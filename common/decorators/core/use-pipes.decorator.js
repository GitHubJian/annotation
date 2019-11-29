const constants = require('../../constants')
const extend_metadata_util = require('../../utils/extend-metadata.util')
const validate_each_util = require('../../utils/validate-each.util')
const shared_utils = require('../../utils/shared.utils')

function UsePipes(...pipes) {
  return (target, key, descriptor) => {
    const isPipeValid = pipe =>
      pipe &&
      (shared_utils.isFunction(pipe) || shared_utils.isFunction(pipe.transform))
    if (descriptor) {
      extend_metadata_util.extendArrayMetadata(
        constants.PIPES_METADATA,
        pipes,
        descriptor.value
      )
      return descriptor
    }
    validate_each_util.validateEach(
      target,
      pipes,
      isPipeValid,
      '@UsePipes',
      'pipe'
    )
    extend_metadata_util.extendArrayMetadata(
      constants.PIPES_METADATA,
      pipes,
      target
    )
    return target
  }
}
exports.UsePipes = UsePipes
