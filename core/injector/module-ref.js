const container_scanner = require('./container-scanner')
const injector = require('./injector')

class ModuleRef {
  constructor(container) {
    this.container = container
    this.injector = new injector.Injector()
    this.containerScanner = new container_scanner.ContainerScanner(container)
  }
  find(typeOrToken) {
    return this.containerScanner.find(typeOrToken)
  }
  async instantiateClass(type, module) {
    const wrapper = {
      name: type.name,
      metatype: type,
      instance: undefined,
      isResolved: false
    }
    return new Promise(async (resolve, reject) => {
      try {
        const callback = async instances => {
          const properties = await this.injector.resolveProperties(
            wrapper,
            module
          )
          const instance = new type(...instances)
          this.injector.applyProperties(instance, properties)
          resolve(instance)
        }
        await this.injector.resolveConstructorParams(
          wrapper,
          module,
          undefined,
          callback
        )
      } catch (err) {
        reject(err)
      }
    })
  }
  findInstanceByPrototypeOrToken(metatypeOrToken, contextModule) {
    return this.containerScanner.findInstanceByPrototypeOrToken(
      metatypeOrToken,
      contextModule
    )
  }
}

exports.ModuleRef = ModuleRef
