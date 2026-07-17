import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getTodayStr } from "@/lib/dailies";
import { DailyMissionService } from "@/services/dailyMissionService";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const service = new DailyMissionService(admin);

  const { data: dev } = await admin
    .from("developers")
    .select("id, github_login, claimed, dailies_completed, dailies_streak, last_dailies_date, last_checkin_date, points")
    .eq("claimed_by", user.id)
    .single();

  const githubLogin = dev?.github_login ?? "";

  if (!dev || !dev.claimed) {
    return NextResponse.json({ error: "Must claim building first" }, { status: 403 });
  }

  const today = getTodayStr();

  const { searchParams } = new URL(request.url);
  const isMobile = searchParams.get("mobile") === "1";

  const summary = await service.loadMissionSummary(
    {
      id: dev.id,
      github_login: dev.github_login,
      claimed: dev.claimed,
      dailies_completed: dev.dailies_completed,
      dailies_streak: dev.dailies_streak,
      last_dailies_date: dev.last_dailies_date,
      last_checkin_date: dev.last_checkin_date,
      points: dev.points,
    },
    { isMobile, today },
  );

  return NextResponse.json(summary);
}
