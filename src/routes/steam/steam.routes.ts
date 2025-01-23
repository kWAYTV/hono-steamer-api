import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { selectSteamProfileSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Steam"];

// Custom schema for Steam-specific routes that use Steam ID or custom URL
const SteamIdParamsSchema = z.object({
  id: z.string().min(1).describe("Steam ID or Custom URL"),
});

// Special Steam-specific routes
export const resolve = createRoute({
  path: "/api/resolve/{id}",
  method: "get",
  request: {
    params: SteamIdParamsSchema,
  },
  tags,
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        receivedId: z.string(),
        profile: selectSteamProfileSchema,
        cached: z.boolean(),
      }),
      "The resolved Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Steam profile not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SteamIdParamsSchema),
      "Invalid Steam ID error",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Internal server error",
    ),
  },
});

export const refresh = createRoute({
  path: "/api/refresh/{id}",
  method: "post",
  request: {
    params: SteamIdParamsSchema,
  },
  tags,
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSteamProfileSchema,
      "The refreshed Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Steam profile not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SteamIdParamsSchema),
      "Invalid Steam ID error",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Internal server error",
    ),
  },
});

export type ResolveRoute = typeof resolve;
export type RefreshRoute = typeof refresh;
