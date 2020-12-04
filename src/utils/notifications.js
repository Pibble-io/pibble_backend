export default class Notifications extends Error {
  constructor(message = '', ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Notifications);
    }
    this.name = 'Notifications';
    this.message = [message, ...params];
  }
}