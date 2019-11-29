const shared_utils = require('../../common/utils/shared.utils')

const getInstanceName = instance => instance && instance.name

const getDependencyName = dependency =>
  getInstanceName(dependency) || dependency || '+'

const getModuleName = module =>
  (module && getInstanceName(module.metatype)) || 'current'

exports.UNKNOWN_DEPENDENCIES_MESSAGE = (
  type,
  unknownDependencyContext,
  module
) => {
  const { index, dependencies, key } = unknownDependencyContext
  let message = `Nest can't resolve dependencies of the ${type}`
  if (shared_utils.isNil(index)) {
    message += `. Please make sure that the "${key}" property is available in the current context.`
    return message
  }
  const dependenciesName = (dependencies || []).map(getDependencyName)
  dependenciesName[index] = '?'
  message += ` (`
  message += dependenciesName.join(', ')
  message += `). Please make sure that the argument at index [${index}] is available in the ${getModuleName(
    module
  )} context.`
  return message
}
exports.INVALID_MIDDLEWARE_MESSAGE = (text, name) =>
  `The middleware doesn't provide the 'resolve' method (${name})`
exports.INVALID_MODULE_MESSAGE = (text, scope) =>
  `Nest cannot create the module instance. Often, this is because of a circular dependency between modules. Use forwardRef() to avoid it. (Read more https://docs.nestjs.com/fundamentals/circular-dependency.) Scope [${scope}]`
exports.UNKNOWN_EXPORT_MESSAGE = (text, module) =>
  `Nest cannot export a component/module that is not a part of the currently processed module (${module}). Please verify whether each exported unit is available in this particular context.`
exports.INVALID_CLASS_MESSAGE = (text, value) =>
  `ModuleRef cannot instantiate class (${value} is not constructable).`
exports.INVALID_MIDDLEWARE_CONFIGURATION = `Invalid middleware configuration passed inside the module 'configure()' method.`
exports.UNKNOWN_REQUEST_MAPPING = `Request mapping properties not defined in the @RequestMapping() annotation!`
exports.UNHANDLED_RUNTIME_EXCEPTION = `Unhandled Runtime Exception.`
exports.INVALID_EXCEPTION_FILTER = `Invalid exception filters (@UseFilters()).`
exports.MICROSERVICES_PACKAGE_NOT_FOUND_EXCEPTION = `Unable to load @nestjs/microservices package. (Please make sure that it's already installed.)`
