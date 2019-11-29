const compiler = require('./compiler')
const services = require('../services')
const module1 = require('./module')

class Container {
  constructor() {
    this.moduleCompiler = new compiler.ModuleCompiler()
    this.modules = new Map()
    this.reflector = new services.Reflector()
  }
  async addModule(metatype, scope) {
    if (!metatype) {
      throw new Error('invalid module exception')
    }
    const { type, token } = await this.moduleCompiler.compile(metatype, scope)
    if (this.modules.has(token)) {
      return
    }
    const module = new module1.Module(type, scope, this)
    this.modules.set(token, module)
  }
  getModules() {
    return this.modules
  }
  async addRelatedModule(relatedModule, token) {
    if (!this.modules.has(token)) {
      return
    }
    const module = this.modules.get(token)
    const parent = module.metatype
    const scope = [].concat(module.scope, parent)
    const { token: relatedModuleToken } = await this.moduleCompiler.compile(
      relatedModule,
      scope
    )
    const related = this.modules.get(relatedModuleToken)
    module.addRelatedModule(related)
  }
  addComponent(component, token) {
    if (!component) {
      throw new Error('circular dependency exception')
    }
    if (!this.modules.has(token)) {
      throw new Error('unknown module exception')
    }
    const module = this.modules.get(token)
    return module.addComponent(component)
  }
  addInjectable(injectable, token) {
    if (!this.modules.has(token)) {
      throw new Error('unknown module exception')
    }
    const module = this.modules.get(token)
    module.addInjectable(injectable)
  }
  addController(controller, token) {
    if (!this.modules.has(token)) {
      throw new Error('unknown module exception')
    }
    const module = this.modules.get(token)
    module.addRoute(controller)
  }
  clear() {
    this.modules.clear()
  }
  replace(toReplace, options) {
    ;[...this.modules.values()].forEach(module => {
      module.replace(toReplace, options)
    })
  }
  getReflector() {
    return this.reflector
  }
  getModulesContainer() {
    if (!this.modulesContainer) {
      this.modulesContainer = this.getModules()
    }
    return this.modulesContainer
  }
}

exports.Container = Container
