## Exercises

**Exercise 1**
A command-line tool is designed to compress a file. To speed things up, the main process spawns a dedicated child process to handle the compression algorithm. The main process reads the file from disk in chunks and needs to send these chunks sequentially to the child process. The communication is strictly one-way. Which IPC mechanism, an anonymous pipe or a message queue, is more suitable for this task? Justify your choice.

**Exercise 2**
A video editing application uses two processes: one for decoding a high-resolution video stream into raw frames, and another for applying complex visual effects to those frames. The processes need to exchange very large data structures (the raw video frames, often many megabytes each) at a very high rate. To maximize performance, which IPC mechanism should be used? Explain the performance advantage by describing how it minimizes data copying and kernel intervention compared to other methods.

**Exercise 3**
Two processes must coordinate access to a shared circular buffer with a fixed size of 10 slots. A "Producer" process writes data into the buffer, and a "Consumer" process reads data from it. Using only semaphores for synchronization, describe a scheme that prevents the Producer from writing to a full buffer and the Consumer from reading from an empty buffer. Specify the initial values of the semaphores and what each one represents.

**Exercise 4**
Consider a system where a logging process collects messages from multiple other processes via a single message queue. If one of the application processes begins sending log messages at an extremely high rate due to an error loop, while the logger process consumes them at a normal, fixed rate, what system-level problem is likely to occur? How might a system administrator or the original programmer mitigate this risk?

**Exercise 5**
Two unrelated processes, P1 and P2, need to use shared memory for communication. The operating system uses virtual memory with paging. Explain the high-level steps, involving system calls and the virtual memory manager, that allow a specific segment of physical RAM to be mapped into the virtual address spaces of both P1 and P2, even if it appears at different virtual addresses in each.

**Exercise 6**
You are designing the architecture for a multi-process database server. One "Listener" process accepts client connections. For each query, it passes the request to one of several "Worker" processes from a pre-forked pool. The Workers execute the query, which might involve significant CPU computation and disk I/O. Results from all Workers must be sent to a single "Logger" process that writes to a transaction log.

Propose and justify a combination of IPC mechanisms for:
1.  The Listener to distribute tasks to the Worker pool.
2.  The Workers to send transaction details to the Logger.

Your justification should consider performance, synchronization needs, and the different workloads of the processes involved (I/O-bound vs. CPU-bound).

---

## Answer Key

**Answer 1**
An anonymous pipe is more suitable for this scenario.

**Reasoning:**
1.  **Process Relationship:** The communication is between a parent and its direct child process. Anonymous pipes are specifically designed for this purpose, as the pipe file descriptors can be inherited by the child upon creation (`fork()`).
2.  **Simplicity:** Pipes provide a simple, stream-oriented interface (`read`/`write`) that perfectly fits the task of sending sequential file chunks.
3.  **Unidirectional Flow:** The problem specifies a one-way flow of data from the parent (reader) to the child (compressor), which matches the nature of a standard anonymous pipe. A message queue would be overkill, as it's designed for more complex, many-to-many communication patterns and adds unnecessary overhead.

**Answer 2**
Shared memory is the most suitable IPC mechanism.

**Reasoning:**
The primary performance advantage of shared memory comes from avoiding data copies.
1.  **Zero-Copy Mechanism:** Once the shared memory segment is established, both processes have it mapped into their virtual address spaces. The decoding process can write a video frame directly into this memory. The effects process can then read it from the same memory location. The data itself never needs to be copied from one process's address space into the kernel and then back out to the other process's address space.
2.  **Reduced Kernel Intervention:** Mechanisms like pipes or message queues require a system call for every `write` and `read` operation, which involves a context switch into the kernel. The kernel then copies the data from the sending process's buffer into a kernel buffer, and later copies it from the kernel buffer to the receiving process's buffer. For multi-megabyte frames at a high rate, these two copies and the associated kernel overhead per frame would create a significant performance bottleneck. Shared memory only requires kernel intervention for initial setup; subsequent reads and writes are as fast as regular memory access.

**Answer 3**
A classic solution uses three semaphores: one for mutual exclusion and two for counting/synchronization.

**Scheme:**
1.  **`mutex` (Binary Semaphore):** Ensures that only one process (either Producer or Consumer) can access the buffer at any given time to prevent race conditions when updating pointers or data.
    *   Initial Value: `1` (unlocked).

2.  **`empty` (Counting Semaphore):** Tracks the number of empty slots available in the buffer. The Producer must wait on this semaphore before writing.
    *   Initial Value: `10` (the buffer is initially empty).

3.  **`full` (Counting Semaphore):** Tracks the number of filled slots in the buffer. The Consumer must wait on this semaphore before reading.
    *   Initial Value: `0` (the buffer is initially empty).

**Operation:**
-   **Producer:**
    1.  `wait(empty)`: Decrements the empty slot count. If it's zero, the Producer blocks until the Consumer frees a slot.
    2.  `wait(mutex)`: Acquires the lock for exclusive buffer access.
    3.  *Writes data to the buffer.*
    4.  `signal(mutex)`: Releases the lock.
    5.  `signal(full)`: Increments the full slot count, potentially waking up a waiting Consumer.

-   **Consumer:**
    1.  `wait(full)`: Decrements the full slot count. If it's zero, the Consumer blocks until the Producer adds an item.
    2.  `wait(mutex)`: Acquires the lock.
    3.  *Reads data from the buffer.*
    4.  `signal(mutex)`: Releases the lock.
    5.  `signal(empty)`: Increments the empty slot count, potentially waking up a waiting Producer.

**Answer 4**
The likely system-level problem is kernel memory exhaustion.

**Reasoning:**
Message queues are managed and buffered by the operating system kernel. When a process sends a message, it is copied into a kernel buffer associated with the queue. If the sending process produces messages faster than the receiving process consumes them, the queue in the kernel will grow. Since kernel memory is a finite and critical system resource, an unbounded or very large queue will consume all available kernel memory, potentially leading to system instability, failure of other processes that require kernel resources, or even a system crash.

**Mitigation:**
1.  **System-level Configuration:** System administrators can configure kernel parameters to limit the maximum size of a single message queue or the total amount of memory usable by all message queues on the system. This prevents a single misbehaving application from taking down the entire server.
2.  **Application-level Logic:** The programmer of the sending process can use non-blocking sends or check the queue status before sending. If the queue is full (exceeds a certain threshold), the sending process could block, drop the message, or implement a back-pressure mechanism to slow down its message generation.

**Answer 5**
This process integrates IPC mechanisms, system calls, and the virtual memory subsystem.

**Reasoning and Steps:**
1.  **Request Shared Segment (System Call):** One process (e.g., P1) initiates the creation of a shared memory segment by making a system call like `shmget()`. It specifies a key (so other processes can find it) and a size. The kernel allocates a segment of physical memory but does not yet map it into any process's address space. The kernel creates a system-wide data structure to manage this new segment and returns an identifier (handle) to P1.

2.  **Attach Segment (System Call & Virtual Memory Manager):** P1 and P2 each independently make a system call like `shmat()` (attach), passing the identifier for the shared segment. When a process calls `shmat()`:
    *   The process requests the kernel to map the shared segment into its virtual address space.
    *   The kernel's **Virtual Memory Manager (VMM)** finds an unused range in the process's virtual address space.
    *   The VMM updates the process's **page table**. It creates new page table entries (PTEs) for this virtual address range. Crucially, these PTEs in *both* P1's and P2's page tables will point to the *same* physical frame addresses—the ones allocated in step 1.

3.  **Result:** After attachment, a virtual address in P1 (e.g., `0xBEEF0000`) and a potentially different virtual address in P2 (e.g., `0xDEADB000`) both translate, via their respective page tables, to the same set of physical memory frames. When P1 writes to its virtual address, the CPU/MMU updates the physical RAM. When P2 reads from its corresponding virtual address, it sees the data P1 wrote because they share the underlying physical pages.

**Answer 6**
This problem requires selecting appropriate mechanisms for two distinct communication patterns.

**1. Listener to Worker Pool Communication:**
*   **Proposed Mechanism:** A single, shared message queue.
*   **Justification:**
    *   **Decoupling:** A message queue decouples the Listener from the Workers. The Listener can rapidly accept connections and place query jobs onto the queue without having to know which specific Worker is free.
    *   **Load Balancing:** Multiple Worker processes can all pull tasks from the same queue. This provides automatic, fair load balancing, as an idle Worker will immediately pick up the next available job.
    *   **Synchronization:** Message queues have built-in synchronization. If the queue is empty, a Worker trying to read from it will block automatically, consuming no CPU until a new job arrives. This is efficient for the Workers, which might otherwise spin-wait.
    *   **Data Structure:** A client request can be packaged neatly into a message.

**2. Worker to Logger Communication:**
*   **Proposed Mechanism:** Shared memory buffer protected by semaphores.
*   **Justification:**
    *   **High Throughput / Low Latency:** Logging can be a high-frequency operation. Using shared memory avoids the overhead of copying every log message into the kernel and back out, which would be significant with many active workers. Workers can write log entries directly into a shared buffer.
    *   **Batching:** This approach allows the Logger process to process logs in batches. Instead of waking up for every single log entry (as might happen with a message queue), it can wake up when the buffer is partially full or on a timer, and write a whole chunk of entries to disk at once. This is much more efficient for an I/O-bound process like a logger, as it minimizes disk I/O operations.
    *   **Synchronization:** Semaphores are necessary to manage access to the shared buffer, preventing multiple workers from writing over each other's entries and signaling the Logger when there is data to be written (similar to the producer-consumer pattern in Exercise 3). This provides the necessary coordination with minimal overhead.