import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isSubscriptionActive } from "@/lib/server/auth/subscription";
import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { optimizeResumeWithAI } from "@/lib/server/resume-ai";
import { resolveJobDescription } from "@/lib/server/jd-extractor";
import { optimizeApiRequestSchema } from "@/utils/api-schemas";

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

    const payload = optimizeApiRequestSchema.parse(await request.json());

    const resolvedJob = payload.jobInput
      ? await resolveJobDescription(payload.jobInput)
      : null;

    const mode = resolvedJob ? "jd-aligned" : payload.mode;

    const result = await optimizeResumeWithAI({
      resumeData: payload.resumeData,
      jobDescription: resolvedJob?.jobDescription,
      mode
    });

    return NextResponse.json({
      sections: result.data,
      context: {
        source: result.source,
        mode,
        jobDescription: resolvedJob?.jobDescription,
        jobSource: resolvedJob?.source,
        jobUrl: resolvedJob?.jobUrl
      },
      warning: result.error
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to optimize resume.";
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
