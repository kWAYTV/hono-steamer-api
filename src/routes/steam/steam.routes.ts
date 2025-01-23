import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertSteamProfileSchema, patchSteamProfileSchema, selectSteamProfileSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Steam"];

// Custom schema for Steam-specific routes that use Steam ID or custom URL
const SteamIdParamsSchema = z.object({
  id: z.string().min(1).describe("Steam ID or Custom URL"),
});

export const list = createRoute({
  path: "/steam",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectSteamProfileSchema),
      "The list of Steam profiles",
    ),
  },
});

export const create = createRoute({
  path: "/steam",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertSteamProfileSchema,
      "The Steam profile to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSteamProfileSchema,
      "The created Steam profile",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSteamProfileSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/steam/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSteamProfileSchema,
      "The requested Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Steam profile not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/steam/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchSteamProfileSchema,
      "The Steam profile updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSteamProfileSchema,
      "The updated Steam profile",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Steam profile not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSteamProfileSchema)
        .or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/steam/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Steam profile deleted"),
      "Steam profile deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Steam profile not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

// Special Steam-specific routes
export const resolve = createRoute({
  path: "/steam/resolve/{id}",
  method: "get",
  request: {
    params: SteamIdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        receivedId: z.string(),
        profile: selectSteamProfileSchema,
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
  path: "/steam/refresh/{id}",
  method: "post",
  request: {
    params: SteamIdParamsSchema,
  },
  tags,
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

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type ResolveRoute = typeof resolve;
export type RefreshRoute = typeof refresh;
