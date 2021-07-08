import * as core from '@actions/core'
import {exec, ExecOptions} from '@actions/exec'

export class LibraryChecker {
  libraryCheckerPath: string
  execOpts: ExecOptions

  constructor(libraryCheckerPath: string) {
    this.libraryCheckerPath = libraryCheckerPath
    this.execOpts = {cwd: libraryCheckerPath}
  }

  /**
   * setup Library Checker
   */
  async setup(): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
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
}
