const constants = require('../../common/constants')
const hash = require('object-hash')

class ModuleTokenFactory {
  create(metatype, scope) {
    const reflectedScope = this.reflectScope(metatype)
    const isSingleScoped = reflectedScope === true;
    const opaqueToken = {
      module: this.getModuleName(metatype),
      scope: isSingleScoped ? this.getScopeStack(scope) : reflectedScope
    }

    return hash(opaqueToken)
  }
  getModuleName(metatype) {
    return metatype.name
  }
  getScopeStack(scope) {
    const reversedScope = scope.reverse()
    const firstGlobalIndex = reversedScope.findIndex(
      s => this.reflectScope(s) === 'global'
    )
    scope.reverse()
    const stack =
      firstGlobalIndex >= 0
        ? scope.slice(scope.length - firstGlobalIndex - 1)
        : scope
    return stack.map(module => module.name)
  }
  reflectScope(metatype) {
    const scope = Reflect.getMetadata(
      constants.SHARED_MODULE_METADATA,
      metatype
    )
    return scope ? scope : 'global'
  }
}

exports.ModuleTokenFactory = ModuleTokenFactory
