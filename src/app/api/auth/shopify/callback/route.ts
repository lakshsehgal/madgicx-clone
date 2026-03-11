import { NextRequest, NextResponse } from "next/server";

// Shopify OAuth callback — exchanges code for permanent access token
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const shop = request.nextUrl.searchParams.get("shop");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code || !shop) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent("Missing code or shop parameter")}&platform=shopify`
    );
  }

  const apiKey = process.env.SHOPIFY_API_KEY!;
  const apiSecret = process.env.SHOPIFY_API_SECRET!;

  try {
    // Exchange code for permanent access token
    const tokenRes = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to get access token");
    }

    const accessToken = tokenData.access_token;

    // Fetch shop details
    const shopRes = await fetch(
      `https://${shop}/admin/api/2024-10/shop.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );
    const shopData = await shopRes.json();
    const shopInfo = shopData.shop || {};

    const payload = {
      platform: "shopify",
      accessToken,
      storeUrl: shop,
      shopName: shopInfo.name || shop,
      email: shopInfo.email || "",
      currency: shopInfo.currency || "USD",
      domain: shopInfo.domain || shop,
    };

    return NextResponse.redirect(
      `${appUrl}/integrations#oauth_result=${encodeURIComponent(JSON.stringify(payload))}`
    );
  } catch (err) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(String(err))}&platform=shopify`
    );
  }
}
