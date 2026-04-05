import { z } from "zod";

type OpenAIJsonParams<T> = {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
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

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

type OpenAIMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

function readMessageContent(content: OpenAIMessageContent) {
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

export async function generateStructuredJson<T>({
  systemPrompt,
  userPrompt,
  schema,
  fallback
}: OpenAIJsonParams<T>): Promise<{ data: T; source: "ai" | "mock"; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      data: fallback,
      source: "mock",
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
        model: DEFAULT_MODEL,
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
        source: "mock",
        error: `OpenAI request failed (${response.status}): ${body}`
      };
    }

    const json = (await response.json()) as OpenAIChatResponse;
    const content = readMessageContent(json.choices?.[0]?.message?.content);

    if (!content) {
      return {
        data: fallback,
        source: "mock",
        error: "OpenAI response did not include text content."
      };
    }

    const parsed = JSON.parse(content) as unknown;
    const validated = schema.parse(parsed);

    return {
      data: validated,
      source: "ai"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI request failure";
    return {
      data: fallback,
      source: "mock",
      error: message
    };
  }
}
