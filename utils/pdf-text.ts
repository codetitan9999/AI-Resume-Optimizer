const unescapePdfText = (value: string) =>
  value
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\\/g, "\\");

function parseTextFromToken(token: string) {
  const matches = token.match(/\((?:\\.|[^\\)])*\)/g) ?? [];
  return matches
    .map((item) => item.slice(1, -1))
    .map(unescapePdfText)
    .join(" ");
}

export async function extractTextFromPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const raw = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer));

  const textTokens = [
    ...(raw.match(/\[(?:\\.|[^\]])*\]\s*TJ/g) ?? []),
    ...(raw.match(/\((?:\\.|[^\\)])*\)\s*Tj/g) ?? [])
  ];

  if (textTokens.length === 0) {
    return "";
  }

  const parsed = textTokens
    .map(parseTextFromToken)
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return parsed;
}
