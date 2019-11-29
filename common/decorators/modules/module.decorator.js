const constants = require('../../constants')
const invalid_module_config_exception = require('./exceptions/invalid-module-config.exception')

const metadataKeys = [
  constants.METADATA.MODULES,
  constants.METADATA.IMPORTS,
  constants.METADATA.EXPORTS,
  constants.METADATA.COMPONENTS,
  constants.METADATA.CONTROLLERS,
  constants.METADATA.PROVIDERS
]

function validateKeys(keys) {
  const isKeyInvalid = key => metadataKeys.findIndex(k => k === key) < 0
  const validateKey = key => {
    if (!isKeyInvalid(key)) {
      return
    }

    throw new invalid_module_config_exception.InvalidModuleConfigException(key)
  }

  keys.forEach(validateKey)
}

function showDeprecatedWarnings(moduleMetadata) {}
function overrideModuleMetadata(moduleMetadata) {
  moduleMetadata.modules = moduleMetadata.imports
    ? moduleMetadata.imports
    : moduleMetadata.modules
  moduleMetadata.components = moduleMetadata.providers
    ? moduleMetadata.providers
    : moduleMetadata.components
}

function Module(metadata) {
  const propsKeys = Object.keys(metadata)
  validateKeys(propsKeys)
  showDeprecatedWarnings(metadata)
  overrideModuleMetadata(metadata)

  return function(target) {
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, metadata[property], target)
      }
    }
  }
}

exports.Module = Module
