const constants = require('../../constants')
const shared_utils = require('../../utils/shared.utils')

function Optional() {
  return (target, key, index) => {
    if (!shared_utils.isUndefined(index)) {
      const args =
        Reflect.getMetadata(constants.OPTIONAL_DEPS_METADATA, target) || []
      Reflect.defineMetadata(
        constants.OPTIONAL_DEPS_METADATA,
        [...args, index],
        target
      )
      return
    }
    const properties =
      Reflect.getMetadata(
        constants.OPTIONAL_PROPERTY_DEPS_METADATA,
        target.constructor
      ) || []
    Reflect.defineMetadata(
      constants.OPTIONAL_PROPERTY_DEPS_METADATA,
      [...properties, key],
      target.constructor
    )
  }
}
exports.Optional = Optional
