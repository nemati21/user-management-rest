class PasswordIncorrectError extends Error {
  constructor() {
    super('Password is incorrect');
    this.code = 1009;
  }
}

module.exports = PasswordIncorrectError;
