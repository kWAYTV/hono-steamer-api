import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { notFound } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import type { AppBindings, AppOpenAPI } from "@/lib/types";

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
  app.use("/api/*", bearerAuth({ token: env.BEARER_TOKEN }));
  app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

  app.notFound(notFound);
  app.onError(extOnError);

  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
