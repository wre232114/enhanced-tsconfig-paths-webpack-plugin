/**
 * e2e test
 */
import { join } from 'path';
import webpack, { Configuration } from 'webpack';
import { EnhancedTsconfigWebpackPlugin } from '../src/index';

function generateWebpackConfig(
  plugin?: EnhancedTsconfigWebpackPlugin,
  filename?: string
): Configuration {
  return {
    entry: './example/apps/src/index.ts',
    output: {
      path: join(__dirname, '..', 'example', 'apps', 'dist'),
      filename: filename ?? 'index.bundle.js',
      libraryTarget: 'commonjs',
    },
    resolve: {
      extensions: ['.ts', 'js'],
      plugins: [plugin ?? new EnhancedTsconfigWebpackPlugin()],
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /.+\.ts$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
  };
}

describe('e2e test', () => {
  it('ignore node modules', done => {
    webpack(generateWebpackConfig(), (err, stats) => {
      if (err) {
        throw err;
      }

      if (stats && stats.hasErrors()) {
        console.log(stats.compilation.errors);
        throw new Error('compilation failed');
      }

      const buildRes = require(join(
        __dirname,
        '..',
        'example',
        'apps',
        'dist',
        'index.bundle.js'
      ));

      expect(buildRes).toEqual({
        greetingUser: 'Hello, brightwu',
        greetingCommon: 'Hello, common',
      });
      done();
    });
  });

  it('do not ignore node modules', done => {
    webpack(
      generateWebpackConfig(
        new EnhancedTsconfigWebpackPlugin({
          ignoreNodeModules: false,
          tsconfigPaths: {
            extensions: ['.ts'],
            mainFields: ['main'],
            matchAll: true,
          },
        }),
        'index.ignore.bundle.js'
      ),
      err => {
        if (err) {
          throw err;
        }

        const buildRes = require(join(
          __dirname,
          '..',
          'example',
          'apps',
          'dist',
          'index.ignore.bundle.js'
        ));

        expect(buildRes).toEqual({
          greetingUser: 'Hello, brightwu',
          greetingCommon: 'Hello, common',
        });

        done();
      }
    );
  });
});
