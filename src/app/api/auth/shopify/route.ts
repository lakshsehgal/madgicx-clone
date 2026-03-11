import { NextRequest, NextResponse } from "next/server";

// Initiates Shopify OAuth install flow
// Accepts client credentials via query params (from user input) or falls back to env vars
export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");
  const clientId = request.nextUrl.searchParams.get("client_id") || process.env.SHOPIFY_API_KEY;
  const clientSecret = request.nextUrl.searchParams.get("client_secret") || process.env.SHOPIFY_API_SECRET;
  // Use NEXT_PUBLIC_APP_URL if set, otherwise derive from the incoming request
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const redirectUri = `${appUrl}/api/auth/shopify/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Client ID is required. Pass ?client_id= or set SHOPIFY_API_KEY env var." },
      { status: 400 }
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
    `client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`;

  // Store client credentials in HTTP-only cookie so the callback can use them
  const response = NextResponse.redirect(authUrl);

  const credentialPayload = JSON.stringify({
    clientId,
    clientSecret: clientSecret || "",
    shop: shopDomain,
  });

  response.cookies.set("shopify_oauth_creds", credentialPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/shopify",
    maxAge: 600, // 10 minutes - enough for OAuth flow
  });

  return response;
}
