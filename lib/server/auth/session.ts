import { cookies } from "next/headers";

import { AuthSession } from "@/types/auth";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createSessionToken,
  verifySessionToken
} from "@/lib/server/auth/session-token";
import { findUserById, toPublicUser } from "@/lib/server/auth/user-store";

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

export function createAuthCookie(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE
  };
}

export function clearAuthCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}

export async function getSessionFromCookieReader(
  cookieReader: CookieReader
): Promise<AuthSession | null> {
  const token = cookieReader.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return null;
  }

  return {
    user: toPublicUser(user),
    issuedAt: payload.iat,
    expiresAt: payload.exp
  };
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  return getSessionFromCookieReader(cookieStore);
}

export function buildSessionToken(user: { id: string; name: string; email: string }) {
  return createSessionToken(user);
}
