## Exercises

**Exercise 1**
You are designing a simple control system with three periodic tasks running on a single-core preemptive RTOS that uses Rate-Monotonic Scheduling (RMS). The tasks are:

-   **Task A (Motor Control):** Execution Time = 10 ms, Period = 50 ms
-   **Task B (Sensor Reading):** Execution Time = 15 ms, Period = 80 ms
-   **Task C (Logging):** Execution Time = 20 ms, Period = 200 ms

First, assign a static priority to each task according to the RMS algorithm. Second, using the processor utilization formula, determine if this task set is guaranteed to be schedulable under RMS. Show your calculations.

**Exercise 2**
An engineer is writing a firmware function for an automotive ECU that must trigger a fuel injector with a precise 5-millisecond deadline after receiving a signal. They have proposed two implementations for the core processing logic:

```c
// Implementation 1
void process_signal_v1() {
    // ... initial setup ...
    for (int i = 0; i < DATA_POINTS; i++) {
        // performs a fixed number of calculations
        result[i] = a[i] * b[i] + c[i];
    }
    trigger_injector(result);
}

// Implementation 2
void process_signal_v2() {
    // ... initial setup ...
    if (engine_temp > THRESHOLD_HIGH) {
        // complex cooling system adjustment algorithm
        adjust_cooling_system(); // takes 3 ms
    }
    // standard processing
    result = calculate_standard_injection(); // takes 1 ms
    trigger_injector(result);
}
```
Which implementation is more suitable for a hard real-time system? Justify your answer by explaining the concepts of determinism and jitter in the context of these two code snippets.

**Exercise 3**
Consider an RTOS managing three tasks in a drone's flight controller:

-   **T_High (Attitude Correction):** Priority 10 (Highest). Runs every 10 ms to keep the drone stable.
-   **T_Medium (GPS Navigation):** Priority 5. Runs every 100 ms to update waypoints.
-   **T_Low (Telemetry Logging):** Priority 1 (Lowest). Runs every 500 ms to write flight data to an SD card.

Both `T_High` and `T_Low` need exclusive access to a shared data structure containing the drone's current state (e.g., pitch, roll, yaw), which is protected by a mutex. Describe the sequence of events that could lead to priority inversion in this system, and explain how this would manifest as a critical failure. Then, propose a specific RTOS mechanism to prevent this and describe how it would alter the sequence of events to resolve the issue.

**Exercise 4**
You are designing the firmware for a battery-powered wildlife tracking collar. The device must perform two main activities:
1.  Acquire a GPS fix, which is an I/O-bound process that takes 800ms to complete. During this time, the main processor is mostly idle, waiting for the GPS module.
2.  Transmit the location data via a low-power radio, which is a CPU-intensive task taking 50ms.

The collar must perform this cycle once every 30 minutes. The microcontroller has the following power states:
-   **Active:** 20 mA consumption.
-   **Idle (Clock Gated):** 5 mA consumption. Wake-up latency is negligible.
-   **Deep Sleep (State Retention):** 0.1 mA consumption. Wake-up latency is 5 ms.

To maximize battery life, describe the power states the microcontroller should be in during the GPS acquisition phase, the data transmission phase, and the long interval between cycles. Justify your choices based on task requirements and wake-up latencies.

**Exercise 5**
A medical device company is building a next-generation patient monitoring system. This system must simultaneously:
1.  Sample vital signs (ECG, SpO2) from sensors with hard real-time deadlines (e.g., every 2ms).
2.  Run complex diagnostic algorithms on the collected data.
3.  Provide a rich graphical user interface (GUI) on a high-resolution display.
4.  Communicate with a central hospital network over TCP/IP.

One architect proposes using a hypervisor (Type 1) to run a certified RTOS for the vital signs collection (1) and a general-purpose OS like Linux for the other tasks (2, 3, 4) on a single multi-core processor. A second architect argues this is overly complex and proposes using a single, feature-rich RTOS that has networking and graphics support.

Analyze the hypervisor-based approach. Integrating concepts from this lesson and your prior knowledge of virtualization and MMUs, explain two distinct advantages this architecture provides for a safety-critical system compared to the single-RTOS approach.

**Exercise 6**
You are leading the design of the firmware for a robot arm controller that must perform high-precision "pick and place" operations. The system involves three critical, concurrent activities on a single-core processor with a DMA controller:

1.  **Motor Trajectory Planner (Task-P):** A CPU-intensive task that calculates the path for the arm. It must complete its calculation every 40 ms to provide a smooth motion profile. This is a hard deadline.
2.  **Motor Controller (Task-C):** A task that sends low-level commands to the motor drivers via an SPI bus. It must run every 5 ms to maintain torque and position. This is the hardest deadline in the system.
3.  **Sensor Feedback Processor (ISR-S):** An interrupt service routine triggered by a high-resolution encoder that provides the arm's actual position. This ISR must execute quickly and provide the latest position data to both Task-P and Task-C.

Your task is to outline the system's real-time architecture.
a) Assign priorities to Task-P and Task-C. Justify your assignment using an appropriate RTOS scheduling policy.
b) Describe how you would manage the high-frequency data transfer on the SPI bus for Task-C to minimize CPU load, referencing a relevant hardware feature from a prior lesson.
c) Identify a potential concurrency issue (e.g., data corruption) related to the shared position data from ISR-S and explain how using an inappropriate concurrency primitive (like a mutex) in the ISR could jeopardize the entire system's real-time guarantees.

---

## Answer Key

**Answer 1**
**Priority Assignment:**
Rate-Monotonic Scheduling (RMS) assigns priorities inversely to the task period. The shorter the period, the higher the priority.
-   Task A (Period = 50 ms): Highest Priority (3)
-   Task B (Period = 80 ms): Medium Priority (2)
-   Task C (Period = 200 ms): Lowest Priority (1)

**Schedulability Analysis:**
The processor utilization (U) is the sum of the execution time (C) divided by the period (T) for each task.
-   U_A = 10 ms / 50 ms = 0.20
-   U_B = 15 ms / 80 ms = 0.1875
-   U_C = 20 ms / 200 ms = 0.10
-   **Total Utilization (U) = 0.20 + 0.1875 + 0.10 = 0.4875**

The sufficient (but not necessary) condition for RMS schedulability is that the total utilization must be less than or equal to the Liu and Layland bound: `U <= n * (2^(1/n) - 1)`, where `n` is the number of tasks.
For n=3, the bound is `3 * (2^(1/3) - 1) ≈ 3 * (1.2599 - 1) ≈ 0.7797`.

**Conclusion:**
Since the calculated total utilization (0.4875) is less than the schedulability bound (≈0.7797), the task set is guaranteed to be schedulable under RMS.

**Answer 2**
**Implementation 1 (`process_signal_v1`) is far more suitable for a hard real-time system.**

**Reasoning:**
-   **Determinism:** Implementation 1 exhibits strong temporal determinism. Its execution time is highly predictable because it consists of a `for` loop that runs a fixed number of times (`DATA_POINTS`) with simple, consistent arithmetic operations. The worst-case execution time (WCET) is very close to its average-case execution time.
-   **Jitter:** Because the execution time is consistent, the time between the signal arrival and the `trigger_injector` call will have very low jitter. This precision is critical for applications like fuel injection.

**Implementation 2 is unsuitable for the following reasons:**
-   **Lack of Determinism:** The `if` statement introduces a major path dependency. If `engine_temp > THRESHOLD_HIGH`, the function takes an additional 3 ms. This makes the WCET (4 ms) significantly different from the best-case execution time (1 ms). An RTOS scheduler must always budget for the WCET, but this variability makes timing analysis difficult and potentially wasteful.
-   **High Jitter:** The variation in execution time (from 1 ms to 4 ms) introduces significant jitter. The injector might be triggered at 1 ms past the signal sometimes and 4 ms past it at other times. This inconsistency can lead to inefficient combustion, increased emissions, and poor engine performance, violating the system's requirements.

**Answer 3**
**Sequence of Events Leading to Priority Inversion:**
1.  `T_Low` (Priority 1) starts executing. It acquires the mutex for the drone's state data structure to begin logging.
2.  `T_Low` is preempted by `T_Medium` (Priority 5), which is ready to run. `T_Medium` does not need the state data mutex and begins its GPS calculations.
3.  While `T_Medium` is running, `T_High` (Priority 10) becomes ready to run (its 10 ms timer expires). Since it has the highest priority, it preempts `T_Medium`.
4.  `T_High` attempts to acquire the mutex for the state data structure but finds it is held by `T_Low`. `T_High` is now blocked.
5.  The scheduler now runs the highest-priority ready task, which is `T_Medium`.

**Manifestation of Failure:**
The highest priority task, `T_High`, which is responsible for flight stability, is effectively blocked by the much lower priority task, `T_Medium`. It must wait for `T_Medium` to finish *and then* for `T_Low` to finish and release the mutex. This delay can easily exceed `T_High`'s 10 ms deadline, causing the drone to miss an attitude correction cycle, become unstable, and potentially crash.

**Prevention Mechanism: Priority Inheritance Protocol**
When `T_High` blocks attempting to acquire the mutex held by `T_Low`, the RTOS scheduler would temporarily elevate the priority of `T_Low` to match that of `T_High` (Priority 10).

**Altered Sequence of Events:**
1.  Steps 1-4 are the same. `T_High` blocks on the mutex held by `T_Low`.
2.  The Priority Inheritance Protocol is triggered. The scheduler raises `T_Low`'s priority to 10.
3.  Now, `T_Low` (at temporary priority 10) has a higher priority than `T_Medium` (priority 5).
4.  `T_Low` is immediately scheduled to run, preempting `T_Medium`.
5.  `T_Low` quickly finishes its critical section and releases the mutex. Its priority is immediately returned to its original value (1).
6.  `T_High` is now unblocked and, being the highest-priority ready task, immediately preempts `T_Low` and runs, meeting its deadline. The duration of the priority inversion is minimized to only the time `T_Low` needs to finish its critical section.

**Answer 4**
The optimal power management strategy involves dynamically changing the MCU's power state based on the current task.

1.  **GPS Acquisition (800ms, I/O-bound):** The microcontroller should be in **Idle** state.
    -   **Justification:** During this phase, the CPU is mostly waiting for the external GPS module. The Active state would waste significant power (20 mA) doing nothing. The Idle state (5 mA) dramatically reduces consumption. Since the wake-up latency is negligible, the CPU can wake up instantly to handle interrupts or data from the GPS module without missing anything. Deep Sleep is not ideal here because the CPU needs to be responsive to the GPS module's I/O throughout the 800ms period.

2.  **Data Transmission (50ms, CPU-intensive):** The microcontroller must be in the **Active** state.
    -   **Justification:** This task requires the full processing capability of the CPU. Any other state would prevent the task from executing. This is the only time the 20 mA consumption is necessary.

3.  **Interval between cycles (~29 minutes, 59 seconds):** The microcontroller should be in **Deep Sleep**.
    -   **Justification:** This is the longest period, where the device is completely idle. The Deep Sleep state offers the lowest possible power consumption (0.1 mA), which is critical for maximizing battery life. The 5 ms wake-up latency is perfectly acceptable, as the 30-minute interval is not a hard real-time deadline. The RTOS would use a low-power timer to wake the MCU from Deep Sleep just before the next cycle needs to begin.

**Answer 5**
The hypervisor-based approach offers two key advantages for this safety-critical system, stemming from the concept of **sandboxing** or **partitioning**.

1.  **Fault Containment and System Stability (Integrates with Memory Management/MMU):**
    A Type 1 hypervisor leverages the processor's MMU to create strictly isolated virtual machines (VMs). The RTOS handling vital signs runs in one VM, and the Linux GPOS runs in another. They have separate, protected memory spaces. A critical fault in the complex, less-vetted GPOS environment (e.g., a memory leak in the GUI, a kernel panic from a faulty network driver) cannot corrupt the memory of the RTOS VM. The hypervisor and MMU enforce this separation at a hardware level. In the single-RTOS approach, a misbehaving graphics driver could potentially overwrite memory belonging to the vital signs collection task, leading to catastrophic failure. The hypervisor ensures the safety-critical part of the system keeps running even if the non-critical parts crash.

2.  **Guaranteed Real-Time Performance (Integrates with RTOS Scheduling):**
    The hypervisor can statically partition system resources. For example, on a quad-core CPU, Core 0 can be exclusively assigned to the RTOS VM, while Cores 1-3 are assigned to the Linux VM. This ensures that the high-priority, non-deterministic tasks running under Linux (like GUI rendering or garbage collection) can never preempt the hard real-time tasks in the RTOS. The RTOS has its own dedicated core and can provide absolute scheduling guarantees for the 2ms vital signs sampling, free from interference. In a single, complex RTOS, even with strict priority scheduling, a high-priority but poorly written driver (e.g., for the GPU) could potentially disable interrupts for too long or create other system-wide delays, introducing jitter that violates the hard real-time constraints. The hypervisor provides a stronger guarantee of "freedom from interference."

**Answer 6**
a) **Priority Assignment:**
-   **Task-C (Motor Controller):** Highest Priority.
-   **Task-P (Motor Trajectory Planner):** Lower Priority (than Task-C).
-   **Justification:** This assignment follows the Rate-Monotonic Scheduling (RMS) policy. Task-C has the shortest period (5 ms) and therefore the most stringent deadline, making it the highest-priority task. Task-P has a longer period (40 ms) and is thus assigned a lower priority. This ensures that the critical, high-frequency task of maintaining motor stability is never delayed by the less frequent, but more computationally intensive, planning task.

b) **SPI Data Transfer Management:**
To minimize CPU load from the high-frequency SPI transfers for Task-C, a **Direct Memory Access (DMA) controller** should be used.
-   **Mechanism:** Instead of the CPU writing each command byte to the SPI data register (a technique called programmed I/O), Task-C would configure a DMA channel. It would set up a buffer in memory with the entire sequence of SPI commands for a given cycle. Then, it would instruct the DMA controller to transfer this buffer to the SPI peripheral's data register, one byte at a time, synchronized with the SPI clock.
-   **Benefit:** This offloads the entire data transfer process from the CPU. The CPU is only involved at the beginning (to set up the transfer) and at the end (when the DMA signals completion via an interrupt). During the transfer, the CPU is free to perform other computations, such as preparing the *next* set of motor commands, significantly improving system efficiency and making it easier to meet deadlines.

c) **Concurrency Issue and Primitive Choice:**
-   **Concurrency Issue:** The shared position data is a point of contention. The ISR-S writes the latest encoder position, while Task-P and Task-C read it. A race condition could occur if, for example, Task-C reads a partially updated position value because the ISR-S was preempted mid-write (on a multi-byte position value). This could cause the robot arm to jerk or move to an incorrect location.
-   **Why a Mutex is Dangerous in an ISR:** If the ISR-S were to try to lock a mutex before writing the position data, a critical problem could arise. If Task-C (a lower priority task than the ISR) currently holds that mutex, the ISR would have to wait. But an ISR *cannot* block. Blocking in an ISR would halt that interrupt line and potentially the entire system, leading to immediate deadline misses and system failure. Furthermore, if the ISR preempted a task *between* disabling and re-enabling interrupts, it could lead to deadlock.
-   **Appropriate Solution:** The correct approach is to use a non-blocking, interrupt-safe mechanism. For a single piece of data like a position value, the best practice is to **disable interrupts** for the few instructions required to perform the read/write operation in the non-ISR tasks (Task-P and Task-C). This creates a very small, deterministic critical section. Alternatively, for more complex data structures, an interrupt-safe ring buffer or lock-free queue could be employed.