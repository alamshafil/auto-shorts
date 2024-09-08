export function mixin(target, source) {
  if (!target || !source) return;

  const keys = Object.keys(source);

  // loop through properties
  for (let i = 0; i < keys.length; ++i) {
    const propertyName = keys[i];

    // Set the property using the property descriptor - this works for accessors and normal value properties
    Object.defineProperty(
      target,
      propertyName,
      Object.getOwnPropertyDescriptor(source, propertyName)
    );
  }
}

const mixins = [];

export function delayMixin(target, source) {
  mixins.push(target, source);
}

export function performMixins() {
  for (let i = 0; i < mixins.length; i += 2) {
    mixin(mixins[i], mixins[i + 1]);
  }
  mixins.length = 0;
}
