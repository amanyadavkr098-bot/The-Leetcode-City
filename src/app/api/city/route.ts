import { NextResponse } from "next/server";
import { CityService } from "@/services/cityService";

/**
 * @param {import('next/server').NextRequest} request
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawFrom = parseInt(searchParams.get("from") ?? "0", 10);
  const rawTo = parseInt(searchParams.get("to") ?? "500", 10);

  if (isNaN(rawFrom) || isNaN(rawTo)) {
    return NextResponse.json(
      { error: "Invalid pagination parameters: 'from' and 'to' must be numbers." },
      { status: 400 }
    );
  }

  const from = Math.max(0, rawFrom);
  const to = Math.min(from + 1000, rawTo);

  const service = new CityService();
  const result = await service.loadCityData({ from, to });

  return NextResponse.json(result.body, {
    headers: result.headers,
  });
}
