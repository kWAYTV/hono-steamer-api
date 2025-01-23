import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";
import type { RefreshRoute, ResolveRoute } from "@/routes/steam/steam.routes";

import { refreshProfile, resolveProfile } from "@/services/steam.services";

export const resolve: AppRouteHandler<ResolveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const result = await resolveProfile(id);

    if ("error" in result) {
      return c.json({ message: result.error }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({
      message: "Steam profile resolved",
      receivedId: result.receivedId,
      profile: result.profile,
      cached: result.isCached,
    }, HttpStatusCodes.OK);
  }
  catch {
    return c.json({ message: "Failed to resolve Steam ID" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const refresh: AppRouteHandler<RefreshRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const result = await refreshProfile(id);

    if ("error" in result) {
      return c.json({ message: result.error }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(result.profile, HttpStatusCodes.OK);
  }
  catch {
    return c.json({ message: "Failed to refresh Steam profile" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
