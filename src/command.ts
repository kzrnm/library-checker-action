import {exec, ExecOptions} from '@actions/exec'
import stream from 'stream'
import delay from 'delay'

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
    const buf = new stream.Transform()
    const ret = await Promise.race([
      delay(500),
      this.runCommand(name, {
        outStream: buf,
        silent: true,
        delay: 0,
        ignoreReturnCode: true
      })
    ])
    buf.destroy()
    return ret >= 0
  }

  async runProblem(
    name: string,
    input: Buffer,
    outStream: stream.Writable
  ): Promise<number> {
    return await this.runCommand(name, {
      input,
      silent: true,
      outStream,
      delay: 0,
      listeners: {
        stdout: line => outStream.write(line, 'utf-8')
      },
      ignoreReturnCode: true
    })
  }
}
