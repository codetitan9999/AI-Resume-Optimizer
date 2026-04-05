import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { hashPassword } from "@/lib/server/auth/password";
import {
  buildSessionToken,
  createAuthCookie
} from "@/lib/server/auth/session";
import { createUser, findUserByEmail } from "@/lib/server/auth/user-store";
import { signupSchema } from "@/utils/auth-schemas";

export async function POST(request: Request) {
  try {
    const payload = signupSchema.parse(await request.json());
    const email = payload.email.trim().toLowerCase();

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await createUser({
      name: payload.name,
      email,
      passwordHash
    });

    const sessionToken = buildSessionToken(user);
    const response = NextResponse.json({
      user
    });
    response.cookies.set(createAuthCookie(sessionToken));

    return response;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid signup payload." },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to create account.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
