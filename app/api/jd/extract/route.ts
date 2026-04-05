import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isSubscriptionActive } from "@/lib/server/auth/subscription";
import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { resolveJobDescription } from "@/lib/server/jd-extractor";
import { jdExtractApiRequestSchema } from "@/utils/api-schemas";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookieReader(cookies());
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!isSubscriptionActive(session.user.subscription)) {
      return NextResponse.json(
        { message: "Active subscription required." },
        { status: 402 }
      );
    }

    const payload = jdExtractApiRequestSchema.parse(await request.json());
    const result = await resolveJobDescription(payload.jobInput);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract job description.";
    return NextResponse.json(
      {
        message
      },
      {
        status: 400
      }
    );
  }
}
