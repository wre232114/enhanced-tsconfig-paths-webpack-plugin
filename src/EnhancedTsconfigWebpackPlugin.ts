import path from 'path';
import { Resolver, ResolveRequest, ResolveContext } from 'enhanced-resolve';
import { createMatchPath, MatchPath } from 'tsconfig-paths';
import { TsconfigLoader } from './TsconfigLoader';

export interface Options {
  /**
   * ignore files under node_modules, default to true
   */
  ignoreNodeModules: boolean;
  /**
   * options parsed to tsconfig paths
   */
  tsconfigPaths?: {
    mainFields?: string[];
    extensions?: string[];
    matchAll?: boolean;
  };
}

export class EnhancedTsconfigWebpackPlugin {
  private _source = 'described-resolve';
  private _target = 'resolve';
  private _matchers: Record<string, MatchPath> = {};
  private _loader = new TsconfigLoader();
  private _options: Options;

  constructor(options?: Partial<Options>) {
    const DEFAULT_OPTIONS: Options = {
      ignoreNodeModules: true,
      tsconfigPaths: {
        extensions: [...Object.keys(require.extensions), '.ts', '.tsx'],
      },
    };

    this._options = Object.assign(DEFAULT_OPTIONS, options ?? {});
  }

  apply(resolver: Resolver) {
    const target = resolver.ensureHook(this._target);
    resolver
      .getHook(this._source)
      .tapAsync(
        'EnhancedTsconfigPathsPlugin',
        (
          request: ResolveRequest,
          resolveContext: ResolveContext,
          callback: any
        ) => {
          /**
           * skip alias resolve if request is relative
           */
          const requestPath = request.request;
          if (
            !requestPath ||
            requestPath.startsWith('.') ||
            requestPath.startsWith('..')
          ) {
            return callback();
          }

          //@ts-ignore context is exsited, but the internal type do not provide it, so we ignore it for now
          const issuer: string | undefined = request.context?.issuer;
          if (
            !issuer ||
            (this._options.ignoreNodeModules &&
              issuer &&
              issuer.includes('node_modules'))
          ) {
            return callback();
          }

          const tsconfig = this._loader.load(path.dirname(issuer));

          if (!tsconfig || !tsconfig.baseUrl) {
            return callback();
          }

          if (!this._matchers[tsconfig.configFileAbsolutePath]) {
            this._matchers[tsconfig.configFileAbsolutePath] = createMatchPath(
              tsconfig.absoluteBaseUrl,
              tsconfig.paths,
              this._options.tsconfigPaths?.mainFields,
              this._options.tsconfigPaths?.matchAll
            );
          }

          const foundMatch = this._matchers[tsconfig.configFileAbsolutePath](
            requestPath,
            undefined,
            undefined,
            this._options.tsconfigPaths?.extensions
          );

          if (!foundMatch) {
            return callback();
          }

          const newRequest = {
            ...request,
            request: foundMatch,
          };

          resolver.doResolve(
            target,
            newRequest,
            `Resolved ${request.request} to ${foundMatch} using tsconfig.json paths mapping`,
            resolveContext,
            (err: Error, result: any) => {
              if (err) callback(err);

              if (result === undefined) callback(undefined, undefined);

              return callback(undefined, result);
            }
          );
        }
      );
  }
}
