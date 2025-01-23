import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { selectSteamProfileSchema } from "@/db/schema";
import { ApiErrorResponseSchema, ApiSuccessResponseSchema } from "@/helpers/api-response.schemas";

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
  summary: "Resolve Steam Profile",
  description: "Resolves a Steam profile by ID or custom URL. Returns cached data if available and not expired.",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ApiSuccessResponseSchema(
        z.object({
          profile: selectSteamProfileSchema.describe("The resolved Steam profile data"),
          isCached: z.boolean().describe("Whether the response was served from cache"),
          receivedId: z.string().describe("The ID that was provided in the request"),
        }),
      ),
      "The resolved Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      ApiErrorResponseSchema,
      "Steam profile not found or private",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SteamIdParamsSchema),
      "Invalid Steam ID format",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      ApiErrorResponseSchema,
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
  summary: "Force Refresh Steam Profile",
  description: "Forces a refresh of a Steam profile by ID or custom URL, bypassing the cache.",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ApiSuccessResponseSchema(
        z.object({
          profile: selectSteamProfileSchema.describe("The refreshed Steam profile data"),
        }),
      ),
      "The refreshed Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      ApiErrorResponseSchema,
      "Steam profile not found or private",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(SteamIdParamsSchema),
      "Invalid Steam ID format",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      ApiErrorResponseSchema,
      "Internal server error",
    ),
  },
});

export type ResolveRoute = typeof resolve;
export type RefreshRoute = typeof refresh;
