import * as core from '@actions/core'

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
  jest
    .spyOn(core, 'startGroup')
    .mockImplementation(message => mockedLogger('startGroup', message))
  jest
    .spyOn(core, 'endGroup')
    .mockImplementation(() => mockedLogger('endGroup', ''))

  jest.spyOn(core, 'group').mockImplementation((name, fn) => {
    mockedLogger('startGroup', name)
    try {
      return fn()
    } finally {
      mockedLogger('endGroup', '')
    }
  })

  return mockedLogger
}
