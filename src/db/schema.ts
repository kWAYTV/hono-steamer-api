import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const steamProfiles = mysqlTable("steam_profiles", {
  id: int("id").primaryKey().autoincrement(),
  steamId64: varchar("steam_id64", { length: 32 }).notNull().unique(),
  customUrl: varchar("custom_url", { length: 255 }),
  // Steam Info
  steamID: varchar("steam_id", { length: 32 }),
  onlineState: varchar("online_state", { length: 32 }),
  stateMessage: varchar("state_message", { length: 255 }),
  privacyState: varchar("privacy_state", { length: 32 }),
  visibilityState: varchar("visibility_state", { length: 32 }),
  avatarIcon: varchar("avatar_icon", { length: 255 }),
  avatarMedium: varchar("avatar_medium", { length: 255 }),
  avatarFull: varchar("avatar_full", { length: 255 }),
  vacBanned: varchar("vac_banned", { length: 32 }),
  tradeBanState: varchar("trade_ban_state", { length: 32 }),
  isLimitedAccount: varchar("is_limited_account", { length: 32 }),
  memberSince: varchar("member_since", { length: 64 }),
  steamRating: varchar("steam_rating", { length: 32 }),
  hoursPlayed2Wk: varchar("hours_played_2wk", { length: 32 }),
  headline: varchar("headline", { length: 255 }),
  location: varchar("location", { length: 255 }),
  realname: varchar("real_name", { length: 255 }),
  summary: text("summary"),
  // Game Info - Stored as JSON since it's an array
  mostPlayedGames: text("most_played_games"),
  groups: text("groups"),
  // Timestamps
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
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
