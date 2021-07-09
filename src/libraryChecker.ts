import * as cache from '@actions/cache'
import * as core from '@actions/core'
import {exec, getExecOutput, ExecOptions} from '@actions/exec'
import path from 'path'
export class LibraryChecker {
  private static CACHE_KEY_PREFIX = 'LibraryCheckerAction-cache-'
  private readonly cacheKey: string
  private readonly libraryCheckerPath: string
  private execOpts: ExecOptions

  constructor(libraryCheckerPath: string) {
    this.libraryCheckerPath = libraryCheckerPath
    const jobId = process.env['GITHUB_JOB']
    this.cacheKey = `${LibraryChecker.CACHE_KEY_PREFIX}${jobId}`
    this.execOpts = {cwd: libraryCheckerPath}
  }

  /**
   * setup Library Checker
   */
  async setup(): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
      const cacheKey = await cache.restoreCache(
        [path.join(this.libraryCheckerPath, '**', 'in')],
        this.cacheKey,
        [LibraryChecker.CACHE_KEY_PREFIX]
      )
      if (cacheKey === undefined) {
        core.info(`Cache is not found`)
      } else {
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
        const cacheId = await cache.saveCache(
          [path.join(this.libraryCheckerPath, '**', 'in')],
          this.cacheKey
        )
        core.info(`Cache problems. id = ${cacheId}`)
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
