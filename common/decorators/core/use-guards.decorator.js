const SharedUtils = require('../../utils/shared.utils')
const ValidateEachUtil = require('../../utils/validate-each.util')
const ExtendMetadataUtil = require('../../utils/extend-metadata.util')
const Constants = require('../../constants')

function UseGuards(...guards) {
  return (target, key, descriptor) => {
    const isValidGuard = guard =>
      guard &&
      (SharedUtils.isFunction(guard) ||
        SharedUtils.isFunction(guard.canActivate))

    if (descriptor) {
      ValidateEachUtil(
        target.constructor,
        guards,
        isValidGuard,
        '@UseGuards',
        'guard'
      )

      ExtendMetadataUtil(Constants.GUARDS_METADATA, guards, descriptor.value)

      return descriptor
    }

    ValidateEachUtil(target, guards, isValidGuard, '@UseGuards', 'guard')
    ExtendMetadataUtil(Constants.GUARDS_METADATA, guards, target)

    return target
  }
}

module.exports = UseGuards
