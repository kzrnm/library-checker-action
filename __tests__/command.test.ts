import {listProblems} from '../src/command'
import {getMockedLogger} from './util'

describe('listProblems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('empty command', async () => {
    expect(await listProblems(``)).toStrictEqual([])
  })

  test('echo empty', async () => {
    expect(await listProblems(`node -e "console.log("")"`)).toStrictEqual([])
  })

  test('echo some problems', async () => {
    expect(
      await listProblems(
        `node -e "console.log('aplusb many_aplusb');console.log('associative_array');"`
      )
    ).toStrictEqual(['aplusb', 'many_aplusb', 'associative_array'])
  })
})
