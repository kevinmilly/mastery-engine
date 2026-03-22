## Exercises

**Exercise 1**
A program needs to add two numbers. The numbers are currently stored on the hard disk. Trace the path the data for one of these numbers would most likely take through the memory hierarchy to reach a CPU register for the calculation. List the memory types in the order the data passes through them.

**Exercise 2**
A marketing brochure for a new laptop advertises "16GB of L3 Cache." Based on your understanding of the memory hierarchy, why is this claim almost certainly a mistake? Explain your reasoning in terms of the typical characteristics of cache memory.

**Exercise 3**
Consider two different ways to process a large 2D array (a grid of numbers) stored in main memory (RAM).
*   **Method A:** Accesses each element row by row (e.g., [0,0], [0,1], [0,2], ... then [1,0], [1,1], [1,2], ...).
*   **Method B:** Accesses each element column by column (e.g., [0,0], [1,0], [2,0], ... then [0,1], [1,1], [2,1], ...).

Assuming the array is stored in memory one row after another, which method is likely to be faster, and why? Relate your answer to how data is moved from RAM to cache.

**Exercise 4**
You are configuring a server that will run a large, active database. Your budget allows for one of the following two upgrades:
1.  Double the amount of RAM (e.g., from 32GB to 64GB).
2.  Replace the secondary storage Hard Disk Drive (HDD) with a Solid-State Drive (SSD) of the same capacity.

Which upgrade is likely to have a more significant positive impact on performance when the database needs to frequently retrieve small, random pieces of data from across the entire dataset? Justify your choice by comparing the roles and relative speeds of RAM and secondary storage.

**Exercise 5**
During the "fetch" stage of the CPU's instruction cycle, the processor needs to retrieve the next instruction to execute. Describe the typical process the hardware follows to find this instruction, starting with the fastest level of the memory hierarchy. What happens if the instruction is not found at a particular level?

**Exercise 6**
Imagine a simplified computer system where a memory address is 16 bits long. This computer has 4096 bytes of RAM.
1.  Using the 16-bit address, what is the maximum amount of memory (in bytes) that the CPU can directly address? Show your calculation.
2.  The CPU requests data from memory address `0100 1110 0101 1011` (binary). This results in a "cache miss," so the system must load a block of 16 contiguous bytes from RAM into the cache. What is the starting address (in binary) of the 16-byte block that would be loaded? Explain your reasoning.

---

## Answer Key

**Answer 1**
The data would travel from the slowest, largest storage to the fastest, smallest storage. The path is:
1.  **Hard Disk (Secondary Storage):** The program and its data are initially loaded from here.
2.  **RAM (Main Memory):** A large chunk of the program's data, including the number, is copied from the hard disk to RAM to be actively worked on.
3.  **Cache (L3, L2, L1):** When the CPU needs the number, it's first copied from RAM into the cache. It may pass through multiple levels of cache (e.g., L3 -> L2 -> L1), getting closer to the CPU core.
4.  **CPU Register:** Finally, the data is moved from the fastest cache (L1) into a register, where the ALU (Arithmetic Logic Unit) can perform the addition.

**Answer 2**
This claim is almost certainly a mistake due to the fundamental trade-offs in the memory hierarchy: cost, speed, and capacity.
*   **Cost & Size:** Cache is built from very fast and expensive SRAM (Static RAM). Main memory (RAM) is built from cheaper, slower DRAM (Dynamic RAM). Because of this high cost, cache sizes are typically measured in megabytes (e.g., 8MB, 16MB, 32MB), not gigabytes.
*   **Purpose:** 16GB is a typical size for main memory (RAM). Confusing the two suggests a misunderstanding of their roles. Cache is a small, fast buffer for RAM, not a replacement for it. A 16GB cache would be prohibitively expensive and unbalanced in a typical system architecture.

**Answer 3**
Method A (row by row) is likely to be significantly faster.
*   **Reasoning:** When the CPU requests data from an address in RAM (e.g., for element [0,0]), the system doesn't just fetch that single piece of data. It fetches a contiguous block of memory (a "cache line") containing that data and its neighbors.
*   **Application (Method A):** Since the array is stored row by row, when element [0,0] is accessed, elements [0,1], [0,2], [0,3], etc., are likely loaded into the cache at the same time. The CPU's subsequent requests for these elements will be very fast "cache hits." This is called *spatial locality*.
*   **Application (Method B):** Accessing elements column by column means that after [0,0] is read, the next required element [1,0] is far away in memory. It will not be in the cache line that was just loaded, forcing another slow fetch from RAM (a "cache miss"). This pattern defeats the purpose of the cache.

**Answer 4**
Replacing the HDD with an SSD is likely to have a more significant impact.
*   **Reasoning:** The main bottleneck described is retrieving *random* data from a *large* dataset. "Large" implies that the entire dataset may not fit into RAM at once. Therefore, the system will frequently need to access secondary storage to pull in data that is not currently in RAM.
*   **Comparison:**
    *   **RAM Upgrade:** Doubling the RAM is helpful, as it allows more data to be held in memory, reducing the number of times the system needs to access secondary storage. However, if the active portion of the dataset is still larger than 64GB, disk access will still be a major factor.
    *   **SSD Upgrade:** SSDs have dramatically lower latency and higher read speeds for random access compared to HDDs (which involve physical spinning platters and moving read/write heads). Every time the system has a "cache miss" in RAM and needs to fetch data from storage, that operation will be orders of magnitude faster with an SSD. This directly addresses the core problem of slow random data retrieval from the larger dataset.

**Answer 5**
The process follows the memory hierarchy from fastest to slowest.
1.  **Check L1 Cache:** The CPU first checks the L1 instruction cache (the fastest cache, closest to the processor core). If the instruction is there (a "cache hit"), it is fetched immediately.
2.  **Check L2/L3 Cache:** If the instruction is not in L1 (an L1 "miss"), the hardware checks the next level(s) of cache (L2, then L3). If found, the instruction (and a surrounding block of data) is fetched and also copied into the L1 cache for future use.
3.  **Check RAM:** If the instruction is not found in any level of the cache (a "cache miss" for all levels), the processor must go to main memory (RAM) to retrieve it. This is a much slower operation.
4.  **Load to Cache and CPU:** When the instruction is retrieved from RAM, it is copied into the caches (L3, L2, L1) and finally sent to the CPU to be executed. This ensures that nearby instructions are pre-loaded for faster access on the next cycle.

**Answer 6**
1.  **Maximum Addressable Memory:**
    *   A 16-bit address means there are 2^16 possible unique addresses.
    *   2^16 = 65,536.
    *   Therefore, the CPU can directly address 65,536 bytes (or 64 KiB) of memory.

2.  **Starting Address of the Block:**
    *   **Reasoning:** The system loads data in 16-byte blocks to take advantage of spatial locality. This means memory addresses are grouped into chunks of 16. To find which chunk an address belongs to, we need to find the start of that chunk. A 16-byte block requires 4 bits to address any byte within it (2^4 = 16). The starting address of any block will therefore have its last 4 bits as `0000`.
    *   **Method:** To find the starting address for `0100 1110 0101 1011`, we keep the upper 12 bits and set the lower 4 bits to zero.
    *   Original Address: `0100 1110 0101 1011`
    *   Starting Address: `0100 1110 0101 0000`