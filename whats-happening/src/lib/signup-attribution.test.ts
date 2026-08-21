import { describe, expect, it } from "vitest";
import {
  AI_REFERRER_HOSTS,
  SIGNUP_SOURCE_OPTIONS,
  buildSignupSourceEventProperties,
  deriveAiReferrerChannel,
  randomizeAiOption,
} from "./signup-attribution";

describe("signup attribution", () => {
  it("recognizes only the approved AI referrer hosts", () => {
    for (const host of AI_REFERRER_HOSTS) {
      expect(
        deriveAiReferrerChannel(`https://${host}/conversation`, "https://www.whatshappeninginai.com/signup"),
      ).toBe("ai_assistant");
    }

    expect(
      deriveAiReferrerChannel(
        "https://chatgpt.com.attacker.example/path",
        "https://www.whatshappeninginai.com/signup",
      ),
    ).toBeUndefined();
  });

  it("recognizes ChatGPT's explicit outbound UTM source", () => {
    expect(
      deriveAiReferrerChannel(
        "",
        "https://www.whatshappeninginai.com/?utm_source=chatgpt.com&utm_medium=referral",
      ),
    ).toBe("ai_assistant");
  });

  it("moves the AI option without changing the option set", () => {
    const first = randomizeAiOption(0);
    const last = randomizeAiOption(0.999999);

    expect(first[0]?.value).toBe("ai_assistant");
    expect(last.at(-1)?.value).toBe("ai_assistant");
    expect(new Set(first.map(({ value }) => value))).toEqual(
      new Set(SIGNUP_SOURCE_OPTIONS.map(({ value }) => value)),
    );
  });

  it("keeps prompt text on the signup event and out of person properties", () => {
    const properties = buildSignupSourceEventProperties(
      "ai_assistant",
      `  ${"x".repeat(220)}  `,
      "ai_assistant",
    );

    expect(properties.ai_prompt_text).toHaveLength(200);
    expect(properties.$set_once).toEqual({
      acquisition_source: "ai_assistant",
      first_referrer_channel: "ai_assistant",
    });
    expect(properties.$set_once).not.toHaveProperty("ai_prompt_text");
  });

  it("drops prompt text for non-AI answers", () => {
    expect(
      buildSignupSourceEventProperties("search_engine", "private arbitrary form value"),
    ).not.toHaveProperty("ai_prompt_text");
  });
});
