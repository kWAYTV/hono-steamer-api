import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHono } from "@hono/zod-openapi";
import { rateLimiter } from "hono-rate-limiter";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { notFound } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import type { AppBindings, AppOpenAPI } from "@/types/app.types";

import env from "@/env";
import { extOnError } from "@/helpers/ext-on-error";
import { pinoLogger } from "@/middlewares/pino-logger";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(pinoLogger());
  app.use(
    csrf({
      origin: env.BASE_URL,
    }),
  );
  app.use(
    cors({
      origin: env.BASE_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );
  app.use(
    rateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
      standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
      keyGenerator: () => "<unique_key>", // Method to generate custom identifiers for clients.
      message: { success: false, message: "Too many requests, try again later" },
    }),
  );

  app.use("/api/*", bearerAuth({ token: env.BEARER_TOKEN }));
  app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

  app.notFound(notFound);
  app.onError(extOnError);

  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
