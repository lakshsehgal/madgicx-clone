import { NextResponse } from "next/server";

// Initiates Meta (Facebook) OAuth login
// Redirects user to Facebook Login dialog
export async function GET() {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/meta/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: "META_APP_ID not configured" },
      { status: 500 }
    );
  }

  // Scopes needed for ad account management
  const scopes = [
    "ads_read",
    "ads_management",
    "pages_show_list",
    "pages_read_engagement",
    "business_management",
  ].join(",");

  const state = crypto.randomUUID();

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
