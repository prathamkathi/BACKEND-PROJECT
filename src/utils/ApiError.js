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
    this.success = false;
    this.errors = errors;
    // this.message = message; // not needed because super() already sets the message

    // * capture stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
