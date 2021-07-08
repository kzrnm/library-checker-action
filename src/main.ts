import * as core from '@actions/core'
import {checkoutRepository} from './github'

async function run(): Promise<void> {
  const repositoryName = 'yosupo06/library-checker-problems'
  try {
    const libraryChecker = await checkoutRepository(repositoryName)

    core.debug(`checkout ${repositoryName} to ${libraryChecker}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
