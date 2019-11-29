const shared_utils = require('../../common/utils/shared.utils')
const constants = require('../../common/constants')
const runtime_exception = require('../errors/exceptions/runtime.exception')
const undefined_dependency_exception = require('../errors/exceptions/undefined-dependency.exception')
const unknown_dependencies_exception = require('../errors/exceptions/unknown-dependencies.exception')

class Injector {
  async loadInstanceOfMiddleware(wrapper, collection, module) {
    const { metatype } = wrapper
    const currentMetatype = collection.get(metatype.name)
    if (currentMetatype.instance !== null) {
      return
    }
    await this.resolveConstructorParams(wrapper, module, null, instances => {
      collection.set(metatype.name, {
        instance: new metatype(...instances),
        metatype
      })
    })
  }
  async loadInstanceOfInjectable(wrapper, module) {
    const injectables = module.injectables
    await this.loadInstance(wrapper, injectables, module)
  }
  loadPrototypeOfInstance({ metatype, name }, collection) {
    if (!collection) {
      return null
    }
    const target = collection.get(name)
    if (
      target.isResolved ||
      !shared_utils.isNil(target.inject) ||
      !metatype.prototype
    ) {
      return null
    }
    collection.set(
      name,
      Object.assign({}, collection.get(name), {
        instance: Object.create(metatype.prototype)
      })
    )
  }
  async loadInstanceOfComponent(wrapper, module) {
    const components = module.components
    await this.loadInstance(wrapper, components, module)
  }
  applyDoneHook(wrapper) {
    let done
    wrapper.done$ = new Promise((resolve, reject) => {
      done = resolve
    })
    wrapper.isPending = true
    return done
  }
  async loadInstance(wrapper, collection, module) {
    if (wrapper.isPending) {
      return wrapper.done$
    }
    const done = this.applyDoneHook(wrapper)
    const { name, inject } = wrapper
    const targetWrapper = collection.get(name)
    if (shared_utils.isUndefined(targetWrapper)) {
      throw new runtime_exception.RuntimeException()
    }
    if (targetWrapper.isResolved) {
      return
    }
    const callback = async instances => {
      const properties = await this.resolveProperties(wrapper, module, inject)
      const instance = await this.instantiateClass(
        instances,
        wrapper,
        targetWrapper
      )
      this.applyProperties(instance, properties)
      done()
    }
    await this.resolveConstructorParams(wrapper, module, inject, callback)
  }
  async resolveConstructorParams(wrapper, module, inject, callback) {
    const dependencies = shared_utils.isNil(inject)
      ? this.reflectConstructorParams(wrapper.metatype)
      : inject
    const optionalDependenciesIds = shared_utils.isNil(inject)
      ? this.reflectOptionalParams(wrapper.metatype)
      : []
    let isResolved = true
    const instances = await Promise.all(
      dependencies.map(async (param, index) => {
        try {
          const paramWrapper = await this.resolveSingleParam(
            wrapper,
            param,
            { index, dependencies },
            module
          )
          if (!paramWrapper.isResolved && !paramWrapper.forwardRef) {
            isResolved = false
          }
          return paramWrapper.instance
        } catch (err) {
          const isOptional = optionalDependenciesIds.includes(index)
          if (!isOptional) {
            throw err
          }
          return undefined
        }
      })
    )
    isResolved && (await callback(instances))
  }
  reflectConstructorParams(type) {
    const paramtypes =
      Reflect.getMetadata(constants.PARAMTYPES_METADATA, type) || []
    const selfParams = this.reflectSelfParams(type)
    selfParams.forEach(({ index, param }) => (paramtypes[index] = param))
    return paramtypes
  }
  reflectOptionalParams(type) {
    return Reflect.getMetadata(constants.OPTIONAL_DEPS_METADATA, type) || []
  }
  reflectSelfParams(type) {
    return (
      Reflect.getMetadata(constants.SELF_DECLARED_DEPS_METADATA, type) || []
    )
  }
  async resolveSingleParam(wrapper, param, dependencyContext, module) {
    if (shared_utils.isUndefined(param)) {
      throw new undefined_dependency_exception.UndefinedDependencyException(
        wrapper.name,
        dependencyContext,
        module
      )
    }
    const token = this.resolveParamToken(wrapper, param)
    return this.resolveComponentInstance(
      module,
      shared_utils.isFunction(token) ? token.name : token,
      dependencyContext,
      wrapper
    )
  }
  resolveParamToken(wrapper, param) {
    if (!param.forwardRef) {
      return param
    }
    wrapper.forwardRef = true
    return param.forwardRef()
  }
  async resolveComponentInstance(module, name, dependencyContext, wrapper) {
    const components = module.components
    const instanceWrapper = await this.lookupComponent(
      components,
      module,
      Object.assign({}, dependencyContext, { name }),
      wrapper
    )
    if (!instanceWrapper.isResolved && !instanceWrapper.forwardRef) {
      await this.loadInstanceOfComponent(instanceWrapper, module)
    }
    if (instanceWrapper.async) {
      instanceWrapper.instance = await instanceWrapper.instance
    }
    return instanceWrapper
  }
  async lookupComponent(components, module, dependencyContext, wrapper) {
    const { name } = dependencyContext
    const scanInExports = () =>
      this.lookupComponentInExports(dependencyContext, module, wrapper)
    return components.has(name) ? components.get(name) : scanInExports()
  }
  async lookupComponentInExports(dependencyContext, module, wrapper) {
    const instanceWrapper = await this.lookupComponentInRelatedModules(
      module,
      dependencyContext.name
    )
    if (shared_utils.isNil(instanceWrapper)) {
      throw new unknown_dependencies_exception.UnknownDependenciesException(
        wrapper.name,
        dependencyContext,
        module
      )
    }
    return instanceWrapper
  }
  async lookupComponentInRelatedModules(module, name, moduleRegistry = []) {
    let componentRef = null
    const relatedModules = module.relatedModules || new Set()
    const children = [...relatedModules.values()].filter(item => item)
    for (const relatedModule of children) {
      if (moduleRegistry.includes(relatedModule.id)) {
        continue
      }
      moduleRegistry.push(relatedModule.id)
      const { components, exports } = relatedModule
      if (!exports.has(name) || !components.has(name)) {
        const instanceRef = await this.lookupComponentInRelatedModules(
          relatedModule,
          name,
          moduleRegistry
        )
        if (instanceRef) {
          return instanceRef
        }
        continue
      }
      componentRef = components.get(name)
      if (!componentRef.isResolved && !componentRef.forwardRef) {
        await this.loadInstanceOfComponent(componentRef, relatedModule)
        break
      }
    }
    return componentRef
  }
  async resolveProperties(wrapper, module, inject) {
    if (!shared_utils.isNil(inject)) {
      return []
    }
    const properties = this.reflectProperties(wrapper.metatype)
    const instances = await Promise.all(
      properties.map(async item => {
        try {
          const dependencyContext = {
            key: item.key,
            name: item.name
          }
          const paramWrapper = await this.resolveSingleParam(
            wrapper,
            item.name,
            dependencyContext,
            module
          )
          return (paramWrapper && paramWrapper.instance) || undefined
        } catch (err) {
          if (!item.isOptional) {
            throw err
          }
          return undefined
        }
      })
    )
    return properties.map((item, index) =>
      Object.assign({}, item, { instance: instances[index] })
    )
  }
  reflectProperties(type) {
    const properties =
      Reflect.getMetadata(constants.PROPERTY_DEPS_METADATA, type) || []
    const optionalKeys =
      Reflect.getMetadata(constants.OPTIONAL_PROPERTY_DEPS_METADATA, type) || []
    return properties.map(item =>
      Object.assign({}, item, {
        name: item.type,
        isOptional: optionalKeys.includes(item.key)
      })
    )
  }
  applyProperties(instance, properties) {
    if (!shared_utils.isObject(instance)) {
      return undefined
    }
    properties
      .filter(item => !shared_utils.isNil(item.instance))
      .forEach(item => (instance[item.key] = item.instance))
  }
  async instantiateClass(instances, wrapper, targetMetatype) {
    const { metatype, inject } = wrapper
    if (shared_utils.isNil(inject)) {
      targetMetatype.instance = wrapper.forwardRef
        ? Object.assign(targetMetatype.instance, new metatype(...instances))
        : new metatype(...instances)
    } else {
      const factoryResult = targetMetatype.metatype(...instances)
      targetMetatype.instance = await factoryResult
    }
    targetMetatype.isResolved = true
    return targetMetatype.instance
  }
}

exports.Injector = Injector
