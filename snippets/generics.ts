function test<T extends Record<K, string>, K extends keyof T>(base: T, key: K): T[K] {
  return base[key];
}

test({ foo: "", bar: 0 }, "foo"); // works

test({ foo: "", bar: 0 }, "foo"); // error as intended
