import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Used by the test suite: the same handlers as the browser, running in Node
export const server = setupServer(...handlers);
