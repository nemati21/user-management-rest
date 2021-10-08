class AccessDeniedError extends Error {
  constructor(code, message) {
    super('Access denied');
    this.code = 1005;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = AccessDeniedError;
