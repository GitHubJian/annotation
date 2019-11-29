const exception_handler = require('./exception-handler')
const messages = require('./messages')

class ExceptionZone {
  static run(fn) {
    try {
      fn()
    } catch (e) {
      this.exceptionHandler.handle(e)
      throw messages.UNHANDLED_RUNTIME_EXCEPTION
    }
  }
  static async asyncRun(fn) {
    try {
      await fn()
    } catch (e) {
      this.exceptionHandler.handle(e)
      throw messages.UNHANDLED_RUNTIME_EXCEPTION
    }
  }
}
ExceptionZone.exceptionHandler = new exception_handler.ExceptionHandler()
exports.ExceptionZone = ExceptionZone
