import type { RequestPayload } from "./openRouterTypes";

export interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "debug";
  message: string;
  data?: unknown;
}

export class OpenRouterLogger {
  private static instance: OpenRouterLogger;
  private logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): OpenRouterLogger {
    if (!OpenRouterLogger.instance) {
      OpenRouterLogger.instance = new OpenRouterLogger();
    }
    return OpenRouterLogger.instance;
  }

  public info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  public error(message: string, error?: unknown): void {
    this.log("error", message, error);
  }

  public debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  public logRequest(payload: RequestPayload): void {
    // Remove sensitive data before logging
    const sanitizedPayload = {
      ...payload,
      messages: payload.messages.map((msg) => ({
        role: msg.role,
        contentLength: msg.content.length,
      })),
    };

    this.debug("API Request", sanitizedPayload);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  private log(level: LogEntry["level"], message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
    };

    this.logs.push(entry);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[OpenRouter][${entry.level.toUpperCase()}] ${entry.message}`, entry.data || "");
    }
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;

    if (typeof data === "object") {
      const sanitized = { ...(data as Record<string, unknown>) };
      // Remove sensitive fields
      delete sanitized.apiKey;
      delete sanitized.Authorization;
      return sanitized;
    }

    return data;
  }
}
