import webpack from 'webpack';

/** @param {import('webpack').Configuration} config */
export async function compileWebpack(config) {
  const compiler = webpack(config);
  if (!compiler) throw new Error('webpack did not create a compiler');
  try {
    return await new Promise((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error || !stats || stats.hasErrors()) {
          reject(
            error ??
              new Error(stats?.toString('errors-only') ?? 'No webpack result'),
          );
        } else resolve(stats);
      });
    });
  } finally {
    await new Promise((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
