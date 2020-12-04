export default class LocalizationError extends Error {
  constructor(message = '', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LocalizationError);
    }
    this.name = 'LocalizationError';
    this.message = [message, ...params];
  }
}