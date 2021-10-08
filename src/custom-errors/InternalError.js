class InternalError extends Error {
  constructor(code, message) {
    super('Internal error');
    this.code = 1001;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = InternalError;
