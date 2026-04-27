import { NextResponse } from "next/server";

export const runtime = "nodejs";

function hostnameOf(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return input;
  }
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function POST(request: Request) {
  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  let target: URL;
  try {
    target = new URL(normalized);
  } catch {
    return NextResponse.json({ title: hostnameOf(url) });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ title: hostnameOf(url) });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(target.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IE-PM-LinkPreview/1.0; +https://insuranceandestates.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ title: hostnameOf(target.toString()) });
    }

    // Stream up to ~64KB of body to find <title>.
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ title: hostnameOf(target.toString()) });
    }
    const decoder = new TextDecoder();
    let html = "";
    let total = 0;
    const cap = 64 * 1024;
    while (total < cap) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/title>/i.test(html)) break;
    }
    try {
      reader.cancel();
    } catch {
      /* noop */
    }

    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (m && m[1]) {
      const title = decodeEntities(m[1].replace(/\s+/g, " ").trim());
      if (title) return NextResponse.json({ title });
    }

    return NextResponse.json({ title: hostnameOf(target.toString()) });
  } catch {
    return NextResponse.json({ title: hostnameOf(target.toString()) });
  }
}
