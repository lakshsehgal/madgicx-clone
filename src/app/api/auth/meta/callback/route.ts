import { NextRequest, NextResponse } from "next/server";

// Meta OAuth callback — exchanges code for long-lived token, fetches ad accounts & pages
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    const errorDesc = request.nextUrl.searchParams.get("error_description") || "OAuth cancelled";
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(errorDesc)}&platform=meta`
    );
  }

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${appUrl}/api/auth/meta/callback`;

  try {
    // 1. Exchange code for short-lived token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortToken = tokenData.access_token;

    // 2. Exchange for long-lived token (60 days)
    const longTokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longTokenUrl.searchParams.set("client_id", appId);
    longTokenUrl.searchParams.set("client_secret", appSecret);
    longTokenUrl.searchParams.set("fb_exchange_token", shortToken);

    const longTokenRes = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenRes.json();
    const accessToken = longTokenData.access_token || shortToken;

    // 3. Fetch user's ad accounts
    const adAccountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${accessToken}`
    );
    const adAccountsData = await adAccountsRes.json();
    const adAccounts = (adAccountsData.data || []).map((acc: { id: string; name: string; account_status: number; currency: string }) => ({
      id: acc.id,
      name: acc.name,
      status: acc.account_status === 1 ? "active" : "inactive",
      currency: acc.currency,
    }));

    // 4. Fetch user's pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const pages = (pagesData.data || []).map((page: { id: string; name: string; category: string }) => ({
      id: page.id,
      name: page.name,
      category: page.category,
    }));

    // 5. Fetch user info
    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=name,email&access_token=${accessToken}`
    );
    const meData = await meRes.json();

    // Redirect back to integrations with data in URL fragment (client-side only)
    const payload = {
      platform: "meta",
      accessToken,
      userName: meData.name || "",
      adAccounts,
      pages,
    };

    // Use URL fragment (#) so the token never hits the server again
    return NextResponse.redirect(
      `${appUrl}/integrations#oauth_result=${encodeURIComponent(JSON.stringify(payload))}`
    );
  } catch (err) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(String(err))}&platform=meta`
    );
  }
}
