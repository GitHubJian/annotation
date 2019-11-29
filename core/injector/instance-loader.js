const common = require('../../common')
const messages = require('../helpers/messages')
const injector = require('./injector')

class InstanceLoader {
  constructor(container) {
    this.container = container
    this.injector = new injector.Injector()
    this.logger = new common.Logger(InstanceLoader.name, true)
  }
  async createInstancesOfDependencies() {
    const modules = this.container.getModules()
    this.createPrototypes(modules)
    await this.createInstances(modules)
  }
  createPrototypes(modules) {
    modules.forEach(module => {
      this.createPrototypesOfComponents(module)
      this.createPrototypesOfInjectables(module)
    })
  }
  async createInstances(modules) {
    await Promise.all(
      [...modules.values()].map(async module => {
        await this.createInstancesOfComponents(module)
        await this.createInstancesOfInjectables(module)
        const { name } = module.metatype
        this.logger.log(messages.MODULE_INIT_MESSAGE`${name}`)
      })
    )
  }
  createPrototypesOfComponents(module) {
    module.components.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance(wrapper, module.components)
    })
  }
  async createInstancesOfComponents(module) {
    await Promise.all(
      [...module.components.values()].map(async wrapper =>
        this.injector.loadInstanceOfComponent(wrapper, module)
      )
    )
  }
  createPrototypesOfInjectables(module) {
    module.injectables.forEach(wrapper => {
      this.injector.loadPrototypeOfInstance(wrapper, module.injectables)
    })
  }
  async createInstancesOfInjectables(module) {
    await Promise.all(
      [...module.injectables.values()].map(async wrapper =>
        this.injector.loadInstanceOfInjectable(wrapper, module)
      )
    )
  }
}

exports.InstanceLoader = InstanceLoader
