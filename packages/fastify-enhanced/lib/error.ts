export class ResponseValidationError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public details: Record<string, any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(validationResult: Record<string, any>) {
    super("Response doesn't match the schema");
    this.name = 'ResponseValidationError';
    this.details = validationResult.error;
  }
}
