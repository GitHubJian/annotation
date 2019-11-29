const messages = require('../messages')
const runtime_exception = require('./runtime.exception')
class UnknownDependenciesException extends runtime_exception.RuntimeException {
  constructor(type, unknownDependencyContext, module) {
    super(
      messages.UNKNOWN_DEPENDENCIES_MESSAGE(
        type,
        unknownDependencyContext,
        module
      )
    )
  }
}
exports.UnknownDependenciesException = UnknownDependenciesException
