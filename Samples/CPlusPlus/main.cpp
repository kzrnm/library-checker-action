#include <cassert>
#include <cstring>
#include <iostream>
#include "./tests/aplusb.hpp"
using namespace std;

int main(int argc, const char *argv[])
{
    assert(argc >= 2);
    auto name = argv[1];
    if (strcmp(name, "aplusb") == 0)
    {
        aplusb_solve();
    }
    else
    {
        return 64; // if skip, exit with 64
    }
}