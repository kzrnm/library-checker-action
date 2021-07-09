import {getExecOutput} from '@actions/exec'

export async function listProblems(command?: string): Promise<string[]> {
  if (!command) {
    return []
  }
  const execOutput = await getExecOutput(command, undefined, {silent: true})
  return execOutput.stdout.split(/\s+/).filter(s => s.length > 0)
}
