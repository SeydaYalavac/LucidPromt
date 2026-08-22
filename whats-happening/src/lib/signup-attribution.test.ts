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

  it("keeps AI attribution bounded to source and first-touch classification", () => {
    const properties = buildSignupSourceEventProperties(
      "ai_assistant",
      "ai_assistant",
    );

    expect(properties).toEqual({
      source: "ai_assistant",
      referrer_channel: "ai_assistant",
      $set_once: {
        acquisition_source: "ai_assistant",
        first_referrer_channel: "ai_assistant",
      },
    });
  });

  it("keeps non-AI attribution bounded to the selected source", () => {
    expect(buildSignupSourceEventProperties("search_engine")).toEqual({
      source: "search_engine",
      $set_once: { acquisition_source: "search_engine" },
    });
  });
});
