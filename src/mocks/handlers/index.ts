import { activityHandlers } from "./activity";
import { authHandlers } from "./auth";
import { clientHandlers } from "./clients";
import { demoHandlers } from "./demo";
import { noteHandlers } from "./notes";

// REST API implemented by Mock Service Worker: in the browser for the app, in Node for the tests.
//
//   POST   /auth/login                      sign in → { token, user }        (422, 401)
//   POST   /auth/logout                     sign out
//   GET    /clients                         list
//   POST   /clients                         create                           (422, 409 duplicate email)
//   GET    /clients/:id                     one client                       (404)
//   PATCH  /clients/:id                     update any subset of fields      (404, 422, 409)
//   DELETE /clients/:id                     delete with its notes + history  (404)
//   GET    /clients/:id/notes               notes, newest first
//   POST   /clients/:id/notes               add a note                       (422, 404)
//   DELETE /clients/:id/notes/:noteId       delete a note                    (404)
//   GET    /clients/:id/activity            history of one client
//   GET    /activity?limit=8                latest events across all clients
//   POST   /demo/reset                      demo only: { dataset: "seed" | "empty" }
//
// Every route except /auth/* requires "Authorization: Bearer <token>" and answers 401 otherwise.
export const handlers = [
  ...authHandlers,
  ...clientHandlers,
  ...noteHandlers,
  ...activityHandlers,
  ...demoHandlers,
];
