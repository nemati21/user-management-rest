class RejectError extends Error {
  constructor(code, message) {
    super('Request rejected');
    this.code = 1002;
    if (code) this.originCode = code;
    if (message) this.originMessage = message;
  }
}

module.exports = RejectError;
