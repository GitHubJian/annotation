const constants = require('../../constants')
const flatten_util = require('../../utils/flatten.util')

function Dependencies(...dependencies) {
  const flattenDeps = flatten_util.flatten(dependencies)
  return function(target) {
    Reflect.defineMetadata(constants.PARAMTYPES_METADATA, flattenDeps, target)
  }
}

exports.Dependencies = Dependencies
