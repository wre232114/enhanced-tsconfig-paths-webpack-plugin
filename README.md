![status](https://github.com/wre232114/enhanced-tsconfig-paths-webpack-plugin/actions/workflows/main.yml/badge.svg?branch=main)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/wre232114/enhanced-tsconfig-paths-webpack-plugin/blob/main/LICENSE)

# enhanced-tsconfig-paths-webpack-plugin
Load modules according to the closest tsconfig.json's paths in webpack, working greatly in Monorepo.

When resolving modules in webpack, it will use the closest tsconfig.json' paths of the file, for example:
```txt
.
├── apps
│   ├── package.json
│   ├── src
│   │   ├── common
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── tsconfig.json             // app's tsconfig.json, define its tsconfig.json's paths
│   └── webpack.config.ts
├── libs
│   ├── package.json
│   ├── src
│   │   ├── index.ts
│   │   └── utils
│   │       └── index.ts
│   └── tsconfig.json             // lib's tsconfig.json, define its tsconfig.json's paths too
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

In the example above, app import lib using `@bright/shared`, when we start app using webpack, this plugin will load each file's closest tsconfig's paths(in apps it will load apps/tsconfig.json, in libs, it will load libs/tsconfig.json), and redirect it to the real path.

## Quick Start
### Install
```sh
# npm
npm install -D enhanced-tsconfig-paths-webpack-plugin

# or yarn
yarn add -D enhanced-tsconfig-paths-webpack-plugin

# or pnpm
pnpm add -D enhanced-tsconfig-paths-webpack-plugin
```

### Usage
```ts
// webpack.config.ts
import { join } from 'path';
import { Configuration } from 'webpack';
import { EnhancedTsconfigWebpackPlugin } from 'enhanced-tsconfig-paths-webpack-plugin';

export default {
  entry: './src/index.ts',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.bundle.js'
  },
  resolve: {
    extensions: ['.ts', 'js'],
    plugins: [
      // using EnhancedTsconfigWebpackPlugin
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
```

> Warning1: If you are using ts-loader to transpile typescript, please set `transpileOnly: true` to skip type-checking, or an type error may be throwed. 
>
> Warning2: node_modules is ignored by default, the `ignoreNodeModules` option can configure this behavior

## Options
### ignoreNodeModules
> since 0.2.0
>
> default: true

ignore mapping files under node_modules. Example:
```ts
new EnhancedTsconfigWebpackPlugin({
  ignoreNodeModules: false
}),
```

### tsconfigPaths
> since 0.2.0
>
> default: {
>   extensions: [...Object.key(require.extensions), '.tx', '.tsx']
>   matchAll: true
>   mainFields: ['main']
> }

options passed to [tsconfig-paths](https://github.com/dividab/tsconfig-paths).
```ts
new EnhancedTsconfigWebpackPlugin({
  tsconfigPaths: {
    extensions: ['.ts'], // only map .ts file
    mainFields: ['main'], // main package.json's main field
    matchAll: true // add a extra * before matching, this is how typescript works
  }
})
```


## Contribution

```bash
$ npm install -g pnpm@6.10.3
$ pnpm start
```