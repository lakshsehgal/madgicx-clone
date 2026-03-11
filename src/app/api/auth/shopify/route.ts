import { NextRequest, NextResponse } from "next/server";

// Initiates Shopify OAuth install flow
// Requires ?shop=mystore.myshopify.com query param
export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");
  const apiKey = process.env.SHOPIFY_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/shopify/callback`;

  if (!apiKey) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!shop) {
    return NextResponse.json(
      { error: "shop parameter is required (e.g. ?shop=mystore.myshopify.com)" },
      { status: 400 }
    );
  }

  // Normalize shop URL
  const shopDomain = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const scopes = [
    "read_orders",
    "read_products",
    "read_analytics",
  ].join(",");

  const nonce = crypto.randomUUID();

  const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
    `client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  return NextResponse.redirect(authUrl);
}
