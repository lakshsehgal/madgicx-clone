import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceData, generateDemoData } from "@/lib/windsor";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiKey =
    searchParams.get("api_key") || process.env.WINDSOR_API_KEY || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "start_date and end_date are required" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!apiKey) {
    // Return demo data when no API key is configured
    const data = generateDemoData(start, end);
    return NextResponse.json({ ...data, demo: true });
  }

  try {
    const data = await fetchPerformanceData({
      apiKey,
      startDate: start,
      endDate: end,
    });
    return NextResponse.json(data);
  } catch {
    const data = generateDemoData(start, end);
    return NextResponse.json({ ...data, demo: true, error: "API call failed, showing demo data" });
  }
}
