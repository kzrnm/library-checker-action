import * as core from '@actions/core'
import {checkoutRepository, getRepositoryURL} from './github'

async function run(): Promise<void> {
  try {
    const repositoryURL = getRepositoryURL(core.getInput('repsitory-name'))
    const libraryChecker = await checkoutRepository(repositoryURL)
    core.info(`checkout ${repositoryURL} to ${libraryChecker}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
