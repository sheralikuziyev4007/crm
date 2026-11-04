import type { StatusKey } from "@/features/clients/types";

interface ActivityBase {
  id: string;
  clientId: string;
  /** Kept so the feed can still name a client after it was renamed */
  clientName: string;
  actor: string;
  createdAt: number;
}

// The server stores facts; the UI turns them into sentences (see describeActivity)
export type Activity =
  | (ActivityBase & { type: "created" })
  | (ActivityBase & { type: "updated"; fields: string[] })
  | (ActivityBase & { type: "status_changed"; from: StatusKey; to: StatusKey })
  | (ActivityBase & { type: "note_added"; preview: string });

export type ActivityType = Activity["type"];
