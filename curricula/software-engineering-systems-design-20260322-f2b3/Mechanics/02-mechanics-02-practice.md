## Exercises

**Exercise 1**
An e-commerce platform uses a master-slave database replication strategy for its product reviews service. A user submits a new review (a write operation directed to the master). They immediately refresh the product page (a read operation), but their review is not visible. Assuming the write to the master was successful, explain the most likely reason for this behavior based on the master-slave architecture.

**Exercise 2**
A company wants to run heavy, complex analytical queries for its business intelligence dashboard. These queries must not impact the performance of the main application database, which handles live user transactions. The data for the dashboard can be a few seconds out of date without issue. Which replication strategy (master-slave or multi-master) is the most straightforward and appropriate choice for this use case, and where should the analytical queries be directed? Justify your choice.

**Exercise 3**
A social media application uses a single-master (leader-follower) replication setup with one master and two follower replicas. The master database server suddenly experiences a complete hardware failure and goes offline. Describe the immediate impact on the application's ability to handle (a) new user posts (writes) and (b) users browsing existing content (reads).

**Exercise 4**
A company is building a real-time collaborative document editor for a global user base. Users are located in both North America and Europe. A primary design goal is to minimize write latency for all users, ensuring their changes appear quickly. Compare the suitability of a single-master setup (with the master in North America) versus a multi-master setup (with a master in both North America and Europe) for achieving this goal. Which strategy is likely to perform better for write operations, and what is the key trade-off it introduces?

**Exercise 5**
You are designing the architecture for a high-traffic news website that uses a leader-follower (master-slave) database setup with one leader and three followers. A load balancer sits in front of the application servers that query the database. To maximize read scalability and ensure data consistency, how should you configure the system to route database queries for (a) users reading articles and (b) journalists publishing new articles? Explain the logic behind this routing configuration.

**Exercise 6**
A financial technology company is designing a critical system for recording stock trades. The system must have very high availability, even if an entire data center fails. They are considering a multi-master replication strategy with masters in two geographically separate data centers (New York and London). Given the absolute requirement for data integrity in a financial system, what is the most significant risk of this architecture, and why is it particularly dangerous for this specific use case?

---

## Answer Key

**Answer 1**
The most likely reason is **replication lag**. In a master-slave setup, write operations occur on the master database, and these changes are then asynchronously copied to the slave databases. The user's read request to view the page was likely routed to a slave replica that had not yet received the new review data from the master. This delay, while often short, means that the slave's data can be slightly out of date, leading to this kind of "read-your-own-writes" inconsistency.

**Answer 2**
The most appropriate choice is a **master-slave (or leader-follower) strategy**.

*   **Strategy:** Create a read replica (a slave/follower) of the main application database.
*   **Routing:** All heavy analytical queries for the BI dashboard should be directed exclusively to this read replica.
*   **Justification:** This approach effectively isolates the analytical workload from the transactional workload. The main database (the master) is not burdened by the slow, resource-intensive queries and can dedicate its resources to handling live user traffic. Since the dashboard can tolerate slightly stale data, the inherent replication lag of this model is acceptable.

**Answer 3**
*   **(a) Impact on Writes (New Posts):** All write operations will fail immediately. In a single-master setup, only the master can accept writes. With the master offline, there is no database instance available to process new posts, user registrations, or any other data modifications. The system is in a "read-only" state.
*   **(b) Impact on Reads (Browsing):** Read operations can continue to be served successfully by the two follower replicas. Users can browse existing content, read old posts, and view profiles. However, the data they see will become progressively stale as no new updates can be written to the system.

**Answer 4**
A **multi-master setup** is likely to perform better for minimizing write latency.

*   **Performance:** In a single-master setup based in North America, a user in Europe must send their write request across the Atlantic, incurring high network latency. With a multi-master setup, the European user's write can be handled by the local master in Europe, resulting in significantly lower latency. The same is true for the North American user.
*   **Key Trade-off:** The primary trade-off is the increased complexity of **write conflict resolution**. Since multiple masters are accepting writes independently, it's possible for two users to edit the same part of a document simultaneously, creating a conflict. The system must have a robust and well-defined mechanism to detect and resolve these conflicts, which is a non-trivial engineering challenge.

**Answer 5**
The system should be configured with application-level or proxy-level routing logic to direct database traffic based on the type of operation.

*   **(a) Users reading articles (Reads):** These are read operations. They should be distributed by the load balancer across the **three follower replicas**. This spreads the read load, preventing any single database instance from becoming a bottleneck and fully utilizing the replicated infrastructure for read scalability.
*   **(b) Journalists publishing articles (Writes):** These are write operations. They must **always be routed directly to the single leader (master)** database. This is the only instance in the configuration that can accept writes, ensuring that all changes are made to the authoritative source and then propagated consistently to the followers.

**Answer 6**
The most significant risk is **write conflict and data divergence**.

*   **Risk:** In a multi-master setup, two different masters can accept writes concurrently. Due to network latency between New York and London, it's possible for two conflicting transactions to be committed locally before they are replicated to the other master. For example, an automated system in New York could sell 100 shares of a stock, while a trader in London simultaneously sells the same 100 shares.
*   **Why it's Dangerous:** For a financial system, this is catastrophic. A naive conflict resolution (e.g., "last write wins") could lead to one trade overwriting the other, causing an incorrect ledger and financial loss. The system might end up in an inconsistent state where New York's database shows one reality and London's shows another. Ensuring transactional atomicity and a perfect, auditable conflict resolution strategy across geographically distributed masters is extremely complex and a single point of critical failure. An error here could corrupt financial records, violate regulations, and cause massive financial discrepancies.