import * as main from '../src/main'
import * as gh from '../src/github'
import {getMockedLogger} from './util'

describe('parseInput', () => {
  test('parse default', () => {
    const expected = {
      repositoryName: '',
      commit: undefined,
      listProblemsCommand: undefined,
      cacheTestData: false
    }
    expect(main.parseInput(() => '')).toStrictEqual(expected)
  })

  test.each`
    input        | expectedInput
    ${undefined} | ${undefined}
    ${''}        | ${''}
    ${'repo'}    | ${'repo'}
  `('parse repository-name = $input', ({input, expectedInput}) => {
    const expected = {
      repositoryName: expectedInput,
      commit: undefined,
      listProblemsCommand: undefined,
      cacheTestData: false
    }
    expect(
      main.parseInput(name => (name === 'repository-name' ? input : ''))
    ).toStrictEqual(expected)
  })

  test.each`
    input          | expectedInput
    ${undefined}   | ${undefined}
    ${''}          | ${undefined}
    ${'012ABCD34'} | ${'012ABCD34'}
  `('parse commit = $input', ({input, expectedInput}) => {
    const expected = {
      repositoryName: '',
      commit: expectedInput,
      listProblemsCommand: undefined,
      cacheTestData: false
    }
    expect(
      main.parseInput(name => (name === 'commit' ? input : ''))
    ).toStrictEqual(expected)
  })

  test.each`
    input        | expectedInput
    ${undefined} | ${false}
    ${''}        | ${false}
    ${'0'}       | ${false}
    ${'false'}   | ${false}
    ${'1'}       | ${true}
    ${'true'}    | ${true}
  `('parse cache-test-data = $input', ({input, expectedInput}) => {
    const expected = {
      repositoryName: '',
      commit: undefined,
      listProblemsCommand: undefined,
      cacheTestData: expectedInput
    }
    expect(
      main.parseInput(name => (name === 'cache-test-data' ? input : ''))
    ).toStrictEqual(expected)
  })
})

describe('checkout library checker', () => {
  beforeAll(() => {
    const OrigGitRepositoryCloner = gh.GitRepositoryCloner
    jest
      .spyOn(gh, 'GitRepositoryCloner')
      .mockImplementation((nameOrUrl, commit) => {
        const g = new OrigGitRepositoryCloner(nameOrUrl, commit)
        jest.spyOn(g, 'checkoutRepository').mockResolvedValue('/tmp/directory')
        return g
      })
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('default', async () => {
    const mockedLogger = getMockedLogger()
    await main.checkout('', '')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/yosupo06/library-checker-problems to /tmp/directory'
    )
  })
  test('with repo name', async () => {
    const mockedLogger = getMockedLogger()
    await main.checkout('repo-owner/repo-repo', '')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo to /tmp/directory'
    )
  })
  test('with repo name and branch', async () => {
    const mockedLogger = getMockedLogger()
    await main.checkout('repo-owner/repo-repo', 'main')
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'checkout https://github.com/repo-owner/repo-repo/tree/main to /tmp/directory'
    )
  })
})

test('printProblems', async () => {
  const mockedLogger = getMockedLogger()
  await main.printProblems({
    pro1: 'ABCD-EFGH-0001',
    pro2: 'ABCD-EFGH-0002',
    pro3: 'ABCD-EFGH-0003',
    pro4: 'ABCD-EFGH-0004'
  })

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

describe('checkout library checker', () => {
  test('empty command', async () => {
    const mockedLogger = getMockedLogger()
    expect(await main.getListProblems(``)).toBeNull()
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'Skip list-problems. Check all problems'
    )
  })

  test('echo empty', async () => {
    const mockedLogger = getMockedLogger()
    expect(await main.getListProblems(`node -e "console.log("")"`)).toBeNull()
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'warning',
      'list-problems returns empty. Check all problems'
    )
  })

  test('echo some problems', async () => {
    const mockedLogger = getMockedLogger()
    expect(
      await main.getListProblems(
        `node -e "console.log('aplusb many_aplusb');console.log('associative_array');"`
      )
    ).toStrictEqual(['aplusb', 'many_aplusb', 'associative_array'])
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'list-problems: aplusb, many_aplusb, associative_array'
    )
  })
})
