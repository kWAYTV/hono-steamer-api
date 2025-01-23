import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "@/lib/types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Steamer API",
    },
    security: [{ bearerAuth: [] }],
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.get(
    "/reference",
    apiReference({
      theme: "deepSpace",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "javascript",
        clientKey: "fetch",
      },
      spec: {
        url: "/doc",
      },
    }),
  );
}
