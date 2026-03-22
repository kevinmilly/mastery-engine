## Capstone: Foundations — computer systems and hardware and systems programming

### The Scenario
You are a junior systems analyst at "Veridian Dynamics," a company that provides data processing services. This morning, a critical data ingestion server, `srv-ingest-01`, began exhibiting erratic behavior. Automated monitoring systems detected unusually high CPU usage and network traffic to an unknown external IP address. A senior security analyst suspects the server has been compromised.

The senior analyst has isolated the server from the network to prevent further damage and has taken several snapshots of the system's state for you to analyze. Your task is to perform an initial triage to identify the nature of the compromise and report your findings. You have been given three key artifacts:
1.  A snapshot of the running processes on the server at the time it was isolated.
2.  A snippet from the network connection logs captured just before the server was taken offline.
3.  A small memory dump (a hexadecimal representation of a segment of RAM) from a suspicious process identified by the monitoring system.

Your analysis will form the basis of the formal incident response, helping the team understand what happened at a fundamental systems level.

### Your Tasks
Your deliverable is an Initial Triage Report. Address the following tasks in your report.

1.  **Process Analysis:** Review the provided process list snapshot below. Identify the single most suspicious process and justify your choice. Explain what a "process" represents in the context of the operating system and why monitoring the list of active processes is a critical first step in an investigation.

    ```
    USER      PID   %CPU  %MEM   COMMAND
    root        1    0.0   0.1   /sbin/init
    root      850    0.0   0.2   /usr/sbin/sshd
    vd-user  1230    0.1   1.5   /opt/veridian/ingest-service
    vd-user  1231    0.1   1.5   /opt/veridian/ingest-service
    root     2450   95.3   2.1   /tmp/kworker
    ```

2.  **Network Log Interpretation:** The log below captured an outbound connection from the server. Deconstruct this log entry by identifying the source IP, destination IP, and destination port. Based on the TCP/IP model, at which layer does this information primarily operate? Explain the significance of this connection in the context of a potential data breach.

    `[2023-10-27 10:32:15] TCP_SENT: 10.0.1.15:48122 -> 198.51.100.33:8080`

3.  **Memory Forensics:** The following 16-byte hex dump was extracted from the memory (RAM) of the suspicious process. First, interpret this data: decode the first 4 bytes as an ASCII string and the 4 bytes that follow (bytes 4-7) as a 32-bit unsigned integer. Second, explain why analyzing data directly from RAM provides a different and often more critical view than analyzing files stored on the hard drive (secondary storage).

    `43 46 47 00 00 01 E2 40 64 61 74 61 2E 7A 69 70`
    *(Hint: Refer to an ASCII table for the string conversion.)*

4.  **Synthesizing the Incident:** Write a brief, high-level summary for a non-technical manager. Explain how the core components of the computer allowed this incident to happen. Your explanation should touch upon how the CPU executes instructions (malicious or not), how the Von Neumann architecture allows for code and data to exist in the same memory, and the role the Operating System plays in managing processes and I/O (like network and file access).

### What Good Work Looks Like
*   Demonstrates a clear understanding of a process as a distinct, OS-managed program execution with its own resources.
*   Correctly applies a layered networking model to interpret communication logs and astutely assesses their security implications.
*   Accurately connects low-level data representations (like ASCII and unsigned integers in hex) to their physical location within the memory hierarchy, explaining the trade-offs between different memory types.
*   Builds a coherent narrative by synthesizing high-level abstractions—like the OS kernel's role and the CPU's instruction cycle—to explain how a computer fundamentally operates and can be compromised.
*   Provides justifications for all conclusions that are grounded in the concepts from the curriculum, not just surface-level observations.