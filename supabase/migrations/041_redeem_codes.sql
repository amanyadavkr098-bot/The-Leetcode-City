-- Migration 041: Redeem Codes System
-- Allows admins to generate item codes that users can redeem in the shop

CREATE TABLE IF NOT EXISTS redeem_codes (
  id           bigserial PRIMARY KEY,
  code         text UNIQUE NOT NULL,     -- e.g. "CITY-CROWN-X3K9"
  item_id      text NOT NULL REFERENCES items(id),
  max_uses     int NOT NULL DEFAULT 1,   -- 1 = single-use, -1 = unlimited
  used_count   int NOT NULL DEFAULT 0,
  expires_at   timestamptz,              -- NULL = never expires
  created_at   timestamptz DEFAULT now(),
  note         text                      -- optional admin note (e.g. "Twitter giveaway March 2025")
);

-- Only service role (admin) can access redeem_codes
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_public_access" ON redeem_codes FOR ALL USING (false);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes (code);

-- Soft-delete in API: single-use codes are DELETED after redemption, leaving no trace
-- Multi-use codes have used_count incremented until used_count >= max_uses, then deleted
