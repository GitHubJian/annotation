function Bind(...decorators) {
  return (target, key, descriptor) => {
    decorators.forEach((fn, index) => fn(target, key, index))
    return descriptor
  }
}
exports.Bind = Bind
