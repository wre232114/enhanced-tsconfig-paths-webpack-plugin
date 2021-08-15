import { join } from 'path';
import { Configuration } from 'webpack';
import { EnhancedTsconfigWebpackPlugin } from '../../dist';

export default {
  entry: './src/index.ts',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.bundle.js'
  },
  resolve: {
    extensions: ['.ts', 'js'],
    plugins: [
      new EnhancedTsconfigWebpackPlugin()
    ]
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /.+\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ]
  }
} as Configuration;