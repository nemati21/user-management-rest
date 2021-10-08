class UnauthorizedError extends Error {
  constructor(code, message) {
    super('Unauthorized');
    this.code = 1003;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = UnauthorizedError;
