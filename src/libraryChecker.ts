import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import fs from 'fs'
import path from 'path'
import {exec, getExecOutput, ExecOptions} from '@actions/exec'
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

  private async updateTimestampOfCachedFile(name: string): Promise<void> {
    const globber = await glob.create(
      [
        path.join(this.libraryCheckerPath, '**', name, 'checker'),
        path.join(this.libraryCheckerPath, '**', name, 'in'),
        path.join(this.libraryCheckerPath, '**', name, 'out')
      ].join('\n')
    )
    const now = new Date()
    for await (const file of globber.globGenerator()) {
      await fs.promises.utimes(file, now, now)
    }
  }

  private async resolveCachedFileHash(): Promise<string> {
    return await glob.hashFiles(this.getCachePath().join('\n'))
  }

  private getCacheDataPath(): string {
    return path.join(this.libraryCheckerPath, 'cache.json')
  }

  private getCachePath(): string[] {
    return [
      this.getCacheDataPath(),
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
        this.restoredHash = await this.resolveCachedFileHash()
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
  async problems(): Promise<{[name: string]: string | undefined}> {
    if (this.problemsData) {
      return this.problemsData
    }
    const out = await getExecOutput(
      'python3',
      ['ci_generate.py', '--print-version'],
      {silent: true, ...this.execOpts}
    )
    return (this.problemsData = JSON.parse(out.stdout))
  }
  private problemsData?: {[name: string]: string | undefined}

  /**
   * @returns Cached Library Checker problems list
   */
  async cachedProblems(): Promise<{[name: string]: string | undefined}> {
    try {
      return JSON.parse(
        await fs.promises.readFile(this.getCacheDataPath(), {encoding: 'utf-8'})
      )
    } catch (e) {
      return {}
    }
  }

  async checkCached(
    problemNames: string[]
  ): Promise<[string[], string[], string[]]> {
    const current: {[name: string]: string | undefined} = await this.problems()
    const cached: {[name: string]: string | undefined} =
      await this.cachedProblems()

    const generated: string[] = []
    const added: string[] = []
    const notFound: string[] = []
    for (const name of problemNames) {
      const version = current[name]
      if (version) {
        if (cached[name]) {
          generated.push(name)
        } else {
          added.push(name)
        }
      } else {
        notFound.push(name)
      }
    }
    return [generated, added, notFound]
  }

  /**
   * generate problems
   */
  async generate(problemNames: string[]): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
      const [generated, added, notFound] = await this.checkCached(problemNames)
      if (notFound.length > 0) {
        core.warning(`Problems are not found: ${notFound.join(', ')}`)
      }
      if (added.length === 0) {
        core.info('Cache is not updated.')
        return
      }

      await Promise.all(
        generated.map(async n => await this.updateTimestampOfCachedFile(n))
      )
      await exec('python3', ['generate.py', '-p', ...added], this.execOpts)

      try {
        const cacheId = await cache.saveCache(
          this.getCachePath(),
          this.getCacheKey()
        )
        core.info(`Cache problems. id = ${cacheId}`)
      } catch (e) {
        core.warning(e)
      }
    })
  }
}
