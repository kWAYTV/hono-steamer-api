import { eq } from "drizzle-orm";
import {
  customUrlToSteamID64,
  steamID64ToCustomUrl,
  steamID64ToFullInfo,
} from "steamid-resolver";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";
import type { SteamInfo } from "@/types/steam";

import db from "@/db";
import { steamProfiles } from "@/db/schema";
import { parseInput } from "@/utils/steam.utils";

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RefreshRoute,
  RemoveRoute,
  ResolveRoute,
} from "./steam.routes";

function isProfileEmpty(profile: typeof steamProfiles.$inferSelect) {
  return !profile.onlineState
    && !profile.stateMessage
    && !profile.privacyState
    && !profile.visibilityState
    && !profile.avatarIcon
    && !profile.avatarMedium
    && !profile.avatarFull;
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const profiles = await db.query.steamProfiles.findMany();
  return c.json(profiles);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const data = c.req.valid("json");
  const [profile] = await db.insert(steamProfiles)
    .values(data)
    .returning();

  return c.json(profile, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const profile = await db.query.steamProfiles.findFirst({
    where: eq(steamProfiles.id, id),
  });

  if (!profile) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(profile, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [updated] = await db.update(steamProfiles)
    .set(updates)
    .where(eq(steamProfiles.id, id))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.delete(steamProfiles)
    .where(eq(steamProfiles.id, id));

  if (result.rowsAffected === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    {
      message: "Steam profile deleted",
    },
    HttpStatusCodes.OK,
  );
};

export const resolve: AppRouteHandler<ResolveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const parsed = parseInput(id);
    let steamId64: string | null = null;
    let fullInfo: SteamInfo | undefined;

    // Try to find in database first
    let profile = await db.query.steamProfiles.findFirst({
      where(fields, operators) {
        return parsed.type === "steamId64"
          ? operators.eq(fields.steamId64, parsed.value)
          : operators.eq(fields.customUrl, parsed.value);
      },
    });

    // If not found, empty, or older than 24 hours, resolve from Steam API
    const now = new Date();
    const needsRefresh = !profile
      || isProfileEmpty(profile)
      || (profile.lastChecked && (now.getTime() - new Date(profile.lastChecked).getTime() > 24 * 60 * 60 * 1000));

    if (needsRefresh) {
      if (parsed.type === "customUrl") {
        steamId64 = await customUrlToSteamID64(parsed.value);
        if (steamId64) {
          fullInfo = await steamID64ToFullInfo(steamId64);
        }
      }
      else {
        // Verify the steamId64 is valid by trying to get info
        fullInfo = await steamID64ToFullInfo(parsed.value);
        if (fullInfo) {
          steamId64 = parsed.value;
        }
      }

      if (!steamId64 || !fullInfo) {
        return c.json(
          {
            message: "Invalid, private or not found Steam ID",
          },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const customUrl = await steamID64ToCustomUrl(steamId64);

      // Extract profile info
      const profileInfo = {
        steamId64,
        customUrl: customUrl || undefined,
        steamID: Array.isArray(fullInfo.steamID) ? fullInfo.steamID[0] : fullInfo.steamID,
        onlineState: Array.isArray(fullInfo.onlineState) ? fullInfo.onlineState[0] : fullInfo.onlineState,
        stateMessage: Array.isArray(fullInfo.stateMessage) ? fullInfo.stateMessage[0] : fullInfo.stateMessage,
        privacyState: Array.isArray(fullInfo.privacyState) ? fullInfo.privacyState[0] : fullInfo.privacyState,
        visibilityState: Array.isArray(fullInfo.visibilityState) ? fullInfo.visibilityState[0] : fullInfo.visibilityState,
        avatarIcon: Array.isArray(fullInfo.avatarIcon) ? fullInfo.avatarIcon[0] : fullInfo.avatarIcon,
        avatarMedium: Array.isArray(fullInfo.avatarMedium) ? fullInfo.avatarMedium[0] : fullInfo.avatarMedium,
        avatarFull: Array.isArray(fullInfo.avatarFull) ? fullInfo.avatarFull[0] : fullInfo.avatarFull,
        vacBanned: Array.isArray(fullInfo.vacBanned) ? fullInfo.vacBanned[0] : fullInfo.vacBanned,
        tradeBanState: Array.isArray(fullInfo.tradeBanState) ? fullInfo.tradeBanState[0] : fullInfo.tradeBanState,
        isLimitedAccount: Array.isArray(fullInfo.isLimitedAccount) ? fullInfo.isLimitedAccount[0] : fullInfo.isLimitedAccount,
        memberSince: Array.isArray(fullInfo.memberSince) ? fullInfo.memberSince[0] : fullInfo.memberSince,
        steamRating: Array.isArray(fullInfo.steamRating) ? fullInfo.steamRating[0] : fullInfo.steamRating,
        hoursPlayed2Wk: Array.isArray(fullInfo.hoursPlayed2Wk) ? fullInfo.hoursPlayed2Wk[0] : fullInfo.hoursPlayed2Wk,
        headline: Array.isArray(fullInfo.headline) ? fullInfo.headline[0] : fullInfo.headline,
        location: Array.isArray(fullInfo.location) ? fullInfo.location[0] : fullInfo.location,
        realname: Array.isArray(fullInfo.realname) ? fullInfo.realname[0] : fullInfo.realname,
        summary: Array.isArray(fullInfo.summary) ? fullInfo.summary[0] : fullInfo.summary,
        // Store arrays as JSON strings
        mostPlayedGames: fullInfo.mostPlayedGames ? JSON.stringify(fullInfo.mostPlayedGames) : null,
        groups: fullInfo.groups ? JSON.stringify(fullInfo.groups) : null,
      };

      // Update or insert profile
      if (profile) {
        [profile] = await db.update(steamProfiles)
          .set({
            ...profileInfo,
            lastChecked: now,
          })
          .where(eq(steamProfiles.id, profile.id))
          .returning();
      }
      else {
        [profile] = await db.insert(steamProfiles)
          .values(profileInfo)
          .returning();
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
      success: true,
      receivedId: id,
      profile: responseProfile,
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
    let profile = await db.query.steamProfiles.findFirst({
      where(fields, operators) {
        return parsed.type === "steamId64"
          ? operators.eq(fields.steamId64, parsed.value)
          : operators.eq(fields.customUrl, parsed.value);
      },
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
    const [customUrl, fullInfo] = await Promise.all([
      steamID64ToCustomUrl(profile.steamId64),
      steamID64ToFullInfo(profile.steamId64),
    ]);

    if (!fullInfo) {
      return c.json(
        {
          message: "Failed to fetch Steam profile info",
        },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Extract profile info
    const profileInfo = {
      customUrl: customUrl || undefined,
      steamID: Array.isArray(fullInfo.steamID) ? fullInfo.steamID[0] : fullInfo.steamID,
      onlineState: Array.isArray(fullInfo.onlineState) ? fullInfo.onlineState[0] : fullInfo.onlineState,
      stateMessage: Array.isArray(fullInfo.stateMessage) ? fullInfo.stateMessage[0] : fullInfo.stateMessage,
      privacyState: Array.isArray(fullInfo.privacyState) ? fullInfo.privacyState[0] : fullInfo.privacyState,
      visibilityState: Array.isArray(fullInfo.visibilityState) ? fullInfo.visibilityState[0] : fullInfo.visibilityState,
      avatarIcon: Array.isArray(fullInfo.avatarIcon) ? fullInfo.avatarIcon[0] : fullInfo.avatarIcon,
      avatarMedium: Array.isArray(fullInfo.avatarMedium) ? fullInfo.avatarMedium[0] : fullInfo.avatarMedium,
      avatarFull: Array.isArray(fullInfo.avatarFull) ? fullInfo.avatarFull[0] : fullInfo.avatarFull,
      vacBanned: Array.isArray(fullInfo.vacBanned) ? fullInfo.vacBanned[0] : fullInfo.vacBanned,
      tradeBanState: Array.isArray(fullInfo.tradeBanState) ? fullInfo.tradeBanState[0] : fullInfo.tradeBanState,
      isLimitedAccount: Array.isArray(fullInfo.isLimitedAccount) ? fullInfo.isLimitedAccount[0] : fullInfo.isLimitedAccount,
      memberSince: Array.isArray(fullInfo.memberSince) ? fullInfo.memberSince[0] : fullInfo.memberSince,
      steamRating: Array.isArray(fullInfo.steamRating) ? fullInfo.steamRating[0] : fullInfo.steamRating,
      hoursPlayed2Wk: Array.isArray(fullInfo.hoursPlayed2Wk) ? fullInfo.hoursPlayed2Wk[0] : fullInfo.hoursPlayed2Wk,
      headline: Array.isArray(fullInfo.headline) ? fullInfo.headline[0] : fullInfo.headline,
      location: Array.isArray(fullInfo.location) ? fullInfo.location[0] : fullInfo.location,
      realname: Array.isArray(fullInfo.realname) ? fullInfo.realname[0] : fullInfo.realname,
      summary: Array.isArray(fullInfo.summary) ? fullInfo.summary[0] : fullInfo.summary,
      // Store arrays as JSON strings
      mostPlayedGames: fullInfo.mostPlayedGames ? JSON.stringify(fullInfo.mostPlayedGames) : null,
      groups: fullInfo.groups ? JSON.stringify(fullInfo.groups) : null,
      lastChecked: new Date(),
    };

    [profile] = await db.update(steamProfiles)
      .set(profileInfo)
      .where(eq(steamProfiles.id, profile.id))
      .returning();

    // Parse JSON fields before returning
    const responseProfile = {
      ...profile,
      mostPlayedGames: profile.mostPlayedGames ? JSON.parse(profile.mostPlayedGames) : null,
      groups: profile.groups ? JSON.parse(profile.groups) : null,
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
