import remapping, {
  type SourceMapInput,
  type SourceMapLoader,
  type RawSourceMap,
} from '@jridgewell/remapping';

const composeMaps = (
  map: SourceMapInput | SourceMapInput[],
  loader: SourceMapLoader,
) => remapping(map, loader, { decodedMappings: false }) as RawSourceMap;

type Transformation = { id: string; code: string; map: SourceMapInput };
// Loader contexts are unique to an invocation. Never cache authored maps by file
// name: simultaneous builds and HMR may have different contents for the same file.
const transformations = new WeakMap<object, Transformation>();

export const recordWebpackMap = (
  context: object,
  transformation: Transformation,
) => {
  const previous = transformations.get(context);
  transformations.set(context, {
    ...transformation,
    map: previous
      ? composeMaps([transformation.map, previous.map], () => null)
      : transformation.map,
  });
};

export const restoreWebpackMap = (
  context: object,
  map?: SourceMapInput,
): SourceMapInput | undefined => {
  const transformation = transformations.get(context);
  if (!transformation || !map) return map;
  transformations.delete(context);
  return composeMaps(map, (source, entry) => {
    if (entry.depth !== 1) return null;
    const matches =
      source.replaceAll('\\', '/') ===
        transformation.id.replaceAll('\\', '/') ||
      entry.content === transformation.code;
    return matches ? transformation.map : null;
  });
};
