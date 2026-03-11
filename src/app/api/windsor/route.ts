import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceData, generateDemoData, fetchWindsorAccounts } from "@/lib/windsor";

const WINDSOR_API_KEY = "0e1294855a50a37edefc099787a27e5cf6d7";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  // Account discovery endpoint
  if (action === "accounts") {
    try {
      const accounts = await fetchWindsorAccounts(WINDSOR_API_KEY);
      return NextResponse.json({ accounts });
    } catch (error) {
      return NextResponse.json(
        { accounts: [], error: String(error) },
        { status: 200 }
      );
    }
  }

  // Performance data endpoint
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const metaAccountId = searchParams.get("meta_account_id") || undefined;
  const googleAccountId = searchParams.get("google_account_id") || undefined;
  const shopifyAccountId = searchParams.get("shopify_account_id") || undefined;

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "start_date and end_date are required" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    const data = await fetchPerformanceData({
      apiKey: WINDSOR_API_KEY,
      startDate: start,
      endDate: end,
      metaAccountId,
      googleAccountId,
      shopifyAccountId,
    });
    return NextResponse.json(data);
  } catch {
    const data = generateDemoData(start, end);
    return NextResponse.json({
      ...data,
      demo: true,
      error: "API call failed, showing demo data",
    });
  }
}
