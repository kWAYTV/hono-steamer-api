import { eq } from "drizzle-orm";
import {
  customUrlToSteamID64,
} from "steamid-resolver";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";
import type {
  RefreshRoute,
  ResolveRoute,
} from "@/routes/steam/steam.routes";

import db from "@/db";
import { steamProfiles } from "@/db/schema";
import { fetchAndFormatSteamProfile, isProfileEmpty, parseInput } from "@/utils/steam.utils";

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

export const resolve: AppRouteHandler<ResolveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const parsed = parseInput(id);
    let steamId64: string | null = null;
    let profile = null;
    let isCached = false;

    // Try to find in database first
    profile = await db.query.steamProfiles.findFirst({
      where(fields, operators) {
        return parsed.type === "steamId64"
          ? operators.eq(fields.steamId64, parsed.value)
          : operators.eq(fields.customUrl, parsed.value);
      },
    });

    // If found and not expired, use cached version
    if (profile && profile.lastChecked) {
      const age = Date.now() - new Date(profile.lastChecked).getTime();
      if (age < CACHE_DURATION && !isProfileEmpty(profile)) {
        isCached = true;
      }
    }

    // If not found or expired, fetch from Steam API
    if (!isCached) {
      if (parsed.type === "customUrl") {
        steamId64 = await customUrlToSteamID64(parsed.value);
      }
      else {
        steamId64 = parsed.value;
      }

      if (!steamId64) {
        return c.json(
          {
            message: "Invalid, private or not found Steam ID",
          },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const profileInfo = await fetchAndFormatSteamProfile(steamId64);
      if (!profileInfo) {
        return c.json(
          {
            message: "Failed to fetch Steam profile info",
          },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      // Update or insert profile
      if (profile) {
        await db.update(steamProfiles)
          .set(profileInfo)
          .where(eq(steamProfiles.id, profile.id));

        // Fetch updated profile
        profile = await db.query.steamProfiles.findFirst({
          where: eq(steamProfiles.id, profile.id),
        });
      }
      else {
        await db.insert(steamProfiles)
          .values(profileInfo);

        // Fetch inserted profile
        profile = await db.query.steamProfiles.findFirst({
          where: eq(steamProfiles.steamId64, steamId64),
        });
      }
    }

    if (!profile) {
      return c.json(
        {
          message: "Failed to create or update profile",
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    // Parse JSON fields before returning
    const responseProfile = {
      ...profile,
      mostPlayedGames: profile.mostPlayedGames ? JSON.parse(profile.mostPlayedGames) : null,
      groups: profile.groups ? JSON.parse(profile.groups) : null,
    };

    return c.json({
      message: "Steam profile resolved",
      receivedId: id,
      profile: responseProfile,
      cached: isCached,
    }, HttpStatusCodes.OK);
  }
  catch {
    return c.json(
      {
        message: "Failed to resolve Steam ID",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const refresh: AppRouteHandler<RefreshRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const parsed = parseInput(id);
    let steamId64: string | null = null;

    // Get steamId64 from input
    if (parsed.type === "customUrl") {
      steamId64 = await customUrlToSteamID64(parsed.value);
    }
    else {
      steamId64 = parsed.value;
    }

    if (!steamId64) {
      return c.json(
        {
          message: "Invalid, private or not found Steam ID",
        },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Find profile in database
    const profile = await db.query.steamProfiles.findFirst({
      where: eq(steamProfiles.steamId64, steamId64),
    });

    if (!profile) {
      return c.json(
        {
          message: HttpStatusPhrases.NOT_FOUND,
        },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Force refresh from Steam API
    const profileInfo = await fetchAndFormatSteamProfile(steamId64);
    if (!profileInfo) {
      return c.json(
        {
          message: "Failed to fetch Steam profile info",
        },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Update profile
    await db.update(steamProfiles)
      .set(profileInfo)
      .where(eq(steamProfiles.id, profile.id));

    // Fetch updated profile
    const updated = await db.query.steamProfiles.findFirst({
      where: eq(steamProfiles.id, profile.id),
    });

    if (!updated) {
      return c.json(
        {
          message: "Failed to update profile",
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    // Parse JSON fields before returning
    const responseProfile = {
      ...updated,
      mostPlayedGames: updated.mostPlayedGames ? JSON.parse(updated.mostPlayedGames) : null,
      groups: updated.groups ? JSON.parse(updated.groups) : null,
    };

    return c.json(responseProfile, HttpStatusCodes.OK);
  }
  catch {
    return c.json(
      {
        message: "Failed to refresh Steam profile",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
