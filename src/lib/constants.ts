import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Required",
  EXPECTED_NUMBER: "Expected number, received nan",
  NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
};

export const STEAM_ERROR_MESSAGES = {
  INVALID_ID: "Invalid, private or not found Steam ID",
  FETCH_FAILED: "Failed to fetch Steam profile info",
  PROFILE_NOT_FOUND: "Profile not found",
  UPDATE_FAILED: "Failed to update profile",
  CREATE_FAILED: "Failed to create profile",
  RESOLVE_FAILED: "Failed to resolve Steam ID",
  REFRESH_FAILED: "Failed to refresh Steam profile",
};

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
