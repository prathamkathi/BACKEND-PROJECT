export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // overwrite parent constructor param with this one's message

    // create & set values
    this.statusCode = statusCode;
    this.data = null;
    // this.message = message; // not needed because super() already sets the message
    this.success = false;
    this.errors = errors;

    // *capture stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
