## Exercises

**Exercise 1**
An online multiplayer game uses a distributed architecture to host game sessions. During a network partition that separates the North American and European server clusters, players in both regions can continue playing in their respective clusters without being disconnected. However, players notice that global leaderboard updates are delayed, and a score achieved in Europe might not be reflected for a player in North America for several minutes. Based on the CAP theorem, which property was sacrificed to maintain the other two during this partition? Explain your reasoning.

**Exercise 2**
A distributed document collaboration service uses an eventually consistent model for propagating comments. User A, in a Dublin office, adds a comment to a shared document. Almost simultaneously, User B, in a San Francisco office, also adds a comment to the same paragraph. Due to network latency, the replication of User A's comment has not yet reached the San Francisco server when User B submits their comment. Describe the state of the document that User A and User B will see immediately after making their respective comments, and what will happen to the document's state over the next few seconds.

**Exercise 3**
A small startup is building a service discovery system for their microservices architecture. The system needs to maintain a canonical list of active services and their network locations. The engineering team is small and prioritizes code maintainability and ease of debugging over raw performance. They have narrowed their choice of underlying consensus algorithm to Paxos or Raft. Which algorithm would be a more suitable choice for this team's priorities, and why?

**Exercise 4**
A distributed database cluster of 7 nodes is used for storing critical inventory data. To ensure durability, any write request must be successfully written to a quorum of nodes before the client receives an acknowledgment. The system is configured with a write quorum (W) of 4. During operation, a network failure isolates 3 of the nodes from the other 4. A client, connected to the larger partition of 4 nodes, issues a write to update the stock level of an item. Will this operation succeed? What if the client were connected to the smaller partition of 3 nodes? Explain how this demonstrates fault tolerance.

**Exercise 5**
A content delivery network (CDN) caches website assets on edge servers located globally. This CDN is built on a distributed key-value store. When an asset (e.g., an image) is updated on the origin server, the change is propagated to the edge servers. To maximize read performance and minimize I/O load on the origin, the system uses an eventually consistent replication model. A user in Tokyo requests `logo.png`, which is served from a local edge cache. Seconds later, a developer in London updates `logo.png` on the origin server. A different user in Tokyo requests `logo.png` again, 30 seconds after the update. Drawing on your knowledge of I/O performance and consistency models, explain the potential conflict between user experience (latency), system performance (I/O load), and data correctness in this scenario.

**Exercise 6**
You are the lead architect for a new cloud-based electronic health record (EHR) system. The system must guarantee that patient records are never lost or corrupted (strong consistency) and must remain accessible to hospitals even if an entire data center fails (high availability). Your infrastructure relies on containerized microservices managed by an orchestrator like Kubernetes. During a major network partition between two data centers, which aspect of the CAP theorem must your system sacrifice for its critical record-updating services? Propose a high-level design that uses a consensus algorithm (like Raft) to manage the state of patient records within this containerized environment, and explain how this design achieves its goals.

---

## Answer Key

**Answer 1**
The property that was sacrificed is **Consistency**.

**Reasoning:**
The CAP theorem states that a distributed system can only provide two of the following three guarantees: Consistency, Availability, and Partition Tolerance.
1.  **Partition Tolerance (P):** The scenario explicitly describes a network partition between the NA and EU clusters. The system continued to operate, so it is partition tolerant.
2.  **Availability (A):** Players in both regions could continue playing without interruption. This means the service remained available to users on both sides of the partition.
3.  **Consistency (C):** Because the system chose to remain available during a partition, it had to sacrifice consistency. This is demonstrated by the fact that the global leaderboard was not immediately consistent across all nodes. A player in Europe and a player in North America would see different (inconsistent) states of the leaderboard data at the same time. The system eventually synchronizes, which is a hallmark of an "eventually consistent" model, chosen to prioritize availability.

**Answer 2**
**Immediate State:**
Immediately after submitting their comments, User A in Dublin will see the original document plus their own comment. They will be unaware of User B's comment. Similarly, User B in San Francisco will see the original document plus their own comment, unaware of User A's comment. At this moment, the state of the document is inconsistent across the two servers.

**Eventual State:**
Over the next few seconds, as the replication messages propagate across the network, the Dublin server will receive User B's comment, and the San Francisco server will receive User A's comment. The system will then merge these changes. Both users will eventually see the document with both comments applied, likely ordered by their timestamps. This process demonstrates eventual consistency: the system is temporarily inconsistent but will converge to a consistent state over time without further updates.

**Answer 3**
**Raft** would be the more suitable choice for the team.

**Reasoning:**
The team's primary goals are maintainability and ease of debugging, not absolute performance. Raft was explicitly designed with understandability as a primary goal. It achieves this by decomposing the consensus problem into three more easily understood subproblems: leader election, log replication, and safety. Its state transitions and algorithms are generally considered easier for engineers to grasp and implement correctly compared to Paxos.

While Paxos is foundational and highly influential, it is notoriously difficult to understand and implement correctly. Its single-decree and multi-decree versions can be subtle and complex, making debugging a significant challenge, especially for a small team under pressure. Given the stated priorities, the operational simplicity of Raft is a much better fit.

**Answer 4**
**In the larger partition (4 nodes):** The write operation will **succeed**.
**In the smaller partition (3 nodes):** The write operation would **fail**.

**Reasoning:**
The system requires a write quorum (W) of 4, meaning at least 4 nodes must confirm the write.
1.  When the client connects to the partition with 4 nodes, it can successfully contact all 4 of them. Since 4 meets the quorum requirement of W=4, the write is acknowledged and succeeds.
2.  If the client were connected to the partition with only 3 nodes, it could not possibly get acknowledgements from 4 nodes. The write request would time out or be explicitly rejected because the quorum cannot be met.

This demonstrates fault tolerance because the system as a whole remains partially operational and can still make forward progress (accept writes) despite a partial failure affecting nearly half of its nodes. The quorum mechanism prevents a "split-brain" scenario where both partitions could accept conflicting writes, thus ensuring data consistency at the cost of availability in the smaller partition.

**Answer 5**
This scenario highlights the fundamental tradeoff between performance and consistency.

1.  **User Experience (Latency):** When the second Tokyo user requests `logo.png`, the CDN's goal is to serve it as fast as possible. The fastest way is to serve the version already cached at the local Tokyo edge server. This results in very low latency for the user.
2.  **System Performance (I/O Load):** Serving from the edge cache avoids a long-haul network request back to the origin server in London. This significantly reduces network traffic and I/O load on the origin server, allowing it to serve many more requests globally. This is a key principle of I/O performance optimization.
3.  **Data Correctness (Consistency):** Because the system is eventually consistent, the updated `logo.png` from London has not yet been replicated to Tokyo. Therefore, the Tokyo user is served a stale, outdated version of the image.

**Conflict:** The system prioritizes low latency and low origin I/O load by serving from the cache (Availability/Performance), but it does so at the expense of Strong Consistency. The user receives incorrect (stale) data. To guarantee the newest version, the edge server would have to check with the origin on every request ("read-through cache"), which would increase latency and I/O load, defeating many of the CDN's performance benefits.

**Answer 6**
**Sacrificed CAP Property:** During a network partition, the system must sacrifice **Availability** for its critical record-updating services. For an EHR system, guaranteeing that a record update is consistently applied across the system and never lost (Consistency) is paramount. Tolerating the partition is a given for a distributed system. Therefore, to maintain Consistency, a partitioned part of the system might have to refuse writes, thus becoming unavailable.

**High-Level Design Proposal:**
1.  **State Management:** The critical state (the "source of truth" for patient records) will be managed by a dedicated, resilient, stateful microservice cluster. The data itself could be stored in a replicated database, but the *log of state transitions* (e.g., "add allergy: penicillin to patient X," "update address for patient Y") must be managed via consensus.
2.  **Consensus with Raft:** This stateful cluster will run a Raft consensus group. Each container instance of this service will act as a Raft peer. The transaction log is replicated across these peers. A write operation (e.g., a record update) is only committed after it has been replicated to a majority of the peers in the Raft cluster. This ensures that even if some peers (containers) fail, the log is safe and consistent. The Raft leader is the single point for coordinating writes, preventing conflicts.
3.  **Interaction with Container Orchestrator:** Kubernetes would be responsible for ensuring that the desired number of Raft peer containers are always running. If a container or node fails, Kubernetes will automatically restart it on a healthy node. The new peer can then rejoin the Raft cluster and catch up on the replicated log from the leader.
4.  **Handling Partitions:** If a network partition splits the Raft cluster, only the partition with a majority of peers can elect a leader and continue processing writes. The minority partition cannot form a quorum, will not elect a leader, and will refuse any write requests it receives. This is how the system sacrifices availability in the minority partition to guarantee that there is only one true, consistent transaction log for the entire system. Stateless services can remain available in both partitions for read-only operations on cached or replicated data.