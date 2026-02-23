import { ZodError } from 'zod';

export class ResponseValidationError extends Error {
  public details: ZodError;

  constructor(validationResult: ZodError) {
    super("Response doesn't match the schema");
    this.name = 'ResponseValidationError';
    this.details = validationResult;
  }
}
