import { createRouter } from "@/lib/create-app";
import * as handlers from "@/routes/steam/steam.handlers";
import * as routes from "@/routes/steam/steam.routes";

const router = createRouter()
  // Steam-specific routes
  .openapi(routes.resolve, handlers.resolve)
  .openapi(routes.refresh, handlers.refresh);

export default router;
