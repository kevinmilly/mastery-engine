## Exercises

**Exercise 1**
An e-commerce platform is experiencing a sudden increase in users reporting that their "Add to Cart" button is failing, but only for certain items. Your team needs to investigate. For each of the following questions, state which pillar of observability (Metrics, Logging, or Tracing) is the *primary* tool you would use to answer it and briefly explain why.

1.  What is the overall error rate for the "Add to Cart" API endpoint?
2.  What specific sequence of service calls led to a failure for a specific user's request?
3.  What was the exact request payload sent by a user who experienced the failure?

**Exercise 2**
You are instrumenting a new background job worker that processes video files uploaded by users. The worker pulls jobs from a message queue, downloads the video from a storage service, re-encodes it into three different resolutions, and then uploads the new files back to the storage service. Identify four key metrics you would implement for this worker. For each metric, specify its type (e.g., Counter, Gauge, Histogram) and explain what insight it would provide.

**Exercise 3**
A financial services company has implemented distributed tracing across its microservices architecture. However, engineers are complaining that the traces are "too noisy" and difficult to use for debugging. They observe that a single user request to the API gateway generates a trace with over 500 spans, many of which are for trivial, synchronous function calls within a single service (e.g., `validate_input()`, `format_currency()`). What is the likely conceptual mistake in their instrumentation strategy, and what specific recommendation would you give them to make the traces more useful?

**Exercise 4**
A team is managing a high-throughput logging pipeline that ingests data from hundreds of microservices. They are facing rapidly increasing storage costs. They've identified that the vast majority of log volume consists of "INFO" level logs detailing successful requests. They propose two potential solutions to reduce costs:

1.  **Solution A: Sampling.** Keep 100% of `WARN` and `ERROR` logs, but only ingest 5% of `INFO` level logs.
2.  **Solution B: Aggregation.** Stop logging individual `INFO` level events. Instead, have each service instance emit a single metric every minute: a counter of successful requests (`http_requests_success_total`).

Analyze the tradeoffs between these two solutions. Which critical debugging capability is lost with Solution B that is preserved (to some degree) with Solution A?

**Exercise 5**
A globally distributed social media application uses a sharded database architecture, with user data sharded by `user_id`. The application guarantees read-after-write consistency. Recently, users in the EU region have been reporting that after they update their profile, they see the old information for several seconds before the new data appears. This issue is not being reported in other regions.

Design an observability plan to diagnose this issue. Describe how you would use metrics, logs, and traces together to distinguish between the following potential causes:
- A "hot shard" issue where a specific database shard is overloaded.
- A network partition event between the application servers and the primary database replica for EU shards (a CAP theorem scenario).
- A cache-invalidation bug in the EU-region application servers.

**Exercise 6**
You are the lead engineer for a small but growing startup. Your entire application is currently a single monolithic service backed by a single database. The business wants to start breaking the monolith into microservices to enable faster feature development by independent teams. Your observability is currently limited to basic CPU/memory metrics and unstructured text logs stored in a file.

You have a budget for one observability vendor and only two engineers' time for the next three months to improve the situation before the first new microservice is launched. Propose a pragmatic, prioritized observability roadmap. Justify the order of your proposed initiatives, explaining how each step provides the most value for the effort invested at that stage of the company's architectural evolution.

---

## Answer Key

**Answer 1**
1.  **Pillar:** Metrics.
    **Reasoning:** An error *rate* is an aggregation of many events over time. Metrics are ideal for this kind of quantitative, aggregated view of system health. A time-series graph of this metric would immediately show the magnitude and start time of the problem.

2.  **Pillar:** Tracing.
    **Reasoning:** A distributed trace is designed to show the end-to-end journey of a single request as it passes through multiple services. It would visualize the full call graph, including timings and dependencies, allowing you to pinpoint which specific downstream service call is failing or introducing latency.

3.  **Pillar:** Logging.
    **Reasoning:** Logs are designed to capture discrete, context-rich events. To see the *exact* request payload, you would need a log entry for that specific event, which would contain the detailed, high-cardinality information of the request body. This level of detail is not suitable for metrics or traces.

**Answer 2**
Here are four key metrics for the video processing worker:

1.  **Metric:** `worker_queue_depth`
    *   **Type:** Gauge
    *   **Insight:** This measures the number of jobs currently waiting in the queue. A consistently high or rising value indicates that the workers cannot keep up with the rate of incoming jobs, suggesting a need to scale up the number of workers.

2.  **Metric:** `video_processing_duration_seconds`
    *   **Type:** Histogram
    *   **Insight:** This measures the time it takes to process a single video file. A histogram allows you to track not just the average time but also latency percentiles (p95, p99). A spike in the p99 latency could indicate that a few very large files are slowing down the system, even if the average is stable.

3.  **Metric:** `jobs_processed_total`
    *   **Type:** Counter
    *   **Insight:** A simple counter of completed jobs, often with a status label (e.g., `status="success"` or `status="failure"`). This provides a clear measure of throughput and allows for calculating the overall success/error rate of the worker.

4.  **Metric:** `file_downloads_bytes_total`
    *   **Type:** Counter
    *   **Insight:** This tracks the total bytes downloaded from the storage service. It is useful for understanding the workload characteristics (are jobs getting larger on average?) and for cost monitoring, as cloud storage services often charge based on data egress.

**Answer 3**
**Conceptual Mistake:** The team is over-instrumenting at the wrong level of abstraction. They are treating tracing like a profiler, creating spans for internal, in-process function calls. The primary purpose of distributed tracing is to understand the interactions *between* system components (microservices, databases, caches, queues), not the internal logic of a single component.

**Recommendation:** The team should adjust their instrumentation strategy to only create spans for operations that represent a significant unit of work or involve crossing a network boundary. This includes:
- Incoming API requests to a service.
- Outgoing client requests to another service (e.g., HTTP, gRPC).
- Queries to a database.
- Messages published to or consumed from a message queue.

By limiting spans to these I/O-bound or service-boundary operations, the resulting traces will be much cleaner, showing a clear causal chain of distributed interactions. This makes it far easier to spot which service-to-service call is the source of latency or error in a distributed request.

**Answer 4**
**Analysis of Tradeoffs:**

*   **Solution A (Sampling):**
    *   **Pros:** It directly addresses the cost problem by reducing log volume. Crucially, it retains the ability to inspect the detailed context of *some* successful requests. This can be vital for debugging logic errors that don't throw an exception (e.g., "Why was the wrong discount applied for this user?") because you can still find example payloads and see the application's behavior.
    *   **Cons:** You lose 95% of the data. If a specific user reports a problem with a successful-but-incorrect transaction, there is only a 5% chance you'll have the corresponding log entry. It makes investigating specific, non-error events a game of chance.

*   **Solution B (Aggregation):**
    *   **Pros:** This is even more effective at reducing data volume and cost, as individual events are replaced by a single data point per minute. It provides an excellent high-level overview of system health and throughput.
    *   **Cons:** It completely eliminates the ability to inspect the context of any individual successful request. You know *that* 10,000 requests succeeded in a minute, but you have no information about *what* those requests were (e.g., which users, which products, what payloads).

**Critical Capability Lost:** Solution B loses the capability for **exploratory debugging of non-error-producing bugs**. With aggregation, you can only answer "how many?" or "how fast?". With sampling (Solution A), you can still, albeit unreliably, answer "what happened for this specific request?". This ability to inspect the details of an individual event is a core function of logging that is completely lost when those events are pre-aggregated into metrics.

**Answer 5**
Here is an observability plan to diagnose the issue, using the three pillars to differentiate between the potential causes:

1.  **Metrics (Initial Triage):**
    *   **Database Metrics:** Monitor CPU utilization, I/O operations (IOPS), and query latency, all broken down by database shard. If one shard (likely containing EU users) shows significantly higher load or latency than others, this points towards a **hot shard** issue.
    *   **Application Metrics:** Implement a custom metric `cache_hit_ratio` for the profile data cache, dimensioned by region (`region="EU"`). A significantly lower cache hit ratio in the EU compared to other regions would suggest a **cache-invalidation bug**.
    *   **Network Metrics:** Monitor network error counters and round-trip-time (RTT) between EU application servers and the primary database replicas. A sudden spike in errors or RTT that correlates with user reports would point towards a **network partition**.

2.  **Distributed Tracing (Isolating the Latency):**
    *   Instrument the profile update and profile read requests. A complete trace will show the end-to-end latency and the time spent in each component.
    *   If the trace for an EU user's profile read shows a long delay specifically in the database query span (`db.query`), it reinforces the **hot shard** or **network partition** theories.
    *   If the trace shows that the read request is not even going to the database (i.e., a very fast response from the application), but the user is still seeing old data, this strongly points to an incorrect response being served from a stale cache, indicating a **cache-invalidation bug**. The trace proves the database was never contacted.

3.  **Logging (Confirming the Root Cause):**
    *   **For Cache Invalidation:** Add structured logs for cache events (e.g., `{"event": "cache_write", "key": "user:123", "region": "EU"}` and `{"event": "cache_read", "key": "user:123", "status": "hit"}`). When a user reports an issue, you can search the logs for their `user_id`. If you see a log for the profile update *not* followed by a `cache_write` or `cache_evict` log, you've found your bug.
    *   **For Network Partition:** In the case of a failed write to the primary DB replica, the application code should log a detailed error including the target database host and the specific network error message. Correlating these `ERROR` logs with the high network error metrics would confirm a **network partition**. CAP theorem comes into play here: the system may be choosing availability (allowing reads of stale data) over consistency during the partition.

By using the pillars in concert—metrics to detect anomalies, traces to isolate where latency occurs, and logs to find the specific contextual error or event—the team can effectively distinguish between these complex failure modes.

**Answer 6**
This is a pragmatic, prioritized roadmap for introducing observability to a monolith preparing for a microservices decomposition, given the constraints.

**Phase 1: Foundational Visibility (Months 0-1)**

*   **Initiative:** Implement **Centralized, Structured Logging**.
*   **Justification:** This is the highest-leverage first step. Moving from scattered log files to a centralized system (e.g., using a vendor's agent) with structured logs (e.g., JSON format) provides immediate value. It makes debugging the *existing monolith* easier, which is critical for stability during the transition. Structured logs are machine-readable, enabling powerful queries (`show me all logs for user_id=123`) that are impossible with plain text. This foundation is essential before adding more services, as it creates a single place to view logs from both the old and new systems.
*   **Effort:** Relatively low. Libraries for structured logging are mature. The main work is instrumenting key parts of the code and configuring the log agent.

**Phase 2: Key Service-Level Metrics (Month 2)**

*   **Initiative:** Instrument the monolith with **Application-Level Metrics** (The "RED" method: Rate, Errors, Duration).
*   **Justification:** Before breaking things apart, you need a clear baseline of the monolith's performance. Instrumenting key API endpoints and business transactions to track request rate, error rate, and request duration (as a histogram) provides a high-level health check. This is crucial because once the first microservice is split off, you can compare its RED metrics to the monolith's baseline to ensure performance hasn't degraded. This is far more insightful than just CPU/memory.
*   **Effort:** Moderate. Requires adding a metrics library (like Prometheus client) and adding instrumentation code at the web framework middleware layer.

**Phase 3: Preparing for Distribution (Month 3)**

*   **Initiative:** Implement **Context Propagation and Basic Tracing**.
*   **Justification:** As soon as you have two services, you will need to track requests between them. The most critical piece of this is **context propagation**: ensuring that a unique request ID (e.g., a `trace_id`) generated at the edge is passed in the headers of every subsequent network call.
    *   **Step 3a (Low Effort):** Start by simply adding a request ID to all structured logs in both the monolith and the new service. This allows you to manually correlate all logs for a single request, which is a massive debugging win.
    *   **Step 3b (Higher Effort):** If time permits, wire this context up to a full distributed tracing system provided by the vendor. This provides the UI visualization. However, even just having the `trace_id` in the logs (Step 3a) is an 80/20 solution that prepares you for a distributed world without the full implementation overhead.

**Summary Justification:** This roadmap prioritizes a "crawl, walk, run" approach. It starts with the highest ROI activity (structured logging), then establishes a performance baseline (metrics), and finally prepares for the immediate challenge of a multi-service architecture (context propagation). It avoids the high cost and complexity of a full-blown tracing implementation on day one, instead focusing on foundational pieces that provide incremental value and are prerequisites for more advanced observability later.