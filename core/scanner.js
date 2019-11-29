const constants = require('../common/constants')
const shared_utils = require('../common/utils/shared.utils')

class DependenciesScanner {
  constructor(container, metadataScanner) {
    this.container = container
    this.metadataScanner = metadataScanner
  }
  async scan(module) {
    await this.scanForModules(module)
    await this.scanModulesForDependencies()
  }
  async scanForModules(module, scope = [], ctxRegistry = []) {
    await this.storeModule(module, scope)
    ctxRegistry.push(module)
    const modules = this.reflectMetadata(module, constants.METADATA.MODULES)
    for (const innerModule of modules) {
      if (ctxRegistry.includes(innerModule)) {
        continue
      }
      await this.scanForModules(
        innerModule,
        [].concat(scope, module),
        ctxRegistry
      )
    }
  }
  async storeModule(module, scope) {
    await this.container.addModule(module, scope)
  }
  async scanModulesForDependencies() {
    const modules = this.container.getModules()
    for (const [token, { metatype }] of modules) {
      await this.reflectRelatedModules(metatype, token, metatype.name)
      this.reflectComponents(metatype, token)
      this.reflectControllers(metatype, token)
    }
  }
  async reflectRelatedModules(module, token, context) {
    const modules = [
      ...this.reflectMetadata(module, constants.METADATA.MODULES)
    ]
    for (const related of modules) {
      await this.storeRelatedModule(related, token, context)
    }
  }
  reflectComponents(module, token) {
    const components = [
      ...this.reflectMetadata(module, constants.METADATA.COMPONENTS)
    ]
    components.forEach(component => {
      this.storeComponent(component, token)
      this.reflectComponentMetadata(component, token)
    })
  }
  reflectComponentMetadata(component, token) {
    this.reflectGatewaysMiddleware(component, token)
  }
  reflectControllers(module, token) {
    const routes = [
      ...this.reflectMetadata(module, constants.METADATA.CONTROLLERS)
    ]
    routes.forEach(route => {
      this.storeRoute(route, token)
    })
  }
  reflectGatewaysMiddleware(component, token) {}
  reflectInjectables(component, token, metadataKey) {}
  reflectParamInjectables(component, token, metadataKey) {}
  reflectKeyMetadata(component, key, method) {}
  async storeRelatedModule(related, token, context) {
    if (shared_utils.isUndefined(related)) {
      throw new Error('circular dependency')
    }
    await this.container.addRelatedModule(related, token)
  }
  storeComponent(component, token) {
    return this.container.addComponent(component, token)
  }
  storeInjectable(component, token) {
    this.container.addInjectable(component, token)
  }
  storeRoute(route, token) {
    this.container.addContainer(route, token)
  }
  reflectMetadata(metatype, metadataKey) {
    return Reflect.getMetadata(metadataKey, metatype) || []
  }
}

exports.DependenciesScanner = DependenciesScanner
