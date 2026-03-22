## Exercises

**Exercise 1**
A system has a 16-bit virtual address space, an 8 KB page size, and a 16-bit physical address space. Given the following simplified page table for a process, translate the virtual address `0x4B3F` to its corresponding physical address. If the translation is not possible, explain what event occurs.

| Virtual Page Number (VPN) | Valid | Physical Frame Number (PFN) |
| :------------------------ | :---- | :-------------------------- |
| 0x0                       | 1     | 0x07                        |
| 0x1                       | 1     | 0x0A                        |
| 0x2                       | 0     | -                           |
| 0x3                       | 1     | 0x02                        |
| 0x4                       | 1     | 0x0D                        |

**Exercise 2**
A system is configured with a 32-bit virtual address space, a 24-bit physical address space, and a 4 KB page size. For the virtual address `0xDEADBEEF`, determine the following:
a) The virtual page number (VPN) in hexadecimal.
b) The page offset in hexadecimal.
c) The total number of virtual pages the system can address.
d) The total number of physical frames available in memory.

**Exercise 3**
A system architect is deciding between using a 4 KB page size and a 64 KB page size for a new operating system. The primary workload consists of large, data-intensive applications that process contiguous multi-gigabyte files. Analyze the trade-offs of choosing the 64 KB page size over the 4 KB page size, specifically considering:
1.  The size of the page table for a single process.
2.  The amount of wasted memory due to internal fragmentation.
3.  The performance of the Translation Lookaside Buffer (TLB).

**Exercise 4**
Process P1 is running and its page table contains a mapping for virtual address `0xA0001234` to physical frame `0x15`. The operating system performs a context switch to Process P2. The very first instruction in P2 attempts to write to the virtual address `0xA0001234`. Assuming P2 has no mapping for this address in its own page table, describe the step-by-step sequence of hardware and OS events that prevents P2 from corrupting P1's data in physical frame `0x15`.

**Exercise 5**
A processor uses virtual memory and has a physically-addressed L1 data cache. A program needs to read a byte from virtual address `V`. Describe the sequence of interactions between the Memory Management Unit (MMU) and the L1 cache for the following two scenarios:
a) The page table entry for `V` is in the TLB (a cache for page table entries), but the data at the corresponding physical address is not in the L1 cache.
b) The page table entry for `V` is not in the TLB, but the data at the corresponding physical address *is* in the L1 cache. (This can happen if the data was accessed recently but the TLB entry was evicted).

**Exercise 6**
You are debugging a scientific computing application written in assembly that is running extremely slowly. Profiling reveals an exceptionally high rate of page faults. The application processes a large 1024x1024 matrix of 8-byte double-precision floats, stored in row-major order. The system has a 4 KB page size. The core of the problematic code is as follows:

```assembly
; R1 = matrix base address
; R2 = 1024 (number of rows/columns)
; R3 = column index (j), R4 = row index (i)

mov R3, 0 ; j = 0
outer_loop:
  mov R4, 0 ; i = 0
inner_loop:
  ; Calculate address of M[i][j]
  ; The bug is here: it's accessing M[j][i] instead!
  ; addr = base + i * 1024 * 8 + j * 8
  ; But the code does: base + j * 1024 * 8 + i * 8
  
  ; Assume R5 holds the calculated address of M[j][i]
  fld double [R5] ; Load float from memory
  
  add R4, R4, 1 ; i++
  cmp R4, R2
  blt inner_loop
  
  add R3, R3, 1 ; j++
  cmp R3, R2
  blt outer_loop
```

Explain, in terms of memory layout and virtual memory pages, why this column-wise traversal of a row-major matrix is causing so many page faults. How would you change the loop structure (the order of `i` and `j` increments) to fix the performance problem, and why would your change be effective?

---

## Answer Key

**Answer 1**
**Reasoning:**
1.  **Determine Page Size and Offset Bits:** The page size is 8 KB, which is 2^13 bytes. This means the lower 13 bits of the virtual address are the page offset.
2.  **Break Down the Virtual Address:** The virtual address is `0x4B3F`.
    *   In binary, this is `0100 1011 0011 1111`.
    *   The page offset is the lower 13 bits: `0 1011 0011 1111`, which is `0x1B3F`.
    *   The Virtual Page Number (VPN) is the remaining upper 3 bits: `010`, which is `0x2`.
3.  **Look up VPN in Page Table:** We look for VPN `0x2` in the page table. The entry for VPN `0x2` has its `Valid` bit set to 0.
4.  **Conclusion:** Because the `Valid` bit is 0, the required page is not currently in physical memory. The hardware (MMU) cannot complete the translation and will trigger a **page fault**. This is a trap that transfers control to the operating system's page fault handler to resolve the issue (e.g., by loading the page from disk). A physical address cannot be generated.

**Answer 2**
**Reasoning:**
1.  **Calculate Offset Bits:** The page size is 4 KB, which is 4 * 1024 = 4096 bytes = 2^12 bytes. This means the page offset uses the lower 12 bits of the address.
2.  **Partition the Virtual Address:** The virtual address is 32 bits.
    *   Offset = 12 bits
    *   Virtual Page Number (VPN) = 32 bits - 12 bits = 20 bits.
3.  **Apply to `0xDEADBEEF`:**
    *   `0xDEADBEEF` in hex is `1101 1110 1010 1101 1011 1110 1110 1111` in binary.
    *   **b) Page Offset:** The lower 12 bits are `1110 1110 1111`, which is `0xEEF`.
    *   **a) VPN:** The upper 20 bits are `1101 1110 1010 1101 1011`, which is `0xDEADB`.
4.  **Calculate System Capacities:**
    *   **c) Total Virtual Pages:** The VPN is 20 bits long, so the total number of virtual pages is 2^20 pages.
    *   **d) Total Physical Frames:** The physical address space is 24 bits. The offset is 12 bits, so the Physical Frame Number (PFN) is 24 - 12 = 12 bits. The total number of physical frames is 2^12 = 4096 frames.

**Answer 3**
**Reasoning:**
1.  **Page Table Size:** A larger page size means fewer pages are needed to cover the same virtual address space. For a 32-bit (4 GB) address space, a 4 KB page size requires 2^20 (about a million) page table entries. A 64 KB page size (2^16 bytes) requires only 2^16 (65,536) entries. Therefore, the **64 KB page size results in a significantly smaller page table per process**, saving memory.
2.  **Internal Fragmentation:** This is the memory wasted within the last page of a memory allocation. If a program needs 130 KB of memory, with 64 KB pages it would be allocated three pages (192 KB), wasting 62 KB in the last page. With 4 KB pages, it would be allocated 33 pages (132 KB), wasting only 2 KB. For workloads with many small, non-page-aligned allocations, the **64 KB page size leads to significantly more wasted memory due to internal fragmentation**.
3.  **TLB Performance:** The TLB is a small, fast cache for address translations. A single TLB entry maps an entire page. With a 64 KB page size, a single TLB entry covers 16 times more memory than with a 4 KB page size. For applications with good spatial locality (like processing large contiguous files), a TLB hit with a 64 KB page allows access to a much larger region of memory. This increases the **TLB reach** (the total memory accessible without a TLB miss), leading to a **higher TLB hit rate and better performance**.

**Answer 4**
**Reasoning:**
1.  **Context Switch:** When the OS switches from P1 to P2, it changes the **page table base register (PTBR)** in the CPU to point to the base of P2's page table in memory. P1's page table is no longer active.
2.  **Address Generation:** P2's instruction attempts to write to virtual address `0xA0001234`. The processor's Memory Management Unit (MMU) begins the translation process.
3.  **Page Table Walk (initiated by MMU):** The MMU uses the virtual address to find the corresponding entry in the *current* page table (which belongs to P2). It looks for the page table entry corresponding to the VPN `0xA0001`.
4.  **Protection Fault:** Since P2 does not have a valid mapping for this address, the MMU will find either:
    *   An entry marked as `invalid`.
    *   No entry for that address at all, depending on the page table structure.
5.  **Hardware Trap:** The MMU cannot complete the translation. It detects an invalid memory access and triggers a hardware trap (an exception) to the operating system. This is often called a **segmentation fault** or general protection fault.
6.  **OS Intervention:** The OS's trap handler takes over. It identifies the faulting process (P2) and the invalid address. Since this is an illegal memory access, the OS will typically terminate Process P2 to prevent it from corrupting memory it doesn't own. P1's data in physical frame `0x15` remains untouched.

**Answer 5**
**Reasoning:**
The key is that the cache is physically-addressed, so the virtual-to-physical address translation must happen *before* the cache can be checked.

**a) TLB Hit, Cache Miss:**
1.  The CPU presents virtual address `V` to the MMU.
2.  The MMU checks the TLB for the translation of `V`'s virtual page number.
3.  **TLB Hit:** The translation is found in the TLB. The MMU quickly gets the physical frame number (PFN).
4.  The MMU constructs the full physical address `P` by combining the PFN with the page offset from `V`.
5.  The physical address `P` is now presented to the L1 cache controller.
6.  **Cache Miss:** The cache checks for the block containing `P`. It is not found.
7.  The L1 cache forwards the request to the next level of memory (L2 cache or main memory). The data is fetched into the L1 cache and then returned to the CPU.

**b) TLB Miss, Cache Hit:**
1.  The CPU presents virtual address `V` to the MMU.
2.  The MMU checks the TLB.
3.  **TLB Miss:** The translation is not in the TLB.
4.  The MMU must perform a "page table walk." It reads the page table base address from a special register and uses the VPN from `V` to index into the page table in main memory to find the correct page table entry. (This may involve multiple memory accesses for multi-level page tables).
5.  Once the entry is found, the MMU extracts the PFN and loads the translation into the TLB for future use.
6.  The MMU constructs the full physical address `P`.
7.  The physical address `P` is presented to the L1 cache controller.
8.  **Cache Hit:** The cache checks for the block containing `P`. It is found. The data is immediately returned from the L1 cache to the CPU.

**Answer 6**
**Reasoning:**
1.  **Memory Layout:** The matrix is stored in row-major order. This means all elements of row 0 are contiguous in memory, followed by all elements of row 1, and so on. A single row (`1024 * 8 bytes = 8192 bytes = 8 KB`) spans exactly two 4 KB pages.
2.  **Access Pattern Problem:** The code's nested loops iterate through columns first (`j` is the outer loop), then rows (`i` is the inner loop). For a fixed column `j`, the inner loop accesses `M[0][j]`, `M[1][j]`, `M[2][j]`, etc.
    *   The memory address of `M[i][j]` is `base + i * (1024 * 8) + j * 8`.
    *   The address of `M[i+1][j]` is `base + (i+1) * (1024 * 8) + j * 8`.
    *   The distance between two consecutive memory accesses in the inner loop is `1024 * 8 = 8192` bytes (8 KB).
3.  **Cause of Page Faults:** Since each access is 8 KB apart, every single memory access falls on a *different* page from the previous one. For the first access (`M[0][j]`), a page is loaded. For the very next access (`M[1][j]`), the program needs a completely different page. Given a limited number of physical frames, the system will constantly be swapping pages in and out of memory, leading to a massive number of page faults and terrible performance. The program has zero spatial locality in its access pattern.

**Proposed Solution:**
The fix is to swap the loops so that the program iterates through the matrix in the same way it is stored in memory (row-by-row). The outer loop should control the row index (`i`) and the inner loop should control the column index (`j`).

```assembly
; Corrected loop structure
mov R4, 0 ; i = 0
outer_loop:
  mov R3, 0 ; j = 0
inner_loop:
  ; Calculate address of M[i][j]
  ; addr = base + i * 1024 * 8 + j * 8
  
  fld double [R5] ; Load float from memory
  
  add R3, R3, 1 ; j++
  cmp R3, R2
  blt inner_loop
  
  add R4, R4, 1 ; i++
  cmp R4, R2
  blt outer_loop
```

**Why it Works:** With this corrected structure, the inner loop accesses `M[i][0]`, `M[i][1]`, `M[i][2]`, etc. These elements are contiguous in memory, only 8 bytes apart. When the first element of a row (`M[i][0]`) is accessed, it may cause a page fault to load the page. However, the next 511 elements (`4096 bytes / 8 bytes per element`) are all on that *same page*. This results in one page fault followed by 511 fast memory accesses, dramatically improving spatial locality and nearly eliminating the page fault storm.