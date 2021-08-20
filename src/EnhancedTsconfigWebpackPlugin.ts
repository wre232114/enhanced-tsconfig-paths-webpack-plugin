import path from 'path';
import { Resolver, ResolveRequest, ResolveContext } from 'enhanced-resolve';
import { createMatchPath, MatchPath } from 'tsconfig-paths';
import { TsconfigLoader } from './TsconfigLoader';

export class EnhancedTsconfigWebpackPlugin {
  private _source = 'described-resolve';
  private _target = 'resolve';
  private _matchers: Record<string, MatchPath> = {};
  private _loader = new TsconfigLoader();

  apply(resolver: Resolver) {
    const target = resolver.ensureHook(this._target);
    resolver.getHook(this._source).tapAsync('EnhancedTsconfigPathsPlugin', (request: ResolveRequest, resolveContext: ResolveContext, callback: any) => {

      /**
       * skip alias resolve if request is relative
       */
      const requestPath = request.request;
      if (!requestPath || requestPath.startsWith('.') || requestPath.startsWith('..')) {
        return callback();
      }

      //@ts-ignore context is exsited, but the internal type do not provide it, so we ignore it for now
      const issuer = request.context?.issuer;
      if (!issuer) {
        return callback();
      }

      const tsconfig = this._loader.load(path.dirname(issuer));
      console.log(issuer, tsconfig?.absoluteBaseUrl);

      if (!tsconfig || !tsconfig.baseUrl) {
        return callback();
      }

      if (!this._matchers[tsconfig.configFileAbsolutePath]) {
        this._matchers[tsconfig.configFileAbsolutePath] = createMatchPath(tsconfig.absoluteBaseUrl, tsconfig.paths, /* todo: mainFields config*/ /* todo: addMatchAll config*/);
      }

      const foundMatch = this._matchers[tsconfig.configFileAbsolutePath](requestPath);
      console.log(foundMatch);
      if (!foundMatch) {
        return callback();
      }

      const newRequest = {
        ...request,
        request: foundMatch
      };

      resolver.doResolve(
        target,
        newRequest,
        `Resolved ${request.request} to ${123} using tsconfig.json paths mapping`,
        resolveContext,
        (err: Error, result: any) => {
          if (err) callback(err);

          if (result === undefined) callback(undefined, undefined);

          return callback(undefined, result);
        }
      );
    });
  }
}
