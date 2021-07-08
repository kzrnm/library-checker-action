import {checkout} from '../src/main'
import * as gh from '../src/github'
import {getMockedInput, getMockedLogger} from './util'

describe('checkout library checker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(gh, 'checkoutRepository').mockResolvedValue('/tmp/directory')
  })

  test('default', async () => {
    getMockedInput({})
    const mockedLogger = getMockedLogger()
    await checkout()
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/yosupo06/library-checker-problems to /tmp/directory'
    )
  })
  test('with repo name', async () => {
    getMockedInput({
      'repsitory-name': 'repo-owner/repo-repo'
    })
    const mockedLogger = getMockedLogger()
    await checkout()
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo to /tmp/directory'
    )
  })
  test('with repo name and branch', async () => {
    getMockedInput({
      'repsitory-name': 'repo-owner/repo-repo',
      commit: 'main'
    })
    const mockedLogger = getMockedLogger()
    await checkout()
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo/tree/main to /tmp/directory'
    )
  })
})
