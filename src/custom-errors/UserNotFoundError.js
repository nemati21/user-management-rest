class UserNotFoundError extends Error {
  constructor(code, message) {
    super('User not found');
    this.code = 1006;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = UserNotFoundError;
