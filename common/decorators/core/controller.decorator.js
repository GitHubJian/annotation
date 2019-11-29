const shared_utils = require('../../utils/shared.utils')
const constants = require('../../constants')

function Controller(prefix) {
  const path = shared_utils.isUndefined(prefix) ? '/' : prefix

  return target => {
    Reflect.defineMetadata(constants.PATH_METADATA, path, target)
  }
}
exports.Controller = Controller
