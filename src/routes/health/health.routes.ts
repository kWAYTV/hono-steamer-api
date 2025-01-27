import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { ApiResponseSchema } from "@/helpers/api-response.schemas";

export const health = createRoute({
  tags: ["Health"],
  method: "get",
  path: "/health",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ApiResponseSchema,
      "Health check endpoint",
    ),
  },
});

export type HealthRoute = typeof health;
