const constants = require('../../constants')
const extend_metadata_util = require('../../utils/extend-metadata.util')
const shared_utils = require('../../utils/shared.utils')
const validate_each_util = require('../../utils/validate-each.util')
const defineFiltersMetadata = (...filters) => {
  return (target, key, descriptor) => {
    const isFilterValid = filter =>
      filter &&
      (shared_utils.isFunction(filter) || shared_utils.isFunction(filter.catch))
    if (descriptor) {
      validate_each_util.validateEach(
        target.constructor,
        filters,
        isFilterValid,
        '@UseFilters',
        'filter'
      )
      extend_metadata_util.extendArrayMetadata(
        constants.EXCEPTION_FILTERS_METADATA,
        filters,
        descriptor.value
      )
      return descriptor
    }
    validate_each_util.validateEach(
      target,
      filters,
      isFilterValid,
      '@UseFilters',
      'filter'
    )
    extend_metadata_util.extendArrayMetadata(
      constants.EXCEPTION_FILTERS_METADATA,
      filters,
      target
    )
    return target
  }
}

exports.UseFilters = (...filters) => defineFiltersMetadata(...filters)
