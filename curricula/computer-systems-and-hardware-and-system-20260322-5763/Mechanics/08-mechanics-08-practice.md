## Exercises

**Exercise 1**
A user program issues a `read()` call for the first 100 bytes of the file `/home/user/report.txt`. Assuming the file exists and is larger than 100 bytes, describe the sequence of main steps the file system component of the OS would take to locate and retrieve this data from the disk. Start from resolving the path and end with returning the data to the user program.

**Exercise 2**
Consider a simple file system with a block size of 4 KB. A file named `log.dat` is 13 KB in size. Its inode contains 10 direct block pointers. How many disk blocks are required in total to store this file and its inode? (Assume one inode fits in a single, separate block). Show your calculation.

**Exercise 3**
A user deletes a 10 MB file from a file system. A forensics expert claims they might be able to recover the file's contents, even though the file no longer appears in directory listings. Based on your understanding of inodes and data blocks, explain why this recovery might be possible. What specific action would make recovery much more difficult?

**Exercise 4**
Consider a file system where each inode has 12 direct block pointers and one single indirect block pointer. Each block pointer is 4 bytes, and the block size is 4 KB.
Scenario A: A 40 KB file has 1 KB of data appended to it.
Scenario B: A 50 MB file has 1 KB of data appended to it.
Compare the number of disk I/O operations required to update the file system metadata (not including writing the actual data) for both scenarios. Explain the difference.

**Exercise 5**
A program writes 1 KB of data to a file via a `write()` system call and immediately after, the program is terminated due to a power outage. The user reboots the computer and finds the data was not saved. However, another program that wrote 1 KB and then explicitly called `fsync()` before a similar power outage *did* have its data saved. Drawing on your knowledge of both file systems and memory hierarchies (like caching), explain the likely mechanism responsible for this difference in outcomes.

**Exercise 6**
Two independent processes, P1 and P2, both open the same file, `/shared/data.log`, for appending. Each process receives a separate file descriptor. P1 writes "AAAA" and P2 writes "BBBB". Describe the roles of the per-process file descriptor table, the system-wide open file table, and the inode in ensuring that both writes occur without corrupting the file, even if the writes are interleaved. What is a potential outcome for the file's content, and why is the file's final size predictable?

---

## Answer Key

**Answer 1**
The OS file system performs the following steps:
1.  **Path Traversal:** The file system starts at the root directory (`/`). It reads the inode for `/` to find its data blocks, which contain directory entries.
2.  **Directory Search:** It searches the root directory's data for the entry "home" and retrieves the corresponding inode number.
3.  **Recursive Traversal:** It repeats the process: it reads the inode for "home", searches its data blocks for the entry "user", and gets its inode number. It then reads the inode for "user", searches its data blocks for "report.txt", and gets the final inode number.
4.  **Inode Read:** The file system reads the inode for `report.txt` from disk. This inode contains metadata (size, permissions) and pointers to the data blocks that hold the file's content.
5.  **Data Block Read:** The file system follows the first data block pointer in the inode to locate the first data block of the file on the disk.
6.  **Data Retrieval:** It reads this first data block from the disk into a kernel buffer. Since only 100 bytes are requested and a block is typically much larger (e.g., 4 KB), the entire first block is sufficient.
7.  **Return to User:** The OS copies the first 100 bytes from the kernel buffer into the buffer provided by the user program and returns control to the program.

**Answer 2**
The reasoning and calculation are as follows:

1.  **Inode Storage:** The problem states that the inode itself occupies one disk block.
    *   Inode blocks: 1

2.  **Data Storage:** The file is 13 KB, and the block size is 4 KB. To find the number of blocks needed for the data, we divide the file size by the block size and round up to the nearest whole number.
    *   Calculation: `ceil(13 KB / 4 KB) = ceil(3.25) = 4`
    *   Data blocks: 4

3.  **Total Blocks:** The total number of blocks is the sum of blocks for the inode and the data.
    *   Total = Inode blocks + Data blocks
    *   Total = 1 + 4 = 5 blocks

Therefore, a total of 5 disk blocks are required. The fact that the inode has 10 direct pointers is relevant because it confirms that it can point to the 4 data blocks needed without requiring indirect blocks.

**Answer 3**
Recovery is possible because a standard file deletion is not a destructive operation for the file's contents. Here's why:

1.  **What Deletion Does:** When a file is deleted, the operating system typically performs two main actions:
    *   It removes the directory entry that links the human-readable filename to the file's inode number.
    *   It marks the inode and its associated data blocks as "free" or "unallocated" in the file system's free-space bitmap or list.
2.  **Why Recovery is Possible:** The actual data in the data blocks is not overwritten or erased. It remains on the disk until the file system allocates those blocks to a new file and writes new data over them. A recovery tool can scan the disk for inodes that are marked as free but still point to valid-looking data blocks, and then reassemble the file.

**Action Making Recovery Difficult:**
Recovery becomes much more difficult if the "free" data blocks are overwritten. This happens naturally as the user creates or modifies other files. An explicit action that would make recovery difficult is creating a new, large file, which would cause the OS to allocate and use the newly-freed blocks, overwriting the old data.

**Answer 4**
The key difference lies in whether an indirect block must be accessed.

-   **Maximum data addressable by direct pointers:** 12 pointers * 4 KB/block = 48 KB.

**Scenario A (40 KB file):**
The file is 40 KB, which is less than the 48 KB limit for direct pointers. All data blocks are referenced by direct pointers in the inode.
1.  **Read Inode:** To find a free data block, the OS may need to check the inode. (1 I/O).
2.  **Write Inode:** After allocating a new data block and adding its address to the next available direct pointer slot, the inode must be written back to disk. (1 I/O).
*Total Metadata I/Os: ~2 (Read inode, Write inode).*

**Scenario B (50 MB file):**
The file is 50 MB, which is much larger than the 48 KB addressable by direct pointers. Therefore, it is already using the single indirect block.
1.  **Read Inode:** The OS reads the inode to find the address of the indirect block. (1 I/O).
2.  **Read Indirect Block:** The OS reads the single indirect block from disk into memory. This block contains a list of pointers to the actual data blocks. (1 I/O).
3.  **Write Indirect Block:** After a new data block is allocated, its address is appended to the list of pointers in the indirect block. This modified indirect block must be written back to disk. (1 I/O).
4.  **Write Inode:** The inode's metadata (e.g., file size, modification time) must be updated and written back to disk. (1 I/O).
*Total Metadata I/Os: ~4 (Read inode, Read indirect block, Write indirect block, Write inode).*

**Conclusion:** Scenario B requires approximately twice as many metadata I/O operations because it must read and write the indirect block in addition to reading and writing the inode.

**Answer 5**
The mechanism responsible is the operating system's **buffer cache** (or page cache).

1.  **`write()` System Call:** When a program issues a `write()` system call, the OS is invoked. However, for performance reasons, the OS does not immediately write the data to the physical disk. Instead, it copies the data from the user's buffer into a kernel buffer in RAM (the buffer cache). It then marks this buffer as "dirty," meaning it needs to be written to disk later. The `write()` call returns control to the user program immediately, giving the illusion of a fast operation.
2.  **Power Outage Scenario 1:** When the power is lost, the contents of the volatile RAM, including the dirty buffer in the cache, are lost. Since the data never made it to the persistent secondary storage (the disk), it is gone.
3.  **`fsync()` System Call:** The `fsync()` system call explicitly instructs the OS to "flush" any dirty buffers associated with that file from the buffer cache to the physical disk. It is a request to synchronize the in-memory state of the file with the on-disk state. The call does not return until the data has been physically written.
4.  **Power Outage Scenario 2:** Because `fsync()` was called, the data was forced from the kernel's RAM buffer to the disk. When the power was lost, the data was already safe on persistent storage.

**Answer 6**
The file system uses a three-table structure to manage this situation correctly, which draws on concepts from both process management and file systems.

1.  **Per-Process File Descriptor Table:** Each process (P1 and P2) has its own private file descriptor table. When P1 opens the file, the OS creates an entry (e.g., at index 3) and returns this index as the file descriptor. P2 does the same and might get file descriptor 3 in its *own* table. These descriptors are local to each process.
2.  **System-Wide Open File Table:** The entries in the process-specific descriptor tables point to entries in a single, system-wide open file table. When P1 opens the file, the OS creates an entry here. When P2 opens the *same* file, the OS sees an entry for this file already exists and simply makes P2's file descriptor table entry point to this *same* entry. This shared entry is crucial; it contains the current file offset (read/write position) and the file's status flags (e.g., opened for appending).
3.  **Inode:** The open file table entry, in turn, points to the in-memory copy of the file's inode. The inode contains the fundamental metadata about the file, such as its size and the location of its data blocks. There is only one inode for `/shared/data.log`.

**How it works:**
Because both processes' operations resolve to the same entry in the system-wide open file table, they share a single file offset. Since the file was opened for appending, all writes will occur at the current end of the file. The OS kernel serializes access to this open file table entry and the inode, preventing a race condition where both processes try to write to the same byte offset simultaneously.

**Potential Outcome:**
The file's content could be `"AAAABBBB"` or `"BBBBAAAA"`, depending on which process's `write()` call is executed by the scheduler first. The key is that the writes are atomic with respect to the file offset. The final size is predictable (original size + 8 bytes) because the shared offset ensures that one process's write completes and updates the offset before the next process begins its write. The data is not interleaved (like "AABBBBAA").