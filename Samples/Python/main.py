import sys
from pathlib import Path
from importlib import import_module

testsDir = Path(__file__).parent.joinpath('tests')
name = sys.argv[1]

if name == '--list-tests':
    for p in testsDir.glob('*.py'):
        print(p.stem)
    exit()

try:
    module = import_module(f'tests.{name}')
except(Exception):
    exit(64)  # if skip, exit with 64

module.main()
