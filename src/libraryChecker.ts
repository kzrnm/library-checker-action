import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as toml from '@iarna/toml'
import {exec, getExecOutput, ExecOptions} from '@actions/exec'
import fs from 'fs'
import path from 'path'
import {v1 as uuidv1} from 'uuid'
import stringify from 'json-stable-stringify'
import stream from 'stream'

export interface LibraryCheckerOptions {
  useCache?: boolean
}

export class LibraryChecker {
  private static CACHE_KEY_PREFIX = 'LibraryCheckerAction'
  private readonly libraryCheckerPath: string
  private readonly commit: string
  private readonly id: string
  private readonly execOpts: ExecOptions

  private readonly options: LibraryCheckerOptions

  constructor(
    libraryCheckerPath: string,
    commit: string,
    options?: LibraryCheckerOptions
  ) {
    this.libraryCheckerPath = libraryCheckerPath
    this.commit = commit
    this.id = uuidv1()
    this.options = options || {}
    this.execOpts = {cwd: libraryCheckerPath}
  }

  private lastCacheHash?: string

  async getCacheHash(): Promise<string> {
    return glob.hashFiles(this.getCachePath().join('\n'))
  }

  async updateTimestampOfCachedFile(name: string): Promise<void> {
    const globber = await glob.create(
      [
        path.join(this.libraryCheckerPath, '**', name, 'checker'),
        path.join(this.libraryCheckerPath, '**', name, 'in'),
        path.join(this.libraryCheckerPath, '**', name, 'out')
      ].join('\n')
    )
    const now = new Date()
    for await (const file of globber.globGenerator()) {
      core.debug(`update utime and mtime: ${file}`)
      await fs.promises.utimes(file, now, now)
    }
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

  private getCacheKeyArray(): string[] {
    return [
      LibraryChecker.CACHE_KEY_PREFIX,
      process.platform,
      this.commit,
      this.id
    ]
  }

  getCacheKey(): string {
    return this.getCacheKeyArray().join('-')
  }

  restoreCacheKey(): string[] {
    const keyArray = this.getCacheKeyArray()
    const result = []
    for (let i = keyArray.length - 1; i > 0; i--) {
      result.push(`${keyArray.slice(0, i).join('-')}-`)
    }
    return result
  }

  private async restoreCache(): Promise<void> {
    const cacheKey = await cache.restoreCache(
      this.getCachePath(),
      this.getCacheKey(),
      this.restoreCacheKey()
    )
    if (cacheKey === undefined) {
      core.info(`Cache is not found`)
    } else {
      core.info(`Restore problems from cache = ${cacheKey}`)
      this.lastCacheHash = await this.getCacheHash()
    }
  }

  async getProblemDirectory(name: string): Promise<string> {
    const pathes = await (
      await glob.create(path.join(this.libraryCheckerPath, '**', name))
    ).glob()
    if (pathes.length === 0) throw new Error(`problem ${name} is not found`)
    return pathes[0]
  }

  private async updateCache(): Promise<void> {
    try {
      const targets = await this.problems()
      for (const [name] of Object.entries(targets)) {
        const checkerPath = path.join(
          await this.getProblemDirectory(name),
          'checker'
        )
        try {
          fs.promises.stat(checkerPath)
        } catch (error) {
          delete targets[name]
        }
      }
      await fs.promises.writeFile(this.getCacheDataPath(), stringify(targets))
      if (this.lastCacheHash === (await this.getCacheHash())) {
        core.info('Cache is not updated.')
        return
      }
      const cacheId = await cache.saveCache(
        this.getCachePath(),
        this.getCacheKey()
      )
      core.info(`Cache problems. id = ${cacheId}`)
    } catch (e) {
      core.warning(e)
    }
  }

  /**
   * setup Library Checker
   */
  async setup(): Promise<void> {
    await core.group('setup Library Checker', async () => {
      if (this.options.useCache) {
        this.restoreCache()
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

  /**
   * update cache
   */
  async updateCacheOf(problemNames: string[]): Promise<void> {
    const checkCached = async (): Promise<{
      exists: string[]
      addeds: string[]
      notFounds: string[]
    }> => {
      const current: {[name: string]: string | undefined} =
        await this.problems()
      const cached: {[name: string]: string | undefined} =
        await this.cachedProblems()

      const exists: string[] = []
      const addeds: string[] = []
      const notFounds: string[] = []
      for (const name of problemNames) {
        const version = current[name]
        if (version) {
          if (version !== cached[name]) {
            addeds.push(name)
          } else {
            exists.push(name)
          }
        } else {
          notFounds.push(name)
        }
      }
      return {exists, addeds, notFounds}
    }

    if (this.options.useCache !== true) return
    await core.group('update caches', async () => {
      const {exists, notFounds} = await checkCached()
      if (notFounds.length > 0) {
        core.warning(`Problems are not found: ${notFounds.join(', ')}`)
      }

      if (exists.length > 0) {
        core.debug(`cached: ${exists.join(', ')}`)
      } else {
        core.debug('cached target is empty')
      }
      await Promise.all(
        exists.map(async n => await this.updateTimestampOfCachedFile(n))
      )
    })
  }

  async runProblem(
    problemName: string,
    runner: (
      name: string,
      input: Buffer,
      outStream: stream.Writable
    ) => Promise<number>
  ): Promise<void> {
    const dir = await this.getProblemDirectory(problemName)
    const infoFile = path.join(dir, 'info.toml')

    const info = toml.parse(
      await fs.promises.readFile(infoFile, {encoding: 'utf-8'})
    )
    const timeoutSec = 5 * (info['timelimit'] as number)

    await exec('python3', ['./generate.py', infoFile], this.execOpts)

    const inDir = path.join(dir, 'in')
    const outDir = path.join(dir, 'out')
    const gotDir = path.join(dir, 'got')
    const checker = path.join(dir, 'checker')
    await fs.promises.mkdir(gotDir)

    const run = async (taskName: string): Promise<void> => {
      try {
        const fileNameWithoutExtension = path.basename(taskName, '.in')
        if (fileNameWithoutExtension === taskName) return
        const inFile = path.join(inDir, taskName)
        const outFile = path.join(outDir, `${fileNameWithoutExtension}.out`)
        const gotFile = path.join(gotDir, `${fileNameWithoutExtension}.got`)

        const dest = fs.createWriteStream(gotFile, {autoClose: true})

        const runPromise = runner(
          problemName,
          await fs.promises.readFile(inFile),
          dest
        )
        const timeout = new Promise<number>(resolve =>
          setTimeout(() => resolve(-1), timeoutSec * 1000)
        )
        const ret = await Promise.race([runPromise, timeout])
        if (ret !== 0) {
          if (ret === -1)
            throw new Error(
              `${problemName}-${taskName}: Your command is timeout.`
            )
          throw new Error(
            `${problemName}-${taskName}: Your command exit with code ${ret}`
          )
        }
        const checkRet = await exec(checker, [inFile, outFile, gotFile], {
          silent: true,
          ...this.execOpts
        })
        if (checkRet !== 0) {
          throw new Error(
            `${problemName}-${taskName}: Checker exit with code ${ret}`
          )
        }
        core.info(`${problemName}-${taskName}: passed`)
      } catch (e) {
        core.setFailed(e)
      }
    }

    for (const dirent of await fs.promises.readdir(inDir, {
      withFileTypes: true
    })) {
      if (!dirent.isFile()) continue
      await run(dirent.name)
    }
  }

  async dispose(): Promise<void> {
    if (this.options.useCache) {
      this.updateCache()
    }
  }
}
