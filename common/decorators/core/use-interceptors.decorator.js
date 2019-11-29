const constants = require('../../constants')
const extend_metadata_util = require('../../utils/extend-metadata.util')
const shared_utils = require('../../utils/shared.utils')
const validate_each_util = require('../../utils/validate-each.util')

function UseInterceptors(...interceptors) {
  return (target, key, descriptor) => {
    const isValidInterceptor = interceptor =>
      interceptor &&
      (shared_utils.isFunction(interceptor) ||
        shared_utils.isFunction(interceptor.intercept))
    if (descriptor) {
      validate_each_util.validateEach(
        target.constructor,
        interceptors,
        isValidInterceptor,
        '@UseInterceptors',
        'interceptor'
      )
      extend_metadata_util.extendArrayMetadata(
        constants.INTERCEPTORS_METADATA,
        interceptors,
        descriptor.value
      )
      return descriptor
    }
    validate_each_util.validateEach(
      target,
      interceptors,
      isValidInterceptor,
      '@UseInterceptors',
      'interceptor'
    )
    extend_metadata_util.extendArrayMetadata(
      constants.INTERCEPTORS_METADATA,
      interceptors,
      target
    )
    return target
  }
}
exports.UseInterceptors = UseInterceptors
