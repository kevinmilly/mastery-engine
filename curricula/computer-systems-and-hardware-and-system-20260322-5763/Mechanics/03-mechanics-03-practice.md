## Exercises

**Exercise 1**
Consider a direct-mapped cache with 8 cache lines, where each line can hold one block of data. A program accesses the following sequence of memory block addresses: `3, 18, 3, 10, 26, 11`.

Trace the state of the cache for this sequence. For each access, state whether it is a hit or a miss, and show the final contents of the cache (which block addresses are stored in which cache lines) after the entire sequence is complete.

**Exercise 2**
A system has a 2-way set-associative cache with a total of 4 sets (i.e., 8 cache lines in total). A program accesses a sequence of memory block addresses that all map to **Set 2**. The sequence of block accesses is: `10, 18, 2, 10, 26, 18, 2`.

Determine the final two block addresses stored in Set 2 after this sequence is complete, assuming:
a) A First-In, First-Out (FIFO) replacement policy.
b) A Least Recently Used (LRU) replacement policy.

**Exercise 3**
A programmer is writing code to process a large 2D integer array, `int matrix[2048][2048]`, which is stored in row-major order in memory. The system has a data cache with a 64-byte cache line size. Integers are 4 bytes. The programmer has written two versions of a function to sum the array elements.

*   **Version A (Row-wise traversal):**
    ```c
    for (int i = 0; i < 2048; i++) {
        for (int j = 0; j < 2048; j++) {
            sum += matrix[i][j];
        }
    }
    ```
*   **Version B (Column-wise traversal):**
    ```c
    for (int j = 0; j < 2048; j++) {
        for (int i = 0; i < 2048; i++) {
            sum += matrix[i][j];
        }
    }
    ```

Which version will likely execute faster and why? Explain your reasoning in terms of memory access patterns, spatial locality, and cache misses.

**Exercise 4**
A processor has a cache with a 2 nanosecond (ns) access time and a main memory with a 100 ns access time. The cache has a hit rate of 96% for a particular benchmark program.

a) Calculate the Average Memory Access Time (AMAT) for this system.
b) A proposed upgrade is to replace the cache with a larger, but slightly slower, one. The new cache would have an access time of 2.5 ns but is expected to increase the hit rate to 98.5%. Would you recommend this upgrade? Justify your decision with a new AMAT calculation.

**Exercise 5**
A CPU has a 5-stage instruction pipeline (IF, ID, EX, MEM, WB) and a base Clock Cycles Per Instruction (CPI) of 1.0 when all memory accesses are cache hits. 30% of its instructions are `load` or `store` operations that access a data cache. The data cache has a miss rate of 5%. A cache miss stalls the entire pipeline for 50 clock cycles (the "miss penalty").

Calculate the effective CPI for this CPU, accounting for the stalls caused by data cache misses.

**Exercise 6**
You are designing the L1 cache for a new high-performance CPU intended for scientific computing and data analysis. These workloads often involve streaming through large datasets and performing complex calculations on small, reusable sets of parameters. You must decide on the cache's associativity. The main options are:

1.  **Direct-mapped:** Simplest hardware, fastest hit time.
2.  **8-way set-associative:** More complex hardware, slightly slower hit time, but much lower chance of conflict misses.

Explain which design you would likely choose and justify your choice. Your answer should discuss the trade-off between hit time, miss rate, and the typical memory access patterns of the target workloads.

---

## Answer Key

**Answer 1**
To find the cache line for a direct-mapped cache, we use the formula: `Cache Line = Block Address mod Number of Lines`. Here, the number of lines is 8.

*   **Access 1: Block 3**
    *   `3 mod 8 = 3`. Miss. Block 3 is loaded into Line 3.
*   **Access 2: Block 18**
    *   `18 mod 8 = 2`. Miss. Block 18 is loaded into Line 2.
*   **Access 3: Block 3**
    *   `3 mod 8 = 3`. Hit. Block 3 is already in Line 3.
*   **Access 4: Block 10**
    *   `10 mod 8 = 2`. Miss. Block 18 in Line 2 is replaced by Block 10.
*   **Access 5: Block 26**
    *   `26 mod 8 = 2`. Miss. Block 10 in Line 2 is replaced by Block 26.
*   **Access 6: Block 11**
    *   `11 mod 8 = 3`. Miss. Block 3 in Line 3 is replaced by Block 11.

**Final Cache State:**
*   Line 0: Empty
*   Line 1: Empty
*   Line 2: Block 26
*   Line 3: Block 11
*   Line 4: Empty
*   Line 5: Empty
*   Line 6: Empty
*   Line 7: Empty

**Answer 2**
The problem states all these blocks map to Set 2, which has two "ways" (slots). We only need to track the two blocks in this set.

**a) FIFO (First-In, First-Out) Policy:**
The cache evicts the block that was loaded first. We can track the contents of the two slots in order of arrival.

1.  **Access 10:** Miss. Set 2: `[10]`
2.  **Access 18:** Miss. Set 2: `[10, 18]` (10 arrived first)
3.  **Access 2:** Miss. Set is full. Evict 10 (oldest). Set 2: `[18, 2]`
4.  **Access 10:** Miss. Set is full. Evict 18 (oldest). Set 2: `[2, 10]`
5.  **Access 26:** Miss. Set is full. Evict 2 (oldest). Set 2: `[10, 26]`
6.  **Access 18:** Miss. Set is full. Evict 10 (oldest). Set 2: `[26, 18]`
7.  **Access 2:** Miss. Set is full. Evict 26 (oldest). Set 2: `[18, 2]`

**Final contents of Set 2 (FIFO):** Blocks `18` and `2`.

**b) LRU (Least Recently Used) Policy:**
The cache evicts the block that has not been accessed for the longest time. We track the use order.

1.  **Access 10:** Miss. Set 2: `[10]`
2.  **Access 18:** Miss. Set 2: `[10, 18]` (18 is most recent)
3.  **Access 2:** Miss. Set is full. Evict 10 (LRU). Set 2: `[18, 2]`
4.  **Access 10:** Miss. Set is full. Evict 18 (LRU). Set 2: `[2, 10]`
5.  **Access 26:** Miss. Set is full. Evict 2 (LRU). Set 2: `[10, 26]`
6.  **Access 18:** Miss. Set is full. Evict 10 (LRU). Set 2: `[26, 18]`
7.  **Access 2:** Miss. Set is full. Evict 26 (LRU). Set 2: `[18, 2]`

**Final contents of Set 2 (LRU):** Blocks `18` and `2`.
*(Note: In this specific sequence, the final result is the same, but the intermediate steps and reasons for eviction are different.)*

**Answer 3**
**Version A (Row-wise traversal) will be significantly faster.**

**Reasoning:**
1.  **Memory Layout and Spatial Locality:** C stores 2D arrays in row-major order. This means that elements in the same row (e.g., `matrix[i][0]`, `matrix[i][1]`, `matrix[i][2]`, ...) are laid out contiguously in memory. Programs that access contiguous memory exhibit good spatial locality.
2.  **Cache Line Utilization (Version A):** A cache line is 64 bytes, and an integer is 4 bytes. Therefore, one cache line holds `64 / 4 = 16` integers. When `matrix[i][0]` is accessed, the hardware fetches a cache line containing `matrix[i][0]` through `matrix[i][15]`. The subsequent 15 accesses in the inner loop (`for j...`) will all be cache hits because the data is already in the cache. This results in approximately 1 miss for every 16 accesses.
3.  **Cache Line Utilization (Version B):** The column-wise traversal accesses `matrix[0][j]`, then `matrix[1][j]`, etc. These elements are far apart in memory (specifically, 2048 * 4 = 8192 bytes apart). Each access will likely be to a different memory block, causing a cache miss. The cache line brought in for `matrix[i][j]` will contain `matrix[i][j+1]...`, but the next access is to `matrix[i+1][j]`, which is not in that line. This poor spatial locality leads to a very high cache miss rate, potentially a miss for every single access.

Therefore, Version A leverages spatial locality for a high cache hit rate, while Version B thrashes the cache, leading to poor performance.

**Answer 4**
The formula for Average Memory Access Time (AMAT) is:
`AMAT = (Hit Time) + (Miss Rate * Miss Penalty)`
Here, the Miss Penalty is the time to access main memory, which is 100 ns.

**a) Initial System:**
*   Hit Time = 2 ns
*   Miss Rate = 1 - 0.96 = 0.04
*   Miss Penalty = 100 ns
*   `AMAT = 2 ns + (0.04 * 100 ns) = 2 ns + 4 ns = 6 ns`

**b) Proposed Upgrade:**
*   Hit Time = 2.5 ns
*   Miss Rate = 1 - 0.985 = 0.015
*   Miss Penalty = 100 ns
*   `AMAT = 2.5 ns + (0.015 * 100 ns) = 2.5 ns + 1.5 ns = 4 ns`

**Recommendation:** Yes, the upgrade is highly recommended. Even though the cache itself is slightly slower (2.5 ns vs 2 ns hit time), the significant reduction in the miss rate drastically lowers the overall AMAT from 6 ns to 4 ns. This represents a 33% improvement in average memory access performance.

**Answer 5**
**1. Find the number of `load`/`store` instructions:**
Total instructions = 1000.
`load`/`store` instructions = 1000 * 30% = 300.

**2. Find the number of data cache misses:**
The miss rate applies only to memory-accessing instructions.
Number of misses = 300 * 5% = 15 misses.

**3. Calculate the total penalty cycles from misses:**
Each miss costs 50 stall cycles.
Total penalty cycles = 15 misses * 50 cycles/miss = 750 cycles.

**4. Calculate the total clock cycles for the program:**
*   Ideal cycles (no stalls) = Total Instructions * Base CPI = 1000 * 1.0 = 1000 cycles.
*   Total cycles = Ideal cycles + Penalty cycles = 1000 + 750 = 1750 cycles.

**5. Calculate the effective CPI:**
Effective CPI = Total Cycles / Total Instructions
Effective CPI = 1750 / 1000 = **1.75**.

The data cache misses increase the effective CPI from an ideal 1.0 to 1.75, representing a 75% performance degradation due to memory stalls.

**Answer 6**
For a high-performance CPU aimed at scientific computing, the **8-way set-associative cache** is the better choice.

**Justification:**
1.  **Workload Analysis:** Scientific workloads often have complex memory access patterns. While some parts involve streaming data (which has good spatial locality and works well with any cache), other critical parts involve accessing a small set of variables (parameters, counters, accumulators) repeatedly and irregularly. This can create a "hotspot" of memory addresses that are frequently used together.
2.  **Conflict Misses in Direct-Mapped Caches:** With a direct-mapped cache, if two frequently used variables happen to map to the same cache line, they will constantly evict each other. This is called a conflict miss. For example, if a core calculation loop accesses `A[i]` and `B[i]`, and their addresses unfortunately map to the same cache line, every access will be a miss. This can cripple performance, regardless of the fast hit time.
3.  **Benefit of Associativity:** An 8-way set-associative cache largely eliminates this problem. If two variables map to the same *set*, there are 7 other slots available before an eviction is necessary. For the common case of a small working set of frequently accessed data, it is highly likely they can all reside in the cache set simultaneously, turning potential conflict misses into hits.
4.  **Trade-off Evaluation:** While the 8-way cache has a slightly slower hit time and is more complex/power-hungry, the cost of a cache miss (which can be hundreds of cycles) is vastly greater than the cost of a slightly longer hit time (perhaps one extra cycle). For performance-critical applications, minimizing the miss rate is paramount. The significant reduction in conflict misses offered by the 8-way design will almost certainly outweigh the minor increase in hit latency, leading to much better overall performance for the target workloads.