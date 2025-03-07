/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),

  MYSQL_HOST: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  MYSQL_SSL: z.enum(["true", "false"]).default("false"),

  BEARER_TOKEN: z.string(),

  // Base URL for CORS and CSRF
  BASE_URL: z.string().default(
    process.env.NODE_ENV === "production"
      ? "https://steam.kway.club"
      : "http://localhost:3000",
  ),
}).superRefine((input, ctx) => {
  if (input.NODE_ENV === "production" && !input.MYSQL_PASSWORD) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["MYSQL_PASSWORD"],
      message: "Must be set when NODE_ENV is 'production'",
    });
  }
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
