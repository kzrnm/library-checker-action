import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as github from './github'

export async function checkout(): Promise<string> {
  const repositoryURL = github.getRepositoryURL(core.getInput('repsitory-name'))
  const commit = core.getInput('commit') || undefined
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
    switch (process.platform) {
      case 'win32':
      case 'darwin':
        break
      default:
        await exec('prlimit', [
          '--stack=unlimited',
          '--pid',
          process.pid.toString()
        ]) // ulimit -s unlimited
        break
    }
    await exec('python3', ['ci_generate.py', '--print-version'], execOpts)
  })
}

async function run(): Promise<void> {
  try {
    const libraryCheckerPath = await checkout()
    await runSetupCommands(libraryCheckerPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
