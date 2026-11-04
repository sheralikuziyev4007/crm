import { describe, it, expect } from "vitest";
import type { Activity } from "../types";
import { describeActivity } from "./describeActivity";

const base = { id: "a", clientId: "CL-001", clientName: "Olivia", actor: "Alex", createdAt: 0 };

describe("describeActivity", () => {
  it.each<[Activity, ReturnType<typeof describeActivity>]>([
    [{ ...base, type: "created" }, { title: "Client added" }],
    [{ ...base, type: "updated", fields: ["email"] }, { title: "Updated email" }],
    [
      { ...base, type: "updated", fields: ["name", "email", "phone"] },
      { title: "Updated name, email and phone" },
    ],
    [{ ...base, type: "status_changed", from: "lead", to: "active" }, { title: "Moved from Lead to Active" }],
    [
      { ...base, type: "note_added", preview: "Call back on Monday" },
      { title: "Note added", detail: "Call back on Monday" },
    ],
  ])("%o", (activity, expected) => {
    expect(describeActivity(activity)).toEqual(expected);
  });

  it("shortens long note previews", () => {
    const { detail } = describeActivity({ ...base, type: "note_added", preview: "x".repeat(200) });
    expect(detail).toHaveLength(90);
    expect(detail?.endsWith("…")).toBe(true);
  });
});
