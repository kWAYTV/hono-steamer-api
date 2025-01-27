import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/types/app.types";

import type { HealthRoute } from "./health.routes";

export const check: AppRouteHandler<HealthRoute> = (c) => {
  return c.json({
    success: true,
    message: "ok",
  }, HttpStatusCodes.OK);
};
