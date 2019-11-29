exports.ReflectMetadata = (metadataKey, metadataValue) => (
  target,
  key,
  descriptor
) => {
  if (descriptor) {
    Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value)
    return descriptor
  }
  Reflect.defineMetadata(metadataKey, metadataValue, target)
  return target
}
