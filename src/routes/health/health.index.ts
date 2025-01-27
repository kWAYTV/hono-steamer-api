import { createRouter } from "@/lib/create-app";

import * as handlers from "./health.handlers";
import * as routes from "./health.routes";

const router = createRouter()
  .openapi(routes.health, handlers.check);

export default router;
