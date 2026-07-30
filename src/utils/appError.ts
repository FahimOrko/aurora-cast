export class AppError extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(message: string, code = 500, isOperational = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
