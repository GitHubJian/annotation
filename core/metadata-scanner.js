const iterare = require('iterare')
const shared_utils = require('../common/utils/shared.utils')

class MetadataScanner {
  scanFromPrototype(instance, prototype, callback) {
    return iterare
      .default([...this.getAllFilteredMethodNames(prototype)])
      .map(callback)
      .filter(metadata => !shared_utils.isNil(metadata))
      .toArray()
  }
  *getAllFilteredMethodNames(prototype) {
    do {
      yield* iterare
        .default(Object.getOwnPropertyNames(prototype))
        .filter(prop => {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, prop)
          if (descriptor.set || descriptor.get) {
            return false
          }
          return (
            !shared_utils.isConstructor(prop) &&
            shared_utils.isFunction(prototype[prop])
          )
        })
        .toArray()
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype !== Object.prototype
    )
  }
}
exports.MetadataScanner = MetadataScanner
