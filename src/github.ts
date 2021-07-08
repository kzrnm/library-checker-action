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
  repositoryName: string,
  commit?: string
): Promise<string> {
  const repositoryURL = `https://github.com/${repositoryName}`
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
