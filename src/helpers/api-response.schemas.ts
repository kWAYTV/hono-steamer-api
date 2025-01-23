import { z } from "@hono/zod-openapi";

export const ApiResponseSchema = z.object({
  success: z.boolean().describe("Whether the request was successful"),
  message: z.string().describe("Response message"),
});

export const ApiErrorResponseSchema = ApiResponseSchema.extend({
  success: z.literal(false),
});

export function ApiSuccessResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return ApiResponseSchema.extend({
    success: z.literal(true),
    data: dataSchema,
  });
}
