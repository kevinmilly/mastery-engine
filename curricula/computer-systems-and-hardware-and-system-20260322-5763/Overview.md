# Curriculum Overview: computer systems and hardware and systems programming

## What This Curriculum Covers
This curriculum provides a foundational to advanced understanding of how computer systems function, from the fundamental representation of data to the complex interactions between hardware and software. You will learn the core abstractions that define a computer system, the underlying mechanisms that implement these abstractions, and the advanced concepts necessary to design, analyze, and optimize complex systems. This includes understanding CPU architecture, memory management, operating system principles, networking protocols, and the challenges of concurrency and distributed computing.

Upon completion, you will possess a deep mental model of computing, enabling you to reason about system behavior, diagnose performance issues, understand security implications, and engage with low-level systems programming concepts.

This curriculum does not cover specific application-level programming languages (beyond introducing assembly as a conceptual link to machine code), advanced digital circuit design at the gate level (beyond HDLs for architectural description), or comprehensive network administration or cybersecurity specific to threat intelligence.

## How It Is Structured
1.  **Foundations:** This tier establishes the essential vocabulary and high-level conceptual models for computer systems. It begins with the most fundamental element—binary data representation—and builds upward through core hardware components (CPU, memory, I/O) and critical software abstractions (operating systems, processes, basic networking). The goal is to provide a coherent mental map of a computer system, defining *what* the major components and concepts are and *why* they exist as abstract layers. Without this abstract understanding, detailed mechanisms would lack context.

2.  **Mechanics:** Building directly on the conceptual framework from Foundations, this tier dissects *how* those high-level abstractions are concretely realized. It moves from "what" to "how it actually works" by detailing the specific architectures, algorithms, and data structures involved. Topics like Instruction Set Architectures, cache operation, virtual memory paging, process scheduling, and specific network protocols explain the functional implementation details behind the abstract components introduced in the first tier. This tier shows the concrete connections between software instructions and hardware operations.

3.  **Mastery:** This tier requires a solid comprehension of both Foundations and Mechanics. It addresses complex system-level challenges, advanced design patterns, and real-world performance and security considerations that integrate knowledge from multiple domains. Topics include sophisticated concurrency management, advanced memory protection, performance optimization, distributed systems design, and specialized system types like embedded systems. This tier prepares you to critically analyze, design, and troubleshoot complex computer systems, pushing beyond understanding mechanisms to applying principles in challenging contexts.

## What Makes This Hard (and Worth It)

### Foundations
*   **Process vs. Thread Abstraction**
    *   **Why it trips people up:** The distinction between a process (an independent program with its own resources) and a thread (a lightweight execution unit *within* a process) is subtle. Both execute code, but their resource ownership, isolation, and overhead differ significantly. This often leads to confusion about how concurrent programs are structured and managed by the operating system.
    *   **What becomes clear once it clicks:** A clear understanding of resource allocation, memory protection, and the true nature of concurrent execution, which is fundamental to understanding how modern operating systems manage multiple tasks and how multi-threaded applications achieve parallelism.

### Mechanics
*   **Virtual Memory and Paging**
    *   **Why it trips people up:** This topic introduces an entirely new way of thinking about memory. The concept of a virtual address space, distinct from physical RAM, and the complex process of translation via page tables, often feels unintuitive. The indirection and the idea that a program's memory might not be physically contiguous can be hard to reconcile with a simpler model of memory.
    *   **What becomes clear once it clicks:** The mechanisms behind memory protection, efficient multi-tasking, program isolation, and how the operating system provides an illusion of vast, dedicated memory to each process, regardless of physical memory constraints. It illuminates a core component of modern OS security and performance.

### Mastery
*   **Concurrency Primitives and Deadlock Management**
    *   **Why it trips people up:** Writing correct concurrent code is inherently difficult due to non-deterministic execution paths, race conditions, and the complexity of ensuring data integrity across multiple threads or processes. Debugging these issues is often challenging, as they may only manifest under specific, hard-to-reproduce timing conditions.
    *   **What becomes clear once it clicks:** The critical importance of synchronization for maintaining data consistency and avoiding program errors in multi-threaded environments. It provides the tools and mental models to design robust, reliable concurrent systems, transforming what seems like chaotic behavior into manageable, predictable interactions.

## How to Use These Materials
1.  Read the lesson doc for each topic before attempting anything else
2.  Attempt every exercise in the practice set before reading the answer key
3.  Complete the tier capstone before moving to the next tier
4.  Use the master glossary when a term is unclear

## Curriculum Map

### Foundations
1.  Binary Representation of Data
2.  Logic Gates and Boolean Algebra
3.  Processor Architecture Fundamentals (CPU Abstraction)
4.  Memory Hierarchy and Abstraction (RAM/Cache)
5.  Input/Output Abstraction (I/O Devices)
6.  The Von Neumann Architecture
7.  Operating System Abstraction (Kernel Role)
8.  Process vs. Thread Abstraction
9.  Basic Networking Concepts (OSI/TCP-IP Model Layers)

### Mechanics
1.  Instruction Set Architecture (ISA) and Assembly Language
2.  Data Path and Control Unit Design
3.  Cache Memory Operation and Policies
4.  Virtual Memory and Paging
5.  Interrupts and System Calls
6.  Process Scheduling Algorithms
7.  Inter-Process Communication (IPC) Mechanisms
8.  File System Structure and Operation
9.  Network Protocol Stacks (TCP/IP Deep Dive)

### Mastery
1.  Concurrency Primitives and Deadlock Management
2.  Memory Management Unit (MMU) Deep Dive and Protection Rings
3.  I/O Performance Optimization and Device Drivers
4.  Virtualization Techniques (Hypervisors and Containers)
5.  Distributed Systems Challenges and Consistency Models
6.  Performance Analysis and Profiling Tools
7.  Operating System Security Principles and Attack Vectors
8.  Embedded Systems Constraints and Real-Time Operating Systems (RTOS)
9.  Hardware Description Languages (HDLs) and ASIC/FPGA Design Flow
10. Advanced File Systems (Journaling, Distributed, ZFS/Btrfs)