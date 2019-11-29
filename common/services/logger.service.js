class Logger {
  constructor(context) {
    this.context = context
  }
  log(message, context) {}
  error(message, trace = '', context) {}
}
Logger.logger = function() {}
exports.Logger = Logger
