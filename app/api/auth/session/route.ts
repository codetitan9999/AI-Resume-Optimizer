import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionFromCookieReader } from "@/lib/server/auth/session";

export async function GET() {
  const cookieStore = cookies();
  const session = await getSessionFromCookieReader(cookieStore);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user,
    expiresAt: session.expiresAt
  });
}
