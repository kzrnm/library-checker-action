import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as github from './github'

export async function checkout(
  repositoryName: string,
  commit: string | undefined
): Promise<string> {
  const repositoryURL = github.getRepositoryURL(repositoryName)
  const libraryChecker = await github.checkoutRepository(repositoryURL, commit)
  const treePath = commit ? `/tree/${commit}` : ''
  core.info(`checkout ${repositoryURL}${treePath} to ${libraryChecker}`)
  return libraryChecker
}

async function runSetupCommands(libraryCheckerPath: string): Promise<void> {
  await core.group('setup Library Checker Problems', async () => {
    const execOpts = {
      cwd: libraryCheckerPath
    }
    await exec(
      'pip3',
      ['install', '--user', '-r', 'requirements.txt'],
      execOpts
    )
    if (process.platform !== 'win32' && process.platform !== 'darwin') {
      await exec('prlimit', [
        '--stack=unlimited',
        '--pid',
        process.pid.toString()
      ]) // ulimit -s unlimited
    }
    await exec('python3', ['ci_generate.py', '--print-version'], execOpts)
  })
}

async function run(): Promise<void> {
  try {
    const libraryCheckerPath = await checkout(
      core.getInput('repsitory-name'),
      core.getInput('commit') || undefined
    )
    await runSetupCommands(libraryCheckerPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
