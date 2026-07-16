import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { getTodayStr } from "@/lib/dailies";
import { DailyMissionService, DailyMissionServiceError } from "@/services/dailyMissionService";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { ok } = await rateLimit(`dailies-progress:${user.id}`, 5, 10_000);
  if (!ok) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  const body = await request.json();
  const { mission_id, points, mobile } = body as {
    mission_id: string;
    points?: number;
    mobile?: boolean;
  };
  const isMobile = mobile === true;
  const increment = typeof points === "number" && points > 0 ? points : 1;

  const admin = getSupabaseAdmin();
  const service = new DailyMissionService(admin);

  const { data: dev } = await admin
    .from("developers")
    .select("id, claimed")
    .eq("claimed_by", user.id)
    .single();

  if (!dev || !dev.claimed) {
    return NextResponse.json({ error: "Must claim building first" }, { status: 403 });
  }

  try {
    const result = await service.updateProgress({
      developerId: dev.id,
      missionId: mission_id,
      increment,
      isMobile,
      today: getTodayStr(),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DailyMissionServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}