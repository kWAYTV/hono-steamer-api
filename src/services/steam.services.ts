import { eq } from "drizzle-orm";
import { customUrlToSteamID64 } from "steamid-resolver";

import type { ServiceError } from "@/types/api.types";
import type { ParsedSteamInput, RefreshResult, ResolveResult } from "@/types/steam.types";

import db from "@/db";
import { steamProfiles } from "@/db/schema";
import { STEAM_ERROR_MESSAGES } from "@/lib/constants";
import { fetchAndFormatSteamProfile, isProfileEmpty, parseInput } from "@/utils/steam.utils";

// Cache duration in milliseconds (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

export async function findProfile(input: ParsedSteamInput) {
  return db.query.steamProfiles.findFirst({
    where(fields, operators) {
      return input.type === "steamId64"
        ? operators.eq(fields.steamId64, input.value)
        : operators.eq(fields.customUrl, input.value);
    },
  });
}

export async function resolveProfile(id: string): Promise<ResolveResult | ServiceError> {
  const parsed = parseInput(id);
  let steamId64: string | null = null;
  let profile = null;
  let isCached = false;

  // Try to find in database first
  profile = await findProfile(parsed);

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
      return { success: false, error: STEAM_ERROR_MESSAGES.INVALID_ID };
    }

    const profileInfo = await fetchAndFormatSteamProfile(steamId64);
    if (!profileInfo) {
      return { success: false, error: STEAM_ERROR_MESSAGES.FETCH_FAILED };
    }

    // Update or insert profile in a single operation
    if (profile) {
      await db.update(steamProfiles)
        .set(profileInfo)
        .where(eq(steamProfiles.id, profile.id));
    }
    else {
      await db.insert(steamProfiles)
        .values(profileInfo);
    }

    // Fetch the final profile
    profile = await db.query.steamProfiles.findFirst({
      where: eq(steamProfiles.steamId64, steamId64),
    });
  }

  if (!profile) {
    return { success: false, error: STEAM_ERROR_MESSAGES.CREATE_FAILED };
  }

  // Parse JSON fields
  return {
    success: true,
    profile: {
      ...profile,
      mostPlayedGames: profile.mostPlayedGames ? JSON.parse(profile.mostPlayedGames) : null,
      groups: profile.groups ? JSON.parse(profile.groups) : null,
    },
    isCached,
    receivedId: id,
  };
}

export async function refreshProfile(id: string): Promise<RefreshResult | ServiceError> {
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
    return { success: false, error: STEAM_ERROR_MESSAGES.INVALID_ID };
  }

  // Find profile in database
  const profile = await db.query.steamProfiles.findFirst({
    where: eq(steamProfiles.steamId64, steamId64),
  });

  if (!profile) {
    return { success: false, error: STEAM_ERROR_MESSAGES.PROFILE_NOT_FOUND };
  }

  // Force refresh from Steam API
  const profileInfo = await fetchAndFormatSteamProfile(steamId64);
  if (!profileInfo) {
    return { success: false, error: STEAM_ERROR_MESSAGES.FETCH_FAILED };
  }

  // Update profile and return updated data in a single operation
  await db.update(steamProfiles)
    .set(profileInfo)
    .where(eq(steamProfiles.id, profile.id));

  const updated = await db.query.steamProfiles.findFirst({
    where: eq(steamProfiles.id, profile.id),
  });

  if (!updated) {
    return { success: false, error: STEAM_ERROR_MESSAGES.UPDATE_FAILED };
  }

  // Parse JSON fields
  return {
    success: true,
    profile: {
      ...updated,
      mostPlayedGames: updated.mostPlayedGames ? JSON.parse(updated.mostPlayedGames) : null,
      groups: updated.groups ? JSON.parse(updated.groups) : null,
    },
  };
}
