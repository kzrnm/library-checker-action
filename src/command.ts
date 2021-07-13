import {ExecOptions} from '@actions/exec'
import * as tr from '@actions/exec/lib/toolrunner'
import stream from 'stream'
import delay from 'delay'
import child from 'child_process'
import PCancelable from 'p-cancelable'

export class CommandRunner {
  private readonly command: string
  private readonly hasSpecifiers: boolean
  constructor(command: string) {
    this.command = command
    this.hasSpecifiers = command.includes('%s')
  }
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  runCommand(
    name: string,
    input: stream.Readable | null,
    outStream: stream.Writable | null,
    options: ExecOptions
  ): PCancelable<number> {
    const makeCommand = (): [string, string[]] => {
      if (this.hasSpecifiers) return [this.command.replace('%s', name), []]
      else return [this.command, [name]]
    }
    const [command, args] = makeCommand()
    const commandArgs = tr.argStringToArray(command)
    const actualCommand = commandArgs[0]
    const actualArgs = commandArgs.slice(1).concat(args)

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const runner = new tr.ToolRunner(actualCommand, actualArgs, options) as any

    return new PCancelable((resolve, reject, onCancel) => {
      const optionsNonNull = runner._cloneExecOptions(options)
      const fileName = runner._getSpawnFileName()
      const cp = child.spawn(
        fileName,
        runner._getSpawnArgs(optionsNonNull),
        runner._getSpawnOptions(options, fileName)
      )
      onCancel(() => {
        cp.kill('SIGKILL')
      })
      if (outStream) cp.stdout.pipe(outStream)

      cp.on('error', (err: Error) => {
        reject(err)
      })
      cp.on('exit', (code: number) => {
        resolve(code)
      })
      cp.on('close', (code: number) => {
        resolve(code)
      })

      if (input) {
        input.pipe(cp.stdin)
      }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  async skipTest(name: string): Promise<boolean> {
    const running = this.runCommand(name, null, null, {
      silent: true,
      delay: 0,
      ignoreReturnCode: true
    })
    const ret = await Promise.race([delay(500), running])
    running.cancel()
    return ret >= 0
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  runProblem(
    name: string,
    input: stream.Readable,
    outStream: stream.Writable
  ): PCancelable<number> {
    return this.runCommand(name, input, outStream, {
      silent: true,
      delay: 0,
      ignoreReturnCode: true
    })
  }
}
