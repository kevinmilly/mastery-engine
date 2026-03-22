## Capstone: Mastery — computer systems and hardware and systems programming

### The Scenario
You are a senior systems architect at "Aetherial Automotive," a company developing a next-generation Level 4 autonomous driving platform. Your team is tasked with designing the core architecture for the new "PerceptionCore ECU," a critical component responsible for real-time sensor fusion. This embedded system must be designed for extreme reliability, security, and performance, as it forms the vehicle's understanding of the world.

The PerceptionCore ECU receives high-bandwidth data streams from a suite of sensors: three 32-beam LiDARs, six 4K cameras, and four radar units. The system's primary function is to process these raw data streams concurrently, fuse them into a unified 3D world model, and make that model available to the separate "PathPlanner" ECU. The most critical system constraint is a hard real-time deadline: the end-to-end latency from the last sensor packet's arrival in memory to a fully updated and consistent world model must not exceed 15 milliseconds.

The system must be designed with ISO 26262 automotive safety standards in mind, which mandates determinism, fault tolerance, and security. Your role is to produce a high-level technical design document that addresses the fundamental challenges of I/O, concurrency, security, and real-time scheduling for the PerceptionCore's operating system and software architecture.

### Your Tasks
1.  **I/O and Data Ingestion Architecture:** Propose a high-level architecture for getting sensor data from the hardware peripherals into main memory with minimal CPU intervention. Justify your choices regarding the use of Direct Memory Access (DMA), the memory bus layout, interrupt handling strategies, and data buffering schemes (e.g., ring buffers) to handle the massive, continuous influx of data.

2.  **Concurrent Fusion Model:** Design a concurrency model for the sensor fusion software that will process the raw data. Specify the main processing tasks (e.g., LiDAR point cloud processing, camera object detection) and how they will run in parallel. Detail which synchronization primitives (e.g., mutexes, semaphores, condition variables) you would use to protect the shared world model data structure and explain how your design prevents race conditions while minimizing contention to meet performance goals.

3.  **Security and Fault Isolation Strategy:** Outline a robust security and fault isolation strategy for the PerceptionCore software. Explain how you will leverage hardware features like the Memory Management Unit (MMU) and CPU protection rings to isolate the critical sensor fusion kernel from other, less-trusted processes like system logging or diagnostics. Justify how this design prevents a fault or compromise in a non-critical component from affecting the real-time processing loop.

4.  **Real-Time Scheduling Analysis:** Select and justify the choice of a specific Real-Time Operating System (RTOS) scheduling policy (e.g., Rate-Monotonic, Earliest Deadline First) for the PerceptionCore ECU. Explain how this policy, in combination with the concurrency model from your second task, ensures that the 15ms processing deadline can be met deterministically. Your analysis must address and propose a solution for potential real-time hazards like priority inversion.

### What Good Work Looks Like
*   Demonstrates a systems-level perspective by showing how decisions in one area (e.g., I/O architecture) directly influence and constrain choices in others (e.g., scheduling and concurrency).
*   Clearly articulates the trade-offs inherent in the design, such as performance vs. security overhead, or scheduling simplicity vs. optimal CPU utilization.
*   Provides specific and well-reasoned justifications for all major architectural choices, connecting them directly back to the project's core constraints of latency, safety, and security.
*   Integrates concepts from hardware (MMU, DMA) and low-level software (RTOS, synchronization primitives) into a single, cohesive, and defensible system design.
*   The analysis of real-time behavior is based on the interaction of components, not just a theoretical description of a scheduling algorithm.