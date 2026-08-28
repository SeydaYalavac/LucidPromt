import { resolve } from "node:path";
import { consumeAuthContactHandoff } from "../src/lib/auth-contact-handoff";
import { dedupeAndMaybeSendCandidate } from "../src/lib/auth-contact-mailbox";

function argumentValue(name: string): string | null {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || null : null;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("AUTH_CONTACT_MAILBOX_CONFIG_MISSING");
  return value;
}

async function run() {
  const input = argumentValue("input")?.trim();
  if (!input) throw new Error("AUTH_CONTACT_HANDOFF_INPUT_REQUIRED");

  const result = await consumeAuthContactHandoff(resolve(input), async (candidate, subject) =>
    dedupeAndMaybeSendCandidate(candidate, subject, {
      apiBase: requiredEnvironment("TIN_SUPPORT_API_BASE").replace(/\/$/u, ""),
      projectId: requiredEnvironment("TIN_SUPPORT_PROJECT_ID"),
      token: requiredEnvironment("TIN_SUPPORT_RUNTIME_TOKEN"),
      sendApprovedNote: process.argv.includes("--send-approved-note"),
    }));

  console.log(JSON.stringify(result));
}

run().catch(() => {
  console.error("AUTH_CONTACT_HANDOFF_CONSUME_FAILED");
  process.exitCode = 1;
});
