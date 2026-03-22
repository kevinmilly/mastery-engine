## Exercises

**Exercise 1**
An API endpoint responsible for processing user-uploaded images is experiencing significant performance degradation under load. System metrics for the service instances running this endpoint consistently show the following:
- CPU Utilization: 15-20%
- Memory Usage: Stable, well below limits
- I/O Wait Time: 75-85%
- Network Throughput: Low and spiky

Based on this profile, what is the most likely type of bottleneck? Propose two distinct, initial optimization strategies to investigate.

**Exercise 2**
A team is preparing to launch a new real-time bidding service for online advertising. They anticipate that the system will need to handle a sustained, high volume of requests 24/7. Their primary concern is not sudden spikes in traffic, but the system's stability and resource consumption (e.g., memory leaks, disk space exhaustion) over several days of continuous operation.

Which specific load testing methodology is most appropriate for validating this non-functional requirement? Justify your choice and identify two key metrics you would monitor during this test.

**Exercise 3**
A microservice that aggregates data from three other downstream services has a P99 latency of 2500ms, far exceeding its SLO of 500ms. A trace reveals the following timing for a typical slow request:
- Request received by aggregator: Timestamp 0ms
- Call to Service A sent: Timestamp 5ms
- Response from Service A received: Timestamp 205ms
- Call to Service B sent: Timestamp 210ms
- Response from Service B received: Timestamp 410ms
- Call to Service C sent: Timestamp 415ms
- Response from Service C received: Timestamp 2415ms
- Aggregation logic executes: Timestamp 2420ms
- Final response sent: Timestamp 2425ms

The initial assumption was that Service C is the bottleneck. However, the team for Service C insists their P99 latency is only 150ms. Assuming both your tracing data and Service C's team are correct, formulate a plausible hypothesis that explains this discrepancy. What specific system component is the likely bottleneck?

**Exercise 4**
A social media application's "timeline generation" service is CPU-bound due to the complex ranking and filtering logic it performs for each user. The service is currently deployed on a fleet of `m5.xlarge` instances. Management has approved a budget increase to address the performance issues. Two primary proposals are on the table:

1.  **Vertical Scaling:** Upgrade the entire fleet to `m5.2xlarge` instances, which have double the CPU cores and memory.
2.  **Horizontal Scaling:** Double the number of `m5.xlarge` instances and distribute the load across them.

Analyze the trade-offs between these two approaches. Describe a scenario where vertical scaling would be the superior choice and a different scenario where horizontal scaling would be more effective.

**Exercise 5**
An event-driven system for processing financial transactions uses a message queue to decouple the initial request capture service from the downstream ledger-writing service. Under high load, the system experiences a severe bottleneck. The queue depth grows rapidly, indicating the ledger writer cannot keep up. Profiling the ledger writer reveals it spends 90% of its time waiting for synchronous `COMMIT` operations on a sharded relational database. The database shards are partitioned by `customer_id`. The performance degradation is most acute during peak business hours when a few large institutional clients submit massive batches of transactions simultaneously.

Integrating your knowledge of event-driven architectures and data sharding, propose a multi-layered solution that addresses both the immediate database contention and the architectural weakness exposed by the "hot shard" problem.

**Exercise 6**
You are the lead engineer for a large e-commerce platform. During a flash sale, the entire site becomes sluggish. The primary symptom identified through your observability platform is that the `products` database, a PostgreSQL cluster, is exhibiting extremely high read latency. A quick check of a performance dashboard reveals that one specific query, designed to fetch product recommendations, is being executed tens of thousands of times per second and is consuming 80% of the database's query execution time. This query was recently deployed and seemed performant in staging.

Your head of infrastructure suggests immediately failing over to the read-replica database to serve all traffic while you debug the primary. Considering the principles of disaster recovery and performance tuning, evaluate this suggestion. What is the primary risk of this action? Propose a more precise, less disruptive immediate mitigation step, and outline the first two diagnostic actions you would take to find the root cause.

---

## Answer Key

**Answer 1**
**Bottleneck Identification:** The system is **I/O-bound**. The key indicator is the extremely high I/O wait time (75-85%), which means the CPU is mostly idle, waiting for input/output operations to complete. The low CPU utilization confirms that the processor is not the constraint.

**Proposed Optimization Strategies:**
1.  **Optimize Storage Operations:** The I/O bottleneck is likely related to reading the uploaded image from or writing the processed image to disk. We could investigate upgrading the storage medium (e.g., from HDD to provisioned IOPS SSDs) or moving the storage operations to a dedicated object store (like S3) which is optimized for this type of workload.
2.  **Introduce Asynchronous Processing:** Instead of processing the image synchronously within the API request, the endpoint could immediately save the raw image to a temporary, high-speed location (or an object store) and place a "process image" job onto a message queue. A separate fleet of workers can then pull from this queue to perform the I/O-intensive work, freeing up the API servers to handle new requests. This improves the API's responsiveness, though the user experiences a delay before the final processed image is ready.

**Answer 2**
**Methodology:** The most appropriate methodology is **Soak Testing**.

**Justification:** Soak testing (also known as endurance testing) is designed specifically to uncover issues that arise over extended periods of sustained load. This aligns perfectly with the requirement to check for resource consumption issues like memory leaks, unclosed database connections, or log file accumulation that would not be apparent in a shorter stress or spike test. The goal is to validate the system's long-term stability and reliability.

**Key Metrics to Monitor:**
1.  **Memory Utilization:** A gradual, steady increase in memory usage over the test period is a classic sign of a memory leak. The memory usage should remain relatively stable or exhibit a sawtooth pattern as garbage collection runs.
2.  **System Resource Handles:** This includes monitoring file descriptors, database connections, and thread counts. A continuous increase in these handles without release indicates a resource leak, which can eventually cause the system to crash.

**Answer 3**
**Hypothesis:** The bottleneck is likely **network congestion or saturation of the connection pool** between the aggregator service and Service C.

**Reasoning:**
The trace shows that 2000ms (from 415ms to 2415ms) is spent between sending the request to Service C and receiving the response. Since Service C itself only takes 150ms to process the request, the remaining ~1850ms is unaccounted for "on the wire."

This points to a problem in the communication layer. A plausible explanation is that the aggregator service makes many parallel requests to its downstream dependencies. While its connections to A and B are fast, it may be exhausting its connection pool for Service C. When a request for Service C needs to be made, it has to wait a long time for a connection to become available from the pool. This "wait time" occurs *within* the aggregator's process but *before* the request is actually transmitted over the network to Service C, thus explaining the massive latency that Service C's own metrics would never see.

**Answer 4**
**Analysis of Trade-offs:**
- **Vertical Scaling (Bigger Instances):**
    - **Pros:** Simpler to implement; no changes to application code or deployment configuration are typically needed. Can be effective for single-threaded applications or workloads that are difficult to parallelize.
    - **Cons:** There's an upper limit to how big a single instance can get. It's often more expensive per unit of compute power than horizontal scaling. It creates a larger single point of failure; if one large instance goes down, it has a bigger impact on capacity than if one small instance goes down.

- **Horizontal Scaling (More Instances):**
    - **Pros:** Offers better elasticity and resilience. The failure of a single instance has a smaller impact on overall system capacity. It is generally more cost-effective at large scale. It's the foundation for modern, cloud-native auto-scaling.
    - **Cons:** The application must be designed to be stateless or to handle state externally. It adds complexity to deployments, service discovery, and load balancing.

**Scenario for Vertical Scaling:** This would be the superior choice if the timeline generation logic had a significant portion that was single-threaded or had a large in-memory state (e.g., a large cache or data structure) that is difficult or inefficient to distribute across multiple instances. If the bottleneck is a single, heavy computation per request, giving that computation more cores can directly speed it up.

**Scenario for Horizontal Scaling:** This is more effective if the application is stateless and can easily handle many concurrent, independent requests. For a timeline service, where each user's request is independent of others, adding more instances to serve more users in parallel is a natural fit. This approach provides better fault tolerance and is the standard for handling high-throughput web services.

**Answer 5**
This problem requires a multi-layered solution that addresses both the database and the architecture.

**Layer 1: Immediate Database Mitigation**
- **Strategy: Asynchronous Commit / Group Commit.** Instead of committing each transaction individually, the ledger writer can be modified to batch multiple transactions from the queue and commit them together. This drastically reduces the number of synchronous `COMMIT` waits, which is the primary source of the I/O bottleneck. This directly attacks the 90% wait time revealed by profiling.

**Layer 2: Architectural Solution for Hot Shard**
- **Strategy: Decouple Ingestion from Processing Logic within the Event Stream.** The "hot shard" is caused by a single client (`customer_id`) overwhelming a single database partition.
    1.  **Introduce a "Pre-Processing" Kafka Topic:** Instead of writing directly to a topic partitioned by `customer_id`, the initial service writes all transactions to a single, highly-partitioned ingestion topic.
    2.  **Fan-out with Intelligent Partitioning:** A new, small service (e.g., using Kafka Streams) reads from this ingestion topic. Its job is to re-partition the data. For normal clients, it re-publishes the event to the final topic, partitioned by `customer_id`. However, for known large institutional clients (the source of the hot shards), it can use a different partitioning key, such as `customer_id + transaction_batch_id`. This effectively spreads the massive batch from one client across multiple partitions and, consequently, multiple consumer instances, preventing a single consumer from getting stuck and holding up the queue. This breaks up the "hot shard" at the application layer before it hits the database.

This combined solution alleviates the immediate database pressure (group commit) and fixes the underlying architectural flaw that allows one user to monopolize system resources (intelligent re-partitioning).

**Answer 6**
**Evaluation of Suggestion:** Failing over to the read-replica is a **high-risk and likely ineffective** action.

- **Primary Risk:** The core risk is **Replica Lag**. Read-replicas are updated asynchronously from the primary. Under high write load (as expected during a flash sale), the replica can fall significantly behind the primary. If you direct all read traffic to a lagging replica, users will see stale data (e.g., products showing as "in stock" when they have already sold out on the primary), which can lead to failed orders and a poor user experience. Furthermore, the replica has the same data and indexes as the primary, so the expensive query will also be expensive on the replica, meaning you would just be moving the bottleneck and potentially causing the replica to fall even further behind, jeopardizing disaster recovery capabilities.

**More Precise Immediate Mitigation:**
- **Step: Rate Limiting or Disabling the Recommendation Feature.** The most precise, immediate step is to use a feature flag to either temporarily disable the product recommendation component entirely or to severely rate-limit the execution of that specific query. This will immediately relieve the 80% load from the database, allowing critical-path queries (like "add to cart" and "checkout") to function correctly. This surgical approach restores site functionality for core e-commerce operations at the cost of a temporary degradation in a non-critical feature.

**First Two Diagnostic Actions:**
1.  **`EXPLAIN ANALYZE` the Query:** The absolute first step is to run `EXPLAIN ANALYZE` on the problematic query directly against the primary database. This will provide the actual query execution plan, showing which indexes are being used (or not used), the type of joins, the number of rows scanned, and where the time is being spent. This will likely reveal the root cause, such as a missing index, a poor join strategy, or an unexpected table scan.
2.  **Check Query Parameters:** Investigate the specific parameters being passed to the query during the flash sale. It's possible the query is performant for most inputs but becomes pathologically slow for a specific, popular product or category being requested during the sale (a data-dependent performance issue). The application logs or a query monitoring tool would reveal this.