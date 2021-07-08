import {checkoutRepository, getRepositoryURL} from '../src/github'
import fs from 'fs'
jest.spyOn(fs.promises, 'mkdtemp').mockImplementation((prefix, opts) => {
  return Promise.resolve(prefix + 'ABCDEFG')
})
jest.mock('git-clone', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (repo: string, targetPath: string, opts: any, cb: (e?: Error) => {}) => {
        cb()
      }
    )
}))

describe('checkout repository', () => {
  afterEach(() => {
    const clone = require('git-clone').default as jest.Mock
    clone.mockClear()
  })

  test('without commit hash', async () => {
    const dir = await checkoutRepository(
      'https://github.com/naminodarie/library-checker-action'
    )
    expect(dir).toMatch(/.*library-checker-action\.ABCDEFG$/)

    const clone = require('git-clone').default as jest.Mock
    expect(clone).toBeCalledTimes(1)
    expect(clone).toBeCalledWith(
      'https://github.com/naminodarie/library-checker-action',
      dir,
      {checkout: undefined, shallow: true},
      expect.any(Function)
    )
  })

  test('with commit hash', async () => {
    const dir = await checkoutRepository(
      'https://github.com/naminodarie/library-checker-action',
      'commit-hash'
    )
    expect(dir).toMatch(/.*library-checker-action\.ABCDEFG$/)

    const clone = require('git-clone').default as jest.Mock
    expect(clone).toBeCalledTimes(1)
    expect(clone).toBeCalledWith(
      'https://github.com/naminodarie/library-checker-action',
      dir,
      {checkout: 'commit-hash', shallow: true},
      expect.any(Function)
    )
  })
})

describe('get repository URL', () => {
  test.each([
    ['', 'https://github.com/yosupo06/library-checker-problems'],
    [
      'https://github.com/naminodarie/library-checker-action',
      'https://github.com/naminodarie/library-checker-action'
    ],
    [
      'naminodarie/library-checker-action',
      'https://github.com/naminodarie/library-checker-action'
    ],
    [
      'git@github.com/naminodarie/library-checker-action',
      'git@github.com/naminodarie/library-checker-action'
    ]
  ])('getRepositoryURL(%s) ==  %s', (nameOrUrl, expected) => {
    expect(getRepositoryURL(nameOrUrl)).toBe(expected)
  })
})
