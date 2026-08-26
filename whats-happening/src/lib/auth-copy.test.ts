import { describe, expect, it } from "vitest";
import { getAuthAvailabilityCopy, getAuthModeCopy } from "./auth-copy";

describe("auth availability copy", () => {
  it("describes configured Google access without an unavailable warning", () => {
    const mode = getAuthModeCopy("signin", "en", true);
    const availability = getAuthAvailabilityCopy("en", true);

    expect(mode.description).toContain("Continue with Google");
    expect(availability.status).toBe("Production status: Google sign-in is connected.");
    expect(`${mode.description} ${availability.description} ${availability.status} ${availability.footer}`).not.toContain("unavailable");
  });

  it("preserves fail-closed English warnings when authentication is not configured", () => {
    const mode = getAuthModeCopy("signin", "en", false);
    const availability = getAuthAvailabilityCopy("en", false);

    expect(mode.description).toContain("will resume");
    expect(availability.status).toContain("account access unavailable");
    expect(availability.status).toContain("No credentials entered on this page are submitted");
    expect(availability.footer).toBe("Authentication is currently unavailable");
  });

  it("keeps configured and unavailable Turkish states distinct", () => {
    expect(getAuthAvailabilityCopy("tr", true).status).toBe("Üretim durumu: Google ile oturum açma bağlı.");
    expect(getAuthAvailabilityCopy("tr", false).status).toContain("hesap erişimi kullanılamıyor");
  });
});
