// Types
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface RequestPayload extends ModelParameters {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?:
    | {
        type: "json_object";
        schema: Record<string, unknown>;
      }
    | {
        type: "json_schema";
        json_schema: Record<string, unknown>;
      };
}

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
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string, code = "AUTH_ERROR", status?: number) {
    super(message, code, status);
    this.name = "OpenRouterAuthError";
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, code = "RATE_LIMIT_ERROR", status?: number) {
    super(message, code, status);
    this.name = "OpenRouterRateLimitError";
  }
}
