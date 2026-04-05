import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { verifyPassword } from "@/lib/server/auth/password";
import {
  buildSessionToken,
  createAuthCookie
} from "@/lib/server/auth/session";
import { findUserByEmail, toPublicUser } from "@/lib/server/auth/user-store";
import { loginSchema } from "@/utils/auth-schemas";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const email = payload.email.trim().toLowerCase();

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const publicUser = toPublicUser(user);
    const sessionToken = buildSessionToken(publicUser);

    const response = NextResponse.json({
      user: publicUser
    });
    response.cookies.set(createAuthCookie(sessionToken));

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Failed to log in.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
