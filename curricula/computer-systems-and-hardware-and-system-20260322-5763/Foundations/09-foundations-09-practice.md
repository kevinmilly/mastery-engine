## Exercises

**Exercise 1**
An application on your computer sends the message "Hello!" to a server. As the data is prepared for sending, a Transport Layer header is added, then a Network Layer header is added, and finally a Data Link Layer header is added. In what order were these headers added to the original "Hello!" message? Explain why this specific order is logically necessary for the data to reach its destination.

**Exercise 2**
You are a network analyst examining a single data packet that has just arrived at your computer's network interface card. You observe that it is an Ethernet frame. Inside the frame's payload, you find an IP packet. What does the presence of an IP packet inside an Ethernet frame tell you about the journey of this data, specifically regarding the network locations of the source and destination machines?

**Exercise 3**
Two computers on your home network, `Laptop-A` and `Tablet-B`, are connected to the same Wi-Fi router. From `Laptop-A`, you can load `google.com` in a browser. From `Tablet-B`, you cannot load any websites. However, you use a network utility and find that `Tablet-B` can successfully send and receive data from `Laptop-A`. Based on this evidence, which layer in the networking model is the most likely location of the problem for `Tablet-B`? Justify your answer.

**Exercise 4**
A software team is developing two new applications:
1. A real-time voice chat application where occasional, minor audio glitches are acceptable in favor of keeping the conversation flowing with minimal delay.
2. A secure banking application for transferring funds, where it is critical that every piece of data arrives correctly and in the right sequence.

For each application, should the developers choose TCP or UDP at the Transport Layer? Justify your choices based on the fundamental trade-offs offered by these two protocols.

**Exercise 5**
When a web browser wants to request a webpage, it asks the Operating System to create a "socket" for communication. The OS kernel manages the intricate details of sending and receiving data through this socket. How does this division of labor between the browser (a user-space application) and the OS kernel map to the layers of the TCP/IP model? Specifically, which layers are typically the responsibility of the OS, and which layer is the primary concern of the application developer?

**Exercise 6**
A user is running a web browser (which is a process managed by the Operating System) and clicks a link. The browser needs to make an HTTP GET request to a remote server. This request originates in the browser process, but must be converted into electrical signals on an Ethernet cable. Trace the journey of this request "down the stack," from the Application Layer to the Physical Layer. For each layer, describe the primary transformation or encapsulation that occurs.

---

## Answer Key

**Answer 1**
The headers are added in the following order:
1.  **Transport Header:** Added first, directly to the "Hello!" data.
2.  **Network Header:** Wrapped around the [Transport Header + "Hello!"].
3.  **Data Link Header:** Wrapped around the [Network Header + Transport Header + "Hello!"].

This process is called encapsulation. The order is necessary because it mirrors the de-encapsulation process at the receiving end. A router on the internet only needs to read the Network Layer header to decide where to send the packet next; it doesn't need to know about the Transport Layer details inside. The final destination computer's network card first reads the Data Link header to accept the frame, then the OS reads the Network header, then the Transport header to deliver the data to the correct application, which finally receives the original "Hello!" message. Each layer provides a service to the layer above it, so the headers must be nested in this "outside-in" order.

**Answer 2**
The presence of an IP packet inside an Ethernet frame indicates that the data has traveled between different logical networks (or subnets).
- The **Ethernet frame** (Data Link Layer) is responsible for delivering data between two devices on the *same local network segment*. Its addressing (MAC addresses) is local.
- The **IP packet** (Network Layer) is responsible for end-to-end delivery of data between hosts that can be on *different networks* anywhere in the world. Its addressing (IP addresses) is global.

Therefore, finding an IP packet inside an Ethernet frame implies that the frame is just one "hop" in a potentially longer journey. The Ethernet header is used for the local part of the journey (e.g., from your computer to your router), while the IP header contains the ultimate source and destination of the data.

**Answer 3**
The problem is most likely at the **Network Layer**.
*   **Reasoning:** Since `Tablet-B` can communicate with `Laptop-A` on the same local network, we know its Physical and Data Link layers are working correctly. It can form frames and send them over the Wi-Fi.
*   Since `Laptop-A` can access the internet, we know the router and the internet connection itself are working.
*   The fact that `Tablet-B` cannot access any websites suggests it is unable to route traffic *beyond the local network*. This is the core function of the Network Layer. The most common cause for this specific symptom is an incorrect IP configuration on `Tablet-B`, such as a wrong IP address, subnet mask, or—most likely—an incorrect **default gateway** address. The default gateway is the router's IP address, which a device must know to send traffic to the internet.

**Answer 4**
1.  **Voice Chat Application:** This application should use **UDP (User Datagram Protocol)**.
    *   **Justification:** UDP is a "fire-and-forget" protocol. It has low overhead because it doesn't guarantee delivery or order. For real-time voice, low latency (minimal delay) is far more important than perfect reliability. A lost packet might cause a tiny audio dropout, which is better than pausing the entire conversation to wait for a retransmission of old data, which is what TCP would do.

2.  **Secure Banking Application:** This application must use **TCP (Transmission Control Protocol)**.
    *   **Justification:** TCP is a connection-oriented protocol that guarantees reliable and in-order delivery. For a financial transaction, it is absolutely essential that all data arrives without corruption and in the correct sequence. The higher overhead and potential for delay (due to retransmissions) are an acceptable price to pay for the correctness and reliability that TCP provides.

**Answer 5**
This division of labor maps directly to the boundary between the Application Layer and the Transport Layer in the TCP/IP model.
-   **Application (Browser):** The application developer is primarily concerned with the **Application Layer**. They use the socket to send and receive application-specific data (like an HTTP request for a webpage). They don't need to know the computer's IP address, how to route packets, or how to retransmit a lost packet.
-   **Operating System (Kernel):** The OS kernel is responsible for the layers below: the **Transport Layer**, **Network Layer**, and **Data Link Layer**. When the browser writes data to the socket, the OS takes that data, segments it, adds TCP headers (Transport), adds IP headers (Network), and adds Ethernet/Wi-Fi headers (Data Link). The kernel manages the TCP state machine, handles retransmissions, and interacts with the network hardware driver. This provides an abstraction, allowing the application to simply "send data" without managing the complexity of the network stack.

**Answer 6**
The journey of the HTTP GET request down the stack is as follows:

1.  **Application Layer:** The browser process creates the raw data for the request, which is a string of text like `GET /page HTTP/1.1\nHost: example.com`. This is the payload that needs to be sent.

2.  **Transport Layer:** The OS kernel takes the HTTP request data. It establishes a TCP connection to the server on port 80 (for HTTP). It encapsulates the HTTP data within a **TCP segment**, adding a TCP header that includes the source port (a random high-numbered port on the user's machine) and the destination port (80). This header also contains sequence numbers for reliable delivery.

3.  **Network Layer:** The OS then takes the entire TCP segment and encapsulates it within an **IP packet**. It adds an IP header containing the source IP address (of the user's laptop) and the destination IP address (of the `example.com` server). This packet is now globally addressable.

4.  **Data Link Layer:** The OS passes the IP packet to the network interface driver. The driver encapsulates the packet within an **Ethernet frame** (or an 802.11 frame for Wi-Fi). It adds a header containing the source MAC address (of the laptop's Wi-Fi card) and the destination MAC address (of the local Wi-Fi router). This frame is only for the local network hop.

5.  **Physical Layer:** Finally, the network interface card takes the Ethernet frame (a sequence of 1s and 0s) and encodes it into the physical medium. For an Ethernet cable, this would be electrical voltage changes. For Wi-Fi, this would be modulated **radio waves** transmitted by the antenna.