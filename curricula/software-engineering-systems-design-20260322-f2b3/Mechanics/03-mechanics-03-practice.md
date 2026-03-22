## Exercises

**Exercise 1**
An online forum's "user profile" service is extremely read-heavy, as profiles are viewed far more often than they are updated. However, when a user does update their profile (e.g., changing their display name), the change must be reflected immediately on subsequent views. Which caching pattern—cache-aside, write-through, or write-back—is most suitable for this service? Justify your choice.

**Exercise 2**
A microservice for retrieving product information receives 20,000 requests per second. The service uses a distributed cache. 92% of requests are cache hits, with an average latency of 2ms. The remaining 8% are cache misses, which require a database query, resulting in an average latency of 80ms. Calculate the average request latency for the microservice.

**Exercise 3**
A video game company uses a write-back cache for its player-ranking service to handle the high volume of score updates at the end of matches. During a tournament, the cache service cluster crashes and cannot be recovered for several minutes. When the service is restored, players report that their rankings and recent match results from the last few minutes before the crash are gone. What is the most likely reason for this data loss, and what specific risk of the write-back pattern does it highlight?

**Exercise 4**
A content management system (CMS) caches articles to speed up website load times. The cache uses a Time-to-Live (TTL) of 30 minutes for all articles. The legal department identifies a factual error in a published article that must be corrected immediately. An editor updates the article in the database, but users continue to see the incorrect version. Besides waiting for the TTL to expire, describe an additional cache invalidation mechanism the developers could implement to solve this problem for urgent updates.

**Exercise 5**
A booking system uses a cache-aside pattern and a primary-replica database architecture. Writes go to the primary database, and reads are load-balanced across several read replicas to handle high traffic. The application logic for an update is:
1.  Update the record in the primary database.
2.  Invalidate the corresponding entry in the cache.

A user changes their flight reservation. A moment later, they refresh the page. The application gets a cache miss, and the subsequent read request is routed to a read replica that has not yet synchronized with the primary database. What specific data consistency issue will the user experience, and how could you modify the read-after-miss logic to prevent it?

**Exercise 6**
A company's API is deployed on three identical server instances behind a round-robin load balancer. To improve performance, each server instance is configured to use its own private, in-memory cache for frequently requested data. A mobile client makes five consecutive `GET` requests for the same popular data resource. Why might this architecture lead to a surprisingly low cache hit rate, and what fundamental change to the caching strategy is needed to fix it?

---

## Answer Key

**Answer 1**
The most suitable pattern is **cache-aside**.

**Reasoning:**
Cache-aside prioritizes data consistency while still providing performance benefits for read-heavy workloads.
1.  **Reads:** The application first checks the cache. If the data is there (cache hit), it's returned quickly. If not (cache miss), the application reads the data from the database, loads it into the cache, and then returns it. This is ideal for the high volume of profile views.
2.  **Writes:** The application writes the update directly to the database and then invalidates the old entry in the cache. The next read for that profile will trigger a cache miss, forcing a fetch of the newly updated data from the database. This directly addresses the requirement for updates to be reflected immediately.

*Write-through* would also work for consistency but adds write latency, which is unnecessary here as writes are infrequent. *Write-back* would offer the best write performance but risks data inconsistency if the cache fails before writing to the database, which is unacceptable for this use case.

**Answer 2**
The average request latency is 8.24ms.

**Method:**
The average latency is a weighted average of the latencies for cache hits and cache misses.

1.  **Calculate the weight of cache hits and misses:**
    *   Cache hit probability = 92% = 0.92
    *   Cache miss probability = 8% = 0.08

2.  **Calculate the latency contribution of each case:**
    *   Latency from hits = (Hit probability) × (Hit latency) = 0.92 × 2ms = 1.84ms
    *   Latency from misses = (Miss probability) × (Miss latency) = 0.08 × 80ms = 6.40ms

3.  **Sum the contributions to find the average latency:**
    *   Average Latency = (Latency from hits) + (Latency from misses)
    *   Average Latency = 1.84ms + 6.40ms = 8.24ms

**Answer 3**
The most likely reason for the data loss is that the score updates were held in the write-back cache's memory but had not yet been "written back" (persisted) to the main database when the cache cluster crashed.

**Risk Highlighted:**
This incident highlights the primary risk of the write-back pattern: **potential for data loss on cache failure**. In this pattern, the application writes data to the cache and acknowledges the write immediately. The cache then asynchronously writes the data to the database at a later time. If the cache fails before this asynchronous write completes, any data that was "in-flight" is permanently lost. This trade-off is made to achieve extremely low write latency, but it comes at the cost of durability.

**Answer 4**
The developers could implement an **explicit invalidation** or **active cache purging** mechanism.

**Implementation:**
When the editor saves the urgent update in the CMS, the application would not only write the change to the database but also execute a command to explicitly delete that specific article's key from the cache.

This would work alongside the TTL policy. The TTL acts as a default, catch-all expiration for stale data. The explicit invalidation provides a direct, immediate way to purge specific cache entries on-demand, ensuring that critical updates are reflected instantly without having to flush the entire cache or wait for the 30-minute TTL to expire. The next request for that article would result in a cache miss, forcing the application to fetch the corrected version from the database.

**Answer 5**
The user will experience **stale reads**, seeing their old flight reservation information even after receiving a confirmation that it was updated.

**Reasoning:**
The problem is caused by **replication lag**. The primary database has the new data, but the read replica the application queries does not. The cache-aside logic is correct in principle, but it doesn't account for the state of the database cluster.

**Mitigation:**
To prevent this, the read-after-miss logic should be modified to **read from the primary database**. When a cache miss occurs for data that is known to be frequently updated (like a user's active reservation), the application should direct its read query specifically to the primary database. This ensures it retrieves the most up-to-date, authoritative data. This data is then used to populate the cache. Subsequent reads for that data can be served from the cache or from any replica without issue until the next update.

**Answer 6**
The low cache hit rate is caused by the use of **local, in-memory caches** in a load-balanced environment.

**Reasoning:**
The round-robin load balancer distributes requests sequentially across the three instances.
*   Request 1 goes to Server A. Server A has a cache miss, fetches the data, and stores it in its *local* cache.
*   Request 2 goes to Server B. Server B has no knowledge of Server A's cache. It also experiences a cache miss, fetches the data, and stores it in its own *local* cache.
*   Request 3 goes to Server C, leading to another cache miss.
*   By the time the fourth request comes back to Server A, it will finally be a cache hit.

This means that for any given resource, you need N requests (where N is the number of servers) before you achieve a consistent cache hit. The data is cached, but it's duplicated across all instances and not shared, leading to redundant database queries.

**Fundamental Change Needed:**
The architecture should be changed to use a **centralized, distributed cache** (e.g., Redis, Memcached). All three server instances would connect to this single, shared cache cluster. When Server A fetches data and caches it, Server B and Server C can immediately access that same cached data on subsequent requests, regardless of which server the load balancer chooses. This solves the data duplication problem and dramatically increases the cache hit rate.