const random_string_generator_util = require('../../common/utils/random-string-generator.util')
const shared_utils = require('../../common/utils/shared.utils')
const module_ref = require('./module-ref')
const modules_container = require('./modules-container')
const runtime_exception = require('../errors/exceptions/runtime.exception')
const reflector_service = require('../services')

class Module {
  constructor(_metatype, _scope, container) {
    this._metatype = _metatype
    this._scope = _scope
    this.container = container
    this._relatedModules = new Set()
    this._components = new Map()
    this._injectables = new Map()
    this.addCoreInjectables(container)
    this._id = random_string_generator_util.randomStringGenerator()
  }
  get id() {
    return this._id
  }
  get scope() {
    return this._scope
  }
  get relatedModules() {
    return this._relatedModules
  }
  get components() {
    return this._components
  }
  get injectables() {
    return this._injectables
  }
  get instance() {
    if (!this._components.has(this._metatype.name)) {
      throw new runtime_exception.RuntimeException()
    }
    const module = this._components.get(this._metatype.name)
    return module.instance
  }
  get metatype() {
    return this._metatype
  }
  addCoreInjectables(container) {
    this.addModuleAsComponent()
    this.addModuleRef()
    this.addReflector(container.getReflector())
    this.addModulesContainer(container.getModulesContainer())
  }
  addModuleRef() {
    const moduleRef = this.createModuleRefMetatype()
    this._components.set(module_ref.ModuleRef.name, {
      name: module_ref.ModuleRef.name,
      metatype: module_ref.ModuleRef,
      isResolved: true,
      instance: new moduleRef()
    })
  }
  addModuleAsComponent() {
    this._components.set(this._metatype.name, {
      name: this._metatype.name,
      metatype: this._metatype,
      isResolved: false,
      instance: null
    })
  }
  addReflector(reflector) {
    this._components.set(reflector_service.Reflector.name, {
      name: reflector_service.Reflector.name,
      metatype: reflector_service.Reflector,
      isResolved: true,
      instance: reflector
    })
  }
  addModulesContainer(modulesContainer) {
    this._components.set(modules_container.ModulesContainer.name, {
      name: modules_container.ModulesContainer.name,
      metatype: modules_container.ModulesContainer,
      isResolved: true,
      instance: modulesContainer
    })
  }
  addInjectable(injectable) {
    this._injectables.set(injectable.name, {
      name: injectable.name,
      metatype: injectable,
      instance: null,
      isResolved: false
    })
  }
  addComponent(component) {
    this._components.set(component.name, {
      name: component.name,
      metatype: component,
      instance: null,
      isResolved: false
    })
    return component.name
  }
  addRelatedModule(relatedModule) {
    this._relatedModules.add(relatedModule)
  }
  replace(toReplace, options) {
    if (options.isComponent) {
      return this.addComponent(Object.assign({ provide: toReplace }, options))
    }
    this.addInjectable(Object.assign({ provide: toReplace }, options))
  }
  createModuleRefMetatype() {
    const self = this
    return class extends module_ref.ModuleRef {
      constructor() {
        super(self.container)
      }
      get(typeOrToken, options = { strict: true }) {
        if (!(options && options.strict)) {
          return this.find(typeOrToken)
        }
        return this.findInstanceByPrototypeOrToken(typeOrToken, self)
      }
      async create(type) {
        if (!(type && shared_utils.isFunction(type) && type.prototype)) {
          throw new Error(`invalid class exception -> ${type}`)
        }
        return this.instantiateClass(type, self)
      }
    }
  }
}

exports.Module = Module
