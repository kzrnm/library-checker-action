using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

class Program
{
    static int Main(string[] args)
    {
        var name = args[0];
        var solvers = GetSolvers();

        if (name == "--list-solvers")
        {
            foreach (var s in solvers)
                Console.WriteLine(s.Name);
            return 0;
        }

        var solver = solvers.FirstOrDefault(s => s.Name == name);
        if (solver == null)
            return 64; // if you want skip a problem, exit before reading stdin
        solver.Solve(Console.OpenStandardInput(), Console.OpenStandardOutput());
        return 0;
    }

    static IEnumerable<ISolver> GetSolvers() => Assembly.GetExecutingAssembly().GetTypes()
            .Where(t => t.IsClass && typeof(ISolver).IsAssignableFrom(t))
            .Select(type => (ISolver)Activator.CreateInstance(type));
}
