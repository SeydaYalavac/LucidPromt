import { chmod, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readAuthContactCandidates } from "../src/lib/auth-contact-candidates";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";

const MAX_LOOKBACK_HOURS = 24 * 31;

function argumentValue(name: string): string | null {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || null : null;
}

function readArguments() {
  const output = argumentValue("output")?.trim();
  const lookbackRaw = argumentValue("lookback-hours")?.trim();
  const lookbackHours = Number(lookbackRaw);

  if (!output) throw new Error("AUTH_CONTACT_READ_OUTPUT_REQUIRED");
  if (!Number.isInteger(lookbackHours) || lookbackHours < 1 || lookbackHours > MAX_LOOKBACK_HOURS) {
    throw new Error("AUTH_CONTACT_READ_LOOKBACK_INVALID");
  }

  return { output: resolve(output), lookbackHours };
}

async function run() {
  const { output, lookbackHours } = readArguments();
  const createdSince = new Date(Date.now() - lookbackHours * 60 * 60 * 1_000);
  const result = await readAuthContactCandidates(getSupabaseAdmin(), createdSince);

  await writeFile(output, `${JSON.stringify({
    generated_at: new Date().toISOString(),
    created_since: createdSince.toISOString(),
    candidates: result.candidates,
  })}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  await chmod(output, 0o600);

  console.log(JSON.stringify(result.summary));
}

run().catch(() => {
  console.error("AUTH_CONTACT_READ_FAILED");
  process.exitCode = 1;
});
