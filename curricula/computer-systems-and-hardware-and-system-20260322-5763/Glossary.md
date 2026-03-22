# Glossary: computer systems and hardware and systems programming

**ALU (Arithmetic Logic Unit)**
This component acts like the computer's calculator, performing basic math and comparisons. It is a digital circuit within the CPU responsible for executing arithmetic operations (like addition, subtraction) and logical operations (like AND, OR, NOT) on binary data, forming the core processing capability.

**ASCII**
ASCII is a standard code that assigns numbers to characters, allowing computers to represent text. It's a character encoding standard that uses 7 bits to represent 128 characters, including English letters, numbers, and punctuation, serving as a foundational method for text data representation.

**Assembly Language**
This is a low-level programming language that is very close to the computer's native instructions. Assembly language uses human-readable mnemonics (like `ADD` or `MOV`) that directly correspond to the machine code instructions a specific CPU can execute, providing direct control over hardware operations.

**Binary**
Binary is a number system that uses only two symbols, 0 and 1, as its digits. In computing, it is the fundamental way all information, from data to instructions, is represented and processed, reflecting the two states (on/off) of electronic circuits.

**Bit**
A bit is the smallest unit of data in a computer, representing either a 0 or a 1. This fundamental digital value forms the basis for all information storage and processing within a computer system.

**Boolean Algebra**
This is a mathematical system for analyzing and simplifying logical operations using true/false values. It is fundamental to the design of digital circuits and computer logic, employing operators like AND, OR, and NOT to express relationships between binary inputs and outputs.

**Buffer Overflow**
A buffer overflow is a security vulnerability where a program attempts to write more data into a fixed-size memory area (buffer) than it can hold. This can overwrite adjacent memory, leading to program crashes or allowing malicious code execution, posing a significant threat to system security.

**Byte**
A byte is a unit of digital information typically consisting of eight bits. It is the smallest addressable unit of memory in most computer architectures and is commonly used to represent a single character of text or a small numerical value.

**Cache**
A cache is a small, very fast memory component that stores copies of frequently accessed data from main memory. Its purpose is to reduce the time it takes for the CPU to access data, significantly improving overall system performance by providing quicker retrieval than main RAM.

**CAP Theorem**
The CAP theorem states that a distributed system cannot simultaneously guarantee Consistency, Availability, and Partition tolerance; it can only deliver two of these three. This fundamental principle highlights the inherent tradeoffs system designers face when building large-scale distributed applications.

**Central Processing Unit (CPU)**
Often called the "brain" of the computer, the CPU is the primary component that executes instructions, performs calculations, and manages the flow of information. It houses the ALU, Control Unit, and registers, orchestrating all computational tasks.

**Concurrency**
Concurrency refers to the ability of a system to handle multiple tasks or processes at the same time, giving the appearance of simultaneous execution. It is essential for modern operating systems and applications to improve responsiveness and utilization of multi-core processors.

**Container**
A container is a lightweight, isolated software package that bundles an application and all its dependencies, running on a shared operating system kernel. It provides a consistent environment for applications, enabling efficient deployment and scaling across different computing environments.

**Control Unit**
The Control Unit is a component of the CPU that directs and coordinates all operations within the processor and the computer system. It interprets instructions, generates control signals, and manages the fetch-decode-execute cycle to ensure instructions are carried out correctly.

**Context Switch**
A context switch is the process where the operating system saves the state of a currently executing process or thread and loads the state of another process or thread to be executed. This mechanism allows the CPU to switch between multiple tasks, enabling multitasking and concurrency.

**Data Path**
The data path is the set of functional units (like the ALU and registers) and their interconnections within a CPU that perform data processing operations. It defines how data moves and is transformed during the execution of an instruction, guided by signals from the control unit.

**Deadlock**
Deadlock is a situation in concurrent programming where two or more processes are permanently blocked, each waiting for a resource that is held by another process in the same group. This can halt system progress and requires careful management and prevention strategies.

**Device Driver**
A device driver is a specialized software program that allows an operating system to communicate with a specific piece of hardware (an I/O device). It translates generic commands from the OS into specific instructions the hardware understands, enabling proper interaction and functionality.

**Direct Memory Access (DMA)**
DMA is a hardware capability that allows I/O devices to transfer data directly to and from main memory without involving the CPU. This significantly improves system performance by freeing up the CPU to perform other tasks while data transfers occur in the background.

**Distributed System**
A distributed system is a collection of independent computers that appear to its users as a single coherent system, working together to achieve a common goal. These systems face challenges like fault tolerance, communication delays, and data consistency across networked nodes.

**Embedded System**
An embedded system is a specialized computer system designed for a particular function within a larger mechanical or electrical system. These systems typically have strict resource constraints, specific timing requirements, and are dedicated to performing a limited set of tasks.

**Eventual Consistency**
Eventual consistency is a data consistency model often used in distributed systems where, if no new updates are made to a given data item, all accesses to that item will eventually return the last updated value. It prioritizes availability and partition tolerance over immediate strong consistency.

**File System**
A file system is the method and data structure that an operating system uses to organize and manage files on a storage device, such as a hard drive or SSD. It determines how data is stored, retrieved, and managed, including naming conventions, directory structures, and access permissions.

**FPGA (Field-Programmable Gate Array)**
An FPGA is an integrated circuit that can be configured by the user after manufacturing to implement specific digital logic functions. Unlike ASICs, FPGAs offer flexibility, allowing developers to prototype and deploy custom hardware designs without custom chip fabrication.

**Hardware Description Language (HDL)**
An HDL is a specialized programming language used to describe the structure, behavior, and design of digital logic circuits, such as those found in CPUs or custom chips. Languages like VHDL or Verilog allow engineers to model complex hardware systems before physical implementation.

**Hypervisor**
A hypervisor, also known as a Virtual Machine Monitor (VMM), is a software or firmware layer that creates and runs virtual machines (VMs). It manages and isolates multiple VMs on a single physical host, allocating resources and ensuring they operate independently.

**Input/Output (I/O) Device**
An I/O device is any piece of hardware that allows a computer to interact with the outside world, either by taking input from a user or environment, or by sending output to a user or another system. Examples include keyboards, monitors, printers, and network cards.

**Instruction Set Architecture (ISA)**
The ISA defines the set of instructions that a particular CPU can understand and execute, along with the register set and memory addressing modes. It acts as the interface between the hardware and the low-level software (like assembly language), dictating the fundamental operations the processor can perform.

**Interrupt**
An interrupt is a hardware or software signal sent to the CPU that indicates an event has occurred and requires immediate attention. It temporarily suspends the current program's execution to allow the CPU to handle the event, such as a key press or a disk read completion, and then resume.

**Inter-Process Communication (IPC)**
IPC refers to mechanisms provided by the operating system that allow different processes to communicate and synchronize their activities. These methods enable processes to exchange data or signal events, which is crucial for building complex applications composed of multiple cooperating processes.

**IP Address**
An IP address is a unique numerical label assigned to each device connected to a computer network that uses the Internet Protocol for communication. It serves two main functions: host or network interface identification and location addressing.

**Journaling File System**
A journaling file system is a type of file system that maintains a special log (a journal) of changes before committing them to the main file system. This technique ensures data integrity and allows for faster recovery from system crashes by quickly replaying the log rather than scanning the entire disk.

**Kernel**
The kernel is the core component of an operating system, serving as the bridge between hardware and applications. It manages fundamental system resources like the CPU, memory, and I/O devices, and provides essential services to other parts of the OS and applications.

**Logic Gate**
A logic gate is a basic building block of digital circuits that performs a fundamental Boolean logic function (like AND, OR, NOT). By combining various logic gates, complex digital systems such as CPUs and memory units can be constructed to process information.

**Machine Code**
Machine code is the lowest-level programming language, consisting of binary instructions (sequences of 0s and 1s) that a CPU can directly understand and execute. It is the direct output of assemblers and compilers and is specific to a particular processor's instruction set.

**Memory Hierarchy**
The memory hierarchy is a layered arrangement of computer storage based on speed, cost, and capacity, with faster, smaller, and more expensive memory at the top (like registers and cache) and slower, larger, cheaper memory at the bottom (like RAM and secondary storage). This structure optimizes data access performance.

**Memory Management Unit (MMU)**
The MMU is a hardware component in the CPU responsible for handling memory access requests, primarily translating virtual addresses generated by programs into physical addresses in RAM. It also enforces memory protection and access permissions, isolating processes from each other.

**Mutex (Mutual Exclusion)**
A mutex is a synchronization primitive used in concurrent programming to protect a critical section of code, ensuring that only one thread can access a shared resource at a time. It prevents race conditions by providing exclusive access, often described as a "lock."

**Operating System (OS)**
The operating system is system software that manages computer hardware and software resources and provides common services for computer programs. It acts as an intermediary between user applications and the hardware, handling tasks like process scheduling, memory management, and I/O operations.

**OSI Model (Open Systems Interconnection Model)**
The OSI model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven distinct layers. It helps understand how different network protocols interact and communicate across various hardware and software components.

**Page Table**
A page table is a data structure used by the operating system and MMU to store the mapping between a program's virtual memory addresses and the corresponding physical memory addresses in RAM. Each entry in the table translates a virtual page number to a physical frame number.

**Paging**
Paging is a memory management scheme that allows the operating system to store and retrieve data from secondary storage in fixed-size blocks called pages. It enables virtual memory by swapping pages between RAM and disk, creating the illusion of a larger, contiguous memory space for each process.

**Physical Address**
A physical address is the actual address of a memory location in the computer's main memory (RAM). It is the real-world location where data is stored, as opposed to the virtual address that a program uses.

**Process**
A process is an instance of a computer program that is being executed, along with its own dedicated memory space, resources, and execution state. The operating system manages multiple processes concurrently, each running independently.

**Process Scheduling**
Process scheduling is the task performed by the operating system's scheduler to decide which process (or thread) should run on the CPU at any given time and for how long. It aims to efficiently utilize the CPU, ensure fairness, and meet performance objectives.

**Profiling**
Profiling is a form of dynamic program analysis that measures and analyzes the performance characteristics of a program during its execution. It helps identify performance bottlenecks, such as CPU-intensive sections or memory leaks, to optimize software efficiency.

**Protection Rings**
Protection rings, or privilege levels, are a hardware-enforced hierarchy of privileges within a computer system that restrict access to system resources. Typically, the kernel operates in the most privileged ring (ring 0) to manage hardware, while user applications operate in less privileged rings.

**Race Condition**
A race condition is a undesirable situation in concurrent programming where the final outcome of a program depends on the unpredictable sequence or timing of multiple threads or processes accessing and modifying shared resources. It often leads to incorrect or inconsistent results.

**RAM (Random Access Memory)**
RAM is the primary volatile memory of a computer, used for short-term data storage while the computer is running. It provides fast read and write access to data, but its contents are lost when the power is turned off.

**Real-Time Operating System (RTOS)**
An RTOS is an operating system specifically designed for applications that require strict, deterministic timing for tasks to complete within defined deadlines. These systems are commonly found in embedded systems where predictable response times are critical for control and monitoring.

**Register**
A register is a small, very high-speed storage location directly within the CPU, used to temporarily hold data, instructions, or memory addresses that the CPU is actively processing. Registers provide the fastest possible access to data for ongoing operations.

**Semaphore**
A semaphore is a synchronization primitive used in concurrent programming to control access to a shared resource or a section of code. It uses an integer value to keep track of the number of available resources, allowing or blocking access based on this count.

**System Call**
A system call is a programmatic way for a user-mode program to request a service from the operating system kernel. It provides a controlled and privileged interface for applications to interact with hardware, manage files, or perform other operations that require kernel privileges.

**TCP/IP Model**
The TCP/IP model is a practical, layered architectural model that defines how data should be exchanged over the Internet. It underlies all modern networking and comprises essential protocols like TCP (for reliable data streams) and IP (for addressing and routing).

**Thread**
A thread is a lightweight unit of execution within a process, sharing the same memory space and resources as its parent process. Multiple threads can run concurrently within a single process, enabling an application to perform several tasks simultaneously.

**UTF-8**
UTF-8 is a variable-width character encoding standard used for representing text in computers, capable of encoding virtually all characters in all languages. It is widely used on the internet and in operating systems due to its compatibility with ASCII and efficient handling of diverse character sets.

**Virtual Address**
A virtual address is an address generated by the CPU for a program, which gives the illusion of a large, contiguous memory space, independent of actual physical memory. The MMU then translates this virtual address into a physical address in RAM.

**Virtual Machine (VM)**
A virtual machine is a software-based emulation of a physical computer, including its own operating system, applications, and virtual hardware. VMs run on top of a hypervisor and provide isolation and flexibility, allowing multiple operating systems to run concurrently on a single physical machine.

**Virtual Memory**
Virtual memory is an operating system technique that gives processes the illusion of having a larger, contiguous memory space than physically available in RAM. It achieves this by using disk space as an extension of main memory, swapping data in and out as needed.

**Von Neumann Architecture**
The Von Neumann architecture is a classic computer design where both program instructions and data share a single memory space and a single bus for access. This model simplifies machine design but can lead to a "Von Neumann bottleneck" due to sequential access to both instructions and data.