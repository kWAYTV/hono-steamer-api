import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import health from "@/routes/health/health.index";
import index from "@/routes/index.route";
import steam from "@/routes/steam/steam.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  steam,
  health,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
