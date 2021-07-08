import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {checkoutRepository, getRepositoryURL} from './github'

export async function checkout(): Promise<string> {
  const repositoryURL = getRepositoryURL(core.getInput('repsitory-name'))
  const commit = core.getInput('commit') || undefined
  const libraryChecker = await checkoutRepository(repositoryURL, commit)
  const treePath = commit ? `/tree/${commit}` : ''
  core.info(`checkout ${repositoryURL}${treePath} to ${libraryChecker}`)
  return libraryChecker
}

async function pipInstall(libraryCheckerPath: string): Promise<void> {
  await core.group('pip install', async () => {
    await exec('pip3', ['install', '--user', '-r', 'requirements.txt'], {
      cwd: libraryCheckerPath
    })
  })
}

async function run(): Promise<void> {
  try {
    const libraryCheckerPath = await checkout()
    await pipInstall(libraryCheckerPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
