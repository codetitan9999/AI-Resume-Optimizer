const URL_PATTERN = /^https?:\/\//i;

const ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">"
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const decodeEntities = (value: string) =>
  Object.entries(ENTITY_MAP).reduce(
    (accumulator, [entity, replacement]) => accumulator.replaceAll(entity, replacement),
    value
  );

const stripHtml = (html: string) => {
  const withoutScripts = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  const textOnly = withoutScripts.replace(/<[^>]+>/g, " ");
  return normalizeWhitespace(decodeEntities(textOnly));
};

const clipText = (value: string, limit = 6000) => {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
};

export type ResolvedJobDescription = {
  jobDescription: string;
  source: "url" | "text";
  jobUrl?: string;
  warnings: string[];
};

export const isLikelyUrl = (value: string) => URL_PATTERN.test(value.trim());

async function fetchUrlContent(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIResumeOptimizer/2.0; +https://vercel.com)"
      },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch URL (${response.status}).`);
    }

    const html = await response.text();
    return html;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveJobDescription(
  jobInput: string
): Promise<ResolvedJobDescription> {
  const normalizedInput = jobInput.trim();

  if (!isLikelyUrl(normalizedInput)) {
    return {
      jobDescription: clipText(normalizedInput, 8000),
      source: "text",
      warnings: []
    };
  }

  try {
    const html = await fetchUrlContent(normalizedInput);
    const text = stripHtml(html);

    if (text.length < 80) {
      throw new Error(
        "The job URL did not provide enough readable content. Paste JD text manually."
      );
    }

    return {
      jobDescription: clipText(text, 8000),
      source: "url",
      jobUrl: normalizedInput,
      warnings: []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch URL.";
    throw new Error(
      `${message} If this site blocks scraping, paste the full job description text.`
    );
  }
}
