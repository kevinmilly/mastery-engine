## Exercises

**Exercise 1**
A user is typing on a keyboard connected via a USB port. Describe the sequence of five key events that occur, starting from the moment the key is pressed, which allows the CPU to register the keystroke. Your description should focus on the role of the interrupt mechanism.

**Exercise 2**
A user-space C program executes the following line of code to write data to an open file: `write(file_descriptor, buffer, size);`. Explain the process by which this user-mode function request is transformed into a privileged operation executed by the operating system kernel.

**Exercise 3**
Consider three events occurring on a running system:
1. A program attempts to divide a number by zero.
2. The network interface card receives a new data packet from the network.
3. A user program requests the current time from the OS.

For each event, classify it as a hardware interrupt, a software interrupt (system call), or an exception. Justify your classification by explaining the origin of the signal for each.

**Exercise 4**
An application needs to read 4KB of data from a disk. The system's `read()` system call can be configured to read data in chunks of any size. From the perspective of CPU overhead due to context switching, is it more efficient to make one `read()` call for 4096 bytes or 1024 separate `read()` calls for 4 bytes each? Explain your reasoning, focusing on the steps involved in a system call.

**Exercise 5**
A process tries to access a memory address that is part of its valid address space but is not currently in physical RAM (it has been paged out to disk). How does the concept of an interrupt (specifically, an exception) work together with the Memory Management Unit (MMU) to make virtual memory possible in this scenario?

**Exercise 6**
A multi-threaded web server application is waiting to receive a request. A network packet destined for the server arrives at the system's network card. Trace the journey of this data from the hardware to the application, explaining the interplay between the hardware interrupt, the kernel's interrupt handler, and the `recv()` system call that the application uses to get the data. At what stage in this process could a CPU cache miss have the most significant impact on latency?

---

## Answer Key

**Answer 1**
The sequence of events for processing a keystroke via an interrupt is as follows:

1.  **Hardware Signal:** The user presses a key. The keyboard controller hardware generates an electrical signal.
2.  **Interrupt Request (IRQ):** The keyboard controller sends an interrupt request signal to the Programmable Interrupt Controller (PIC) or Advanced PIC (APIC), which in turn signals the CPU's interrupt pin.
3.  **CPU Acknowledgment and Context Switch:** The CPU finishes its current instruction, saves its current state (program counter, registers) onto the kernel stack, and switches from user mode to kernel mode.
4.  **Interrupt Handler Execution:** The CPU uses the interrupt number (provided by the PIC) to look up the address of the appropriate Interrupt Service Routine (ISR) or interrupt handler in the Interrupt Vector Table. It then jumps to and executes this handler.
5.  **Data Processing and Return:** The handler reads the keystroke data from the keyboard controller's port, places it in a kernel buffer for the appropriate application, and then executes a special `IRET` (Interrupt Return) instruction to restore the saved state and return control to the interrupted user program.

**Answer 2**
The `write()` function in a standard library is a wrapper that initiates a system call. The process is as follows:

1.  **Library Call:** The user program calls the `write()` function. This function is part of a library (like `libc`) that prepares for the transition to the kernel.
2.  **Setup for System Call:** The library function places the system call number for `write` and its arguments (file descriptor, buffer address, size) into specific CPU registers, according to the system's Application Binary Interface (ABI).
3.  **Trap Instruction:** The library then executes a special instruction like `SYSCALL` or `INT 0x80`. This instruction is a "trap," a software-generated interrupt that causes the CPU to switch from user mode to the more privileged kernel mode.
4.  **Kernel Execution:** The CPU transfers control to a predefined system call handler in the kernel. The kernel uses the system call number from the register to find and execute the actual kernel function for writing to a file.
5.  **Return to User Mode:** Once the kernel has finished the write operation, it places a return value (e.g., number of bytes written, or an error code) in a designated register and executes another special instruction (e.g., `SYSRET`) to return control to the user-space program, switching the CPU back to user mode. The program then resumes execution at the instruction immediately following the trap.

**Answer 3**
1.  **Divide by zero:** This is an **exception**. The signal originates synchronously from within the CPU itself. The Arithmetic Logic Unit (ALU) detects an illegal operation during the execution of an instruction and triggers a fault, causing the CPU to trap to a kernel handler to deal with the error (usually by terminating the program).
2.  **Network packet arrival:** This is a **hardware interrupt**. The signal originates asynchronously from an external device (the network card). The card signals the CPU that an external event has occurred and requires attention, regardless of what the CPU is currently doing.
3.  **Requesting the current time:** This is a **software interrupt (system call)**. The signal originates from a deliberate, synchronous instruction executed by the user program. The program intentionally traps into the kernel to request a service (getting the time) that it does not have the privilege to perform itself.

**Answer 4**
It is far more efficient to make **one `read()` call for 4096 bytes.**

**Reasoning:**
Every system call incurs a fixed overhead cost that is independent of the amount of data transferred. This overhead includes:
- Saving the user program's state (registers, program counter).
- Executing the `SYSCALL`/trap instruction.
- Switching the CPU from user mode to kernel mode.
- The kernel validating the parameters.
- The kernel looking up the system call number and dispatching to the correct function.
- The kernel performing the operation.
- Switching the CPU back from kernel mode to user mode.
- Restoring the user program's state.

Making 1024 separate calls means this entire overhead is incurred 1024 times. Making one call means this overhead is incurred only once. While the actual data transfer will take roughly the same amount of time, the cumulative time spent on mode switching and state management for 1024 calls will be significantly higher than for a single call.

**Answer 5**
The MMU and the interrupt mechanism work together as follows:

1.  **Address Translation Attempt:** The CPU executes an instruction that references a virtual address. It sends this virtual address to the Memory Management Unit (MMU) for translation into a physical address.
2.  **Page Table Lookup and Fault:** The MMU checks the process's page table. It finds the entry for the corresponding virtual page but sees that the "present" bit is set to 0, indicating the page is not in physical RAM.
3.  **MMU Triggers an Exception:** Instead of completing the memory access, the MMU hardware triggers a specific type of exception called a **page fault**. This is a synchronous, CPU-internal interrupt.
4.  **OS Takes Control:** The page fault causes the CPU to trap to the operating system's page fault handler, switching to kernel mode. The CPU saves the state of the faulting process.
5.  **Page Fault Handler Executes:** The OS handler examines the faulting address. It finds the page on the backing store (disk), allocates a free physical frame in RAM, loads the page from disk into that frame, and updates the page table entry to map the virtual page to the new physical frame, setting the "present" bit to 1.
6.  **Return and Retry:** The handler then executes an interrupt return instruction. This restores the faulting process's state and restarts the instruction that caused the fault originally. This time, the MMU successfully translates the address, and the program continues, unaware that a fault occurred.

**Answer 6**
Here is the trace of events:

1.  **Hardware Interrupt:** The network card receives the full packet and copies it into its own onboard memory. It then asserts an interrupt request (IRQ) line to notify the CPU.
2.  **Kernel Takes Over:** The CPU receives the interrupt, saves the context of whatever it was doing (which might be an idle loop or another process), and jumps to the network card's Interrupt Service Routine (ISR) in the kernel.
3.  **Interrupt Handler (Bottom Half):** The ISR reads the packet data from the network card into kernel memory buffers. It performs initial processing (e.g., checking for errors) and identifies which socket the data belongs to. It then places the data in the socket's receive buffer and wakes up the sleeping user-space web server thread that was waiting on that socket.
4.  **System Call Unblocks:** The web server thread was previously blocked inside a `recv()` system call. The scheduler, noticing the thread is now "runnable," eventually schedules it to run on a CPU core. The kernel's `recv()` implementation can now copy the data from the kernel's socket buffer into the user-space buffer provided by the application.
5.  **Return to User Space:** Once the data is copied, the `recv()` system call returns. The CPU switches from kernel mode back to user mode, and the application code continues its execution with the new request data in its buffer.

A **CPU cache miss** would have the most significant impact during **Step 3, within the kernel's Interrupt Service Routine (ISR)**. This is the most performance-critical part of the path. An ISR must execute as quickly as possible to allow the CPU to service other interrupts and return to user tasks. A cache miss here (e.g., when accessing the network card's data structures or the kernel's socket buffers) would force the CPU to stall for many cycles while fetching data from main memory. This directly adds to the end-to-end network latency, delaying packet processing and the wakeup of the application thread. While a cache miss in the application code (Step 5) also adds latency, it doesn't block the entire system's interrupt handling capability in the same way.