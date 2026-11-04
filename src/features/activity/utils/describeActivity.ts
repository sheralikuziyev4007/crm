import { getStatusMeta } from "@/features/clients/constants";
import type { Activity } from "../types";

const FIELD_LABELS: Record<string, string> = {
  name: "name",
  company: "company",
  email: "email",
  phone: "phone",
};

const PREVIEW_LENGTH = 90;

/** "name, email and phone" */
function listFields(fields: string[]): string {
  const labels = fields.map((f) => FIELD_LABELS[f] ?? f);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

const truncate = (text: string) =>
  text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH - 1)}…` : text;

/** Turns a stored event into a sentence for the timeline. */
export function describeActivity(activity: Activity): { title: string; detail?: string } {
  switch (activity.type) {
    case "created":
      return { title: "Client added" };
    case "updated":
      return { title: `Updated ${listFields(activity.fields)}` };
    case "status_changed":
      return {
        title: `Moved from ${getStatusMeta(activity.from).label} to ${getStatusMeta(activity.to).label}`,
      };
    case "note_added":
      return { title: "Note added", detail: truncate(activity.preview) };
  }
}
