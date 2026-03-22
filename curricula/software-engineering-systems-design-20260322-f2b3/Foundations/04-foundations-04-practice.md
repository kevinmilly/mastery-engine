## Exercises

**Exercise 1**
A user is streaming a high-definition movie. The movie starts playing almost instantly after they press 'play', but about every five minutes, it freezes for several seconds to "buffer". The user's internet plan is advertised with a maximum speed of 100 Mbps. Which performance metric — latency, throughput, or bandwidth — is the most likely cause of the buffering issue? Explain your reasoning.

**Exercise 2**
A server is designed to process API requests. The server's CPU can handle a maximum of 500 requests per second. Each request generates a 20 Kilobyte (KB) response. The server is connected to the internet via a network link with 100 Megabits per second (Mbps) of bandwidth. What is the maximum effective throughput of this system, measured in requests per second? (Note: 1 KB = 1024 bytes; 1 byte = 8 bits; 1 Mbps = 1,000,000 bits per second).

**Exercise 3**
Two data centers, one in New York and one in London, are connected by a dedicated, high-bandwidth (10 Gbps) undersea fiber optic cable. An engineer starts a large data transfer of a 1 Terabyte (TB) file from New York to London. They are surprised to find that the actual transfer speed (throughput) is only a fraction of the available 10 Gbps bandwidth. Assuming there is no other traffic on the cable, what is the most likely reason for this discrepancy?

**Exercise 4**
You are a systems architect for a company that is launching two new services:
1.  **A cloud gaming platform:** Players stream games from your servers, and their controller inputs (button presses, joystick movements) are sent to the server in real-time.
2.  **A video-on-demand service:** Users browse a library and stream pre-recorded movies and TV shows.

For each service, identify which is more critical to optimize for a good user experience: low latency or high throughput. Justify your choice for each.

**Exercise 5**
A user in a client application clicks "Load Report". The client sends a request to a server, the server queries a database, and the server sends the report data back to the client. The entire round trip takes 850 milliseconds (ms). A performance analysis reveals the following breakdown:
-   Client to Server network travel time: 75ms
-   Server processing and database query time: 700ms
-   Server to Client network travel time: 75ms

To improve the user experience, one team member suggests upgrading the network infrastructure to reduce network travel time. Another suggests adding an index to the database to speed up the query. Based on the data, which approach will have a more significant impact on the end-to-end latency for this action? Explain why.

**Exercise 6**
You are designing a distributed system for a new social media application feature that allows users to upload short, high-quality video clips (average size 25 MB). The system must handle thousands of concurrent uploads during peak hours. Your goal is to ensure that uploads are both fast (low time-to-completion for the user) and that the system can handle a high volume of simultaneous uploads.

Describe how latency, throughput, and bandwidth each present a unique challenge in this scenario. For each metric, identify one potential bottleneck and suggest a high-level strategy to mitigate it.

---

## Answer Key

**Answer 1**
The most likely issue is **low throughput**.

**Reasoning:**
-   **Latency** is the time for a single packet to travel. Since the video starts playing almost instantly, the initial latency is likely low and not the problem.
-   **Bandwidth** is the *maximum theoretical* speed (100 Mbps), but the actual, measured speed is the throughput.
-   **Throughput** is the actual rate at which data is being successfully delivered. Buffering occurs when the video player consumes data faster than the network can deliver it. This indicates that the sustained, actual data rate (throughput) is insufficient for high-definition streaming, even though the advertised bandwidth is high. This could be due to network congestion, server load, or other issues between the user and the streaming service.

**Answer 2**
The maximum effective throughput is **500 requests per second**.

**Reasoning:**
The system has two main components that can be a bottleneck: the server's processing capacity and the network's data transfer capacity. We must calculate the capacity of each and find the minimum.

1.  **Server Capacity:** The server can process **500 requests/sec**.

2.  **Network Capacity:** We need to find out how many requests per second the network link can handle.
    -   First, convert the response size from Kilobytes to bits:
        20 KB * 1024 bytes/KB * 8 bits/byte = 163,840 bits per request.
    -   Next, find the maximum number of these responses the network can send per second:
        100,000,000 bits/sec (bandwidth) / 163,840 bits/request ≈ 610.3 requests/sec.

3.  **Identify the Bottleneck:**
    -   Server can handle: 500 req/sec
    -   Network can handle: ~610 req/sec
    The server is the slower component, so it is the bottleneck. The system cannot process requests faster than its slowest part. Therefore, the maximum effective throughput is limited by the server's capacity.

**Answer 3**
The most likely reason is the high **latency** of the long-distance connection.

**Reasoning:**
Even with a high-bandwidth pipe, data transfer protocols like TCP require acknowledgement (ACK) packets to be sent from the receiver back to the sender to confirm data was received successfully. The time it takes for a packet to travel from New York to London and for the ACK to travel back is the round-trip time (latency).

Due to the physical distance, this latency is significant. The sender might fill the network's buffer (the "TCP window") and then have to wait idly for an ACK from London before it can send more data. This "wait time," caused by high latency, prevents the sender from continuously filling the high-bandwidth pipe, leading to an actual throughput that is much lower than the theoretical bandwidth.

**Answer 4**
1.  **Cloud Gaming Platform:** **Low latency** is more critical.
    **Justification:** In gaming, the delay between a player's action (e.g., pressing a jump button) and the result appearing on screen must be minimal for the game to feel responsive. Even a delay of 100-200ms can make a game unplayable. While a stable amount of throughput is needed, the primary user experience is dictated by the responsiveness that low latency provides.

2.  **Video-on-Demand Service:** **High throughput** is more critical.
    **Justification:** For streaming pre-recorded video, the system needs to send a large, continuous stream of data to the user. The primary goal is to deliver data faster than the user is watching it to prevent buffering. A small initial delay (latency) of a few seconds before the video starts is generally acceptable. The critical factor for a smooth viewing experience is a sustained, high data rate (throughput).

**Answer 5**
The suggestion to **add an index to the database** will have a more significant impact.

**Reasoning:**
End-to-end latency is the sum of all its parts. The total latency is 850ms.
-   Total Network Latency = 75ms (client to server) + 75ms (server to client) = 150ms.
-   Server Processing Latency = 700ms.

The server processing time accounts for 700ms / 850ms ≈ 82% of the total delay. The network time accounts for only 18%. Even if the network upgrade cut the network time in half (saving 75ms), the total time would still be 775ms. In contrast, optimizing the database query, which is the bulk of the server processing time, could potentially save hundreds of milliseconds, leading to a much more noticeable improvement for the user. The bottleneck is clearly server-side processing, not network performance.

**Answer 6**
**1. Bandwidth Challenge:**
-   **Description:** Bandwidth is the capacity of the network link. Uploading large 25 MB files requires significant bandwidth, both on the user's end ("uplink") and at the data center receiving the file.
-   **Bottleneck:** The server's incoming internet connection could be saturated if thousands of users upload large files simultaneously.
-   **Mitigation Strategy:** Use a Content Delivery Network (CDN) or Points of Presence (PoPs). This allows users to upload to a server that is geographically closer and distributes the incoming traffic across many different network entry points instead of overwhelming a single data center.

**2. Latency Challenge:**
-   **Description:** Latency is the time delay for network communication. For the user, this manifests as the initial delay after they hit "upload" before the transfer begins and communicates its status. High latency can make the application feel sluggish.
-   **Bottleneck:** The geographical distance between the user and the upload server. A user in Australia uploading to a server in North America will experience high latency.
-   **Mitigation Strategy:** Similar to the bandwidth solution, use geographically distributed servers (PoPs/edge locations). By directing the user to the nearest server, the round-trip time for the initial TCP handshake and subsequent communication is minimized, making the upload process start faster and feel more responsive.

**3. Throughput Challenge:**
-   **Description:** Throughput is the actual rate at which the system can process uploads. This isn't just about network speed, but the entire processing pipeline: receiving the file, validating it, transcoding it to different formats, and storing it.
-   **Bottleneck:** The server-side processing power. A single server can only transcode a limited number of videos at once. If thousands of videos arrive, a long queue will form, and the overall system throughput will be low.
-   **Mitigation Strategy:** Decouple the upload process from the processing step using a message queue. The web servers can handle the uploads quickly and place a "transcode job" message into a queue. A separate fleet of scalable worker servers can then pull jobs from the queue and process them in parallel. This allows the system to handle a high rate of incoming requests (high throughput) by scaling the processing workers independently.