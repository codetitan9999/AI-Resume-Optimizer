import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isSubscriptionActive } from "@/lib/server/auth/subscription";
import { getSessionFromCookieReader } from "@/lib/server/auth/session";
import { analyzeResumeWithAI } from "@/lib/server/resume-ai";
import { resolveJobDescription } from "@/lib/server/jd-extractor";
import { analyzeApiRequestSchema } from "@/utils/api-schemas";

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

    const payload = analyzeApiRequestSchema.parse(await request.json());
    const resolvedJob = await resolveJobDescription(payload.jobInput);

    const aiResult = await analyzeResumeWithAI({
      resumeText: payload.resumeText?.trim() || payload.resumeFileName || "Resume file uploaded",
      resumeFileName: payload.resumeFileName,
      jobDescription: resolvedJob.jobDescription
    });

    return NextResponse.json({
      analysisResult: aiResult.data,
      source: aiResult.source,
      warning: aiResult.error,
      jobDescriptionSource: resolvedJob.source,
      jobDescription: resolvedJob.jobDescription,
      jobUrl: resolvedJob.jobUrl
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze resume.";
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
