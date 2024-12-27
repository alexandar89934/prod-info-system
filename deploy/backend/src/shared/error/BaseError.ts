export abstract class BaseError extends Error {
  statusCode: number;

  stack: string;

  isOperational: boolean;
}
