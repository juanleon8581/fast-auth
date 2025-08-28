export abstract class CustomError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract getStatusCode(): number;

  serializeErrors(): { message: string; field?: string; code?: string }[] {
    return [{ 
      message: this.message, 
      field: this.field,
      code: this.code 
    }];
  }
}
