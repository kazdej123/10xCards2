import type { ApiResponse, ModelParameters, RequestPayload } from "./openRouterTypes";

import { OpenRouterAuthError, OpenRouterError } from "./openRouterTypes";

import { requestPayloadSchema } from "./openRouterSchemas";

import { Logger } from "./openRouterLogger";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;
  private readonly logger: Logger;

  private currentSystemMessage = "";
  private currentUserMessage = "";
  private currentResponseFormat?: Record<string, unknown>;
  private currentModelName = "openai/gpt-4o-mini";
  private currentModelParameters: ModelParameters = {
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  constructor(config: { apiKey: string; apiUrl?: string; timeout?: number; maxRetries?: number }) {
    this.logger = new Logger("OpenRouterService");

    try {
      // Validate required configuration
      if (!config.apiKey) {
        throw new OpenRouterError("API key is required", "MISSING_API_KEY");
      }

      this.apiKey = config.apiKey;
      this.apiUrl = config.apiUrl || "https://openrouter.ai/api/v1";
      this.defaultTimeout = config.timeout || 30000;
      this.maxRetries = config.maxRetries || 3;

      this.logger.info("OpenRouter service initialized", {
        apiUrl: this.apiUrl,
        model: this.currentModelName,
      });
    } catch (error) {
      this.logger.error("Failed to initialize OpenRouter service", error);
      throw error;
    }
  }

  /**
   * Sets the system message that provides context for the model
   */
  public setSystemMessage(message: string): void {
    try {
      if (!message.trim()) {
        throw new OpenRouterError("System message cannot be empty", "INVALID_SYSTEM_MESSAGE");
      }

      this.currentSystemMessage = message;
      this.logger.debug("System message set", { messageLength: message.length });
    } catch (error) {
      this.logger.error("Failed to set system message", { error, messageLength: message.length });
      throw error;
    }
  }

  /**
   * Sets the user message for the chat request
   */
  public setUserMessage(message: string): void {
    try {
      if (!message.trim()) {
        throw new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE");
      }

      this.currentUserMessage = message;
      this.logger.debug("User message set", { messageLength: message.length });
    } catch (error) {
      this.logger.error("Failed to set user message", { error, messageLength: message.length });
      throw error;
    }
  }

  /**
   * Sets the JSON schema for structured responses
   */
  public setResponseFormat(schema: Record<string, unknown>): void {
    try {
      // Validate that the schema is a valid JSON object
      JSON.stringify(schema);

      this.currentResponseFormat = schema;
      this.logger.debug("Response format set", { schemaKeys: Object.keys(schema) });
    } catch (error) {
      this.logger.error("Failed to set response format", { error, schemaKeys: Object.keys(schema) });
      throw new OpenRouterError("Invalid JSON schema provided", "INVALID_RESPONSE_FORMAT");
    }
  }

  /**
   * Sets the model and its parameters
   */
  public setModel(name: string, parameters?: ModelParameters): void {
    try {
      if (!name.trim()) {
        throw new OpenRouterError("Model name cannot be empty", "INVALID_MODEL_NAME");
      }

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
    } catch (error) {
      this.logger.error("Failed to set model", { error, model: name, parameters });
      throw error;
    }
  }

  /**
   * Sends a chat message to the OpenRouter API and returns the response
   * @throws {OpenRouterError} If the request fails or validation fails
   */
  public async sendChatMessage(): Promise<string> {
    try {
      // Build and validate the request payload
      const payload = this.buildRequestPayload();
      requestPayloadSchema.parse(payload);

      // Execute the request
      const response = await this.executeRequest(payload);

      this.logger.info("Chat message sent successfully", {
        model: this.currentModelName,
        choices: response.choices.length,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error("Failed to send chat message", error);
      throw error;
    }
  }

  /**
   * Builds the request payload for the OpenRouter API
   */
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

      // Add user message - we've already validated it exists
      if (this.currentUserMessage) {
        messages.push({
          role: "user" as const,
          content: this.currentUserMessage,
        });
      }

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

      return payload;
    } catch (error) {
      this.logger.error("Failed to build request payload", error);
      throw error;
    }
  }

  /**
   * Executes a request to the OpenRouter API with retry logic
   */
  private async executeRequest(requestPayload: RequestPayload): Promise<ApiResponse> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(this.defaultTimeout),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle specific error cases
          if (response.status === 401 || response.status === 400) {
            throw new OpenRouterAuthError("Invalid API key", "API_ERROR", response.status);
          }

          throw new OpenRouterError(errorData.message || "HTTP error " + response.status, "API_ERROR", response.status);
        }

        const data = await response.json();
        return data as ApiResponse;
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Request attempt ${attempt + 1} failed`, error);

        // Don't retry on authentication errors or invalid requests
        if (error instanceof OpenRouterAuthError && (error.status === 401 || error.status === 400)) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }

    throw lastError || new OpenRouterError("Maximum retry attempts reached", "MAX_RETRIES_EXCEEDED");
  }
}
