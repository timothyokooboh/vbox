if (!globalThis.CSS) {
  Object.defineProperty(globalThis, 'CSS', {
    value: {},
    writable: true,
    configurable: true
  });
}

Object.defineProperty(globalThis.CSS, 'supports', {
  value: () => true,
  writable: true,
  configurable: true
});
