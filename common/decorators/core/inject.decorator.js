const constants = require('../../constants')
const shared_utils = require('../../utils/shared.utils')

function Inject(token) {
  return (target, key, index) => {
    token = token || Reflect.getMetadata('design:type', target, key)
    const type = token && shared_utils.isFunction(token) ? token.name : token
    if (!shared_utils.isUndefined(index)) {
      let dependencies =
        Reflect.getMetadata(constants.SELF_DECLARED_DEPS_METADATA, target) || []
      dependencies = [...dependencies, { index, param: type }]
      Reflect.defineMetadata(
        constants.SELF_DECLARED_DEPS_METADATA,
        dependencies,
        target
      )
      return
    }
    let properties =
      Reflect.getMetadata(
        constants.PROPERTY_DEPS_METADATA,
        target.constructor
      ) || []
    properties = [...properties, { key, type }]
    Reflect.defineMetadata(
      constants.PROPERTY_DEPS_METADATA,
      properties,
      target.constructor
    )
  }
}
exports.Inject = Inject
