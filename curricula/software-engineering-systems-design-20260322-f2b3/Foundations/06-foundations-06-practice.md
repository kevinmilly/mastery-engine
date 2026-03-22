## Exercises

**Exercise 1**
An online gaming company runs its entire game state on a single, powerful server. As the player base grows, they notice that the server's CPU is consistently at 100% utilization, causing lag for players. To address this, they halt the server, replace the CPU with a much faster model, and add more RAM before restarting it. Explain why this is an example of vertical scaling and identify one key risk associated with this approach.

**Exercise 2**
A popular blog site uses a single database to store all its articles. The site is getting a lot of read traffic, and users are complaining about slow page loads. The engineering team decides to create two additional, identical copies of the database. They then configure their system to distribute all incoming read requests evenly across the original database and the two new copies. What is this technique called, and how does it specifically address the problem of slow page loads?

**Exercise 3**
A company provides a video transcoding service where users upload large video files that are then converted into different formats (e.g., 4K to 1080p). Each video transcoding job is a self-contained, independent task that takes a long time to complete. The company is currently running the service on one large, expensive server, which is now at full capacity. Should they scale vertically (by upgrading the existing server) or horizontally (by adding more, identical servers)? Justify your choice based on the nature of the workload.

**Exercise 4**
A social media platform stores its user data in a single, massive database. To improve performance and scalability, the engineers decide to shard the database. They use an algorithm based on the first letter of a user's username (A-M go to Shard 1, N-Z go to Shard 2). After implementation, they discover that Shard 1 is consistently experiencing much higher load and filling up faster than Shard 2. What is the likely cause of this imbalance, and what is the general name for this type of problem in a sharded system?

**Exercise 5**
An e-commerce platform initially used a single database server (a vertical scaling approach). To improve availability, they later added a second, identical server that continuously replicates data from the primary one. In the event the primary server fails, the system is designed to switch all traffic to the replica. While this improves availability, how does this two-server replication setup fail to improve the system's *throughput* for write operations (e.g., processing new orders)?

**Exercise 6**
You are designing the architecture for a new ride-sharing app. The system must handle two primary types of data: user profiles (infrequently updated) and real-time GPS location data for drivers (updated every few seconds). The system must be highly available and support millions of users globally. Propose a high-level scaling strategy that uses both replication and sharding. Explain which strategy you would apply to which type of data, and why that choice is appropriate.

---

## Answer Key

**Answer 1**
This is vertical scaling (or "scaling up") because the capacity of a single machine is being increased by adding more powerful components (CPU, RAM).

The key risk is that it introduces a single point of failure. During the upgrade, the entire service was down. Furthermore, if this single server fails for any reason (hardware malfunction, power outage), the entire game becomes unavailable. Vertical scaling also has an upper limit—eventually, you can't buy a faster CPU or add more RAM.

**Answer 2**
The technique is called replication. The original database is being replicated (copied) to two other servers.

This addresses slow page loads by distributing the read load. Instead of one server handling 100% of the requests to read article data, three servers now each handle roughly 33% of the requests. This reduces the load on any single machine, allowing it to respond to queries faster and improving overall system throughput for reads.

**Answer 3**
They should scale horizontally. The workload is "embarrassingly parallel," meaning each video transcoding job is independent of the others. This makes it a perfect candidate for horizontal scaling.

By adding more servers, the company can simply distribute new jobs to any available machine. This allows them to increase total throughput in a linear, cost-effective way. Vertical scaling would be a poor choice because a single, more powerful server would still only be able to work on a limited number of jobs at once, and they would hit a cost and performance ceiling much faster.

**Answer 4**
The likely cause is an uneven distribution of usernames. In English, for example, many more last names and usernames begin with letters from the first half of the alphabet (like S, M, B, C) than the second half (like X, Y, Z, Q).

This problem is known as a "hotspot" or a "hot shard." The sharding key (the first letter of the username) did not result in an even distribution of data or traffic, causing one shard to be overloaded while another is underutilized. This undermines the goal of sharding, which is to distribute the load evenly.

**Answer 5**
This setup fails to improve write throughput because every write operation must still be processed by the primary database. Furthermore, that write operation must then be successfully replicated to the secondary server. This process does not reduce the write load on the primary server; in fact, it adds the slight overhead of managing the replication stream. While this primary-replica model is excellent for read scaling and improving availability (via failover), all writes must still go through a single point, creating a potential bottleneck.

**Answer 6**
A suitable strategy would be to use sharding for the real-time GPS data and replication for the user profile data.

**Reasoning:**
*   **GPS Location Data (Sharding):** This data is generated in massive volumes and needs to be written frequently. Sharding is ideal here. For example, we could shard by geographic region (e.g., all drivers in California go to one shard, Texas to another). This distributes the intense write load across many different servers, preventing any single machine from becoming a bottleneck. This is crucial for maintaining low latency for location updates.
*   **User Profile Data (Replication):** This data is read often (e.g., when a user opens the app) but written to infrequently (e.g., when a user changes their name). A primary database with multiple read replicas would be effective. All writes go to the primary, ensuring consistency, while the numerous read replicas can handle the high volume of profile loads globally. This provides high availability and low read latency without the complexity of sharding a dataset that doesn't have a natural, high-volume write pattern to distribute.