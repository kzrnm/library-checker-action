import sys
from pathlib import Path
from importlib import import_module

testsDir = Path(__file__).parent.joinpath('tests')
name = sys.argv[1]

try:
    module = import_module(f'tests.{name}')
except(Exception):
    exit(64)  # if skip, exit with 64

module.main()
