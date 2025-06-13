import type { ApiResponse, ModelParameters, OpenRouterConfig, RequestPayload } from "./openRouterTypes";

import { OpenRouterAuthError, OpenRouterError, OpenRouterRateLimitError } from "./openRouterTypes";

import { apiResponseSchema, configSchema, requestPayloadSchema } from "./openRouterSchemas";

import { OpenRouterLogger } from "./openRouterLogger";

// Types
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export type RequestPayload = {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?: {
    type: "json_object";
    schema: Record<string, unknown>;
  };
} & ModelParameters;

export interface ApiResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
}

export interface OpenRouterConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  retries?: number;
  defaultModel?: string;
  defaultModelParameters?: ModelParameters;
}

// Error types
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "OpenRouterAuthError";
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "OpenRouterRateLimitError";
  }
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private currentSystemMessage?: string;
  private currentUserMessage?: string;
  private currentResponseFormat?: Record<string, unknown>;
  private currentModelName: string;
  private currentModelParameters: ModelParameters;
  private readonly logger: OpenRouterLogger;

  constructor(config: OpenRouterConfig) {
    this.logger = OpenRouterLogger.getInstance();

    try {
      // Validate config using Zod
      const validatedConfig = configSchema.parse(config);

      // Initialize configuration
      this.apiKey = validatedConfig.apiKey;
      this.apiUrl = validatedConfig.apiUrl ?? "https://openrouter.ai/api/v1";
      this.timeout = validatedConfig.timeout ?? 30000;
      this.retries = validatedConfig.retries ?? 3;
      this.currentModelName = validatedConfig.defaultModel ?? "openai/gpt-3.5-turbo";
      this.currentModelParameters = validatedConfig.defaultModelParameters ?? {
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      this.logger.info("OpenRouter service initialized", {
        apiUrl: this.apiUrl,
        model: this.currentModelName,
      });
    } catch (error) {
      this.logger.error("Failed to initialize OpenRouter service", error);
      throw error;
    }
  }

  // Public methods for configuration
  public setSystemMessage(message: string): void {
    this.currentSystemMessage = message;
    this.logger.debug("System message set", { length: message.length });
  }

  public setUserMessage(message: string): void {
    this.currentUserMessage = message;
    this.logger.debug("User message set", { length: message.length });
  }

  public setResponseFormat(schema: Record<string, unknown>): void {
    this.currentResponseFormat = schema;
    this.logger.debug("Response format set", { schema });
  }

  public setModel(name: string, parameters?: ModelParameters): void {
    this.currentModelName = name;
    if (parameters) {
      this.currentModelParameters = {
        ...this.currentModelParameters,
        ...parameters,
      };
    }
    this.logger.debug("Model configuration updated", {
      model: name,
      parameters: this.currentModelParameters,
    });
  }

  // Public method for sending messages
  public async sendChatMessage(userMessage?: string): Promise<ApiResponse> {
    try {
      // Set user message if provided
      if (userMessage) {
        this.setUserMessage(userMessage);
      }

      // Validate required messages
      if (!this.currentUserMessage) {
        throw new OpenRouterError("User message is required");
      }

      const payload = this.buildRequestPayload();
      this.logger.logRequest(payload);

      const response = await this.executeRequest(payload);
      this.logger.info("Chat message sent successfully", {
        model: this.currentModelName,
        choices: response.choices.length,
      });

      return response;
    } catch (error) {
      this.logger.error("Failed to send chat message", error);
      // Rethrow OpenRouterError instances
      if (error instanceof OpenRouterError) {
        throw error;
      }
      // Wrap unknown errors
      throw new OpenRouterError("Failed to send chat message", error);
    }
  }

  // Private methods
  private buildRequestPayload(): RequestPayload {
    try {
      const messages = [];

      // Add system message if present
      if (this.currentSystemMessage) {
        messages.push({
          role: "system" as const,
          content: this.currentSystemMessage,
        });
      }

      // Add user message
      messages.push({
        role: "user" as const,
        content: this.currentUserMessage!,
      });

      const payload: RequestPayload = {
        messages,
        model: this.currentModelName,
        ...this.currentModelParameters,
      };

      // Add response format if present
      if (this.currentResponseFormat) {
        payload.response_format = {
          type: "json_object",
          schema: this.currentResponseFormat,
        };
      }

      // Validate payload using Zod
      return requestPayloadSchema.parse(payload);
    } catch (error) {
      this.logger.error("Failed to build request payload", error);
      throw error;
    }
  }

  private async executeRequest(payload: RequestPayload): Promise<ApiResponse> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        if (attempt > 1) {
          this.logger.info(`Retrying request (attempt ${attempt}/${this.retries})`);
        }

        const response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases
          switch (response.status) {
            case 401:
              throw new OpenRouterAuthError("Invalid API key");
            case 429:
              throw new OpenRouterRateLimitError("Rate limit exceeded");
            default:
              throw new OpenRouterError(`API request failed: ${response.statusText}`, errorData);
          }
        }

        const data = await response.json();
        // Validate response using Zod
        return apiResponseSchema.parse(data);
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Request attempt ${attempt} failed`, error);

        // Don't retry on auth errors or rate limits
        if (error instanceof OpenRouterAuthError || error instanceof OpenRouterRateLimitError) {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === this.retries) {
          throw new OpenRouterError(`Failed to execute request after ${this.retries} attempts`, lastError);
        }

        // Wait before retrying (exponential backoff)
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    // This should never happen due to the loop above
    throw new OpenRouterError("Unexpected error in request execution");
  }
}
