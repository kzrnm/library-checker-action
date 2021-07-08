import * as core from '@actions/core'
import {checkoutRepository, getRepositoryURL} from './github'

export async function checkout(): Promise<void> {
  const repositoryURL = getRepositoryURL(core.getInput('repsitory-name'))
  const commit = core.getInput('commit') || undefined
  const libraryChecker = await checkoutRepository(repositoryURL, commit)
  const treePath = commit ? `/tree/${commit}` : ''
  core.info(`checkout ${repositoryURL}${treePath} to ${libraryChecker}`)
}

async function run(): Promise<void> {
  try {
    await checkout()
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
