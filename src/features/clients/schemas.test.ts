import { describe, it, expect } from "vitest";
import { loginSchema } from "@/features/auth/schemas";
import { noteSchema } from "@/features/notes/schemas";
import { clientPatchSchema, clientSchema } from "./schemas";

const valid = {
  name: "Jane Cooper",
  company: "",
  email: "jane@acme.com",
  phone: "+1 415 555 0132",
  status: "lead",
};

const firstError = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) => result.error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`)[0];

describe("clientSchema (shared by the form and the API)", () => {
  it("accepts a valid client and tidies it", () => {
    const result = clientSchema.parse({ ...valid, name: "  Jane Cooper ", phone: "+1  415 555   0132" });
    expect(result).toEqual({ ...valid, phone: "+1 415 555 0132" });
  });

  it.each([
    [{ name: "J" }, "name: Name must be at least 2 characters"],
    [{ name: "x".repeat(81) }, "name: Name must be at most 80 characters"],
    [{ email: "" }, "email: Email is required"],
    [{ email: "jane@" }, "email: Enter a valid email address"],
    [{ phone: "" }, "phone: Phone is required"],
    [{ phone: "415 555 0132" }, "phone: Include the country code, e.g. +1 415 555 0132"],
    [{ status: "won" }, "status: Choose a status"],
  ])("rejects %o", (override, message) => {
    expect(firstError(clientSchema.safeParse({ ...valid, ...override }))).toBe(message);
  });

  it("lets PATCH send only some fields, still validating them", () => {
    expect(clientPatchSchema.parse({ status: "closed" })).toEqual({ status: "closed" });
    expect(clientPatchSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires an email and a 6+ character password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "123456" }).success).toBe(true);
    expect(firstError(loginSchema.safeParse({ email: "a@b.co", password: "123" }))).toBe(
      "password: Password must be at least 6 characters",
    );
  });
});

describe("noteSchema", () => {
  it("rejects blank and overly long notes", () => {
    expect(firstError(noteSchema.safeParse({ body: "   " }))).toBe("body: Write something first");
    expect(noteSchema.safeParse({ body: "x".repeat(1001) }).success).toBe(false);
    expect(noteSchema.parse({ body: "  Call back  " })).toEqual({ body: "Call back" });
  });
});
