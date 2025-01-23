import { steamID64ToCustomUrl, steamID64ToFullInfo } from "steamid-resolver";

import type { steamProfiles } from "@/db/schema";
import type { ParsedSteamInput, SteamInfo } from "@/types/steam";

export function parseInput(id: string): ParsedSteamInput {
  // Remove trailing slashes
  id = id.replace(/\/$/, "");

  // Full profile URL with ID
  const profileMatch = id.match(/steamcommunity\.com\/profiles\/(\d+)/);
  if (profileMatch) {
    return { type: "steamId64", value: profileMatch[1] };
  }

  // Full custom URL
  const customUrlMatch = id.match(/steamcommunity\.com\/id\/([^/]+)/);
  if (customUrlMatch) {
    return { type: "customUrl", value: customUrlMatch[1] };
  }

  // Raw Steam ID64 (just numbers)
  if (/^\d+$/.test(id)) {
    return { type: "steamId64", value: id };
  }

  // Assume it's a custom URL if none of the above
  return { type: "customUrl", value: id };
}

export function isProfileEmpty(profile: typeof steamProfiles.$inferSelect) {
  return !profile.onlineState
    && !profile.stateMessage
    && !profile.privacyState
    && !profile.visibilityState
    && !profile.avatarIcon
    && !profile.avatarMedium
    && !profile.avatarFull;
}

// Helper to safely get first array item or undefined
function getFirst<T>(arr: T[] | undefined): T | undefined {
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
}

export async function fetchAndFormatSteamProfile(steamId64: string): Promise<typeof steamProfiles.$inferInsert | null> {
  const [customUrl, fullInfo] = await Promise.all([
    steamID64ToCustomUrl(steamId64),
    steamID64ToFullInfo(steamId64),
  ]);

  if (!fullInfo) {
    return null;
  }

  const info = fullInfo as SteamInfo;
  return {
    steamId64,
    customUrl: customUrl || undefined,
    steamID: getFirst(info.steamID),
    onlineState: getFirst(info.onlineState),
    stateMessage: getFirst(info.stateMessage),
    privacyState: getFirst(info.privacyState),
    visibilityState: getFirst(info.visibilityState),
    avatarIcon: getFirst(info.avatarIcon),
    avatarMedium: getFirst(info.avatarMedium),
    avatarFull: getFirst(info.avatarFull),
    vacBanned: getFirst(info.vacBanned),
    tradeBanState: getFirst(info.tradeBanState),
    isLimitedAccount: getFirst(info.isLimitedAccount),
    memberSince: getFirst(info.memberSince),
    steamRating: getFirst(info.steamRating),
    hoursPlayed2Wk: getFirst(info.hoursPlayed2Wk),
    headline: getFirst(info.headline),
    location: getFirst(info.location),
    realname: getFirst(info.realname),
    summary: getFirst(info.summary),
    // Store arrays as JSON strings
    mostPlayedGames: info.mostPlayedGames ? JSON.stringify(info.mostPlayedGames) : null,
    groups: info.groups ? JSON.stringify(info.groups) : null,
    lastChecked: new Date(),
  };
}
