export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service request failed", statusCode = 502) {
    super("EXTERNAL_SERVICE_ERROR", message, statusCode);
  }
}

export class TradingCredentialsMissingError extends AppError {
  constructor(
    message = "Trading credentials are not configured. Set POLYMARKET_KEY_ID and POLYMARKET_SECRET_KEY.",
  ) {
    super("TRADING_CREDENTIALS_MISSING", message, 401);
  }
}

export class AiCredentialsMissingError extends AppError {
  constructor(
    message = "AI credentials are not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
  ) {
    super("AI_CREDENTIALS_MISSING", message, 401);
  }
}
