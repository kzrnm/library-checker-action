import * as core from '@actions/core'
import * as github from './github'
import * as command from './command'
import {LibraryChecker, Problem} from './libraryChecker'

interface InputObject {
  repositoryName: string
  commit?: string
  listProblemsCommand?: string
}

export function parseInput(
  getInputFunc: (
    name: string,
    options?: core.InputOptions | undefined
  ) => string
): InputObject {
  const repositoryName = getInputFunc('repository-name')
  const commit = getInputFunc('commit')
  const listProblemsCommand = getInputFunc('list-problems')
  return {
    repositoryName,
    commit: commit || undefined,
    listProblemsCommand: listProblemsCommand || undefined
  }
}

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

export async function printProblems(problems: Problem[]): Promise<void> {
  core.group('Library Checker Problems', async () => {
    for (const p of problems) {
      core.info(`${p.name}: ${p.version}`)
    }
  })
}

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    const {repositoryName, commit, listProblemsCommand} = parseInput(
      core.getInput
    )
    const libraryChecker = new LibraryChecker(
      await checkout(repositoryName, commit)
    )
    await libraryChecker.setup()

    const allProblems = await libraryChecker.problems()
    await printProblems(allProblems)

    await command.listProblems(listProblemsCommand)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
