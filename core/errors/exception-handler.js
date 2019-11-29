const runtime_exception = require('./exceptions/runtime.exception')
const logger_service = require('../../common/services/logger.service')
class ExceptionHandler {
  handle(exception) {
    if (!(exception instanceof runtime_exception.RuntimeException)) {
      ExceptionHandler.logger.error(exception.message, exception.stack)
      return
    }
    ExceptionHandler.logger.error(exception.what(), exception.stack)
  }
}
ExceptionHandler.logger = new logger_service.Logger(ExceptionHandler.name)
exports.ExceptionHandler = ExceptionHandler
