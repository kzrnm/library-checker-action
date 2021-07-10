import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {exec, getExecOutput, ExecOptions} from '@actions/exec'
import path from 'path'
import {v1 as uuidv1} from 'uuid'
export class LibraryChecker {
  private static CACHE_KEY_PREFIX = 'LibraryCheckerAction-'
  private readonly libraryCheckerPath: string
  private readonly commit: string
  private readonly id: string
  private readonly execOpts: ExecOptions

  private restoredHash?: string

  constructor(libraryCheckerPath: string, commit: string) {
    this.libraryCheckerPath = libraryCheckerPath
    this.commit = commit
    this.id = uuidv1()
    this.execOpts = {cwd: libraryCheckerPath}
  }

  private async resolveCacheFileHash(): Promise<string> {
    return await glob.hashFiles(this.getCachePath().join('\n'))
  }

  private getCachePath(): string[] {
    return [
      path.join(this.libraryCheckerPath, '**', 'checker'),
      path.join(this.libraryCheckerPath, '**', 'in'),
      path.join(this.libraryCheckerPath, '**', 'out')
    ]
  }

  private getCacheKey(): string {
    return `${LibraryChecker.CACHE_KEY_PREFIX}${this.commit}-${this.id}`
  }
  private restoreCacheKey(): string[] {
    return [
      this.getCacheKey(),
      `${LibraryChecker.CACHE_KEY_PREFIX}${this.commit}-`,
      LibraryChecker.CACHE_KEY_PREFIX
    ]
  }
  /**
   * setup Library Checker
   */
  async setup(): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
      const cacheKey = await cache.restoreCache(
        this.getCachePath(),
        this.getCacheKey(),
        this.restoreCacheKey()
      )
      if (cacheKey === undefined) {
        core.info(`Cache is not found`)
      } else {
        this.restoredHash = await this.resolveCacheFileHash()
        core.info(`Restore problems from cache = ${cacheKey}`)
      }
      await exec(
        'pip3',
        ['install', '--user', '-r', 'requirements.txt'],
        this.execOpts
      )
      if (process.platform !== 'win32' && process.platform !== 'darwin') {
        await exec('prlimit', [
          '--stack=unlimited',
          '--pid',
          process.pid.toString()
        ]) // ulimit -s unlimited
      }
    })
  }

  /**
   * @returns Library Checker problems
   */
  async problems(): Promise<Problem[]> {
    const versions = await (async () => {
      const out = await getExecOutput(
        'python3',
        ['ci_generate.py', '--print-version'],
        {silent: true, ...this.execOpts}
      )
      return out.stdout
    })()
    return Object.entries(JSON.parse(versions)).map(t => ({
      name: t[0],
      version: t[1] as string
    }))
  }

  /**
   * generate problems
   */
  async generate(problemNames: string[]): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
      await exec(
        'python3',
        ['generate.py', '-p', ...problemNames],
        this.execOpts
      )

      try {
        if (this.restoredHash === (await this.resolveCacheFileHash())) {
          core.info('Cache is not updated.')
        } else {
          const cacheId = await cache.saveCache(
            this.getCachePath(),
            this.getCacheKey()
          )
          core.info(`Cache problems. id = ${cacheId}`)
        }
      } catch (e) {
        core.warning(e)
      }
    })
  }
}

export interface Problem {
  name: string
  version: string
}
