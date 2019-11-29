class Reflector {
  get(metadataKey, target) {
    return Reflect.getMetadata(metadataKey, target)
  }
}
exports.Reflector = Reflector
