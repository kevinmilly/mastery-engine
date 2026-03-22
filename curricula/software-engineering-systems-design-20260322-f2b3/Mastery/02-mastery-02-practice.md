## Exercises

**Exercise 1**
A photo-sharing application shards its `users` table using a hash-based strategy on the `user_id`. This provides excellent load distribution for profile lookups, which are done by `user_id`. The product team now wants to launch a "Discover" feature that allows users to browse for other users alphabetically by their `username`. What specific performance problem will this new feature create, and why is the current sharding strategy the direct cause?

**Exercise 2**
An e-commerce platform shards its `orders` table using range-based sharding on the `order_timestamp`. The ranges are partitioned by calendar month (e.g., Jan 2023 on Shard 1, Feb 2023 on Shard 2, etc.). The company is running a massive one-day "Black Friday" sale. Describe the hotspot problem this will create and identify which specific database shard(s) will be disproportionately affected.

**Exercise 3**
You are designing a system to store logs from a large, distributed network of servers. Each log entry contains a `timestamp`, `server_id`, and `log_message`. The two most common query patterns are:
1.  Fetching all logs from a specific `server_id` within a given time range.
2.  Aggregating the number of "ERROR" messages across *all* servers in the last 5 minutes.

You decide to shard the data using a composite key: `(server_id, timestamp)`. How would this sharding strategy efficiently handle the first query pattern? Conversely, explain the inefficiency it introduces for the second query pattern.

**Exercise 4**
A URL shortening service uses a hash-based sharding strategy on the full original URL to distribute data across its database shards. This works well for distributing write load. However, when a user tries to access a shortened link (e.g., `short.ly/xyz`), the service must first look up the original URL corresponding to "xyz". The table mapping short codes to original URLs is sharded by a hash of the short code.

A competing service claims their system is faster because they use a directory-based sharding strategy. How could a directory-based approach potentially offer lower latency for the read path (resolving a short link) compared to the hash-based sharding of the mapping table? What is the primary tradeoff or new risk introduced by this directory-based design?

**Exercise 5**
A large financial institution uses a directory-based sharding system for its customer accounts. A central "locator" service maps each `account_id` to its corresponding database shard. To maintain high availability, this locator service is replicated across multiple data centers. During a network partition event (where data centers cannot communicate), the system is configured to prioritize Availability over Consistency (AP in the CAP theorem).

A customer initiates a funds transfer, which requires writing to their account. Due to the network partition, their request is routed to a secondary data center whose locator service replica is slightly stale—it hasn't yet received an update that the customer's shard was recently moved for rebalancing. What is the dangerous inconsistency that could occur in this scenario, and how does the system's "AP" configuration contribute to this risk?

**Exercise 6**
You are the lead architect for a multi-tenant SaaS application that provides project management tools. Your database stores tasks, which belong to projects, which in turn belong to a customer `tenant_id`. You have two critical requirements:
1.  **Strict Data Isolation:** A query for one tenant must *never* be able to access data from another tenant, even accidentally.
2.  **Scalability:** The system must scale to millions of tenants, some of whom may be small startups while others are massive enterprises with millions of tasks.

You are debating two sharding strategies:
A. **Hash-based sharding on `task_id`:** A global, unique ID for every task in the system.
B. **Directory-based sharding on `tenant_id`:** Each tenant's data is guaranteed to be on a single shard (or set of shards). A lookup service maps `tenant_id` to the correct shard.

Choose one strategy. Write a justification that not only argues for your choice but also explicitly details how you would mitigate its primary weakness (e.g., query inefficiency for A, or noisy neighbors/hotspots for B).

---

## Answer Key

**Answer 1**
The performance problem will be scatter-gather queries. To display usernames in alphabetical order, the system cannot target a specific shard. Since the data is sharded by a hash of `user_id`, usernames that are alphabetically close (e.g., "Aaron", "Abby", "Adam") are randomly distributed across all database shards.

Therefore, to build a single page of the "Discover" feature, the application will have to query *every single shard*, ask each one for users whose usernames fall within the desired alphabetical range, and then aggregate and sort the combined results in the application layer. This is highly inefficient and scales poorly as the number of shards increases.

**Answer 2**
This will create a severe write hotspot. Range-based sharding by time means all new data is written to the same location. In this case, all orders generated during the Black Friday sale will be directed to the single shard responsible for the "November 2023" data range.

This single shard will have to handle 100% of the write traffic for the entire system, while all other shards (for previous months) will be relatively idle. This will overwhelm the CPU, I/O, and network resources of the target shard, leading to high latency, timeouts, and potential system failure.

**Answer 3**
**Efficiency for Query 1 (Fetching by `server_id`):**
A composite key `(server_id, timestamp)` would be highly efficient for this query. The sharding strategy would likely use `server_id` as the primary partitioning key. This means all logs for a given server are co-located on the same shard. When a query comes in for a specific `server_id`, the router knows exactly which shard to target. The query is sent to one and only one shard, where the data can be further filtered by the `timestamp` range. This avoids a costly scatter-gather operation.

**Inefficiency for Query 2 (Aggregating across all servers):**
This query becomes very inefficient. To count "ERROR" messages across *all* servers, the system cannot target a single shard. Since logs are partitioned by `server_id`, the query must be sent to *every single shard* in the cluster. Each shard will scan its data for relevant logs in the last 5 minutes, calculate a partial count, and return it. The application or a coordinating node must then gather all these partial counts and sum them up to get the final result. This is a classic scatter-gather problem that creates high network overhead and load on every database node.

**Answer 4**
**Potential Latency Improvement:**
A directory-based approach could be faster by eliminating a computational step and potentially a network hop. With hash-based sharding, the application or a routing layer must first compute the hash of the short code to determine the correct shard. In a directory-based model, the system could maintain an in-memory cache (like Redis or a routing service) of the directory. Resolving a short link would be a direct key-value lookup in this directory cache (`short_code` -> `shard_location`), which can be faster than computing a hash and then routing. This is especially true if the directory is small enough to be fully cached on every application server, avoiding a network call to a separate routing tier entirely.

**Primary Tradeoff/Risk:**
The primary tradeoff is that the directory becomes a single point of failure and a potential performance bottleneck. Unlike a decentralized hashing algorithm, all requests must consult the directory. If the directory service goes down, the entire URL shortening service is unavailable for reads. If it becomes slow, it adds latency to every single request. This introduces a critical dependency that must be made highly available and scalable, adding significant operational complexity compared to a stateless hash function.

**Answer 5**
**The Dangerous Inconsistency:**
The inconsistency that could occur is a **lost write** or a **stale read leading to incorrect state**. Here is the sequence:
1.  The customer's account data exists on Shard A.
2.  An administrator rebalances the system, moving the customer's account to Shard B. The central locator service is updated: `account_id` -> Shard B.
3.  A network partition occurs before this update propagates to the replica in the secondary data center. The replica's mapping is now stale: `account_id` -> Shard A.
4.  The customer's funds transfer request is routed to the secondary data center. It consults its stale directory and routes the write operation to Shard A.
5.  The write to Shard A succeeds, but this shard is no longer the system of record for this account.
6.  When the network partition heals, the system's true state is on Shard B. The transaction that was written to Shard A is effectively lost. Any subsequent read from the correct shard (Shard B) will not reflect this transfer.

**Contribution of "AP" Configuration:**
By choosing Availability over Consistency, the system is designed to continue accepting writes even when it cannot guarantee that all replicas of the directory service are consistent. It prioritizes keeping the service online over ensuring every operation is based on the absolute latest state. This choice directly enables the scenario where a write request is routed based on stale information, leading to the data inconsistency. A "CP" system would have instead returned an error for the request until the partition healed and consistency was restored.

**Answer 6**
**Chosen Strategy:** B. Directory-based sharding on `tenant_id`.

**Justification:**
The most critical requirement is **Strict Data Isolation**. Sharding by `tenant_id` is fundamentally superior for this goal. It ensures that all data for a single customer resides on a known, dedicated shard. This simplifies the application logic immensely—every query must be authenticated and contain a `tenant_id`, which is then used to route the request to the correct shard. This physical partitioning provides a strong safeguard against cross-tenant data leakage bugs, which would be a catastrophic failure for a multi-tenant SaaS. While hash-based sharding on `task_id` might distribute load more evenly by default, it scatters a single tenant's data across all shards, making isolation much harder to enforce and verify. Any query for a tenant's projects or tasks would require a complex and potentially error-prone scatter-gather operation.

**Mitigating the Primary Weakness (Noisy Neighbors / Hotspots):**
The primary weakness of sharding by `tenant_id` is the "noisy neighbor" problem: a single, massive enterprise tenant (a "hot" tenant) could overwhelm its dedicated shard, degrading performance for them and any smaller tenants who happen to be co-located on that same shard.

I would mitigate this with a tiered, dynamic rebalancing strategy:
1.  **Monitoring:** Implement robust, real-time monitoring of resource utilization (CPU, I/O, query throughput) on a per-shard and per-tenant basis.
2.  **Tiered Shard Classes:** Instead of one-size-fits-all shards, we would have different classes of hardware (e.g., standard-tier, performance-tier).
3.  **Dynamic Rebalancing:** When monitoring detects that a tenant is consistently consuming a disproportionate amount of resources and creating a hotspot, we trigger an automated workflow. This workflow would provision a new, dedicated shard (potentially from the performance-tier) and migrate *only that hot tenant's data* to the new shard. The directory service would then be updated to point the `tenant_id` to its new, isolated home.

This approach allows small tenants to be packed efficiently onto shared resources while giving large, demanding tenants the dedicated resources they need, solving the hotspot problem without sacrificing the core benefit of data isolation.