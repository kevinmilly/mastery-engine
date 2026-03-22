## Exercises

**Exercise 1**
You launch two different applications on your computer: a music player and a spreadsheet program. From the operating system's point of view, are these two applications running as separate processes or as threads within a single process? Explain your reasoning based on the definition of a process.

**Exercise 2**
A modern web browser opens each new website tab with its own independent rendering and execution environment. If a script on one tab crashes or freezes, the other tabs and the main browser interface remain responsive. Does this design suggest that each tab is managed as a separate process or as a thread within the main browser process? Justify your answer.

**Exercise 3**
An image editing application needs to apply a complex filter to a large image, a task that can take several seconds. To keep the user interface from freezing, the developer decides to run the filter calculation in the background. This background task needs to read the original image data and write the modified pixel data back to the same memory buffer that the main application uses. Based on this requirement for direct data sharing, which is the more suitable abstraction for the background task: a new process or a new thread? Explain why.

**Exercise 4**
A server application is designed to handle incoming network requests. The developer measures the time it takes to create a new "unit of execution" to handle a request and finds it to be significantly faster to use threads than processes. Based on what you know about the resources associated with processes versus threads, provide a reason for this performance difference.

**Exercise 5**
An operating system performs a "context switch" to pause one task and run another. Considering what you've learned about the Memory Hierarchy, why is a context switch between two threads of the same process generally much faster than a context switch between two different processes? Be specific about what memory-related information needs to be changed in each case.

**Exercise 6**
Consider a simple program with two threads running inside a single process on a computer with a single-core CPU. Can these two threads ever be executing instructions at the exact same physical moment in time? Explain how the operating system creates the illusion of concurrency in this scenario, referencing the role of the OS scheduler.

---

## Answer Key

**Answer 1**
The music player and the spreadsheet program are running as two separate processes.

**Reasoning:**
A process is defined as an executing program with its own dedicated memory space and system resources (like file handles and network connections). The music player and the spreadsheet program are distinct, independent applications. The OS must isolate them from each other to ensure that an error in one cannot corrupt the memory or data of the other. Therefore, each one is encapsulated in its own process.

**Answer 2**
This design suggests that each tab is managed as a separate process.

**Reasoning:**
The key piece of information is that a crash in one tab does not affect the others. Processes provide memory and resource isolation. If each tab were a process, a fatal error would be contained within that process's memory space, allowing the OS to terminate it without impacting the main browser process or the other tab processes. If the tabs were threads, they would all share the same memory space, and a crash in one thread would likely corrupt the shared memory and bring down the entire browser application.

**Answer 3**
A new thread is the more suitable abstraction.

**Reasoning:**
Threads within the same process share the same memory space. The background task needs to directly read from and write to the same memory buffer as the main application. Using a thread makes this data sharing trivial and efficient—both the main thread and the new filter thread have immediate access to the same image data in RAM. If a separate process were used, it would have its own isolated memory space, and sharing the large image buffer would require a much more complex and slower mechanism called Inter-Process Communication (IPC).

**Answer 4**
The performance difference exists because creating a process is a "heavier" operation than creating a thread.

**Reasoning:**
When the OS creates a new process, it must allocate a completely new, private virtual memory space, load program code, and set up various kernel data structures to manage its resources. When creating a new thread, the OS only needs to allocate a small amount of memory for the thread's own stack and create a new execution context (like a program counter and registers). The new thread reuses the existing memory space and resources of its parent process, which is a much faster and less resource-intensive operation.

**Answer 5**
A context switch between threads of the same process is faster because the memory context (the virtual address space) remains the same.

**Reasoning:**
- **Switching Processes:** When the OS switches between two different processes, it must not only save the CPU state (registers, program counter) of the outgoing process and load the state of the incoming one, but it must also update the CPU's Memory Management Unit (MMU). The MMU's page table pointers must be changed to point to the memory map of the new process. This invalidates the CPU's caches (like the TLB - Translation Lookaside Buffer), which causes performance penalties as the new process starts accessing memory.
- **Switching Threads:** When the OS switches between two threads *in the same process*, they share the same memory address space. The OS only needs to save and load the CPU state. The memory map and the MMU configuration do not need to be changed. This avoids the overhead of updating page tables and flushing memory-related caches, making the switch much faster.

**Answer 6**
No, on a single-core CPU, two threads can never execute at the exact same physical moment.

**Reasoning:**
A single-core CPU can only execute one stream of instructions at a time. The operating system's scheduler creates the illusion of concurrency through time-slicing. It allocates a very small slice of CPU time (e.g., a few milliseconds) to Thread 1, runs it, then performs a context switch to save its state. It then allocates the next time slice to Thread 2, runs it for a short period, and so on. Because these switches happen thousands of times per second, it appears to a human user that the threads are running simultaneously, but they are actually taking turns executing on the single CPU core.