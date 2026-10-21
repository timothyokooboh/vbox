export const __DEV__ = (() => {
  try {
    // Keep this expression replaceable by bundlers; standalone UMD has no process.
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
})();
