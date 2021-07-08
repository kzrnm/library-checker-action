import os from 'os'
import path from 'path'
import fs from 'fs'
import clone from 'git-clone'

export interface CheckoutOptions {
  verboseLevel?: number
}

/**
 * Checkout repository
 * @returns directory path of the repository
 */
export async function checkoutRepository(
  repositoryURL: string,
  commit?: string
): Promise<string> {
  const dir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'library-checker-action.')
  )
  return new Promise((resolve, reject) => {
    clone(repositoryURL, dir, {checkout: commit, shallow: true}, e => {
      if (e) {
        reject(e)
      }
      resolve(dir)
    })
  })
}

/**
 *
 * @param nameOrUrl repository name or url
 * @returns repository full path default: https://github.com/yosupo06/library-checker-problems
 */
export function getRepositoryURL(nameOrUrl: string): string {
  if (!nameOrUrl) return 'https://github.com/yosupo06/library-checker-problems'
  if (nameOrUrl.startsWith('https://') || nameOrUrl.startsWith('git@'))
    return nameOrUrl
  return `https://github.com/${nameOrUrl}`
}
