import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { ApiSuccessResponseSchema } from "@/helpers/api-response.schemas";
import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          ApiSuccessResponseSchema(z.object({
            message: z.string().describe("API welcome message"),
            serverTime: z.string().describe("Server time"),
          })),
          "Steamer API Index",
        ),
      },
    }),
    (c) => {
      return c.json({
        success: true as const,
        data: {
          message: "Steamer API",
          serverTime: new Date().toISOString(),
        },
        message: "Welcome to Steamer API",
      }, HttpStatusCodes.OK);
    },
  );

export default router;
