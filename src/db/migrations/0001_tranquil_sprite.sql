CREATE TABLE `steam_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`steam_id64` text NOT NULL,
	`custom_url` text,
	`last_checked` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `steam_profiles_steam_id64_unique` ON `steam_profiles` (`steam_id64`);