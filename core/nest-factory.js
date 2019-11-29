const container_1 = require('./injector/container')
const instance_loader = require('./injector/instance-loader')
const scanner = require('./scanner')
const metadata_scanner = require('./metadata-scanner')
const exception_zone = require('./errors/exceptions-zone')

class FactoryStatic {
  async create(module) {
    const container = new container_1.Container()
    await this.initialize(module, container)
  }

  async initialize(module, container) {
    const instanceLoader = new instance_loader.InstanceLoader(container)
    const dependenciesScanner = new scanner.DependenciesScanner(
      container,
      new metadata_scanner.MetadataScanner()
    )
    try {
      await exception_zone.ExceptionZone.asyncRun(async function() {
        debugger
        await dependenciesScanner.scan(module)
        await instanceLoader.createInstancesOfDependencies()
        container
        debugger
      })
    } catch (e) {
      process.abort()
    }
  }
}
exports.FactoryStatic = FactoryStatic
exports.Factory = new FactoryStatic()
