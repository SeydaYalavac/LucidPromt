import { describe, expect, it } from "vitest";
import { scrubAutomaticAcquisitionProperties } from "./analytics-privacy";

describe("analytics payload privacy", () => {
  it("removes raw referrers, UTM values, click ids, queries, and hashes", () => {
    const properties: Record<string, unknown> = {
      $current_url: "https://www.whatshappeninginai.com/pricing?email=test@example.com#private",
      $initial_current_url: "https://www.whatshappeninginai.com/?q=private",
      $session_entry_url: "https://www.whatshappeninginai.com/signup?prompt=private",
      $referrer: "https://versily.com/products/what-s-happening?query=private",
      $initial_referrer: "https://chatgpt.com/c/private",
      $session_entry_referrer: "https://example.com/private",
      $referring_domain: "versily.com",
      $initial_referring_domain: "chatgpt.com",
      utm_source: "versily.com",
      $utm_campaign: "free text campaign",
      $initial_utm_content: "free text content",
      gclid: "private-click-id",
      $initial_fbclid: "private-click-id",
      $set_once: {
        acquisition_source: "directory_or_review_site",
        $initial_utm_term: "private free text",
      },
      first_referrer_channel: "directory_or_review_site",
      $initial_person_info: {
        r: "https://versily.com/private",
        u: "https://www.whatshappeninginai.com/?q=private",
      },
      $client_session_props: {
        props: {
          r: "https://versily.com/private",
          u: "https://www.whatshappeninginai.com/signup?prompt=private",
        },
      },
    };

    scrubAutomaticAcquisitionProperties(properties);

    expect(properties).toEqual({
      $current_url: "https://www.whatshappeninginai.com/pricing",
      $initial_current_url: "https://www.whatshappeninginai.com/",
      $session_entry_url: "https://www.whatshappeninginai.com/signup",
      first_referrer_channel: "directory_or_review_site",
      $set_once: {
        acquisition_source: "directory_or_review_site",
      },
      $initial_person_info: {
        u: "https://www.whatshappeninginai.com/",
      },
      $client_session_props: {
        props: {
          u: "https://www.whatshappeninginai.com/signup",
        },
      },
    });
  });
});
