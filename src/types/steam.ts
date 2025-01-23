import type { steamProfiles } from "@/db/schema";

export interface ParsedSteamInput {
  type: "customUrl" | "steamId64";
  value: string;
}

export interface SteamProfile {
  steamId64: string;
  customUrl?: string;
  fullInfo?: SteamInfo;
}

export interface SteamInfo {
  steamID64?: string[];
  steamID?: string[];
  onlineState?: string[];
  stateMessage?: string[];
  privacyState?: string[];
  visibilityState?: string[];
  avatarIcon?: string[];
  avatarMedium?: string[];
  avatarFull?: string[];
  vacBanned?: string[];
  tradeBanState?: string[];
  isLimitedAccount?: string[];
  customURL?: string[];
  memberSince?: string[];
  steamRating?: string[];
  hoursPlayed2Wk?: string[];
  headline?: string[];
  location?: string[];
  realname?: string[];
  summary?: string[];
  mostPlayedGames?: Array<{
    mostPlayedGame?: Array<{
      gameName?: string[];
      gameLink?: string[];
      gameIcon?: string[];
      gameLogo?: string[];
      gameLogoSmall?: string[];
      hoursPlayed?: string[];
      hoursOnRecord?: string[];
      statsName?: string[];
    }>;
  }>;
  groups?: Array<{
    group?: Array<{
      $?: { isPrimary: string };
      groupID64?: string[];
      groupName?: string[];
      groupURL?: string[];
      headline?: string[];
      summary?: string[];
      avatarIcon?: string[];
      avatarMedium?: string[];
      avatarFull?: string[];
      memberCount?: string[];
      membersInChat?: string[];
      membersInGame?: string[];
      membersOnline?: string[];
    }>;
  }>;
}

// Service Types
export interface ServiceError {
  error: string;
}

export type ServiceProfile = typeof steamProfiles.$inferSelect & {
  mostPlayedGames: any;
  groups: any;
};

export interface ResolveResult {
  profile: ServiceProfile;
  isCached: boolean;
  receivedId: string;
}

export interface RefreshResult {
  profile: ServiceProfile;
}
