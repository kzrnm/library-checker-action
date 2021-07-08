import * as core from '@actions/core'
import {exec} from '@actions/exec'
import * as github from './github'
import * as command from './command'
import {LibraryChecker} from './library_checker'

/**
 * Checkout repository
 * @returns Library Checker path
 */
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

async function run(): Promise<void> {
  try {
    const libraryCheckerPath = await checkout(
      core.getInput('repsitory-name'),
      core.getInput('commit') || undefined
    )
    const libraryChecker = new LibraryChecker(libraryCheckerPath)
    await libraryChecker.setup()

    await exec('python3', ['ci_generate.py', '--print-version'], {
      cwd: libraryCheckerPath
    })
    await command.listProblems(core.getInput('list-problems'))
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
