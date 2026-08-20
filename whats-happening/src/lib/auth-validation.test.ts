import { describe, expect, it } from "vitest";
import { signinSchema, signupSchema } from "./auth-validation";

describe("auth validation", () => {
  it("rejects malformed email and short passwords", () => {
    expect(signinSchema.safeParse({ email: "nope", password: "short" }).success).toBe(false);
  });
  it("requires matching signup passwords", () => {
    expect(signupSchema.safeParse({ email: "test@example.com", password: "password-one", confirmPassword: "password-two", displayName: "Test" }).success).toBe(false);
  });
});
