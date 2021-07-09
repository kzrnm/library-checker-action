import {checkout, printProblems, parseInput} from '../src/main'
import * as gh from '../src/github'
import {getMockedLogger} from './util'

describe('parseInput', () => {
  describe.each([undefined, 'repo'])('repository-name=%s', repositoryName => {
    describe.each([undefined, 'commit-hash'])('commit=%s', commit => {
      test.each([undefined, 'echo aplusb'])(
        'list-problems=%s',
        listProblemsCommand => {
          const expected = {
            repositoryName: repositoryName ?? '',
            commit,
            listProblemsCommand
          }
          const input: {[key: string]: string | undefined} = {
            'repository-name': repositoryName,
            commit: commit,
            'list-problems': listProblemsCommand
          }
          expect(parseInput(name => input[name] || '')).toStrictEqual(expected)
        }
      )
    })
  })
})

describe('checkout library checker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(gh, 'checkoutRepository').mockResolvedValue('/tmp/directory')
  })

  test('default', async () => {
    const mockedLogger = getMockedLogger()
    await checkout('', '')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/yosupo06/library-checker-problems to /tmp/directory'
    )
  })
  test('with repo name', async () => {
    const mockedLogger = getMockedLogger()
    await checkout('repo-owner/repo-repo', '')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo to /tmp/directory'
    )
  })
  test('with repo name and branch', async () => {
    const mockedLogger = getMockedLogger()
    await checkout('repo-owner/repo-repo', 'main')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo/tree/main to /tmp/directory'
    )
  })
})

test('printProblems', () => {
  const mockedLogger = getMockedLogger()
  printProblems([
    {name: 'pro1', version: 'ABCD-EFGH-0001'},
    {name: 'pro2', version: 'ABCD-EFGH-0002'},
    {name: 'pro3', version: 'ABCD-EFGH-0003'},
    {name: 'pro4', version: 'ABCD-EFGH-0004'}
  ])

  expect(mockedLogger).toBeCalledTimes(6)
  expect(mockedLogger).toHaveBeenNthCalledWith(
    1,
    'startGroup',
    'Library Checker Problems'
  )
  expect(mockedLogger).toHaveBeenNthCalledWith(
    2,
    'info',
    'pro1: ABCD-EFGH-0001'
  )
  expect(mockedLogger).toHaveBeenNthCalledWith(
    3,
    'info',
    'pro2: ABCD-EFGH-0002'
  )
  expect(mockedLogger).toHaveBeenNthCalledWith(
    4,
    'info',
    'pro3: ABCD-EFGH-0003'
  )
  expect(mockedLogger).toHaveBeenNthCalledWith(
    5,
    'info',
    'pro4: ABCD-EFGH-0004'
  )
  expect(mockedLogger).toHaveBeenNthCalledWith(6, 'endGroup', '')
})
