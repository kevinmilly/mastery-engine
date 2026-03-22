## Exercises

**Exercise 1**
Categorize each of the following peripherals as either a character device or a block device. For each, provide a one-sentence justification based on how it handles data transfer.
a) A computer mouse
b) A USB flash drive
c) A thermal receipt printer

**Exercise 2**
A user buys a brand-new, cutting-edge scanner that was just released last week. They plug it into their computer's USB port, but the operating system reports an "Unknown Device" and the scanning software cannot find it. Explain the most likely reason for this failure, referencing the specific software component that is missing or incorrect.

**Exercise 3**
A modern smartphone's touchscreen is a complex I/O device. It reports a continuous stream of coordinates (x, y) as a finger moves across it, but it can also report distinct "tap" and "swipe" gestures. Would you classify the touchscreen primarily as a character device or a block device? Justify your choice by analyzing its data stream.

**Exercise 4**
A programmer is writing code to read data from a hard disk drive (a block device). Their first attempt is to write a function that requests one byte at a time from the disk. While this code is logically correct, a senior engineer tells them it will be extremely inefficient. Explain why reading one byte at a time from a block device is so much slower than reading a full block, even if you only need the first byte.

**Exercise 5**
A video game loads a 10 MB texture file from a solid-state drive (SSD) into system RAM. The SSD is a block device with a fixed block size of 4 KB. The operating system's device driver for this SSD uses a 64 KB buffer in RAM to manage data transfer.
1. What is the minimum number of block read operations the SSD controller must perform?
2. How many times does the device driver need to fill its 64 KB buffer from the SSD to transfer the entire file?

**Exercise 6**
Consider a system designed to log temperature data once every second from a sensor connected via a serial port. The CPU needs to take the reading, timestamp it, and save it. The system must also remain responsive to user commands typed into a terminal. An engineer proposes two different interaction models:

*   **Model A (Polling):** The CPU continuously checks the serial port in a tight loop to see if a new temperature reading is available.
*   **Model B (Interrupts):** The CPU performs other tasks (like waiting for user commands) and the sensor's hardware controller sends a signal (an interrupt) to the CPU only when a new reading is ready.

Which model is a more efficient use of the processor for this system? Justify your answer by explaining how each model affects the CPU's ability to handle multiple tasks (logging the temperature and responding to user commands).

---

## Answer Key

**Answer 1**
a) **Mouse:** Character device. It generates an unpredictable stream of bytes representing movement (delta X, delta Y) and button clicks, which must be processed in the order they occur.
b) **USB flash drive:** Block device. Data is stored in fixed-size blocks, and the operating system can read or write any specific block without having to access the ones before it (random access).
c) **Thermal receipt printer:** Character device. It accepts a stream of characters and commands (like "new line" or "cut paper") and prints them sequentially. It cannot, for example, jump back to the top of the receipt to add text.

**Answer 2**
The most likely reason is that the operating system does not have the correct **device driver** for the new scanner. A device driver is the specialized software that acts as a translator between the OS's generic commands (e.g., "scan page") and the specific, proprietary signals the scanner hardware understands. Because the scanner is brand new, its driver is likely not included in the OS's standard library of drivers. The user would need to install it from a disk or download it from the manufacturer's website.

**Answer 3**
The touchscreen is best classified as a **character device**.
**Reasoning:** Although gestures like "tap" might seem like discrete blocks of information, the fundamental operation of the device is to provide a continuous, sequential stream of data (x/y coordinates, pressure level, etc.). The operating system or application receives this data as it happens and must interpret it in sequence to understand the path of a finger. You cannot randomly access the 50th position in a swipe gesture; you must process the preceding 49 data points. This stream-based, sequential nature is the defining feature of a character device.

**Answer 4**
Reading one byte at a time from a block device is inefficient due to the overhead of each I/O operation.
**Reasoning:** A block device like a hard disk is physically designed to read and write data in fixed-size chunks (blocks). Every read operation, regardless of size, involves significant overhead: the CPU must command the disk controller, the disk may need to physically position its read/write heads (for an HDD), and the controller must transfer the data. The OS must read, at a minimum, one entire block from the disk into memory. Requesting a single byte forces the system to perform this entire expensive operation to retrieve a block, only to then discard all but one byte. Reading a full block at once performs the same expensive operation but makes all the data in that block available for a much lower marginal cost.

**Answer 5**
**1. Minimum block read operations from the SSD:**
*   File size: 10 MB = 10 * 1024 KB = 10,240 KB
*   SSD block size: 4 KB
*   Number of blocks = Total file size / Block size = 10,240 KB / 4 KB = **2,560 block reads**
    The SSD controller must be instructed to read 2,560 separate blocks to access the entire file.

**2. Number of times the driver buffer is filled:**
*   Total file size: 10,240 KB
*   Driver buffer size: 64 KB
*   Number of buffer fills = Total file size / Buffer size = 10,240 KB / 64 KB = **160 buffer fills**
    The device driver will coordinate with the SSD controller to fill its 64 KB buffer 160 times to transfer the complete 10 MB file into system RAM.

**Answer 6**
**Model B (Interrupts)** is far more efficient.
**Reasoning:**
*   In **Model A (Polling)**, the CPU is stuck in an active loop, spending almost all of its processing cycles asking "Is it ready yet?". This is called a "busy-wait". While it is busy checking the sensor, it cannot do other work, such as checking for or responding to user commands. The system would feel unresponsive.
*   In **Model B (Interrupts)**, the CPU can issue a "read" command and then immediately switch to another task, like waiting for user input. It wastes no cycles checking the sensor. When the sensor has a new reading ready, its hardware controller sends an interrupt signal that forces the CPU to pause its current task, run the code to handle the temperature data (the interrupt service routine), and then resume its previous task. This allows the CPU to effectively do two things at once (or at least, appear to), making the system efficient and responsive.