## Exercises

**Exercise 1**
An online gaming platform based in South Korea is launching in North America. The platform stores user profile information, including email addresses and payment details, as well as in-game character data. The company wants to ensure low latency for its North American players. According to the CCPA/CPRA, Californian users have the right to request deletion of their personal data. How should the company architect its data storage for the new North American region to simultaneously address latency and this specific compliance requirement?

**Exercise 2**
A global weather forecasting service provides a mobile app that displays satellite imagery. The application servers and the primary database are located in a central EU region (Ireland). Users in Southeast Asia report that while the weather data (temperature, wind speed) loads quickly, the satellite map tiles load very slowly. Propose a technical solution to specifically address the slow map tile loading without re-architecting the core application and database infrastructure. Explain how your solution reduces latency for the users in Southeast Asia.

**Exercise 3**
A company runs a global, multi-tenant B2B SaaS application for project management. Each tenant (a customer company) has its own isolated data. The company has deployed application instances in North America, Europe, and APAC. Currently, all data for all tenants is stored in a single database cluster in North America. A new, large European customer is concerned about two things: 1) the performance of database-heavy operations like generating a complex report, and 2) EU data sovereignty regulations. The company is considering two options:
1.  **Geo-sharding:** Shard the database by tenant ID, and physically move the new European customer's data to a new database cluster in the EU region.
2.  **Read Replicas:** Keep the primary database in North America but create a read replica in the EU region.

Analyze the trade-offs between these two options for this specific customer's concerns. Which option is superior and why?

**Exercise 4**
A social network with users across the globe wants to implement a "follower count" feature on user profiles. This count needs to be highly available (the number should always be displayed) and writes (a user following another) should be fast. However, perfect, real-time global consistency is not required; it's acceptable if the count is temporarily slightly different across regions for a few seconds after a user follows or unfollows someone. The system is deployed in three active regions: US, EU, and APAC. Describe a data replication strategy for the follower counts that achieves these product requirements. What consistency model does this imply?

**Exercise 5**
You are the lead architect for "ConnectSphere," a professional networking platform. The platform is currently hosted entirely in `us-east-1`. The board has approved a global expansion initiative with the following critical requirements:
- **Requirement A:** A Recovery Point Objective (RPO) of zero for user messages. No messages can be lost in a regional outage.
- **Requirement B:** User data (profile, connections, messages) must be stored in the user's home region (either US or EU) to comply with data residency policies.
- **Requirement C:** The system must remain available for writes (e.g., sending messages) even if one region is completely offline.
- **Requirement D:** Latency for reading and writing messages should be minimized for users in their home region.

Design a high-level data architecture that meets all these requirements. Specifically, describe the database deployment model across the US and EU regions and the replication method you would use for the messaging data. Justify your choices by referencing the specific requirements.

**Exercise 6**
A multinational e-commerce company uses an event-driven architecture. When an order is placed in any country, an `OrderPlaced` event is published to a central event bus located in the US. Downstream services (inventory, shipping, analytics) consume this event. The company has fulfillment centers in the US, Germany, and Japan. The German fulfillment center has recently been experiencing significant shipping delays. Investigation reveals that the `OrderPlaced` events for European orders are often delayed in reaching the German shipping service, especially during peak US internet hours. This delays the entire fulfillment process.

Propose a modification to the event-driven architecture to solve this latency and reliability problem for the German fulfillment center. Your proposal should integrate concepts of geo-distribution and system evolution. Explain how your new design would affect the system's coupling, cost, and observability strategy.

---

## Answer Key

**Answer 1**
The company should implement a geo-sharded data architecture. User data should be physically stored in a database located within North America.

**Reasoning:**
1.  **Latency:** By co-locating the data (both profile and character data) with the application servers in North America, read and write operations for North American players will have significantly lower latency, which is critical for a good gaming experience.
2.  **Compliance (CCPA/CPRA):** While CCPA/CPRA does not mandate data residency *within* California, isolating North American user data into its own regional database makes compliance tasks, such as data access requests and targeted deletions, much simpler to manage and audit. The application can route a deletion request from a verified Californian user directly to the North American database without affecting or searching through the primary Korean user database. This is achieved by routing users to the nearest regional deployment upon sign-up or login, and ensuring their data is created in that region's database.

**Answer 2**
The most effective solution is to use a Content Delivery Network (CDN).

**Reasoning:**
1.  **How it Works:** A CDN is a globally distributed network of proxy servers. The satellite map tiles, which are static assets, would be cached on CDN "edge locations" around the world, including several in or near Southeast Asia.
2.  **Latency Reduction:** When a user in Southeast Asia requests a map tile, the request is routed to the nearest CDN edge location instead of traveling all the way to the central EU server. Serving the cached content from a geographically proximate server drastically reduces the network round-trip time (RTT), resulting in faster load times.
3.  **Minimal Re-architecture:** This solution meets the constraint of not changing the core infrastructure. The application would be configured to serve image URLs via the CDN provider. The CDN would automatically pull the images from the origin server (in the EU) and cache them. The core application logic and database for dynamic weather data remain untouched.

**Answer 3**
Geo-sharding is the superior option.

**Reasoning:**
1.  **Addressing Performance:**
    *   **Read Replicas:** This would only solve the performance problem for read-heavy operations like viewing existing reports. Generating a *new* complex report is a write-intensive operation (or a read from the most up-to-date data), which would still have to be sent to the primary database in North America, incurring high latency.
    *   **Geo-sharding:** By moving the entire shard (all of the customer's data) to the EU, both read *and* write operations initiated by the European customer would be executed locally within the EU region. This would provide low latency for all database interactions, including report generation.

2.  **Addressing Data Sovereignty:**
    *   **Read Replicas:** This solution does *not* solve the data sovereignty issue. The primary copy of the data—the "source of truth"—still resides in North America. A replica in the EU is just a copy.
    *   **Geo-sharding:** This solution directly addresses data sovereignty by making the EU database cluster the primary and only location for this customer's data, ensuring it resides within the EU's legal jurisdiction.

Therefore, geo-sharding is the only option that fully satisfies both of the customer's critical concerns.

**Answer 4**
A multi-master or multi-leader replication strategy using Conflict-Free Replicated Data Types (CRDTs) or a similar convergent data structure is ideal for this use case.

**Reasoning:**
1.  **Replication Strategy:** In a multi-master setup, each region (US, EU, APAC) has a master database that can accept writes. When a user in the EU follows another user, the write is committed to the EU database immediately, making it fast. This change is then asynchronously replicated to the US and APAC master databases.
2.  **Handling Conflicts and Convergence:** A simple counter is problematic in this model (e.g., if two people follow and unfollow simultaneously in different regions, the final count could be wrong). A CRDT counter (specifically, a G-Counter for increments and a PN-Counter for increments/decrements) is designed to handle this. Each region can increment/decrement its local counter, and the replication messages contain these state changes. The data structures are designed such that when all updates have been propagated, all replicas will converge to the same final value, regardless of the order in which the updates arrived.
3.  **Consistency Model:** This implies an **Eventual Consistency** model. The system guarantees that if no new updates are made, all replicas will eventually converge to the same value. This prioritizes Availability (the count is always readable and writable in every region) and Partition Tolerance (the system continues to work if a region is disconnected) over Strong Consistency, which aligns perfectly with the product requirements.

**Answer 5**
The architecture should be a **geo-sharded, active-active deployment using synchronous replication within a region and asynchronous replication for cross-region data access (like a user's name).**

**Reasoning:**
1.  **Deployment Model (Geo-sharded Active-Active):**
    *   **Geo-sharding:** To satisfy **Requirement B** (data residency), user data must be sharded by their home region. A US user's data lives in the US database cluster, and an EU user's data lives in the EU cluster. This is the only way to guarantee residency.
    *   **Active-Active:** Both the US and EU regions will be fully active, serving traffic for their local users. This satisfies **Requirement D** (low latency) as reads and writes for a user's own messages happen within their home region.

2.  **Replication Method for Messaging:**
    *   To satisfy **Requirement A** (RPO of zero), writes must be durably committed before acknowledging success to the user. This requires **synchronous replication** to multiple availability zones (AZs) *within* the user's home region (e.g., a message from a US user is written synchronously to database nodes in `us-east-1a` and `us-east-1b`). This ensures that the loss of a single data center does not result in data loss.
    *   To satisfy **Requirement C** (availability during a regional outage), the application must be able to continue operating. In this design, if the EU region goes down, US users are unaffected because their data and application servers are in the US. The platform remains available for writes for all US users. The same is true for EU users if the US region fails.

**Summary of Design:**
- Two regions (US, EU), both fully active.
- User data is sharded by region (US users in US DB, EU users in EU DB).
- A global routing layer (e.g., Route 53 with latency-based routing) directs users to their appropriate regional deployment.
- Within each region, the database uses synchronous replication across multiple AZs to achieve an RPO of zero.
- Cross-region data (e.g., needing to display an EU user's profile picture to a US user) would use asynchronous replication or direct cross-region API calls, accepting slightly higher latency for this non-primary data access.

**Answer 6**
The proposed solution is to introduce a **regional event bus** in the EU (Germany) and use a **federated or hub-and-spoke eventing model**.

**Reasoning:**
1.  **New Architecture:**
    *   Instead of all producers publishing to a central US bus, European services would publish `OrderPlaced` events to a new, regional event bus in Germany.
    *   The German shipping service would subscribe directly to this local bus, receiving events with very low latency.
    *   A "bridge" or "replicator" service would be set up to forward events from the German bus to the central US bus. This ensures that global services like analytics, which may still be centralized, can receive a copy of the event.

2.  **Impact Analysis:**
    *   **Coupling:** This change **decreases temporal coupling** for regional fulfillment. The German shipping service is no longer dependent on the availability and performance of the transatlantic network link and the central US event bus to do its core job. It is now only coupled to its local bus.
    *   **Cost:** This will likely **increase cloud costs**. The company now has to pay for and manage a second event bus infrastructure (e.g., another Kafka cluster or Amazon EventBridge bus). There will also be costs associated with the inter-region data transfer from the EU bus to the US bus. However, this cost must be weighed against the business cost of delayed shipments.
    *   **Observability:** The observability strategy becomes more complex. The team must now monitor the health and latency of two separate event buses and, crucially, the replication process between them. New alerts would be needed to detect if the bridge service fails or if the replication lag between the EU and US buses becomes too high. Distributed tracing would become even more critical to track an event's lifecycle across both regional and central systems.