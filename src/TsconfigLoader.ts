import fs from 'fs';
import path from 'path';

import { loadConfig, ConfigLoaderSuccessResult } from 'tsconfig-paths';

/**
 * Load the clostest tsconfig.json
 */
export class TsconfigLoader {
  readonly TSCONFIG_FILE = 'tsconfig.json';
  /**
   * cache visited dir and tsconfig infos
   */
  private readonly _visitedDirMap = new Map<string, boolean>();

  /**
   * load closest tsconfig.json
   * @param cwd the dir path to load closest tsconfig.json
   */
  load(cwd: string): ConfigLoaderSuccessResult | null {
    const tsconfigPath = this._getClosestTsconfigDirPath(cwd);

    if (!tsconfigPath) {
      return null;
    }

    const tsconfig = loadConfig(tsconfigPath);

    if (tsconfig.resultType === 'success') {
      return tsconfig;
    } else {
      return null;
    }
  }

  private _getClosestTsconfigDirPath(cwd: string): string {
    let tempDir = cwd;

    /**
     * return when reach root
     */
    if (path.dirname(tempDir) === tempDir) {
      return '';
    }

    if (this._visitedDirMap.get(tempDir) === true) {
      return tempDir;
    }

    const tsconfigPath = path.join(tempDir, this.TSCONFIG_FILE);

    if (fs.existsSync(tsconfigPath)) {
      this._visitedDirMap.set(tempDir, true);
      return tempDir;
    }

    this._visitedDirMap.set(tempDir, false);
    return this._getClosestTsconfigDirPath(path.dirname(tempDir));
  }
}
