import path from 'path'
import clone from 'git-clone'

export class GitRepositoryCloner {
  readonly repositoryUrl: string
  readonly commit?: string
  constructor(repositoryNameOrUrl: string, commit?: string) {
    this.repositoryUrl =
      GitRepositoryCloner.toRepositoryURL(repositoryNameOrUrl)
    this.commit = commit
  }

  /**
   * @returns repository full path default: https://github.com/yosupo06/library-checker-problems
   */
  private static toRepositoryURL(repositoryNameOrUrl: string): string {
    const nameOrUrl = repositoryNameOrUrl
    if (!nameOrUrl)
      return 'https://github.com/yosupo06/library-checker-problems'
    if (nameOrUrl.startsWith('https://') || nameOrUrl.startsWith('git@'))
      return nameOrUrl
    return `https://github.com/${nameOrUrl}`
  }

  /**
   * Checkout repository
   * @returns directory of the repository
   */
  async checkoutRepository(): Promise<string> {
    const dir = path.join(process.cwd(), 'library-checker-action')
    return new Promise((resolve, reject) => {
      clone(
        this.repositoryUrl,
        dir,
        {checkout: this.commit, shallow: true},
        e => {
          if (e) {
            reject(e)
          }
          resolve(dir)
        }
      )
    })
  }
}
