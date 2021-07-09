import * as core from '@actions/core'
import {getExecOutput} from '@actions/exec'

export async function listProblems(command?: string): Promise<string[]> {
  if (!command) {
    core.info('Skip list-problems. Check all problems')
    return []
  }
  const execOutput = await getExecOutput(command, undefined, {silent: true})
  const problems = execOutput.stdout.split(/\s+/).filter(s => s.length > 0)

  if (problems.length > 0) core.info(`list-problems: ${problems.join(', ')}`)
  else core.warning('list-problems returns empty. Check all problems')
  return problems
}
