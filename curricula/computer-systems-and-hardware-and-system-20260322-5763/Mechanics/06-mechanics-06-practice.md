## Exercises

**Exercise 1**
Consider the following set of processes, with arrival times and CPU burst times given in milliseconds:

| Process | Arrival Time | Burst Time |
| :--- | :--- | :--- |
| P1 | 0 | 7 |
| P2 | 2 | 4 |
| P3 | 4 | 1 |
| P4 | 5 | 4 |

Calculate the average waiting time for these processes using both the First-Come, First-Served (FCFS) and the non-preemptive Shortest Job First (SJF) scheduling algorithms.

**Exercise 2**
Three processes (P1, P2, P3) arrive at time 0 with the following CPU burst times: P1=10ms, P2=5ms, P3=8ms. The system uses a Round Robin scheduler with a time quantum of 3ms.

Construct a Gantt chart illustrating the execution of these processes. Then, calculate the turnaround time for each process.

**Exercise 3**
A server runs a mix of two types of processes: long-running data analysis jobs (CPU-bound) and short, interactive user queries (I/O-bound). The system uses a Round Robin scheduling algorithm. Analyze the effect of setting a very large time quantum (e.g., 500ms) on the system's performance, specifically addressing the average response time for interactive queries and overall CPU utilization.

**Exercise 4**
A system uses a strict priority-based scheduler where high-priority processes can always preempt low-priority ones. The system runs a critical, high-priority background process that wakes up periodically to perform a short task. It also runs several long-running, low-priority user applications. A programmer notices that if they launch a new medium-priority, CPU-intensive process, the low-priority applications make no progress at all.

Identify and name this scheduling problem. Propose a modification to the priority scheduling algorithm that would ensure the low-priority processes eventually get to run, and explain how it works.

**Exercise 5**
A process, P_current, is currently running on the CPU under a preemptive Shortest-Remaining-Time-First (SRTF) scheduler. The scheduler's estimate for P_current's remaining burst time is 4ms. The next shortest process in the ready queue, P_next, has an estimated remaining time of 10ms. Suddenly, P_current executes an instruction that accesses a memory address in a swapped-out page, causing a page fault. Servicing the page fault from the disk is expected to take 12ms.

Explain what the operating system scheduler will do immediately following the page fault trap. How does this event demonstrate the challenge of implementing a true SRTF scheduler in a system with virtual memory?

**Exercise 6**
You are tasked with selecting a scheduling algorithm for the main control computer of a deep-space probe. The computer must perform two primary functions:
1.  **Attitude Control:** A high-frequency, high-priority task that makes tiny adjustments to the probe's orientation. This task must run precisely every 50ms to maintain stability. Missing a deadline could be catastrophic.
2.  **Data Transmission:** A long-running, lower-priority task that compresses and transmits scientific data back to Earth. This task can be interrupted without issue.

Would a standard Round Robin algorithm be a suitable choice for this system? Justify your decision by evaluating its ability to meet the system's critical requirements, and compare it to a more appropriate algorithm type.

---

## Answer Key

**Answer 1**
The average waiting time is calculated by summing the waiting times for all processes and dividing by the number of processes. Waiting time = Start Time - Arrival Time.

**FCFS Scheduling:**
The processes will execute in the order they arrive: P1 -> P2 -> P3 -> P4.
-   P1 starts at 0, waits 0ms (0 - 0). Finishes at 7.
-   P2 starts at 7, waits 5ms (7 - 2). Finishes at 11.
-   P3 starts at 11, waits 7ms (11 - 4). Finishes at 12.
-   P4 starts at 12, waits 7ms (12 - 5). Finishes at 16.
-   **Total Waiting Time:** 0 + 5 + 7 + 7 = 19ms
-   **Average Waiting Time:** 19ms / 4 = **4.75ms**

**Non-Preemptive SJF Scheduling:**
-   At time 0, only P1 is available. It starts.
-   P1 runs from 0 to 7. While it runs, P2, P3, and P4 arrive.
-   At time 7, the scheduler looks at the ready queue: P2 (burst 4), P3 (burst 1), P4 (burst 4).
-   P3 has the shortest burst, so it runs next. Starts at 7, finishes at 8.
-   At time 8, the ready queue has P2 (burst 4) and P4 (burst 4). FCFS is used as a tie-breaker, so P2 runs. Starts at 8, finishes at 12.
-   At time 12, only P4 remains. It starts and finishes at 16.
-   **Waiting Times:**
    -   P1: 0ms (0 - 0)
    -   P2: 6ms (8 - 2)
    -   P3: 3ms (7 - 4)
    -   P4: 7ms (12 - 5)
-   **Total Waiting Time:** 0 + 6 + 3 + 7 = 16ms
-   **Average Waiting Time:** 16ms / 4 = **4.0ms**

For this specific workload, SJF results in a lower average waiting time than FCFS.

**Answer 2**
**Gantt Chart (Time Quantum = 3ms):**

| P1 | P2 | P3 | P1 | P2 | P3 | P1 | P3 | P1 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 0 | 3 | 6 | 9 | 12| 14| 17| 19| 22|
| | | | | | | | | |
| 3 | 6 | 9 | 12| 14| 17| 19| 22| 23|

**Execution Trace:**
-   0-3: P1 runs (7ms left)
-   3-6: P2 runs (2ms left)
-   6-9: P3 runs (5ms left)
-   9-12: P1 runs (4ms left)
-   12-14: P2 runs (0ms left). P2 finishes at time 14.
-   14-17: P3 runs (2ms left)
-   17-19: P1 runs (2ms left)
-   19-22: P3 runs (0ms left). P3 finishes at time 22. Wait, mistake in trace. P3's last run is 2ms. So it runs from 19-21. Let me re-do the chart.

**Corrected Gantt Chart:**
| P1 | P2 | P3 | P1 | P2 | P3 | P1 | P3 | P1 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 0  | 3  | 6  | 9  | 12 | 14 | 17 | 20 | 22 |
|    |    |    |    |    |    |    |    |    |
| 3  | 6  | 9  | 12 | 14 | 17 | 20 | 22 | 23 |

**Corrected Execution Trace:**
- 0-3: P1 runs (7 remaining)
- 3-6: P2 runs (2 remaining)
- 6-9: P3 runs (5 remaining)
- 9-12: P1 runs (4 remaining)
- 12-14: P2 runs (0 remaining). **P2 finishes at time 14.**
- 14-17: P3 runs (2 remaining)
- 17-20: P1 runs (1 remaining)
- 20-22: P3 runs (0 remaining). **P3 finishes at time 22.**
- 22-23: P1 runs (0 remaining). **P1 finishes at time 23.**

**Turnaround Time Calculation:**
Turnaround Time = Completion Time - Arrival Time. (Arrival time is 0 for all).
-   **P1 Turnaround Time:** 23 - 0 = **23ms**
-   **P2 Turnaround Time:** 14 - 0 = **14ms**
-   **P3 Turnaround Time:** 22 - 0 = **22ms**

**Answer 3**
Using a very large time quantum in Round Robin scheduling effectively makes the algorithm behave like First-Come, First-Served (FCFS).

-   **Impact on Interactive Queries:** The response time for interactive queries will degrade significantly. If a long data analysis job arrives just before a short interactive query, the query will be forced to wait in the ready queue for the entire (long) duration of the analysis job's time slice. Because the quantum is very large, the analysis job will not be preempted, leading to poor responsiveness for users submitting queries.
-   **Impact on CPU Utilization:** CPU utilization may not be negatively affected and could even slightly increase. This is because the overhead of context switching becomes negligible. With a large quantum, the scheduler is invoked much less frequently. This saves the CPU cycles that would otherwise be spent saving and loading process states, leading to more time spent on useful computation. However, this gain in CPU efficiency comes at the severe cost of fairness and responsiveness for short processes.

**Answer 4**
The problem is **starvation**. The low-priority processes are being "starved" of CPU time because there is always a higher-priority (high or medium) process ready to run. In a strict preemptive priority system, as long as a medium-priority process is running, the low-priority ones will never be scheduled.

A solution is to implement **aging**. Aging is a technique where the priority of a process increases the longer it waits in the ready queue.

**How it works:**
The operating system would periodically (e.g., every few seconds) scan the ready queue and increase the priority of any process that has been waiting for a long time. For example, a low-priority process (priority 1) might have its priority incremented to 2, then 3, and so on. Eventually, its priority will become high enough to be scheduled, even in the presence of newly arriving medium-priority tasks. This ensures that no process waits indefinitely.

**Answer 5**
**Sequence of Events:**
1.  **Trap:** P_current's memory access causes a hardware trap for a page fault. Control is transferred from the user process to the operating system's interrupt handler.
2.  **State Change:** The OS moves P_current from the "Running" state to the "Waiting" (or "Blocked") state. It will remain in this state until the page has been loaded from the disk into a physical memory frame.
3.  **Scheduler Invocation:** Since the CPU is now free, the scheduler is invoked to select a new process to run.
4.  **Process Selection:** The scheduler will examine the ready queue. The only process in the ready queue is P_next, with an estimated remaining time of 10ms. The scheduler dispatches P_next to the CPU.

**Challenge to SRTF:**
This scenario highlights the challenge of relying on *predicted* CPU burst times. The SRTF algorithm chose P_current because its *CPU burst* was predicted to be short (4ms). However, the page fault introduced a long I/O delay (12ms). The total time until P_current is ready for the CPU again will be at least 12ms, much longer than its predicted CPU time and longer than P_next's time. The scheduler's "optimal" choice was invalidated by an unpredictable event related to virtual memory. This demonstrates that accurate prediction of future CPU behavior is extremely difficult, as it is affected by I/O, page faults, and other system events, not just code execution.

**Answer 6**
No, a standard Round Robin algorithm would be a **poor choice** for this system.

**Justification:**
The primary requirement is meeting the hard real-time deadline for the **Attitude Control** task. It must execute every 50ms.

1.  **Lack of Guarantees:** Round Robin is designed for fairness, not for meeting deadlines. If the Data Transmission task is in the middle of its time slice when the Attitude Control task becomes ready, the control task will be placed in the ready queue and must wait. Depending on the quantum size and the number of other processes, it could easily miss its 50ms deadline. This lack of priority handling makes it unsuitable for real-time systems.
2.  **Unnecessary Overhead:** The frequent, periodic context switching inherent in Round Robin introduces overhead that is not beneficial here. The Data Transmission task can be preempted at any time without issue, so it does not need a protected time slice.

**More Appropriate Algorithm:**
A **preemptive, priority-based scheduler** would be far more appropriate.
-   The Attitude Control task would be assigned the highest priority.
-   The Data Transmission task would be assigned a lower priority.

When the 50ms timer fires, the high-priority Attitude Control task becomes ready. The scheduler would immediately preempt the lower-priority Data Transmission task, guaranteeing that the critical attitude control calculations run on time, every time. This model directly addresses the system's hard real-time constraints.