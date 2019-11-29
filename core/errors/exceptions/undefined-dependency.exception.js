const messages = require('../messages')
const runtime_exception = require('./runtime.exception')
class UndefinedDependencyException extends runtime_exception.RuntimeException {
  constructor(type, undefinedDependencyContext, module) {
    super(
      messages.UNKNOWN_DEPENDENCIES_MESSAGE(
        type,
        undefinedDependencyContext,
        module
      )
    )
  }
}
exports.UndefinedDependencyException = UndefinedDependencyException
