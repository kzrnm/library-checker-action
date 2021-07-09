import {GitRepositoryCloner} from '../src/github'
import fs from 'fs'
jest.mock('git-clone')
const clone = require('git-clone')
clone.mockImplementation(
  (repo: string, targetPath: string, opts: any, cb: (e?: Error) => {}) => {
    cb()
  }
)

describe('checkout repository', () => {
  beforeEach(() => {
    clone.mockClear()
    jest.spyOn(fs.promises, 'mkdtemp').mockImplementation((prefix, opts) => {
      return Promise.resolve(prefix + 'ABCDEFG')
    })
  })

  test('without commit hash', async () => {
    const gh = new GitRepositoryCloner(
      'https://github.com/naminodarie/library-checker-action'
    )
    const dir = await gh.checkoutRepository()
    expect(dir).toMatch(/.*library-checker-action\.ABCDEFG$/)

    expect(clone).toBeCalledTimes(1)
    expect(clone).toBeCalledWith(
      'https://github.com/naminodarie/library-checker-action',
      dir,
      {checkout: undefined, shallow: true},
      expect.any(Function)
    )
  })

  test('with commit hash', async () => {
    const gh = new GitRepositoryCloner(
      'https://github.com/naminodarie/library-checker-action',
      'commit-hash'
    )
    const dir = await gh.checkoutRepository()
    expect(dir).toMatch(/.*library-checker-action\.ABCDEFG$/)

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
  ])('url or name: %s, url: %s', (nameOrUrl, expected) => {
    expect(new GitRepositoryCloner(nameOrUrl).repositoryUrl).toBe(expected)
  })
})