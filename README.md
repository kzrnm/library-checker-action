#  Library Checker Action

This action runs [yosupo06/library-checker-problems](https://github.com/yosupo06/library-checker-problems).

![test](https://github.com/naminodarie/library-checker-action/workflows/build-test/badge.svg?branch=master)

## Input

### repository-name

**Option** 

Repository name of library-checker

default: `yosupo06/library-checker-problems`

### commit

**Option** 

revision/branch/tag

default: HEAD

### list-problems

**Option** 

Command that lists the problems to check.

The output must be whitespace delimited.

If the output is empty, this action checks all problems.

## Output


## Usage

```yml
      - uses: naminodarie/library-checker-actions@v1
        id: get-version
        with:
          commit: 0e6c8e1b809f67a5e0685a5de03d3f313a10475f
```