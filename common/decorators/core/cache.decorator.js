const constants = require('../../constants')

function Catch(...exceptions) {
  return target => {
    Reflect.defineMetadata(
      constants.FILTER_CATCH_EXCEPTIONS,
      exceptions,
      target
    )
  }
}
exports.Catch = Catch
