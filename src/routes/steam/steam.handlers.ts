import * as HttpStatusCodes from "stoker/http-status-codes";

import type { RefreshRoute, ResolveRoute } from "@/routes/steam/steam.routes";
import type { ApiErrorResponse } from "@/types/api.types";
import type { AppRouteHandler } from "@/types/app.types";

import { STEAM_ERROR_MESSAGES } from "@/lib/constants";
import { refreshProfile, resolveProfile } from "@/services/steam.services";

export const resolve: AppRouteHandler<ResolveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const result = await resolveProfile(id);

    if (!result.success) {
      return c.json({
        success: false,
        message: result.error,
      } satisfies ApiErrorResponse, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({
      success: true,
      message: "Steam profile resolved",
      data: {
        profile: result.profile,
        isCached: result.isCached,
        receivedId: result.receivedId,
      },
    }, HttpStatusCodes.OK);
  }
  catch {
    return c.json({
      success: false,
      message: STEAM_ERROR_MESSAGES.RESOLVE_FAILED,
    } satisfies ApiErrorResponse, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const refresh: AppRouteHandler<RefreshRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const result = await refreshProfile(id);

    if (!result.success) {
      return c.json({
        success: false,
        message: result.error,
      } satisfies ApiErrorResponse, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({
      success: true,
      message: "Steam profile refreshed",
      data: {
        profile: result.profile,
      },
    }, HttpStatusCodes.OK);
  }
  catch {
    return c.json({
      success: false,
      message: STEAM_ERROR_MESSAGES.REFRESH_FAILED,
    } satisfies ApiErrorResponse, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
