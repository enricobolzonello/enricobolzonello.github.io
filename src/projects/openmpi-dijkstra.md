---
title: "OpenMPI Dijkstra"
year: 2023
draft: false
category: ["Parallel Programming"]
client: "University"
technologies: ["C", "OpenMPI", "Make"]
icon: "E04A"
description: "A parallel implementation of Dijkstra’s Single-Source Shortest Path algorithm using OpenMPI. Explores how to distribute the workload across multiple processes to speed up shortest-path computation on weighted graphs."
link: "https://github.com/enricobolzonello/OpenMPI-Dijkstra/tree/main"
---

## Approach for Parallelization
Before discussing the parallel implementation, it's important to highlight that the sequential algorithm in use is not optimized to its fullest potential. Specifically, the implemented \\(O(n^2)\\) version [^1], contrasts with the more efficient \\(O(n\log n)\\) version employing a heap-based priority queue. This choice was made for two reasons: 
- dependency from external sources. The aim was to avoid relying on any external dependencies apart from OpenMPI, and the prospect of implementing a min-heap was firmly ruled out.
- ease of parallelization. 

Dijkstra's algorithm is inherently sequential since at each pass it chooses greedily the next vertex based on the following theorem [^1]:

Assume that the cost \\(L_i\\) of the shortest paths from \\(s\\) to each vertex \\(i\\) belonging to a given set \\(S\in V\\) with \\(s\in S\\)(\\(L_s=0\\)) is known and let 
```math
    (v,h)=\arg\min\{L_i+c_{ij}:(i,j)\in \delta^+(S)\}
```
If \\(c_{ij}\ge 0, \forall (i,j)\in A\\) then \\(L_v+c_{vh}\\) is the cost of the shortest path from \\(s\\) to \\(h\\).

The consequence of this theorem is that fully parallelizing Dijkstra is not possible, since we want to find the shortest distance for all vertices in the graph. The only way to parallelize is to assign a number of vertices to each processor and in each processor compute the distance from the source. 

First let's discuss the data division between processors. Let \\(n\\) be the number of vertices, so the adjacency matrix is \\(n\times n\\), and \\(p\\) be the number of processors. If \\(n\\) is divisible by \\(p\\) then \\(n/p\\) vertices can be assigned to a processor: vertex \\(p\\) has vertices \\([(p\cdot n/p), (p\cdot n/p + n/p)]\\).
In terms of the adjacency matrix, it corresponds to assigning \\(n/p\\) columns to each processor.

To achieve this behaviour in MPI, *Scatter* is the perfect candidate since each processor receives the same amount of columns, but custom MPI datatypes are needed to make the scatter work. The types are two: 
- **send type**, which defines a column of the adjacency matrix. It is achieved with a MPI Vector type with \\(count=n\\), which is the number of values in a column, and \\(stride=n\\), since each value of a column is placed at distance \\(n\\) from the previous one thanks to contiguous memory allocation. The *create_resized* is needed to tell MPI where to find the next column, which is one value after the current column.
- **receive type**, follows the same logic as the send type but with \\(stride=n/p\\)
Now from each processor we can access the data as a normal matrix, being careful that the number of columns is \\(n/p\\).

The outer loop of the Dijkstra subroutine maintains the same number of executions, what changes is the inside loops since each processor has fewer nodes. Each processor finds the non-visited node closer to the source, sends it to the other processors and computes the minimum of all nodes sent by the processors. This behaviour is achieved by an *Allreduce* with *MINLOC* MPI operation, which works in pairs of values: it finds the minimum value in the former and reports it along with the value that was paired with it.

Now every processor has the  minimum vertex, so mark it as visited if it belongs to the processor. Subsequently, update all minimum paths and record the predecessor. Finally, since each processor holds \\(n/p\\) elements both for minimum paths and predecessors, a simple *Gather* suffices to get the full results.

## Results
The datasets were generated through a Python script utilizing the networkx library to produce an Erdós-Rényi random graph, employing two specified parameters as in the documentation: 
- \\(n\\), number of nodes
- \\(p\\), probability for edge creation
This allowed for two tests: the first fixing \\(p\\) for the scalability on number of nodes, the second, fixing \\(n\\), to test whether the number of edges exiting a node affects runtime. All runs have been executed in the Capri platform [^2].

### Scalability on \\(n\\)
For the first experiment, \\(p\\) is fixed to \\(0.5\\) and the results in Table \ref{tab:1st-runtimes} with different sizes are obtained.
| n    | file name    | time sequential | time 2 processors | time 5 processors | time 10 processors |
|------|--------------|-----------------|-------------------|-------------------|--------------------|
| 100  | random05.txt | 0.000170        | 0.000471          | 0.000814          | 0.001706           |
| 500  | random04.txt | 0.003735        | 0.006348          | 0.005087          | 0.007381           |
| 1000 | random06.txt | 0.015361        | 0.024530          | 0.017180          | 0.018987           |
| 2000 | random07.txt | 0.057728        | 0.087999          | 0.061480          | 0.060349           |
| 5000 | random08.txt | 0.425093        | 0.567382          | 0.349344          | 0.293054           |
| 7500 | random09.txt | 0.943866        | 1.570785          | 0.831178          | 0.711831           |

As we can see in the table, the speed-up tends to increase as the number of processors and size of the graph increases. It is interesting to note the fact that with \\(2\\) processors the algorithm performs always worst than the sequential algorithm. In all other cases, the speed-up tells us that the use of more processors slightly improves the run-time compared to the sequential algorithm, but not of a factor of \\(p\\) as the aim was. To better understand the cause of this results, let's analyze the Computing over Communication ratio in the following table with \\(n=100\\).

| processors      | 2    | 5    | 10   |
|---------------------|----------|----------|----------|
| communication total | 0,000219 | 0,00059  | 0,000516 |
| execution           | 0,000263 | 0,000901 | 0,00113  |
| total time          | 0,000482 | 0,001491 | 0,001646 |
| **ratio**               | **54,56%**   | **60,43%**   | **68,65%**   |

For simplicity, the execution time also includes the *Allreduce* operation inside the Dijkstra subroutine. The algorithm spends at least 31% of the time on the distribution of the data between processors and the final gathering, but what mainly goes up is the execution time, due to the *Allreduce* since the dataset is the same for all the runs. It is interesting to note that the run with the best speed-up has a Computing-over-Communication ratio of 18,43%.

### Constant n, different p
Fixing n=5000 and varying p, the following results are obtained.

| p | filename | time sequential | time 2 processors | time 5 processors | time 10 processors |
|-------|--------------|---------------------|-----------------------|-----------------------|------------------------|
| 0.1   | random10.txt | 0.214774            | 0.503825              | 0.314247              | 0.268701               |
| 0.3   | random11.txt | 0.288822            | 0.539787              | 0.319813              | 0.260734               |
| 0.5   | random08.txt | 0.425093            | 0.567382              | 0.349344              | 0.293054               |
| 0.7   | random12.txt | 0.365197            | 0.616920              | 0.360916              | 0.270841               |
| 0.9   | random13.txt | 0.261535            | 0.631541              | 0.363818              | 0.283388               |
| 1     | random14.txt | 0.214215            | 0.660333              | 0.378930              | 0.286056               |

In this experiment, it is interesting to observe the behaviour of the run-time as the probability of an edge being created increases. The expected behaviour is that the runtime increases when the probability, and consequently the number of edges exiting from a node, increases. The runs somewhat follows the theoretical assumption, excluding the run with \\(p=0.5\\) and 10 processors which is an outlier. A possible explanation for the outlier is that the execution with \\(p=0.5\\) took place at a distinct time from the other runs, suggesting the possibility that Capri experienced higher congestion during that specific timeframe. The hypothesis proved true since another run executed in a much better time of \\(0,251142\\) seconds.

[^1]: Matteo Fischetti. Introduction to Mathematical Optimization. 5th. 2019. isbn: 9781692792022.
[^2]: University of Padova Strategic Research Infrastructure Grant 2017. CAPRI: Calcolo ad Alte Prestazioni per la Ricerca e l’Innovazione.