import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const steamProfiles = sqliteTable("steam_profiles", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  steamId64: text("steam_id64")
    .notNull()
    .unique(),
  customUrl: text("custom_url"),
  // Steam Info
  steamID: text("steam_id"),
  onlineState: text("online_state"),
  stateMessage: text("state_message"),
  privacyState: text("privacy_state"),
  visibilityState: text("visibility_state"),
  avatarIcon: text("avatar_icon"),
  avatarMedium: text("avatar_medium"),
  avatarFull: text("avatar_full"),
  vacBanned: text("vac_banned"),
  tradeBanState: text("trade_ban_state"),
  isLimitedAccount: text("is_limited_account"),
  memberSince: text("member_since"),
  steamRating: text("steam_rating"),
  hoursPlayed2Wk: text("hours_played_2wk"),
  headline: text("headline"),
  location: text("location"),
  realname: text("real_name"),
  summary: text("summary"),
  // Game Info - Stored as JSON since it's an array
  mostPlayedGames: text("most_played_games"),
  groups: text("groups"),
  // Timestamps
  lastChecked: integer("last_checked", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectSteamProfileSchema = createSelectSchema(steamProfiles);

export const insertSteamProfileSchema = createInsertSchema(
  steamProfiles,
  {
    steamId64: schema => schema.steamId64.min(1),
  },
).omit({
  id: true,
  lastChecked: true,
  createdAt: true,
  updatedAt: true,
});

export const patchSteamProfileSchema = insertSteamProfileSchema.partial();
