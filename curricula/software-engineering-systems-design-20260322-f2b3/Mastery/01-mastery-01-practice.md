## Exercises

**Exercise 1**
You are designing the backend system for an airline booking website. A network partition occurs that separates the database replica in London from the replica in New York. A user connected to the New York server attempts to book the last available seat on a flight, while a user connected to the London server simultaneously attempts to book the same seat. Which property, Consistency or Availability, should the system prioritize in this scenario, and why?

**Exercise 2**
Consider a distributed system that aggregates and displays real-time analytics for a popular live-streaming event, such as the number of current viewers. During a network partition, some data collection nodes are unable to communicate with the central aggregation server. If the system is designed to be an AP (Available, Partition-tolerant) system, what would a user viewing the analytics dashboard likely experience during this partition?

**Exercise 3**
A development team is building a new social media platform using a database that is strongly consistent (a CP system). The platform has a feature that allows users to "like" a post. The product manager wants the "like" action to feel instantaneous to the user, with the like counter updating immediately on their screen. Analyze the potential conflict between the chosen database architecture (CP) and this user experience requirement, especially under conditions of high latency or partial network failure.

**Exercise 4**
You are an architect for a large-scale Internet of Things (IoT) platform that manages smart home devices (lights, thermostats, etc.). The system has two primary functions:
1.  Users can send commands to their devices (e.g., "turn on lights").
2.  The system logs all historical device activity for auditing and user review.

During a network partition that isolates a user's home network from your central servers, how would you apply different CAP trade-offs for these two distinct functions? Justify your reasoning for each.

**Exercise 5**
You are designing a distributed locking service. This service provides a "lock" that ensures only one client can access a critical resource at a time. The service must guarantee that it never, under any circumstances, grants the same lock to two different clients simultaneously. A junior engineer suggests building this service on an AP database like Apache Cassandra to ensure the lock service itself is highly available. Evaluate this suggestion. What is the fundamental flaw in this approach, and what would be the consequences of implementing it?

**Exercise 6**
A major e-commerce platform wants to add a "flash sale" feature, where a limited-stock, high-demand item is sold at a deep discount for a very short period. The architecture team is debating the system design.

-   **Team A argues:** "We must prioritize Consistency (CP). We cannot sell more items than we have in stock. The system should reject orders if it cannot confirm the current inventory count, even if it means some users see an error message."
-   **Team B argues:** "We must prioritize Availability (AP). Turning away customers during a flash sale is a business disaster. We should accept all incoming orders and deal with any overselling later by cancelling the unlucky orders and offering an apology coupon."

Synthesize these two positions. Propose a more nuanced system design that attempts to balance these competing requirements. Your proposal should describe the system's behavior before and during the sale, and how it handles the risk of a network partition.

---

## Answer Key

**Answer 1**
The system should prioritize **Consistency (C)**.

**Reasoning:**
In a booking system, the integrity of the transaction is critical. Selling the same seat twice (a double-booking) would lead to significant customer dissatisfaction and operational problems. By choosing Consistency, the system guarantees that once a seat is booked, all parts of the system reflect that reality.

During the partition, a CP system would likely make one of the database replicas unavailable for write operations (booking the seat). For example, the New York server might be unable to commit the transaction until it can re-establish communication with the London server to confirm the state of the seat. While this reduces availability (the user in New York might see a loading spinner or an error message), it prevents the data corruption of a double-booking, which is the more severe business problem in this context.

**Answer 2**
A user viewing the analytics dashboard of an AP system would likely experience **stale or partially inaccurate data**.

**Reasoning:**
An AP system prioritizes Availability, meaning it will continue to respond to requests even during a partition. In this scenario, the central aggregation server, unable to hear from some data collection nodes, would continue to serve requests based on the data it *can* access. This means the viewer count it displays would represent only the viewers reported by the connected nodes. The total count would be lower than the actual number of viewers, but the system would remain online and responsive, which is often the primary goal for non-critical monitoring systems. The count would eventually become accurate again once the partition heals.

**Answer 3**
The conflict arises because a CP system must sacrifice availability (in this case, low-latency responses) to guarantee consistency across all nodes.

**Reasoning:**
1.  **Consistency Requirement:** For the "like" to be recorded in a CP system, a write operation must be propagated and acknowledged by a quorum of database replicas before the operation is confirmed to the user.
2.  **User Experience Requirement:** An "instantaneous" update implies a very low-latency response.
3.  **The Conflict:** Under high network latency or a partial failure, the time it takes to achieve a quorum and confirm the write can become significant. The user's client would have to wait for this confirmation, resulting in a noticeable delay between clicking "like" and seeing the counter update. This directly contradicts the product manager's goal. To solve this, the team might need to implement an optimistic UI update (updating the screen immediately) while the write happens in the background, but this introduces its own complexity for handling write failures.

**Answer 4**
The two functions require different CAP trade-offs.

1.  **Sending Commands (Prioritize Availability - AP):** For a user to control their own smart home devices, the system must be available even if the home is disconnected from the internet. The commands should be processed locally. This implies an AP approach where the local home hub remains available to the user's app on the same network. The state between the local hub and the central servers will be inconsistent during the partition, but this is an acceptable trade-off for the crucial functionality of controlling one's lights. The commands can be queued and synced with the central servers once the partition heals.

2.  **Logging Historical Activity (Prioritize Consistency - CP):** The audit log must be a single, authoritative source of truth. There should be no conflicting histories. Therefore, this part of the system should be CP. During a partition where a local hub cannot reach the central logging service, it should buffer the logs locally. It should not attempt to create a separate, parallel history. When the partition heals, the buffered logs can be sent to the central server in the correct order to be integrated consistently. Forcing consistency ensures the historical record is reliable and unambiguous.

**Answer 5**
The fundamental flaw is that an AP system, by definition, cannot guarantee the global uniqueness required by a distributed lock.

**Reasoning:**
A distributed lock's primary purpose is to ensure mutual exclusion, which is a form of strong consistency. It must guarantee that only one client holds the lock at any given time across the entire system.

In an AP system like Cassandra, during a network partition, clients connected to different partitions could both believe the lock is available. Each partition, prioritizing availability, would allow the client to write a "lock acquired" record. As a result, two different clients would be granted the same lock, completely violating the service's core promise. This could lead to data corruption or race conditions in the critical resource the lock was supposed to protect. A distributed locking service must be a CP system.

**Answer 6**
A balanced approach would involve a multi-phase design that changes its behavior and risk profile for the duration of the sale.

**Proposed Design:**

1.  **Pre-Sale Phase (CP Behavior):** Before the sale begins, the inventory system operates in a standard, strongly consistent (CP) mode. The exact number of items available for the flash sale is loaded into a dedicated, high-performance in-memory cache or database (like Redis) that is replicated across regions. The count is precise.

2.  **Sale Phase (Shift towards AP with Controls):**
    *   **Decentralized Stock Counts:** At the start of the sale, instead of every transaction hitting a single central database, each regional server or even each application instance works off a pre-allocated shard of the total inventory (e.g., if there are 10,000 items and 100 servers, each server is allocated a "budget" of 100 items to sell).
    *   **Availability Priority:** Each server can sell its allocated stock without coordinating with others, making the "add to cart" and "checkout" process extremely fast and available, even if some servers are partitioned from the central coordinator. This is an AP model at the local level.
    *   **Overselling Mitigation:** This sharded approach inherently limits the potential for a massive oversell. The maximum oversell is constrained by how many shards might process a final transaction simultaneously. To further control this, the system can be designed to slightly *under-allocate* the total stock to the shards (e.g., allocate only 9,900 of the 10,000 items), holding the rest in reserve.

3.  **Post-Sale Reconciliation (Eventual Consistency):** After the sale window closes, the system stops accepting new orders. It then runs a reconciliation process. It collects the final sales counts from all the decentralized servers. If the total number of items sold exceeds the actual inventory, a predetermined policy is executed (e.g., orders are cancelled on a first-come-first-served or last-come-first-served basis), and apology coupons are automatically issued.

**Justification:** This hybrid approach acknowledges that neither pure CP nor pure AP is ideal. It uses CP when data integrity is paramount (pre-sale) and shifts to a controlled AP model when availability and performance are critical for business success (during the sale). It contains the "blast radius" of inconsistency and plans for reconciliation, accepting a small, controlled business risk (overselling) in exchange for a vastly better customer experience during the high-traffic event.