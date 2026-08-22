import { createHash } from "node:crypto";

function digest(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function normalizeHtmlForFingerprint(html: string) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    ?? html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    ?? html;

  return decodeHtmlEntities(main)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fingerprintSourceBody(url: string, contentType: string, body: Uint8Array) {
  if (/application\/pdf|application\/octet-stream/i.test(contentType)) {
    return digest(Buffer.concat([Buffer.from(`${url}\n`), Buffer.from(body)]));
  }

  const decoded = new TextDecoder().decode(body);
  const meaningful = /text\/html|application\/xhtml\+xml/i.test(contentType)
    ? normalizeHtmlForFingerprint(decoded)
    : decoded.replace(/\s+/g, " ").trim();
  if (!meaningful) throw new Error("Source returned no meaningful content");
  if (/\bclient challenge\b/i.test(meaningful) || /required part of this site couldn[’']t load/i.test(meaningful)) {
    throw new Error("Source returned a client challenge");
  }
  return digest(`${url}\n${meaningful}`);
}
