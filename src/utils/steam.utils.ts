import type { ParsedSteamInput } from "@/types/steam";

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
