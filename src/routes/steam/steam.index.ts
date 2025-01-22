import { createRouter } from "@/lib/create-app";

import * as handlers from "./steam.handlers";
import * as routes from "./steam.routes";

const router = createRouter()
  // CRUD routes
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  // Steam-specific routes
  .openapi(routes.resolve, handlers.resolve)
  .openapi(routes.refresh, handlers.refresh);

export default router;
