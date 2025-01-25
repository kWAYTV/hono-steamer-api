import type { ErrorHandler } from "hono";

import { HTTPException } from "hono/http-exception";
import { TOO_MANY_REQUESTS, UNAUTHORIZED } from "stoker/http-status-codes";
import { onError } from "stoker/middlewares";

export const extOnError: ErrorHandler = (err, c) => {
  // Handle 401 Unauthorized errors
  if (err instanceof HTTPException && err.status === UNAUTHORIZED) {
    return c.json({ success: false, message: "Unauthorized: Invalid or missing authorization token" }, UNAUTHORIZED);
  }

  // Handle 429 Too Many Requests errors
  if (err instanceof HTTPException && err.status === TOO_MANY_REQUESTS) {
    return c.json({ success: false, message: "Too many requests" }, TOO_MANY_REQUESTS);
  }

  // For all other errors, use the original onError handler
  return onError(err, c);
};
