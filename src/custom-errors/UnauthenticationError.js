class UnauthenticationError extends Error {
  constructor(code, message) {
    super('Unauthenticated');
    this.code = 1004;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = UnauthenticationError;
