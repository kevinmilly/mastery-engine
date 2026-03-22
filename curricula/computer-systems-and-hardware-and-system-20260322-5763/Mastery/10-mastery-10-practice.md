## Exercises

**Exercise 1**
A user creates a new 10 KB file named `report.txt` and writes data to it. The file system uses a metadata-only journaling mode (like ext4's `data=ordered` mode). The system crashes after the data blocks are written to disk, but before the metadata (inode update, directory entry) is committed to the journal and then to the main file system. What is the state of `report.txt` after the system reboots and the journal is replayed? What would be different if the file system were using a full data journaling mode (`data=journal`)?

**Exercise 2**
A file is stored on a disk that develops a fault, causing a single bit to flip in a data block that has already been written and is not currently in use. A traditional file system like ext2 or FAT32 is in use. Later, a user attempts to read this file. What happens? Now, assume the file system is ZFS with its default settings (checksumming enabled, mirrored VDEVs). What happens when the user tries to read the corrupted file in this case? Describe the steps ZFS takes.

**Exercise 3**
You are designing a simple distributed file system for a high-performance computing cluster. To improve read performance, each client node aggressively caches file data it reads from the central storage servers. A file, `shared_data.bin`, is read by Client A and cached. Shortly after, Client B modifies `shared_data.bin` by writing to it directly on the server. Client A then reads from its cached copy of `shared_data.bin`. What consistency problem arises here? Propose a simple mechanism (e.g., based on callbacks or leases) that the storage server could implement to mitigate this issue.

**Exercise 4**
A database administrator is using a Btrfs file system to store a large, active transactional database file. To create backups, they take frequent file system snapshots. They notice that after a snapshot is created, database write performance degrades significantly for a period of time. Explain, in terms of Btrfs's copy-on-write (CoW) mechanism, why creating a snapshot would lead to this performance degradation for a write-heavy workload like a database.

**Exercise 5**
The file system journal is a critical on-disk data structure that multiple concurrent processes (via system calls) might need to update. Consider a scenario where Process A is writing a file (requiring metadata updates) and Process B is deleting another file (also requiring metadata updates). Both operations must be written to the journal as part of transactions. Drawing on your knowledge of concurrency primitives, describe what mechanism the operating system kernel must use to manage access to the journal. What would be the consequence of not using such a mechanism, and how does this relate to the atomicity guarantees of journaling?

**Exercise 6**
You are the lead systems architect for a cloud provider. You need to design the storage backend for a new virtualization platform that will host thousands of customer container and VM images. Key requirements are:
1.  **High data integrity:** Silent corruption is unacceptable.
2.  **Space efficiency:** Many VMs will be created from the same base template (e.g., Ubuntu 22.04).
3.  **Instantaneous backups/cloning:** Customers need the ability to "snapshot" their running VMs and instantly clone them.
4.  **Flexible capacity management:** You must be able to add new disks to the storage pool non-disruptively.

Which advanced file system (e.g., ZFS, Btrfs) would you choose for this backend? Justify your choice by explaining which specific features of the file system address each of the four requirements. Your justification should also briefly mention how this design leverages concepts from virtualization.

---

## Answer Key

**Answer 1**
In the metadata-only journaling (`data=ordered`) scenario:
After reboot, the journal replay process will find no committed transaction for the creation of `report.txt`. The file system will be in a consistent state, but the file `report.txt` will not exist. The 10 KB of data written to disk will become orphaned data blocks—they are allocated from the file system's perspective but are not referenced by any inode. These blocks will eventually be reclaimed by a file system check (`fsck`) or when the space is needed for new files. The user's data is lost, but the file system structure is intact.

In the full data journaling (`data=journal`) scenario:
If the crash happened after the data and metadata were committed to the journal but before they were written to the main file system, the journal replay would write both the metadata and the data to their final locations. The file `report.txt` would exist and contain the correct data. If the crash happened before the transaction was committed to the journal, the result would be the same as the `data=ordered` case: the file would not exist. The key difference is that `data=journal` prevents the "orphaned data block" state by making the data and metadata write atomic from the user's perspective.

**Answer 2**
On a traditional file system (ext2/FAT32):
The file system has no mechanism to detect silent data corruption. When the user reads the file, the corrupted block is read from the disk and returned to the application. The application receives data with the flipped bit, which could cause a crash, incorrect calculations, or display artifacts, depending on the file type. The file system remains unaware that the data is corrupt.

On a ZFS file system with checksumming and mirroring:
1.  **Detection:** When the user requests to read the file, ZFS reads the data block from the primary disk in the mirror. It then calculates a checksum of the data it just read and compares it to the checksum stored in the block's parent pointer (metadata). The checksums will not match due to the bit flip, so ZFS detects the corruption.
2.  **Correction:** ZFS then reads the corresponding data block from the other disk in the mirrored VDEV. It calculates the checksum for this second copy. Assuming this copy is not corrupt, the checksum will match its metadata pointer.
3.  **Repair:** ZFS uses the good copy to repair the corrupted block on the first disk by overwriting it with the correct data.
4.  **Return Data:** Finally, ZFS returns the good data to the application. The entire process is transparent to the user, who simply receives the correct, uncorrupted data.

**Answer 3**
The consistency problem is that Client A has a **stale cache**. It is unaware that the file `shared_data.bin` has been updated on the server by Client B, and it will continue to use its old, incorrect local copy for read operations. This violates strong consistency models.

A simple mitigation mechanism would be a **server-initiated callback invalidation** system:
1.  When Client A caches data from a file, it also registers its interest in that file with the server.
2.  When Client B writes to `shared_data.bin`, the server accepts the write and updates the file on disk.
3.  The server then looks up all clients that have registered an interest in this file (in this case, Client A).
4.  The server sends an "invalidation" message or callback to Client A, instructing it to purge its cached copy of `shared_data.bin`.
5.  The next time Client A needs to read the file, its cache will miss, forcing it to fetch the new, updated version from the server. This restores cache coherency.

**Answer 4**
The performance degradation is a direct result of the copy-on-write (CoW) mechanism that enables snapshots.

1.  **Before the snapshot:** A transactional database performs many small, random writes, often overwriting existing data blocks within its large file. Without snapshots, Btrfs can, in some cases, overwrite these blocks in place.
2.  **Snapshot creation:** A Btrfs snapshot is not a full copy. It is an instantaneous operation that freezes the current state of the file system by making the existing data blocks read-only. The new, writable version of the file system shares all these blocks with the snapshot.
3.  **After the snapshot:** When the database now tries to overwrite a block, the CoW mechanism prevents it from modifying the original block (as it is part of the snapshot). Instead, Btrfs must:
    *   Read the original block.
    *   Allocate a *new* block elsewhere on the disk.
    *   Write the modified data to this new block.
    *   Update all the metadata pointers up the tree to point to this new block.
4.  **Performance Impact:** This process turns a single logical overwrite into a read-allocate-write sequence, which fragments the file layout and significantly increases I/O amplification and metadata overhead. For a write-heavy, random-access workload like a database, this repeated CoW activity causes the observed performance degradation.

**Answer 5**
The operating system kernel must use a **mutex** (or a similar locking primitive like a spinlock for short critical sections) to protect access to the in-memory journal structures and the on-disk journal log.

**Reasoning:**
The journal is a shared resource. Both Process A's write operation and Process B's delete operation will eventually require adding entries to the journal as part of an atomic transaction. This involves modifying shared data structures like the journal's head/tail pointers and writing to the log file itself.

**Consequence of No Lock:**
Without a mutex, a race condition could occur. For example:
1.  Process A reads the journal's head pointer to begin writing its transaction.
2.  A context switch occurs, and Process B runs.
3.  Process B reads the same head pointer, writes its entire transaction to the journal, and updates the head pointer.
4.  A context switch occurs back to Process A.
5.  Process A, unaware of Process B's actions, continues its operation using the old, stale head pointer value, overwriting Process B's transaction in the journal.

This would corrupt the journal, destroying its integrity. On the next reboot, the journal replay would either fail or replay a corrupted, inconsistent transaction, potentially leaving the entire file system in an unusable state. This completely defeats the purpose of journaling, which is to guarantee the **atomicity** of file system operations across crashes. The lock ensures that only one process can be in the process of committing a transaction to the journal at any given time, making the commit operation itself an atomic unit.

**Answer 6**
For this storage backend, **ZFS** is the superior choice.

Here is the justification based on the requirements:

1.  **High data integrity:** ZFS addresses this with its end-to-end checksumming. Checksums for all data blocks are stored in their parent block pointers, creating a self-validating Merkle tree. This allows ZFS to detect silent data corruption ("bit rot") on read. When combined with redundancy (RAID-Z or mirroring), ZFS can automatically repair the corrupted data, satisfying the "unacceptable" requirement.
2.  **Space efficiency:** ZFS's copy-on-write (CoW) nature is ideal for this. When thousands of VMs are created from a single base template, their disk images will initially point to the same set of on-disk blocks. Only when a VM writes new data are new blocks allocated for that specific VM. This is a form of thin provisioning and deduplication at the block level, drastically reducing the storage space required compared to allocating a full-sized disk image for every VM.
3.  **Instantaneous backups/cloning:** ZFS's snapshot and clone features directly address this. A `zfs snapshot` is an instantaneous, read-only capture of a file system (or a ZVOL, which is a block device used for a VM's disk). A `zfs clone` can then be created from this snapshot almost instantly, providing a writable copy for a new VM. This process is extremely fast because it also uses CoW and only consumes space as the clone diverges from the snapshot.
4.  **Flexible capacity management:** ZFS has integrated volume management. You can create a storage pool (zpool) from multiple disks. To expand capacity, you can add a new group of disks (a new VDEV) to the existing pool non-disruptively. The new space immediately becomes available to all file systems and ZVOLs within the pool.

**Integration with Virtualization Concepts:**
This design directly leverages virtualization principles. The storage backend becomes "virtualization-aware." The CoW snapshots and clones align perfectly with the need to provision and manage VM lifecycles efficiently. Instead of the hypervisor copying a 50 GB template file to create a new VM (a slow, I/O-intensive process), it can simply issue a `zfs clone` command, which finishes in seconds. This dramatically improves the agility and scalability of the virtualization platform.