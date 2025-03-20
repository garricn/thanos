/* eslint-disable @typescript-eslint/no-require-imports */
import { build } from 'esbuild';
import { copy } from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
/* eslint-enable @typescript-eslint/no-require-imports */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runBuild() {
  // Build the TypeScript files
  await build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/index.js',
    sourcemap: true,
    external: ['express', 'sqlite3'],
    loader: {
      '.ts': 'ts',
    },
  });

  // Copy assets
  try {
    await copy(
      path.join(__dirname, 'src/assets'),
      path.join(__dirname, 'dist/assets'),
      {
        overwrite: true,
      }
    );

    await copy(path.join(__dirname, 'db'), path.join(__dirname, 'dist/db'), {
      overwrite: true,
    });

    // eslint-disable-next-line no-console
    console.log('Assets copied successfully.');
  } catch (err) {
    console.error('Error copying assets:', err);
  }

  // eslint-disable-next-line no-console
  console.log('Build completed successfully.');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
