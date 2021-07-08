import * as core from '@actions/core'

export function getMockedInput(impl: {
  [s: string]: string
}): jest.SpyInstance<
  string,
  [name: string, options?: core.InputOptions | undefined]
> {
  return jest
    .spyOn(core, 'getInput')
    .mockImplementation((name, opt) => impl[name] ?? '')
}

export function getMockedLogger(): jest.Mock<
  void,
  [kind: string, message: string | Error]
> {
  const mockedLogger = jest.fn((kind: string, message: string | Error) => {})
  jest
    .spyOn(core, 'debug')
    .mockImplementation(message => mockedLogger('debug', message))
  jest
    .spyOn(core, 'info')
    .mockImplementation(message => mockedLogger('info', message))
  jest
    .spyOn(core, 'warning')
    .mockImplementation(message => mockedLogger('warning', message))
  jest
    .spyOn(core, 'error')
    .mockImplementation(message => mockedLogger('error', message))
  return mockedLogger
}
