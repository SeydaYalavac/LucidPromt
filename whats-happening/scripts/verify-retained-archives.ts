export {};

const origin = (process.env.ARCHIVE_VERIFY_ORIGIN || "https://www.whatshappeninginai.com").replace(/\/$/, "");
const hubs = ["artificial-intelligence", "developer-tools", "sports", "world"];

function pageCount(html: string) {
  const match = html.match(/Page\s+1\s+of\s+([\d,]+)/i);
  return match ? Number(match[1].replaceAll(",", "")) : 0;
}

function cardCount(html: string) {
  return (html.match(/<article\b/g) || []).length;
}

async function read(path: string) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual" });
  return { status: response.status, html: await response.text() };
}

async function run() {
  const results = [];
  for (const slug of hubs) {
    const first = await read(`/category/${slug}`);
    if (first.status !== 200) throw new Error(`${slug} first page returned ${first.status}`);
    const pages = pageCount(first.html);
    if (pages < 1) throw new Error(`${slug} did not expose a page count`);
    const final = await read(`/category/${slug}?page=${pages}`);
    const overflow = await read(`/category/${slug}?page=${pages + 1}`);
    const cards = cardCount(final.html);
    if (final.status !== 200 || cards < 1 || cards > 30) {
      throw new Error(`${slug} final page returned ${final.status} with ${cards} cards`);
    }
    if (overflow.status !== 404) throw new Error(`${slug} overflow returned ${overflow.status}`);
    results.push({ slug, pages, final_status: final.status, final_cards: cards, overflow_status: overflow.status });
  }
  console.log(JSON.stringify({ origin, results }));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
