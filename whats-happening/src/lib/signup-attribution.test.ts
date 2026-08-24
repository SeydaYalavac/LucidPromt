import { describe, expect, it } from "vitest";
import {
  AI_REFERRER_HOSTS,
  DIRECTORY_REFERRER_HOSTS,
  SIGNUP_SOURCE_OPTIONS,
  buildFirstReferrerEventProperties,
  buildSignupSourceEventProperties,
  deriveFirstReferrerChannel,
  preserveFirstReferrerChannel,
  randomizeAiOption,
} from "./signup-attribution";

describe("signup attribution", () => {
  it("recognizes only the approved AI referrer hosts", () => {
    for (const host of AI_REFERRER_HOSTS) {
      expect(
        deriveFirstReferrerChannel(`https://${host}/conversation`, "https://www.whatshappeninginai.com/signup"),
      ).toBe("ai_assistant");
    }

    expect(
      deriveFirstReferrerChannel(
        "https://chatgpt.com.attacker.example/path",
        "https://www.whatshappeninginai.com/signup",
      ),
    ).toBeUndefined();
  });

  it("recognizes ChatGPT's explicit outbound UTM source", () => {
    expect(
      deriveFirstReferrerChannel(
        "",
        "https://www.whatshappeninginai.com/?utm_source=chatgpt.com&utm_medium=referral",
      ),
    ).toBe("ai_assistant");
  });

  it("recognizes only verified directory hosts and allowlisted UTM sources", () => {
    for (const host of DIRECTORY_REFERRER_HOSTS) {
      expect(
        deriveFirstReferrerChannel(
          `https://www.${host}/products/what-s-happening`,
          "https://www.whatshappeninginai.com/",
        ),
      ).toBe("directory_or_review_site");

      expect(
        deriveFirstReferrerChannel(
          "",
          `https://www.whatshappeninginai.com/?utm_source=${host}`,
        ),
      ).toBe("directory_or_review_site");
    }

    expect(
      deriveFirstReferrerChannel(
        "https://versily.com.attacker.example/products/what-s-happening",
        "https://www.whatshappeninginai.com/",
      ),
    ).toBeUndefined();
    expect(
      deriveFirstReferrerChannel(
        "",
        "https://www.whatshappeninginai.com/?utm_source=unverified-directory",
      ),
    ).toBeUndefined();
  });

  it("preserves the first bounded class when a later visit has another source", () => {
    expect(
      preserveFirstReferrerChannel(
        "ai_assistant",
        "directory_or_review_site",
      ),
    ).toBe("ai_assistant");
    expect(
      preserveFirstReferrerChannel(undefined, "directory_or_review_site"),
    ).toBe("directory_or_review_site");
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
      first_referrer_channel: "ai_assistant",
      $set_once: {
        acquisition_source: "ai_assistant",
        first_referrer_channel: "ai_assistant",
      },
    });
  });

  it("uses the same bounded first-touch class for a directory signup", () => {
    const pageViewProperties = buildFirstReferrerEventProperties(
      "directory_or_review_site",
    );
    const signupProperties = buildSignupSourceEventProperties(
      "directory_or_review_site",
      "directory_or_review_site",
    );

    expect(pageViewProperties).toEqual({
      first_referrer_channel: "directory_or_review_site",
    });
    expect(signupProperties).toEqual({
      source: "directory_or_review_site",
      referrer_channel: "directory_or_review_site",
      first_referrer_channel: "directory_or_review_site",
      $set_once: {
        acquisition_source: "directory_or_review_site",
        first_referrer_channel: "directory_or_review_site",
      },
    });
    expect(signupProperties.first_referrer_channel).toBe(
      pageViewProperties.first_referrer_channel,
    );
  });

  it("keeps non-AI attribution bounded to the selected source", () => {
    expect(buildSignupSourceEventProperties("search_engine")).toEqual({
      source: "search_engine",
      $set_once: { acquisition_source: "search_engine" },
    });
  });
});
