import type { ErrorHandler } from "hono";

import { HTTPException } from "hono/http-exception";
import { UNAUTHORIZED } from "stoker/http-status-codes";
import { onError } from "stoker/middlewares";

export const extOnError: ErrorHandler = (err, c) => {
  // Handle 401 Unauthorized errors
  if (err instanceof HTTPException && err.status === UNAUTHORIZED) {
    return c.json({ success: false, message: "Unauthorized: Invalid or missing authorization token" }, UNAUTHORIZED);
  }

  // For all other errors, use the original onError handler
  return onError(err, c);
};
