import { describe, it, expect } from "vitest";
import { validate } from "./validation";

const valid = { name: "Aziz", email: "aziz@mail.uz", phone: "+998 90 123 45 67" };

describe("validate", () => {
  it("accepts a correct client", () => {
    expect(validate(valid)).toEqual({});
  });

  it("requires a name of at least 2 characters (ignoring spaces)", () => {
    expect(validate({ ...valid, name: "" }).name).toBeDefined();
    expect(validate({ ...valid, name: " A " }).name).toBeDefined();
    expect(validate({ ...valid, name: "Al" }).name).toBeUndefined();
  });

  it.each(["", "plain", "a@b", "a b@c.uz", "@c.uz"])("rejects invalid email %j", (email) => {
    expect(validate({ ...valid, email }).email).toBeDefined();
  });

  it("accepts an email with surrounding spaces (mobile keyboards add them)", () => {
    expect(validate({ ...valid, email: " aziz@mail.uz " }).email).toBeUndefined();
  });

  it("requires exactly 9 digits after +998", () => {
    expect(validate({ ...valid, phone: "+998 90 123 45" }).phone).toBeDefined();
    expect(validate({ ...valid, phone: "+998" }).phone).toBeDefined();
    expect(validate({ ...valid, phone: "" }).phone).toBeDefined();
    expect(validate({ ...valid, phone: "901234567" }).phone).toBeUndefined();
  });

  it("reports all problems at once", () => {
    expect(Object.keys(validate({})).sort()).toEqual(["email", "name", "phone"]);
  });
});
