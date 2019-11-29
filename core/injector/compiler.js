const module_token_factory = require('./module-token-factory')

class ModuleCompiler {
  constructor() {
    this.moduleTokenFactory = new module_token_factory.ModuleTokenFactory()
  }

  async compile(metatype, scope) {
    const { type } = await this.extractMetadata(metatype)
    const token = this.moduleTokenFactory.create(type, scope)

    return {
      type,
      token
    }
  }

  async extractMetadata(metatype) {
    metatype = await metatype

    return {
      type: metatype
    }
  }
}

exports.ModuleCompiler = ModuleCompiler
