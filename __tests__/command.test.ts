import * as exec from '@actions/exec'
import {CommandRunner} from '../src/command'

describe('skipTest call exec', () => {
  let execMock: jest.SpyInstance<
    Promise<number>,
    [commandLine: string, args?: string[], options?: exec.ExecOptions]
  >

  beforeEach(() => {
    jest.clearAllMocks()
    execMock = jest.spyOn(exec, 'exec').mockResolvedValue(0)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('without specifiers', async () => {
    await new CommandRunner('node -e "console.log(process.argv)"').skipTest(
      'test-problem-name'
    )
    expect(execMock.mock.calls).toEqual([
      [
        'node -e "console.log(process.argv)"',
        ['test-problem-name'],
        {
          ignoreReturnCode: true,
          outStream: expect.anything(),
          delay: 0,
          silent: true
        }
      ]
    ])
  })

  test('with specifiers', async () => {
    await new CommandRunner(`node -e "console.log('%s')"`).skipTest(
      'test-problem-name'
    )
    expect(execMock.mock.calls).toEqual([
      [
        `node -e "console.log('test-problem-name')"`,
        [],
        {
          ignoreReturnCode: true,
          outStream: expect.anything(),
          delay: 0,
          silent: true
        }
      ]
    ])
  })
})

describe('skipTest result', () => {
  let execMock: jest.SpyInstance<
    Promise<number>,
    [commandLine: string, args?: string[], options?: exec.ExecOptions]
  >
  let execResolve: (v: number) => void

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    const execPromise = new Promise<number>(resolve => {
      execResolve = resolve
    })
    execMock = jest.spyOn(exec, 'exec').mockResolvedValueOnce(execPromise)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  test('timeout', async () => {
    const runner = new CommandRunner('dummy')
    const skipPromise = runner.skipTest('test-problem')
    jest.advanceTimersByTime(600)
    expect(await skipPromise).toBe(false)
  })

  test.each`
    code
    ${0}
    ${1}
    ${255}
  `('skip with exit code = $code', async ({code}) => {
    const runner = new CommandRunner('dummy')
    const skipPromise = runner.skipTest('test-problem')
    execResolve(code)
    expect(await skipPromise).toBe(true)
  })
})
