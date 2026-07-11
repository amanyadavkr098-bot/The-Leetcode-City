import { describe, expect, it, vi, beforeEach } from "vitest";
import { BusinessLogicError, InfrastructureError } from "@/lib/errors";
import { POST } from "../route";

const mockGetSupabaseAdmin = vi.fn();
const mockGetStripe = vi.fn();
const mockFulfillItemPurchase = vi.fn();
const mockAutoEquipIfSolo = vi.fn();
const mockSendPurchaseNotification = vi.fn();
const mockSendGiftSentNotification = vi.fn();
const mockSendGiftReceivedNotification = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => mockGetSupabaseAdmin(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockGetStripe(),
}));

vi.mock("@/lib/items", () => ({
  autoEquipIfSolo: (...args: unknown[]) => mockAutoEquipIfSolo(...args),
  fulfillItemPurchase: (...args: unknown[]) => mockFulfillItemPurchase(...args),
}));

vi.mock("@/lib/notification-senders/purchase", () => ({
  sendPurchaseNotification: (...args: unknown[]) => mockSendPurchaseNotification(...args),
  sendGiftSentNotification: (...args: unknown[]) => mockSendGiftSentNotification(...args),
}));

vi.mock("@/lib/notification-senders/gift", () => ({
  sendGiftReceivedNotification: (...args: unknown[]) => mockSendGiftReceivedNotification(...args),
}));

interface QueryOp {
  name: string;
  args: unknown[];
}

interface QueryBuilder {
  select(cols?: string): QueryBuilder;
  eq(col: string, val: unknown): QueryBuilder;
  in(col: string, vals: unknown[]): QueryBuilder;
  update(values: unknown): QueryBuilder;
  maybeSingle(): Promise<{ data: unknown; error: unknown }>;
  single(): Promise<{ data: unknown; error: unknown }>;
  insert(values: unknown): Promise<{ data: unknown; error: unknown }>;
  delete(): Promise<{ data: unknown; error: unknown }> ;
}

function createMockQuery(table: string, record: { callLog: string[]; enablePendingPurchase?: boolean; stripeProcessedEventExists?: boolean; processedEventInsertCount?: { count: number } }) {
  const ops: QueryOp[] = [];
  const builder: QueryBuilder = {
    select(cols?: string) {
      ops.push({ name: "select", args: [cols] });
      return builder;
    },
    eq(col: string, val: unknown) {
      ops.push({ name: "eq", args: [col, val] });
      return builder;
    },
    in(col: string, vals: unknown[]) {
      ops.push({ name: "in", args: [col, vals] });
      return builder;
    },
    update(values: unknown) {
      ops.push({ name: "update", args: [values] });
      return builder;
    },
    maybeSingle: async () => {
      record.callLog.push(`${table}.maybeSingle ${JSON.stringify(ops)}`);
      if (table === "stripe_processed_events") {
        return {
          data: record.stripeProcessedEventExists ? { id: "evt_1" } : null,
          error: null,
        };
      }
      if (table === "purchases") {
        const hasIdempotencyKeySelect = ops.some(op => op.name === "eq" && op.args[0] === "idempotency_key");
        const hasPendingClaim = ops.some(op => op.name === "update") && ops.some(op => op.name === "select");
        if (hasIdempotencyKeySelect) {
          return { data: null, error: null };
        }
        if (hasPendingClaim) {
          return {
            data: record.enablePendingPurchase ? { id: "purchase_pending", developer_id: 1, item_id: "consumable" } : null,
            error: null,
          };
        }
      }
      return { data: null, error: null };
    },
    single: async () => {
      record.callLog.push(`${table}.single ${JSON.stringify(ops)}`);
      return { data: { github_login: "test-user" }, error: null };
    },
    insert: async (values: unknown) => {
      record.callLog.push(`${table}.insert ${JSON.stringify(values)}`);
      if (table === "stripe_processed_events" && record.processedEventInsertCount) {
        record.processedEventInsertCount.count++;
      }
      return { data: values, error: null };
    },
    delete: async () => {
      record.callLog.push(`${table}.delete ${JSON.stringify(ops)}`);
      return { data: null, error: null };
    },
  };
  return builder;
}

function makeRequest(body: string) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "sig_123" },
    body,
  });
}

describe("Stripe webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips duplicate Stripe events before processing", async () => {
    const callLog: string[] = [];
    mockGetSupabaseAdmin.mockReturnValue({
      from: (table: string) => createMockQuery(table, { callLog, stripeProcessedEventExists: true, processedEventInsertCount: { count: 0 } }),
    });
    mockGetStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({ type: "checkout.session.expired", data: { object: { metadata: { type: "sky_ad" }, id: "sess_123" } } })),
      },
    });

    const response = await POST(makeRequest(JSON.stringify({} as unknown)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, duplicate: true });
    expect(callLog.some(entry => entry.startsWith("stripe_processed_events.insert"))).toBe(false);
  });

  it("returns 500 and does not mark event processed when fulfillment throws InfrastructureError", async () => {
    const callLog: string[] = [];
    const processedEventInsertCount = { count: 0 };
    mockGetSupabaseAdmin.mockReturnValue({
      from: (table: string) => createMockQuery(table, {
        callLog,
        stripeProcessedEventExists: false,
        enablePendingPurchase: true,
        processedEventInsertCount,
      }),
    });
    mockFulfillItemPurchase.mockRejectedValueOnce(new InfrastructureError("DB timeout", { code: "PGRST_TIMEOUT" }));
    mockGetStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: "checkout.session.completed",
          data: {
            object: {
              metadata: { developer_id: "1", item_id: "consumable" },
              payment_intent: "pi_123",
              amount_total: 100,
              currency: "usd",
            },
          },
        })),
      },
    });

    const response = await POST(makeRequest(JSON.stringify({} as unknown)));
    expect(response.status).toBe(500);
    expect(processedEventInsertCount.count).toBe(0);
  });

  it("marks Stripe event processed after deterministic business error and returns 200", async () => {
    const callLog: string[] = [];
    const processedEventInsertCount = { count: 0 };
    mockGetSupabaseAdmin.mockReturnValue({
      from: (table: string) => createMockQuery(table, {
        callLog,
        stripeProcessedEventExists: false,
        enablePendingPurchase: true,
        processedEventInsertCount,
      }),
    });
    mockFulfillItemPurchase.mockRejectedValueOnce(new BusinessLogicError("Item already owned"));
    mockGetStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: "checkout.session.completed",
          data: {
            object: {
              metadata: { developer_id: "1", item_id: "consumable" },
              payment_intent: "pi_456",
              amount_total: 100,
              currency: "usd",
            },
          },
        })),
      },
    });

    const response = await POST(makeRequest(JSON.stringify({} as unknown)));
    expect(response.status).toBe(200);
    expect(processedEventInsertCount.count).toBe(1);
  });
});
