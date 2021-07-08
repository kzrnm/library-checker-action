using System.IO;

public interface ISolver
{
    string Name { get; }
    void Solve(Stream stdin, Stream stdout);
}