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

    const { ok } = await rateLimit(`dailies-claim:${user.id}`, 2, 10_000);
    if (!ok) {
      return NextResponse.json({ error: "Too fast" }, { status: 429 });
    }

    const admin = getSupabaseAdmin();
    const service = new DailyMissionService(admin);

    const { data: dev } = await admin
      .from("developers")
      .select("id, github_login, claimed, contributions, public_repos, total_stars, kudos_count, dailies_completed, dailies_streak, last_dailies_date, easy_solved, medium_solved, hard_solved, contest_rating, lc_streak, total_prs")
      .eq("claimed_by", user.id)
      .single();

    const githubLogin = dev?.github_login ?? "";

    if (!dev || !dev.claimed) {
      return NextResponse.json({ error: "Must claim building first" }, { status: 403 });
    }

    const today = getTodayStr();

    let isMobile = false;
    try {
      const body = await request.json();
      isMobile = body?.mobile === true;
    } catch (err) {
      console.error("[app/api/dailies/claim/route.ts] failed to parse request body:", err);
    }

    try {
      const result = await service.claimReward({
        developer: {
          id: dev.id,
          github_login: dev.github_login,
          claimed: dev.claimed,
          contributions: dev.contributions,
          public_repos: dev.public_repos,
          total_stars: dev.total_stars,
          kudos_count: dev.kudos_count,
          dailies_completed: dev.dailies_completed,
          dailies_streak: dev.dailies_streak,
          last_dailies_date: dev.last_dailies_date,
          easy_solved: dev.easy_solved,
          medium_solved: dev.medium_solved,
          hard_solved: dev.hard_solved,
          contest_rating: dev.contest_rating,
          lc_streak: dev.lc_streak,
          total_prs: dev.total_prs,
        },
        isMobile,
        today,
      });

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof DailyMissionServiceError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json({ error: "Failed to claim" }, { status: 500 });
    }
  }