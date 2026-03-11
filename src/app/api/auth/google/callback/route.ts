import { NextRequest, NextResponse } from "next/server";

// Google OAuth callback — exchanges code for tokens, fetches Ads customer accounts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(error || "OAuth cancelled")}&platform=google`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // 2. Fetch user profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = await profileRes.json();

    // 3. Fetch accessible Google Ads customer accounts
    let customerAccounts: { id: string; name: string; currencyCode: string }[] = [];
    if (developerToken) {
      try {
        const adsRes = await fetch(
          "https://googleads.googleapis.com/v18/customers:listAccessibleCustomers",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
            },
          }
        );
        const adsData = await adsRes.json();
        const resourceNames: string[] = adsData.resourceNames || [];

        // Fetch details for each customer
        const details = await Promise.allSettled(
          resourceNames.map(async (rn: string) => {
            const customerId = rn.replace("customers/", "");
            const detailRes = await fetch(
              `https://googleads.googleapis.com/v18/customers/${customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "developer-token": developerToken,
                  "login-customer-id": customerId,
                },
              }
            );
            const detail = await detailRes.json();
            return {
              id: customerId,
              name: detail.descriptiveName || `Account ${customerId}`,
              currencyCode: detail.currencyCode || "USD",
            };
          })
        );

        customerAccounts = details
          .filter((r): r is PromiseFulfilledResult<{ id: string; name: string; currencyCode: string }> => r.status === "fulfilled")
          .map((r) => r.value);
      } catch {
        // If Ads API fails, still return OAuth tokens — user can enter Customer ID manually
      }
    }

    const payload = {
      platform: "google",
      accessToken,
      refreshToken,
      clientId,
      clientSecret,
      developerToken,
      userName: profile.name || profile.email || "",
      email: profile.email || "",
      customerAccounts,
    };

    return NextResponse.redirect(
      `${appUrl}/integrations#oauth_result=${encodeURIComponent(JSON.stringify(payload))}`
    );
  } catch (err) {
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(String(err))}&platform=google`
    );
  }
}
