## Exercises

**Exercise 1**
A financial services company runs a critical batch processing job for end-of-day market analysis. The job must run every weekday between 10:00 PM and 11:00 PM UTC and requires a specific high-CPU virtual machine type to complete on time. The workload is highly predictable and has been stable for over a year. Which cloud billing model (On-Demand, Reserved Instance, or Spot Instance) is most cost-effective for this workload, and why? Justify your choice by explaining the primary risks or inefficiencies of using the other two models in this specific scenario.

**Exercise 2**
An image processing service stores original high-resolution images in a standard object storage bucket. When a user requests an image, a cloud function is triggered to resize it and serve a thumbnail. This happens millions of times a day. The original images are rarely accessed directly after upload. The current storage cost for 100 TB of original images is significant.

Current Storage Costs:
- Standard Storage: $0.023 per GB/month
- Infrequent Access (IA) Storage: $0.0125 per GB/month
- Data Retrieval Fee from IA Storage: $0.01 per GB

Propose a change to the storage strategy for the original images to reduce costs. Calculate the estimated monthly savings for the 100 TB of data, assuming all of it is moved. Also, identify the new cost component introduced by your change and explain why it is likely to be negligible in this architecture.

**Exercise 3**
A startup has deployed its main application in a single cloud region. To reduce data egress costs, the engineering team enabled a Content Delivery Network (CDN) for all static assets (images, CSS, JS). However, the monthly bill shows that data transfer costs have not decreased as much as expected. Upon investigation, they find that a significant portion of the remaining egress cost is labeled "Data Transfer between Availability Zones." The application's web servers in AZ-a frequently communicate with a relational database replica in AZ-b. What architectural principle is likely being violated, and how does this lead to unexpected costs? Propose a specific change to the system's configuration to mitigate this cost.

**Exercise 4**
A team manages a microservice that experiences highly unpredictable, spiky traffic. They initially chose a serverless functions-as-a-service (FaaS) model for its auto-scaling capabilities and pay-per-use billing. However, they observe that many user requests suffer from high latency (2-3 seconds) during sudden traffic spikes. This latency is traced back to function "cold starts." A proposal is made to switch to a container-based model (e.g., Kubernetes or AWS Fargate) with a minimum of 3-5 constantly running container instances to eliminate the cold start problem. Analyze the cost and performance trade-offs of this proposed migration. Under what specific traffic conditions might the new container-based model actually be *more* cost-effective than the serverless model, despite having idle "always-on" capacity?

**Exercise 5**
A company is designing a new global, multi-tenant SaaS application. The architecture uses a separate database per tenant (a common data sharding strategy) to ensure strong data isolation. To optimize costs, the team proposes using a serverless database offering (like Aurora Serverless v2) which can scale compute resources down to near-zero when a tenant is inactive. However, a security architect raises a concern related to this cost-saving measure. Drawing on your knowledge of security considerations and observability, what potential security or operational problem could arise from a tenant's database scaling down to zero and then needing to "wake up" upon their first request? How does this cost-optimization choice create a tension with security and performance SLAs?

**Exercise 6**
An event-driven system for processing IoT data consists of three main services:
1.  **Ingestor**: A fleet of VMs behind a load balancer receiving data streams.
2.  **Processor**: A serverless function that triggers on new data, processes it, and writes to a database.
3.  **Notifier**: A service that queries the database periodically and sends alerts.

The system works, but it's expensive. The Ingestor VMs are over-provisioned to handle peak load, sitting idle 80% of the time. The Notifier service runs its query every 10 seconds, even when no new data has arrived, leading to high database read costs.

Propose a refactoring of this architecture that maintains its event-driven nature but significantly improves cost-efficiency. Your proposal should address the specific inefficiencies of both the Ingestor and Notifier services. Your answer should integrate concepts from both cost optimization and event-driven architecture best practices.

---

## Answer Key

**Answer 1**
**Most Cost-Effective Model:** A one-year or three-year Reserved Instance (RI) is the most suitable and cost-effective model for this workload.

**Reasoning:**
- **Predictability:** The workload is highly predictable, running at a fixed time for a fixed duration on a specific instance type. This perfectly matches the RI model, which offers a significant discount (up to 70%+) in exchange for a commitment to use a specific instance for a set term.
- **Risk of Spot Instances:** While Spot Instances offer the largest discounts, they are not suitable for a critical, time-bound job. Spot instances can be terminated with little notice if the cloud provider needs the capacity back. For a job that *must* complete within a specific one-hour window, the risk of interruption is too high and would violate the business requirement.
- **Inefficiency of On-Demand:** Using On-Demand instances would guarantee availability but would be unnecessarily expensive. The company would be paying the highest possible price for a workload that is predictable enough to qualify for commitment-based discounts. The RI provides the same availability guarantee as On-Demand but at a much lower cost.

**Answer 2**
**Proposed Change:** The original, high-resolution images should be moved from the Standard storage class to an Infrequent Access (IA) storage class.

**Calculation of Savings:**
1.  **Convert TB to GB:** 100 TB = 100 * 1024 GB = 102,400 GB.
2.  **Current Monthly Cost (Standard):** 102,400 GB * $0.023/GB = $2,355.20
3.  **New Monthly Cost (IA):** 102,400 GB * $0.0125/GB = $1,280.00
4.  **Estimated Monthly Savings:** $2,355.20 - $1,280.00 = $1,075.20

**New Cost Component and Why It's Negligible:**
The new cost component is the **Data Retrieval Fee** ($0.01 per GB) from the IA storage class. In this architecture, the original images are only retrieved once by the cloud function to generate thumbnails. Subsequent user requests are served the already-generated and cached thumbnails, not the original image. Because the originals are accessed very rarely (likely only upon upload), the total volume of data retrieved from the IA tier will be minimal. Therefore, the retrieval fees will be a very small fraction of the overall storage cost savings.

**Answer 3**
**Architectural Principle Violated:** The principle of **locality of reference**, specifically keeping compute and data in the same Availability Zone (AZ). Cloud providers typically do not charge for data transfer within the same AZ but do charge for transfer between AZs.

**Explanation of Cost:** The application's design forces frequent, cross-AZ communication. Every time a web server in AZ-a needs data, it makes a network call to the database replica in AZ-b. This traffic crosses AZ boundaries and incurs costs for every byte transferred. While this setup might have been designed for high availability, it is not cost-optimal for read-heavy workloads.

**Proposed Mitigation:**
The most effective change would be to reconfigure the database read replicas so that each AZ has its own replica. The web servers in AZ-a should be configured to exclusively read from the database replica in AZ-a, and servers in AZ-b from the replica in AZ-b. This ensures that the vast majority of read traffic stays within the same AZ, eliminating the inter-AZ data transfer costs. Write traffic would still go to the primary database, but this is often a much smaller volume than read traffic.

**Answer 4**
**Analysis of Trade-offs:**
- **Performance:** The serverless (FaaS) model suffers from high tail latency due to cold starts, which is unacceptable for user-facing requests. The container model solves this by maintaining a warm pool of instances, providing consistently low latency.
- **Cost (Idle vs. Active):** The serverless model is perfectly cost-effective for zero traffic (cost is $0). The container model has a fixed baseline cost for its minimum running instances, making it more expensive during idle periods. However, the cost per request *once running* can be lower for containers, as you are not paying for the invocation overhead and managed platform fees on every single call.

**When Containers Could Be More Cost-Effective:**
The container-based model could become more cost-effective than the serverless model under conditions of **sustained, high-throughput traffic, even if spiky.**
1.  **Resource Pooling:** A single container instance can process many concurrent requests, whereas each concurrent FaaS request might spin up a new, separate execution environment. At high volume, the resource pooling in the container model is more efficient.
2.  **Avoiding Per-Invocation Costs:** FaaS billing models often include a small charge per invocation on top of the resource-time cost. During periods of millions of small, rapid requests, these per-invocation charges can add up significantly. A container model processes these requests as simple network calls without an individual invocation fee.
3.  **Predictable Baseline:** If the "spiky" traffic has a predictable, non-zero baseline (e.g., traffic never drops below 100 requests per second), the cost of the minimum running containers can be easily offset by the efficiency gains during the sustained traffic periods.

**Answer 5**
**Potential Problem:** The primary issue is the introduction of **unpredictable, high latency (a "cold start" for the database)** on the first request from an awakening tenant. This creates a tension between cost optimization and the user experience/security posture.

**Tension with Security:**
- **Timing Attacks:** Security vulnerability scanners or malicious actors could probe the system to identify which tenants are inactive. A request to an inactive tenant's endpoint would have a noticeably longer response time (~seconds) compared to an active tenant's (~milliseconds). This information leak reveals tenant activity patterns, which could be exploited (e.g., targeting inactive accounts for takeover).
- **Denial-of-Service (DoS):** A malicious actor could launch a low-volume attack by sending one request to every single tenant, forcing a mass "wake-up" of databases. This could overwhelm the control plane of the serverless database offering or incur a sudden, massive cost spike, creating a financial DoS.

**Tension with Performance SLAs:**
- The first user from a company returning to the app after a weekend will experience a multi-second delay, which is a poor user experience and likely violates any performance Service Level Agreement (SLA). This problem is non-deterministic and hard to debug for the end-user, who will simply perceive the application as "slow" or "broken."

**Answer 6**
**Proposed Refactoring Plan:**

The core goal is to move from provisioned, idle resources to a more reactive, on-demand architecture that scales to zero.

**Phase 1: Refactor the Ingestor Service**
- **Problem:** Over-provisioned VMs are expensive and inefficient.
- **Solution:** Replace the fleet of VMs and the load balancer with a cloud-native, managed message queue or stream service (e.g., AWS Kinesis, Google Pub/Sub, Azure Event Hubs). IoT devices would publish data directly to an endpoint for this service.
- **Cost Improvement:** This changes the model from "provisioned compute" to "pay-per-message" or "pay-per-GB-ingested." The cost scales directly with the volume of incoming data, eliminating all costs for idle capacity. This also improves reliability and scalability, as these managed services are designed for massive throughput.

**Phase 2: Refactor the Notifier Service**
- **Problem:** The Notifier's polling mechanism (querying every 10 seconds) is inefficient and expensive, generating high database read traffic regardless of data changes.
- **Solution:** Modify the `Processor` serverless function. After the function processes the data and writes it to the database, it should also perform the logic for sending notifications if needed. Alternatively, and for better separation of concerns, the `Processor` could publish a "new_data_processed" event to a second, simple message queue (like AWS SQS). The `Notifier` logic could then be moved into another serverless function that is triggered *only* when a message appears in this second queue.
- **Cost Improvement:** This completely eliminates the costly polling mechanism. The database is no longer queried periodically; instead, the notification logic runs only when there is actual new data to be evaluated. This aligns with event-driven best practices ("react to events" rather than "poll for state") and dramatically reduces database read operations and compute cycles for the Notifier.