# Library Checker Action

This action runs [yosupo06/library-checker-problems](https://github.com/yosupo06/library-checker-problems).

![test](https://github.com/naminodarie/library-checker-action/workflows/build-test/badge.svg?branch=master)

## Input

### command

**Required**

Command for library checker.

If your command contains `%s`, the action replace `%s` with a problem name If not, the action add a problem name to the command arguments.

**_example_**

- `command` = `./run.py`

```sh
./run.py aplusb
./run.py unionfind
# Run others....
```

- `command` = `./run.py -name %s -s %s`

```sh
./run.py -name aplusb -s aplusb
./run.py -name unionfind -s unionfind
# Run others....
```

If you want skip a problem, exit before reading stdin.

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

### cache-test-data

**Option**

If true, the action cache test datas.

- `false`: `""`, `"false"`, `"0"`
- `true`: otherwise

## Output

## Usage

```yml
- uses: naminodarie/library-checker-actions@v1
  id: get-version
  with:
    commit: 0e6c8e1b809f67a5e0685a5de03d3f313a10475f
```
