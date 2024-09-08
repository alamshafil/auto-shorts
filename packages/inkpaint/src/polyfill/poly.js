class Foo {}

export default function poly(Class) {
  return Class || Foo;
}
