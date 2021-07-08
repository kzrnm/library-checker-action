using System;
using System.Linq;
using System.Reflection;

class Program
{
    static int Main(string[] args)
    {
        var name = args[0];
        var solver = Assembly.GetExecutingAssembly().GetTypes()
            .Where(t => t.IsClass && typeof(ISolver).IsAssignableFrom(t))
            .Select(type => (ISolver)Activator.CreateInstance(type))
            .FirstOrDefault(s => s.Name == name);

        if (solver == null)
            return 64; // if skip, exit with 64
        solver.Solve(Console.OpenStandardInput(), Console.OpenStandardOutput());
        return 0;
    }
}
