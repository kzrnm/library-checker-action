import * as core from '@actions/core'
import {getExecOutput} from '@actions/exec'
import * as command from './command'
import {GitRepositoryCloner} from './github'
import {LibraryChecker} from './libraryChecker'

interface InputObject {
  repositoryName: string
  commit?: string
  listProblemsCommand?: string
  cacheTestData: boolean
}

function parseBoolean(str: string | undefined): boolean {
  if (str) {
    return str !== '0' && str !== 'false'
  }
  return false
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
  const cacheTestData = parseBoolean(getInputFunc('cache-test-data'))
  return {
    repositoryName,
    commit: commit || undefined,
    listProblemsCommand: listProblemsCommand || undefined,
    cacheTestData
  }
}

async function createLibraryChecker(
  repositoryName: string,
  commit?: string,
  cacheTestData?: boolean
): Promise<LibraryChecker> {
  const libraryCheckerPath = await checkout(repositoryName, commit)
  const libraryCheckerCommit = await getExecOutput(
    'git',
    ['rev-parse', 'HEAD'],
    {
      cwd: libraryCheckerPath
    }
  )
  return new LibraryChecker(
    libraryCheckerPath,
    libraryCheckerCommit.stdout.trim(),
    {useCache: cacheTestData}
  )
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

export async function printProblems(problems: {
  [name: string]: string | undefined
}): Promise<void> {
  core.group('Library Checker Problems', async () => {
    for (const [name, version] of Object.entries(problems)) {
      core.info(`${name}: ${version}`)
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
    const {repositoryName, commit, listProblemsCommand, cacheTestData} =
      parseInput(core.getInput)
    const libraryChecker = await createLibraryChecker(
      repositoryName,
      commit,
      cacheTestData
    )
    await libraryChecker.setup()

    const allProblems = await libraryChecker.problems()
    await printProblems(allProblems)

    const listProblems =
      (await getListProblems(listProblemsCommand)) ?? Object.keys(allProblems)
    await libraryChecker.generate(listProblems)
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
