## Exercises

**Exercise 1**
A legacy, monolithic airline booking system has a tightly-coupled "Pricing Engine" module. You've been tasked with replacing this module with a new, standalone microservice that uses a more sophisticated pricing algorithm. Your primary constraint is that the replacement must happen with zero downtime for the main booking application. Outline the first three distinct steps you would take to apply the Strangler Fig pattern for this migration. What is the single most critical component in this pattern that enables the non-disruptive switchover?

**Exercise 2**
You are refactoring the data serialization logic in a high-throughput messaging service, moving from a custom binary format to Protobuf for better cross-platform compatibility. The change is risky because any serialization error could lead to data loss. You plan to use a feature flag to deploy the change. Describe a two-stage rollout strategy for this flag that minimizes risk to production data. For each stage, specify the target population (e.g., which requests or users) and the key metric you would monitor to validate the change before proceeding.

**Exercise 3**
A social media company's core "Feed Generation" service is a single, large application that is becoming a bottleneck. Two senior engineers propose different evolution strategies:
- **Engineer A** proposes a "branch-by-abstraction" refactoring. They would create an abstraction layer over the existing feed generation logic, build the new implementation behind this layer, and then switch over once it's complete. This would all happen within the existing service's codebase.
- **Engineer B** proposes using the Strangler Fig pattern. They would introduce a proxy and incrementally route feed generation requests for low-traffic user groups to a completely new microservice, strangling the old implementation over time.

Analyze the trade-offs between these two approaches. In a scenario where the primary goal is to improve developer velocity and enable independent team deployments, which strategy is more suitable and why?

**Exercise 4**
A video streaming service has a "Recommendations" component that was built quickly to meet a launch deadline. To save time, the algorithm was hardcoded to only consider a user's direct watch history. The system now needs to evolve to incorporate more complex inputs like "likes," "shares," and real-time trends. However, every part of the codebase that needs recommendations calls the `get_recommendations(user_id)` function directly, making it impossible to add new parameters without a massive, coordinated change across dozens of services.

Identify the specific technical debt pattern at play here. Propose a concrete, two-step refactoring plan that would decouple the client services from the recommendation algorithm's implementation, allowing the algorithm to evolve independently without requiring immediate changes to its consumers.

**Exercise 5**
You are leading the gradual migration of a monolithic inventory management system to a new event-driven architecture. You are using the Strangler Fig pattern, with a facade routing write requests (e.g., "update stock count") to both the new and old systems for a period of data consistency validation. Your system must be highly observable to ensure a safe migration.

Integrating your knowledge of observability, what specific kind of metric or check should the facade implement *after* performing a dual-write to both systems? Explain how this check, combined with distributed tracing, would allow you to safely automate the decision to roll back or flag a transaction for manual review, thereby improving upon a simple "fire-and-forget" dual-write.

**Exercise 6**
A healthcare data platform stores patient records in a large, sharded monolithic database. To comply with new data sovereignty regulations (e.g., GDPR), the platform must be refactored to ensure a patient's data is physically stored in their home country's data center. The current sharding key is `patient_id`, which has no correlation to geography. This refactoring requires a massive, live data migration without violating security protocols or causing downtime.

Design a high-level system evolution strategy that addresses this challenge. Your strategy must integrate:
1.  A non-disruptive refactoring pattern to handle application logic changes.
2.  A data migration approach that moves petabytes of data while the system is live.
3.  A security consideration for ensuring data is not exposed or corrupted during the cross-region migration.

---

## Answer Key

**Answer 1**
The first three steps to apply the Strangler Fig pattern would be:
1.  **Introduce a Facade/Proxy:** Deploy a lightweight routing layer (the "fig vine") between the client applications and the monolithic booking system. Initially, this facade will do nothing but pass 100% of the traffic for the Pricing Engine directly to the old module inside the monolith.
2.  **Develop the New Microservice:** Build, test, and deploy the new Pricing Engine microservice. It should be running in production but not yet receiving any live traffic from the facade.
3.  **Divert a Small Subset of Traffic:** Modify the facade's routing logic to redirect a small, low-risk portion of traffic to the new microservice. This could be internal employee traffic or requests for non-critical airline routes. The results from the new service are returned to the client, while the facade logs and compares outcomes.

The single most critical component is the **Facade (or Proxy)**. It intercepts calls, controls the routing of traffic between the old and new systems, and makes the entire migration transparent to the client applications, which is the key to achieving a non-disruptive switchover.

**Answer 2**
A two-stage rollout strategy would prioritize safety and validation:

*   **Stage 1: Shadow Mode & Canary Release:**
    *   **Target Population:** A small percentage (e.g., 1-5%) of internal users or traffic from a specific, low-impact region. The feature flag would be configured to enable the Protobuf serialization logic for this group.
    *   **Rollout Logic:** The system would perform the new Protobuf serialization in "shadow mode." It would still send the old binary format to the recipient but would execute the new logic, log the outcome, and compare the serialized object size or a hash of the payload against the old method.
    *   **Key Metric:** The primary metric would be the **serialization error rate** for the new logic. A secondary metric would be a **data-diff count** (if comparison is feasible) to ensure byte-for-byte equivalence where expected. Success is a near-zero error rate and no unexpected data discrepancies.

*   **Stage 2: Production Rollout with Monitoring:**
    *   **Target Population:** Gradually increase the percentage of production traffic, starting with 10%, then 25%, 50%, and finally 100% over several hours or days.
    *   **Rollout Logic:** The feature flag now configures the system to *actually send* the Protobuf-serialized data for the targeted traffic percentage.
    *   **Key Metric:** The key metric shifts to the **end-to-end processing success rate** of the downstream consumer. We are now looking for any increase in parsing errors or application-level failures in the service that *receives* the Protobuf messages, as this indicates a real production impact. A spike in this error rate would trigger an immediate rollback of the flag.

**Answer 3**
*   **Analysis of Trade-offs:**
    *   **Branch-by-Abstraction (Engineer A):** This is an internal refactoring technique. Its main advantage is that it's contained within a single deployable unit, making it potentially faster to implement in the short term as it requires no new infrastructure. However, it does not solve the underlying problem of the monolith. The codebase grows more complex, and it doesn't help with independent team deployments or scaling parts of the system separately. It's a code-level pattern, not an architectural one.
    *   **Strangler Fig (Engineer B):** This is an architectural evolution pattern. Its primary advantage is that it results in a truly independent service that can be developed, deployed, and scaled on its own. This directly addresses the goal of improving developer velocity and enabling team autonomy. The main disadvantage is the higher initial overhead of setting up a proxy, new deployment pipelines, and new infrastructure for the microservice.

*   **Recommendation:**
    For the primary goal of improving developer velocity and enabling independent deployments, **Engineer B's Strangler Fig pattern is far more suitable.** While Engineer A's approach cleans up the internal code structure, it leaves the team constrained by the monolithic deployment and release process. The Strangler Fig pattern is explicitly designed to break apart a monolith into independently maintainable services, which is the key to unlocking team autonomy and improving long-term velocity.

**Answer 4**
*   **Technical Debt Pattern:** The pattern is **Tight Coupling**, specifically between the client services and the implementation details of the `get_recommendations` function signature. The clients are not coded against an abstraction but a concrete, rigid implementation, making the callee (the recommendations service) impossible to change without breaking all callers.

*   **Refactoring Plan:**
    1.  **Introduce an Intermediate Abstraction (Facade Pattern):** Create a new, intermediate "Recommendations Facade" service or module. All client services will be updated (incrementally) to call this facade instead of the old function directly. The facade's initial job is simple: it just calls the old `get_recommendations(user_id)` function and returns the result. This is a mechanical, low-risk change for the client teams.
    2.  **Evolve the Implementation Behind the Facade:** Once clients are decoupled, the Recommendations team is free to evolve the implementation behind the facade. They can now build the new, more complex algorithm. The facade can be enhanced to gather the additional data points it needs (likes, shares) from other services, and then pass a richer context object to the new algorithm (e.g., `get_recommendations_v2(user_context_object)`). The facade maintains the simple `(user_id)` interface for old clients while using the new implementation, ensuring a non-disruptive upgrade.

**Answer 5**
*   **Metric/Check:** After performing the dual-write, the facade should perform a **data consistency check**. This involves immediately reading back the written data from *both* the old and new systems (or reading back a checksum/hash of the data) and comparing them within the facade.

*   **Explanation and Integration with Observability/DR:**
    1.  **Automated Anomaly Detection:** The result of this comparison (Success, Mismatch, New-System-Error, Old-System-Error) should be emitted as a tagged metric (e.g., `inventory.dual_write.consistency_result`). An observability platform can then be configured to alert aggressively on any status other than "Success." A sudden spike in "Mismatch" results indicates a bug in the new service's logic.
    2.  **Distributed Tracing for Root Cause Analysis:** Each dual-write operation should be part of a distributed trace. If the consistency check fails, the trace ID is logged with the error. This allows an engineer to immediately pull up the entire lifecycle of the failed request, seeing the exact inputs, the response from the legacy system, the response from the new system, and the point of failure. This drastically reduces the time to diagnose the root cause.
    3.  **Automated Rollback/Disaster Recovery:** This check enables automated safety mechanisms. If the rate of "Mismatch" or "New-System-Error" exceeds a predefined threshold (e.g., 1% of requests in 5 minutes), the facade's configuration can be automatically triggered to stop routing writes to the new system, effectively rolling back the change for the write path without human intervention. This prevents widespread data corruption.

**Answer 6**
This strategy requires combining multiple advanced concepts for a live, secure, large-scale migration.

1.  **Non-Disruptive Refactoring Pattern (Application Logic):**
    *   **Strategy:** Use the **Strangler Fig pattern** combined with a **Facade/Proxy**.
    *   **Implementation:** Introduce a "Patient Data Router" service that all applications must use to access patient data. Initially, this router directs all reads and writes to the old sharded monolith. As the migration progresses, this router's logic will be updated to become geo-aware. It will look up the patient's country of residence and route the request to the correct new regional database or the old monolith if the patient's data has not yet been migrated. This decouples the application logic from the physical location of the data.

2.  **Live Data Migration Approach:**
    *   **Strategy:** A phased, **dual-write and backfill** approach.
    *   **Implementation:**
        *   **Phase 1 (Dual Write):** Update the Patient Data Router. For any *new* or *updated* patient records, the router will write the data to *both* the old monolith and the new, correct regional database. This keeps new data consistent.
        *   **Phase 2 (Backfill):** Use a scalable data replication service (like AWS DMS or a custom Spark job) to perform a bulk migration of existing, inactive data from the monolith to the new regional databases. This process runs in the background, throttling itself to avoid impacting production performance. It copies data region by region.
        *   **Phase 3 (Verification & Cutover):** Once a region's backfill is complete and dual-writes are stable, the router can be updated to direct *reads* for that region's patients to the new database. After a validation period, the dual-write for that region can be turned off, and the data can be eventually purged from the monolith.

3.  **Security Consideration (Data in Transit):**
    *   **Strategy:** End-to-end encryption and network isolation.
    *   **Implementation:** The connection between the source monolithic database and the destination regional databases during the backfill process must be secured. This is not just standard TLS. Use a **private network connection** (e.g., AWS PrivateLink, GCP Private Service Connect, or a dedicated VPN tunnel) between the data centers. This ensures that the petabytes of sensitive patient data never traverse the public internet. All data must also be encrypted in transit using strong TLS protocols (e.g., TLS 1.3), and credentials for accessing both databases must be managed securely via a secrets management system (e.g., HashiCorp Vault, AWS KMS).