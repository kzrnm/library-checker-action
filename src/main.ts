import * as core from '@actions/core'
import {getExecOutput} from '@actions/exec'
import {CommandRunner} from './command'
import {GitRepositoryCloner} from './github'
import {LibraryChecker} from './libraryChecker'

interface InputObject {
  command: string
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
  const command = getInputFunc('command', {required: true})
  const listProblemsCommand = getInputFunc('list-problems', {required: true})
  const repositoryName = getInputFunc('repository-name')
  const commit = getInputFunc('commit')
  const cacheTestData = parseBoolean(getInputFunc('cache-test-data'))
  return {
    command,
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

export async function getProblems(
  listProblemsCommand?: string
): Promise<string[] | null> {
  if (!listProblemsCommand) {
    core.info('Skip list-problems. Check all problems')
    return null
  }
  const listProblems = await (async (command?: string) => {
    if (!command) {
      return []
    }
    const execOutput = await getExecOutput(command, undefined, {silent: true})
    return execOutput.stdout.split(/\s+/).filter(s => s.length > 0)
  })(listProblemsCommand)

  if (listProblems.length > 0) {
    core.info(`list-problems: ${listProblems.join(', ')}`)
    return listProblems
  } else {
    core.warning('list-problems returns empty. Check all problems')
    return null
  }
}

export async function problemsWithSkip(
  commandRunner: CommandRunner,
  allProblemNames: string[]
): Promise<string[]> {
  const skips = await Promise.all(
    allProblemNames.map(async v => commandRunner.skipTest(v))
  )
  const ret: string[] = []
  for (let i = 0; i < allProblemNames.length; i++) {
    if (!skips[i]) ret.push(allProblemNames[i])
  }
  return ret
}

async function run(): Promise<void> {
  try {
    core.setCommandEcho(true)
    const {
      command: targetCommand,
      repositoryName,
      commit,
      listProblemsCommand,
      cacheTestData
    } = parseInput(core.getInput)
    const libraryChecker = await createLibraryChecker(
      repositoryName,
      commit,
      cacheTestData
    )
    await libraryChecker.setup()

    const allProblems = await libraryChecker.problems()
    await printProblems(allProblems)

    const commandRunner = new CommandRunner(targetCommand)
    const problems = await getProblems(listProblemsCommand)

    if (!problems) throw new Error("problems don't exist.")

    core.info(`target problems: ${problems}`)

    await libraryChecker.updateCacheOf(problems)

    for (const p of problems) {
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      await libraryChecker.runProblem(p, (n, input, out) =>
        commandRunner.runProblem(n, input, out)
      )
    }
    await libraryChecker.dispose()
  } catch (error) {
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run()
}
