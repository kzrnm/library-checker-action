import {exec, ExecOptions} from '@actions/exec'
import stream from 'stream'

export class CommandRunner {
  private readonly command: string
  private readonly hasSpecifiers: boolean
  constructor(command: string) {
    this.command = command
    this.hasSpecifiers = command.includes('%s')
  }

  async runCommand(name: string, options: ExecOptions): Promise<number> {
    const makeCommand = (): [string, string[]] => {
      if (this.hasSpecifiers) return [this.command.replace('%s', name), []]
      else return [this.command, [name]]
    }
    const [command, args] = makeCommand()
    return await exec(command, args, options)
  }

  async skipTest(name: string): Promise<boolean> {
    const timeout = new Promise<number>(resolve =>
      setTimeout(() => resolve(-1), 500)
    )
    const ret = await Promise.race([
      timeout,
      this.runCommand(name, {silent: true, ignoreReturnCode: true})
    ])
    return ret >= 0
  }

  async runProblem(
    name: string,
    input: Buffer,
    outStream: stream.Writable
  ): Promise<number> {
    return await this.runCommand(name, {
      input,
      outStream,
      silent: true,
      ignoreReturnCode: true
    })
  }
}
