import { request } from "@/lib/http";

export type DemoDataset = "seed" | "empty";

/** Mock-API only: restores the demo data set or removes every client. */
export const resetDemoData = (dataset: DemoDataset) =>
  request<void>("/demo/reset", { method: "POST", body: JSON.stringify({ dataset }) });
