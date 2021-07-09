import {listProblems} from '../src/command'
import {getMockedLogger} from './util'

describe('listProblems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('empty command', async () => {
    const mockedLogger = getMockedLogger()
    expect(await listProblems(``)).toStrictEqual([])
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'info',
      'Skip list-problems. Check all problems'
    )
  })

  test('echo empty', async () => {
    const mockedLogger = getMockedLogger()
    expect(await listProblems(`node -e "console.log("")"`)).toStrictEqual([])
    expect(mockedLogger).toBeCalledTimes(1)
    expect(mockedLogger).toBeCalledWith(
      'warning',
      'list-problems returns empty. Check all problems'
    )
  })

  test('echo some problems', async () => {
    const mockedLogger = getMockedLogger()
    expect(
      await listProblems(
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
