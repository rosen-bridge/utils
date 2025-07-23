export class ResponseValidationError extends Error {
  public details: Record<string, any>;

  constructor(validationResult: Record<string, any>) {
    super("Response doesn't match the schema");
    this.name = 'ResponseValidationError';
    this.details = validationResult.error;
  }
}
