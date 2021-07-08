using System;
using System.IO;
using System.Linq;

class Aplusb : ISolver
{
    public string Name => "aplusb";
    public void Solve(Stream stdin, Stream stdout)
    {
        using var sr = new StreamReader(stdin);
        using var sw = new StreamWriter(stdout);

        var input = sr.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
        sw.WriteLine(input[0] + input[1]);
    }
}