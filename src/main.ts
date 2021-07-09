import * as core from '@actions/core'
import {GitRepositoryCloner} from './github'
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
  const gh = new GitRepositoryCloner(repositoryName, commit)
  const libraryChecker = await gh.checkoutRepository()
  const treePath = commit ? `/tree/${commit}` : ''
  core.info(`checkout ${gh.repositoryUrl}${treePath} to ${libraryChecker}`)
  return libraryChecker
}

export async function printProblems(problems: Problem[]): Promise<void> {
  core.group('Library Checker Problems', async () => {
    for (const p of problems) {
      core.info(`${p.name}: ${p.version}`)
    }
  })
}

export async function getListProblems(
  listProblemsCommand?: string
): Promise<string[] | null> {
  if (!listProblemsCommand) {
    core.info('Skip list-problems. Check all problems')
    return null
  }
  const listProblems = await command.listProblems(listProblemsCommand)
  if (listProblems.length > 0) {
    core.info(`list-problems: ${listProblems.join(', ')}`)
    return listProblems
  } else {
    core.warning('list-problems returns empty. Check all problems')
    return null
  }
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

    const listProblems =
      (await getListProblems(listProblemsCommand)) ??
      allProblems.map(p => p.name)
    await libraryChecker.generate(listProblems)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
