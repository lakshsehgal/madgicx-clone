import { NextRequest, NextResponse } from "next/server";

// Shopify OAuth callback — exchanges code for permanent access token
// Reads client credentials from HTTP-only cookie set during initiation
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const shop = request.nextUrl.searchParams.get("shop");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code || !shop) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent("Missing code or shop parameter")}&platform=shopify`
    );
  }

  // Read client credentials from cookie (set during OAuth initiation)
  const credsCookie = request.cookies.get("shopify_oauth_creds")?.value;
  let clientId = process.env.SHOPIFY_API_KEY || "";
  let clientSecret = process.env.SHOPIFY_API_SECRET || "";

  if (credsCookie) {
    try {
      const parsed = JSON.parse(credsCookie);
      clientId = parsed.clientId || clientId;
      clientSecret = parsed.clientSecret || clientSecret;
    } catch {
      // Fall back to env vars
    }
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent("Missing client credentials. Please re-enter your Client ID and Secret.")}&platform=shopify`
    );
  }

  try {
    // Exchange code for permanent access token
    const tokenRes = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
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
      clientId,
      clientSecret,
      storeUrl: shop,
      shopName: shopInfo.name || shop,
      email: shopInfo.email || "",
      currency: shopInfo.currency || "USD",
      domain: shopInfo.domain || shop,
    };

    // Redirect back with payload in URL fragment and clear the credentials cookie
    const response = NextResponse.redirect(
      `${appUrl}/integrations#oauth_result=${encodeURIComponent(JSON.stringify(payload))}`
    );

    // Clear the temporary credentials cookie
    response.cookies.set("shopify_oauth_creds", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/shopify",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(String(err))}&platform=shopify`
    );
  }
}
