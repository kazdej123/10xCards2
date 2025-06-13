import { z } from "zod";

export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});

export const messageSchema = z.object({
  role: z.enum(["system", "user"]),
  content: z.string().min(1),
});

export const requestPayloadSchema = modelParametersSchema.extend({
  messages: z.array(messageSchema).min(1),
  model: z.string().min(1),
  response_format: z
    .object({
      type: z.literal("json_object"),
      schema: z.record(z.unknown()),
    })
    .optional(),
});

export const apiResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
          role: z.string(),
        }),
      })
    )
    .min(1),
});

export const configSchema = z.object({
  apiKey: z.string().min(1),
  apiUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().int().positive().optional(),
  defaultModel: z.string().min(1).optional(),
  defaultModelParameters: modelParametersSchema.optional(),
});
