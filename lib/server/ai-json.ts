import { z } from "zod";

type AIProvider = "openai" | "gemini";

type GenerateStructuredJsonParams<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  geminiJsonSchema?: Record<string, unknown>;
  normalize?: (value: unknown) => unknown;
  fallback: T;
};

type OpenAIChoice = {
  message?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
};

type OpenAIChatResponse = {
  choices?: OpenAIChoice[];
};

type GeminiCandidate = {
  content?: {
    parts?: Array<{ text?: string }>;
  };
};

type GeminiGenerateContentResponse = {
  candidates?: GeminiCandidate[];
};

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type OpenAIMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (provider === "gemini" || provider === "openai") {
    return provider;
  }

  return process.env.GEMINI_API_KEY ? "gemini" : "openai";
}

function readOpenAIMessageContent(content: OpenAIMessageContent) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (item.type === "text" ? item.text ?? "" : item.text ?? ""))
      .join("\n");
  }

  return "";
}

function readGeminiMessageContent(response: GeminiGenerateContentResponse) {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("\n");
}

async function generateWithOpenAI<T>({
  systemPrompt,
  userPrompt,
  schema,
  normalize,
  fallback
}: GenerateStructuredJsonParams<T>) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      data: fallback,
      source: "mock" as const,
      error: "OPENAI_API_KEY is not configured."
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        temperature: 0.25,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        data: fallback,
        source: "mock" as const,
        error: `OpenAI request failed (${response.status}): ${body}`
      };
    }

    const json = (await response.json()) as OpenAIChatResponse;
    const content = readOpenAIMessageContent(json.choices?.[0]?.message?.content);

    if (!content) {
      return {
        data: fallback,
        source: "mock" as const,
        error: "OpenAI response did not include text content."
      };
    }

    const parsed = JSON.parse(content) as unknown;
    const prepared = normalize ? normalize(parsed) : parsed;
    const validated = schema.parse(prepared);

    return {
      data: validated,
      source: "ai" as const
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI request failure";
    return {
      data: fallback,
      source: "mock" as const,
      error: message
    };
  }
}

async function generateWithGemini<T>({
  systemPrompt,
  userPrompt,
  schema,
  geminiJsonSchema,
  normalize,
  fallback
}: GenerateStructuredJsonParams<T>) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      data: fallback,
      source: "mock" as const,
      error: "GEMINI_API_KEY is not configured."
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
            ...(geminiJsonSchema
              ? {
                  responseJsonSchema: geminiJsonSchema
                }
              : {})
          }
        })
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return {
        data: fallback,
        source: "mock" as const,
        error: `Gemini request failed (${response.status}): ${body}`
      };
    }

    const json = (await response.json()) as GeminiGenerateContentResponse;
    const content = readGeminiMessageContent(json);

    if (!content) {
      return {
        data: fallback,
        source: "mock" as const,
        error: "Gemini response did not include text content."
      };
    }

    const parsed = JSON.parse(content) as unknown;
    const prepared = normalize ? normalize(parsed) : parsed;
    const validated = schema.parse(prepared);

    return {
      data: validated,
      source: "ai" as const
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI request failure";
    return {
      data: fallback,
      source: "mock" as const,
      error: message
    };
  }
}

export async function generateStructuredJson<T>(params: GenerateStructuredJsonParams<T>) {
  const provider = getAIProvider();

  if (provider === "gemini") {
    return generateWithGemini(params);
  }

  return generateWithOpenAI(params);
}
