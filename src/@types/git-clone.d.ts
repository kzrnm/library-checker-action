declare module 'git-clone' {
  type Callback = (err: Error) => void
  type CloneOptions = {
    /**
     * path to git binary; default: git
     */
    git?: string
    /**
     * when true, clone with depth 1
     */
    shallow?: boolean
    /**
     * revision/branch/tag to check out
     */
    checkout?: string
  }
  type CloneDef = (
    repo: string,
    targetPath: string,
    options: CloneOptions,
    /**
     * calling on completion
     */
    cb: Callback
  ) => void
  const clone: CloneDef
  export = clone
}
