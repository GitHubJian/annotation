const constants = require('./constants')

class InvalidModuleConfigException extends Error {
  constructor(property) {
    super(constants.InvalidModuleConfigMessage(property))
  }
}

exports.InvalidModuleConfigException = InvalidModuleConfigException
