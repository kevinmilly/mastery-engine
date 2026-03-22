## Exercises

**Exercise 1**
An e-commerce application has a `ProductCatalog` service with three running instances at the following IP addresses: `10.0.1.5`, `10.0.1.6`, and `10.0.1.7`. A `Search` service, acting as a client, needs to fetch product details. The system uses a client-side discovery pattern with a central service registry. Trace the sequence of network requests the `Search` service must make to successfully retrieve data from one of the `ProductCatalog` instances for the very first time.

**Exercise 2**
A startup is building a polyglot microservices-based social media platform. The backend team has chosen to implement server-side discovery. The `UserService` is written in Go, the `PostService` in Python, and the `FeedService` in Java. Explain one major development advantage and one potential runtime performance disadvantage of this choice for their specific situation.

**Exercise 3**
You are designing a system for a fleet of IoT devices deployed in a factory. These devices have limited processing power and memory. They need to periodically send sensor data to a `DataIngestion` service, which runs on a cluster of servers within the factory's private network. Would you recommend a client-side or server-side discovery pattern for the IoT devices to find the `DataIngestion` service? Justify your choice based on the constraints of the devices.

**Exercise 4**
A system relies on DNS-based service discovery. The `BillingService` is available via the hostname `billing.internal.service.corp`. To handle high traffic, the DNS record for this hostname is a CNAME pointing to an Elastic Load Balancer (ELB). The TTL (Time-To-Live) for the DNS record is set to 60 seconds. A sysadmin accidentally misconfigures the DNS and points `billing.internal.service.corp` to the wrong ELB. Describe the immediate impact on client services and explain how the TTL setting influences the duration of the resulting outage.

**Exercise 5**
Consider an architecture where an API Gateway acts as the single entry point for all external traffic. Behind the gateway, there are dozens of microservices, including a `UserService` and an `OrderService`. When a mobile client sends a request to `POST /api/orders`, the API Gateway must forward it to an available instance of the `OrderService`. Explain how the API Gateway can leverage a service discovery mechanism (like a service registry) and a load balancing strategy to fulfill this request reliably and efficiently.

**Exercise 6**
You are the lead architect for a new global ride-sharing platform. The architecture must be highly available and provide low latency for users in North America, Europe, and Asia. The system includes:
1.  Regional API Gateways that act as entry points for each continent.
2.  Stateless services like `RideMatchingService` that can be scaled horizontally within a region.
3.  Stateful services like `DriverLocationService` that use sharded databases and are more sensitive to network latency.

Propose a multi-layered service discovery strategy for this platform. Specify which discovery mechanism you would use for (a) directing user traffic to the nearest regional gateway, and (b) internal service-to-service communication within a region. Justify your choices based on latency, fault tolerance, and operational complexity.

---

## Answer Key

**Answer 1**
The `Search` service would perform the following sequence of network requests:

1.  **Request 1 (to Service Registry):** The `Search` service first sends a query to the service registry, asking for the locations of the `ProductCatalog` service. For example, `GET /services/ProductCatalog`.
2.  **Response (from Service Registry):** The registry responds with a list of available instances: `["10.0.1.5", "10.0.1.6", "10.0.1.7"]`.
3.  **Request 2 (to ProductCatalog instance):** The `Search` service's client library selects one of the IP addresses from the list (e.g., using a round-robin algorithm) and sends the actual application request directly to that instance, for example, `GET http://10.0.1.6/products/123`.

This demonstrates the two-step process inherent in client-side discovery: first, discover (talk to the registry), then interact (talk to the service instance).

**Answer 2**
**Advantage:** Simplicity for client service development. Since the services are written in different languages (Go, Python, Java), a server-side discovery pattern means none of the individual service teams need to find, maintain, or implement a language-specific service discovery client library. All services simply send requests to a stable endpoint (e.g., `http://post-service/`), and the discovery logic is handled centrally by a router or load balancer. This reduces code duplication and dependency management across the polyglot environment.

**Disadvantage:** Increased network latency. Every request from one service to another must pass through an additional network hop: `UserService` -> `Router/LB` -> `PostService`. This central router/proxy, which handles the service discovery and load balancing, becomes a bottleneck. In a high-traffic social media platform where low-latency feed generation is critical, this extra hop for every internal API call can add up to a noticeable delay in the end-user experience.

**Answer 3**
**Recommendation:** Server-side discovery.

**Justification:** The primary constraint is that the IoT devices have limited processing power and memory.
*   **Client-Side Discovery:** This pattern would require each IoT device to run a client library. This library would be responsible for querying the service registry, caching the results, and implementing a load-balancing algorithm to choose an instance. This adds computational overhead and increases the memory footprint on the already-constrained devices. It also complicates firmware updates if the discovery logic needs to change.
*   **Server-Side Discovery:** With this pattern, the IoT devices can be configured with a single, static endpoint (e.g., a hardware load balancer or a DNS name pointing to a proxy). The device simply sends its data to that fixed address. All the logic of finding a healthy `DataIngestion` service instance is handled on the server side by the load balancer/proxy. This keeps the client device "dumb" and simple, minimizing its resource consumption and making it more robust.

**Answer 4**
**Immediate Impact:** As soon as the misconfiguration is applied, new requests from client services attempting to resolve `billing.internal.service.corp` may receive the incorrect IP address of the wrong ELB. However, clients that have recently made a request might have the old, correct IP address cached. The outage will not be instantaneous for all clients; it will propagate as their local DNS caches expire.

**Influence of TTL:** The TTL of 60 seconds dictates the maximum time that any client, router, or DNS resolver in the path will cache the incorrect DNS record. Once a client has the bad record, it will continue sending traffic to the wrong ELB for up to 60 seconds. After the TTL expires, the client's resolver must re-query the DNS server. If the issue has been fixed by then, the client will get the correct record and service will be restored for it. Therefore, the 60-second TTL means that after the DNS is fixed, the outage could persist for up to an additional minute for some clients as their caches slowly expire. A lower TTL would lead to a faster recovery, while a higher TTL would prolong the outage.

**Answer 5**
The API Gateway integrates service discovery and load balancing as follows:

1.  **Request Reception:** The gateway receives the `POST /api/orders` request. It consults its routing configuration and determines that this path maps to the `OrderService`.
2.  **Service Discovery (Server-Side):** The API Gateway itself acts as a client to the service registry. It queries the registry for the list of healthy and available instances of the `OrderService`. The registry might return a list like `["10.1.2.3:8080", "10.1.2.4:8080"]`. This step is a form of server-side discovery because the original mobile client is unaware of it; the discovery logic resides on the server-side infrastructure (the gateway).
3.  **Load Balancing:** The gateway's built-in load balancer then applies a policy (e.g., Round Robin, Least Connections) to select one instance from the list provided by the registry. For example, it might choose `10.1.2.3:8080`.
4.  **Request Forwarding:** The gateway forwards the original `POST` request to the selected `OrderService` instance. The response from the service is then proxied back to the mobile client.

This combination makes the system resilient. If an `OrderService` instance fails, the service registry will detect it (via health checks) and remove it from the list, so the API Gateway will no longer route traffic to it.

**Answer 6**
A robust, multi-layered service discovery strategy would be:

**(a) Directing user traffic to the nearest regional gateway:**
*   **Mechanism:** DNS-based discovery, specifically using GeoDNS or Geolocation routing.
*   **Justification:** When a user's device in Germany tries to connect to `api.rideshare.com`, GeoDNS resolves this hostname to the IP address of the European regional API Gateway. A user in Canada would be directed to the North American gateway. This is the ideal mechanism for coarse-grained, global traffic routing because it is a standard, highly scalable internet technology that pushes the routing decision as close to the user as possible, minimizing initial connection latency.

**(b) Internal service-to-service communication within a region:**
*   **Mechanism:** A combination of client-side and server-side discovery managed by a platform like Kubernetes or a dedicated service mesh (e.g., Istio, Linkerd).
    *   **Stateless Services (`RideMatchingService`):** These services can use client-side discovery. A service mesh sidecar proxy can intercept outgoing calls (e.g., from the API gateway to the `RideMatchingService`), look up healthy instances in a central registry, and perform intelligent, latency-aware load balancing. This provides fine-grained control and resilience without burdening the application code.
    *   **Stateful Services (`DriverLocationService`):** These often benefit from a more controlled discovery mechanism. While a service mesh can still be used, the routing logic might be simpler. For example, a request for a specific driver's location needs to be routed to the specific shard/instance that holds that data. The discovery mechanism here is less about generic load balancing and more about topology-aware routing. The service registry would contain not just IP addresses but also metadata about which data shards each instance is responsible for. This ensures requests are sent directly to the correct stateful instance, avoiding unnecessary internal hops.

**Overall Justification:** This hybrid approach uses the right tool for the job. GeoDNS is perfect for global-level routing due to its scale and ubiquity. A more sophisticated, registry-based approach (like a service mesh) is ideal for the complex, dynamic, and latency-sensitive environment of internal microservices, providing advanced features like health checking, fine-grained load balancing, and observability that are critical for regional fault tolerance.