## Exercises

**Exercise 1**
A host computer named `Alpha` (IP: 192.168.1.10, MAC: AA:AA:AA:AA:AA:AA) wants to send its first-ever IP packet to a host named `Beta` (IP: 192.168.1.20, MAC: BB:BB:BB:BB:BB:BB) on the same local Ethernet network. `Alpha` does not have `Beta`'s MAC address in its ARP cache. List the network frames that must be exchanged between `Alpha` and `Beta` *before* `Alpha` can send the actual IP packet. For each frame, specify its type (e.g., ARP Request), source MAC, and destination MAC.

**Exercise 2**
A client initiates a TCP connection to a server. The client chooses an Initial Sequence Number (ISN) of 5000 for its SYN packet. Assuming the server is up and accepting connections, describe the critical values in the TCP header of the server's response packet (the SYN-ACK). Specifically, what will the SYN and ACK flags be set to, what will the Sequence Number be, and what will the Acknowledgment Number be?

**Exercise 3**
You are designing two new network applications:
1. A live-streaming video service where a few dropped frames are acceptable to maintain low latency and real-time playback.
2. A secure banking application for transferring funds, where every single byte of data must be received correctly and in order.

For each application, choose either TCP or UDP as the more appropriate transport protocol. Justify your choice by explaining which characteristics of the chosen protocol (e.g., connection setup, reliability, flow control) are most beneficial for that specific application's requirements.

**Exercise 4**
A client application attempts to establish a TCP connection with a server at IP address 10.0.0.50. The client's operating system sends a TCP SYN packet. However, a misconfigured firewall silently drops all incoming packets to the server on that specific port. The server never receives the SYN packet. From the client's perspective, what happens next? Describe the behavior of the client's TCP stack and what kind of error will eventually be reported back to the client application that tried to connect.

**Exercise 5**
Consider a multi-process web server running on an operating system. A `worker` process has just finished generating an HTTP response and needs to send it to a client over an already-established TCP socket. This involves moving the data from the worker process's user-space memory into the kernel's network buffers to be processed by the TCP/IP stack. Drawing on your knowledge of system calls and kernel architecture, explain the key steps that bridge this gap. How does the user-space process hand off the data to the kernel, and what is the kernel's role in preparing this data before it even gets to the IP layer?

**Exercise 6**
A user on a corporate network (Client IP: 10.10.10.50) reports that they can load the Google homepage (which uses HTTPS/TCP) but cannot get any DNS resolution to work when they try to visit a new website. A network trace shows that the client is sending UDP packets on port 53 to the corporate DNS server (10.10.1.1), but no response is ever received by the client. However, the user can successfully `ping` the DNS server.

Based on this evidence, propose two distinct and plausible root causes for the DNS failure. One cause should be related to a stateful firewall policy, and the other should be related to a network layer (IP/Routing) issue. Explain your reasoning for each proposed cause.

---

## Answer Key

**Answer 1**
Before the first IP packet can be sent, Address Resolution Protocol (ARP) must be used to resolve the IP address 192.168.1.20 to a MAC address.

1.  **Frame 1: ARP Request**
    *   **Type:** ARP Request
    *   **Source MAC:** AA:AA:AA:AA:AA:AA (`Alpha`)
    *   **Destination MAC:** FF:FF:FF:FF:FF:FF (Ethernet Broadcast)
    *   **Reasoning:** `Alpha` doesn't know `Beta`'s MAC address, so it broadcasts a request to all devices on the local network segment, asking "Who has IP 192.168.1.20? Tell me."

2.  **Frame 2: ARP Reply**
    *   **Type:** ARP Reply
    *   **Source MAC:** BB:BB:BB:BB:BB:BB (`Beta`)
    *   **Destination MAC:** AA:AA:AA:AA:AA:AA (`Alpha`)
    *   **Reasoning:** `Beta` sees the ARP request addressed to its IP address. It responds directly to `Alpha` (a unicast frame) with a reply stating, "I have IP 192.168.1.20, and my MAC address is BB:BB:BB:BB:BB:BB."

After this exchange, `Alpha` caches `Beta`'s MAC address and can now construct the Ethernet frame for its IP packet with the correct destination MAC.

**Answer 2**
The server's SYN-ACK packet is the second step in the three-way handshake and serves to both acknowledge the client's SYN and send its own.

*   **SYN flag:** Set to 1. The server is also synchronizing its sequence number with the client.
*   **ACK flag:** Set to 1. The server is acknowledging the client's initial packet.
*   **Sequence Number:** A new Initial Sequence Number (ISN) chosen by the server. It will be an arbitrary number, let's say 8000 for this example. It is *not* related to the client's ISN.
*   **Acknowledgment Number:** 5001. The ACK number is always the sequence number of the packet being acknowledged, plus one. Since the client's SYN packet had sequence number 5000, the acknowledgment is for 5000 + 1 = 5001.

**Answer 3**
1.  **Live-Streaming Video Service: UDP**
    *   **Justification:** UDP is the better choice because it is a connectionless, "fire-and-forget" protocol. This low overhead is critical for real-time streaming. A connection setup (like TCP's handshake) would add initial latency. More importantly, UDP has no built-in reliability or retransmission mechanism. If a video frame (a packet) is dropped, the application simply moves on. Retransmitting a late frame would be useless, as it would arrive too late to be displayed, causing stuttering and jitter. The application prioritizes continuous, low-latency playback over the guaranteed delivery of every single frame.

2.  **Secure Banking Application: TCP**
    *   **Justification:** TCP is the only acceptable choice. A financial transaction requires absolute data integrity. TCP guarantees this through its core features:
        *   **Reliability:** Sequence numbers and acknowledgments ensure that every packet is received. If a packet is lost, it is retransmitted.
        *   **In-order Delivery:** TCP reassembles the data stream in the correct order on the receiving end, which is essential for structured financial data.
        *   **Connection-Oriented:** The three-way handshake establishes a stable connection, confirming that both parties are ready to exchange data, which is crucial before sensitive information is sent. The connection-teardown ensures all data is acknowledged before closing.

**Answer 4**
Since the server never receives the SYN packet, it will never send a SYN-ACK (or a RST) in response. The client's TCP stack will not receive the expected response and will assume the initial packet was lost in transit.

*   **Behavior:** The client's TCP stack will start a retransmission timer. When the timer expires, it will re-send the same SYN packet. This will typically happen multiple times, often with an increasing delay between attempts (exponential backoff).
*   **Final Error:** After a number of retransmission attempts fail (e.g., after about a minute, depending on the OS configuration), the client's TCP stack will give up. It will report an error back to the application that initiated the connection. The error will be a **Connection Timed Out** error, indicating that it failed to establish a connection within the maximum allowed time.

**Answer 5**
The handoff from a user-space process to the kernel's network stack is a critical boundary crossing, orchestrated by a system call.

1.  **System Call:** The `worker` process will invoke a system call like `send()` or `write()` on the socket's file descriptor. This call includes a pointer to the user-space buffer containing the HTTP response and the length of the data.
2.  **Context Switch:** The `send()` call triggers a software interrupt (a trap), causing the CPU to switch from user mode to kernel mode. The context of the `worker` process is saved.
3.  **Data Copy:** Now in kernel mode, the kernel's system call handler takes over. Its first job is to copy the HTTP response data from the process's user-space memory into a kernel-space buffer (a `sk_buff` or similar structure). This is essential because the kernel cannot trust pointers to user-space memory, which could be paged out or changed by the process scheduler.
4.  **Kernel Processing:** Once the data is safely in the kernel's memory, the kernel passes it down to the TCP layer of its network stack. The TCP layer prepends the TCP header (with correct source/destination ports, sequence/ack numbers, etc.), calculates the checksum, and then passes the resulting TCP segment down to the IP layer for further encapsulation. The user process remains suspended until the data copy is complete, at which point the `send()` call can return.

**Answer 6**
The key facts are: UDP (DNS) fails, TCP (HTTPS) works, and ICMP (ping) works. This points to a specific filtering rule or a path issue affecting only UDP.

1.  **Cause 1: Stateful Firewall Policy**
    *   **Plausible Cause:** The corporate firewall is configured with a stateful policy that allows outbound DNS requests but has a misconfigured or overly strict rule for inbound responses. It sees the client's UDP packet on port 53 going out, but it does not correctly associate the server's incoming UDP response with the established "session." Because UDP is connectionless, stateful firewalls have to track UDP "flows" using a timeout. The rule might be blocking all unsolicited inbound UDP traffic, and it fails to match the response to the outbound request.
    *   **Reasoning:** This explains why `ping` (ICMP) and HTTPS (TCP) work, as they would have their own, correctly configured stateful rules. TCP is easy for stateful firewalls to track due to its explicit connection setup (SYN/ACK). The DNS failure is specific to the handling of UDP responses.

2.  **Cause 2: Asymmetric Routing Issue**
    *   **Plausible Cause:** There is an asymmetric routing path between the client and the DNS server. The client's outbound packet (source 10.10.10.50, destination 10.10.1.1) follows one route to the server successfully. However, the server's response packet (source 10.10.1.1, destination 10.10.10.50) is being sent back along a different network path that is either broken, blocked, or routes through a device that drops the packet.
    *   **Reasoning:** This would affect all traffic from the server back to the client. The reason TCP *appears* to work could be that its path is different, or more likely, the problem only exists on the path from the DNS server specifically. Ping works because the echo-reply packets from the DNS server are successfully finding a route back, indicating the asymmetric routing issue might be specific to a router or path that only affects the UDP traffic, or the return path for ICMP is different from the return path for UDP. In many networks, routing policies for different protocols can vary.