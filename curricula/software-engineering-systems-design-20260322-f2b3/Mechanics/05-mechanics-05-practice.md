## Exercises

**Exercise 1**
A mobile banking app needs to display a user's account balance, recent transactions, and outstanding loan status on its home screen. These three pieces of information are served by three separate microservices: `AccountService`, `TransactionService`, and `LoanService`. Without an API Gateway, the mobile app must make three separate network requests to fetch this data.

Describe how an API Gateway could be configured to optimize this interaction for the mobile client. What is this pattern called?

**Exercise 2**
A SaaS company provides a public API for its customers. To ensure fair usage, they decide to implement a rate limit of 200 requests per user per hour. A junior engineer suggests adding the rate-limiting logic directly into each of the five microservices that are exposed via the API.

Explain why implementing rate limiting in the API Gateway is a better approach than implementing it in each individual microservice.

**Exercise 3**
A retail company is modernizing its e-commerce platform. The new `ProductService` microservice returns product data in a detailed JSON format. However, a critical partner system, which powers an in-store kiosk, is a legacy application that can only parse a specific, simplified XML format. The kiosk application cannot be updated in the short term.

Explain how an API Gateway can be used to allow the legacy kiosk to consume data from the new `ProductService` without requiring any changes to the microservice itself.

**Exercise 4**
An application consists of a `UserService`, `OrderService`, and `InventoryService`. A security review mandates that every request to `OrderService` and `InventoryService` must be authenticated to verify the user's identity and permissions, but requests to parts of the `UserService` (like the "create account" endpoint) can be unauthenticated.

Analyze the risks of making each microservice responsible for its own authentication logic. How does centralizing authentication at the API Gateway level address these risks?

**Exercise 5**
A popular sports news website has a microservice, `ScoreService`, that provides live scores for ongoing games. This endpoint is hit by millions of users simultaneously, causing extremely high load on the service and its database. The scores only update every 30 seconds.

Proposing a solution that uses both an API Gateway and a Distributed Cache, describe the request flow for a user fetching live scores. How does this design protect the `ScoreService` from being overwhelmed?

**Exercise 6**
A ride-sharing application has a "Request Ride" feature. When a user requests a ride, the system must find available drivers, calculate the fare, and assign a driver. This process can take several seconds. The initial design involves the client's mobile app making a synchronous API call to the API Gateway, which then calls a `RideMatcherService` and waits for a response.

Identify the primary problem with this synchronous design. Redesign the flow using the API Gateway and a Message Queue to create a more robust and responsive user experience. Explain the role of each component in your new design.

---

## Answer Key

**Answer 1**
The API Gateway can be configured to expose a single, composite endpoint (e.g., `GET /api/dashboard`). When the gateway receives a request at this endpoint, it internally makes parallel requests to the `AccountService`, `TransactionService`, and `LoanService`. Once all three responses are received, the gateway combines them into a single, consolidated response object and returns it to the mobile client.

This pattern is called **Request Aggregation** or **Fan-out**. Its primary benefit is reducing the number of round-trip network calls the client has to make, which is especially important for mobile applications where network latency can be high and variable. This improves performance and simplifies the client-side code.

**Answer 2**
Implementing rate limiting in the API Gateway is a better approach for two main reasons:

1.  **Centralization and Consistency:** Placing the logic in the gateway ensures a single, consistent rate-limiting policy is applied to all incoming traffic. If the logic were in each microservice, there would be a high risk of implementing the rules differently or having them drift apart over time. A change in the rate limit (e.g., to 250 requests/hour) would require coordinated updates and deployments across all five services, which is inefficient and error-prone. With a gateway, it's a single change in one place.
2.  **Separation of Concerns:** Microservices should focus on their core business logic (e.g., processing orders, managing users). Rate limiting is a cross-cutting concern related to traffic management and security. The API Gateway is the ideal place for such concerns, as it keeps the microservice code cleaner and more focused on its specific domain.

**Answer 3**
The API Gateway can solve this problem by performing **response transformation**. The flow would be as follows:

1.  The legacy kiosk application sends a request to a specific endpoint on the API Gateway.
2.  The API Gateway routes this request to the new `ProductService`.
3.  The `ProductService` processes the request and returns its standard, detailed JSON response to the gateway.
4.  The API Gateway intercepts this JSON response. It then transforms the data from the JSON format into the specific, simplified XML format that the legacy kiosk expects.
5.  The gateway sends the transformed XML response back to the kiosk.

This allows the new microservice to remain modern and unaware of the legacy client's requirements, while the gateway acts as an anti-corruption layer, ensuring backward compatibility.

**Answer 4**
Making each microservice handle its own authentication introduces significant risks and inefficiencies:

1.  **Increased Attack Surface & Inconsistency:** Each service becomes a potential point of failure for security. A bug in the authentication logic of `OrderService` would not be present in `InventoryService`, leading to inconsistent security postures. A developer might forget to secure a new endpoint, leaving a vulnerability.
2.  **Code Duplication and Maintenance Overhead:** The same authentication logic (e.g., token validation, signature checking, permission lookup) would need to be written, tested, and maintained in multiple places. A change to the authentication scheme (e.g., updating a security library) would require a coordinated, multi-service deployment.

Centralizing authentication at the API Gateway mitigates these risks:

*   **Single Security Checkpoint:** The gateway acts as a guard. It authenticates every incoming request before it can reach the internal network where the microservices reside. Unauthenticated requests are rejected at the edge, never reaching the services.
*   **Simplified Microservice Logic:** The `OrderService` and `InventoryService` can trust that any request they receive from the gateway has already been authenticated. They can focus purely on business logic. The gateway can also be configured to pass user identity information (e.g., User ID) in a request header, so the services know *who* is making the request without needing to parse the original token.

**Answer 5**
This design integrates the API Gateway with a distributed cache (like Redis) to protect the `ScoreService`.

The request flow would be:
1.  A user's client requests the live scores from an endpoint on the API Gateway (e.g., `GET /api/scores`).
2.  The API Gateway first checks the Distributed Cache for a key like `live_scores_data`.
3.  **Cache Hit:** If the data is found in the cache and is not expired (e.g., its Time-To-Live/TTL of 30 seconds has not passed), the gateway immediately returns the cached data to the user. The `ScoreService` is not contacted at all.
4.  **Cache Miss:** If the data is not in the cache or has expired, the API Gateway forwards the request to the `ScoreService`.
5.  The `ScoreService` computes the latest scores and returns them to the gateway.
6.  The gateway takes the response from the `ScoreService`, stores it in the cache with a 30-second TTL, and then forwards the response to the user.

This design ensures that the `ScoreService` is only invoked once every 30 seconds, regardless of whether it receives one request or one million requests in that time frame. All subsequent requests are served directly from the high-speed cache, drastically reducing the load on the service and its database.

**Answer 6**
**Problem with Synchronous Design:** The primary problem is poor user experience and low system resilience. The client's app (and the user) is left waiting for the entire process to complete. More critically, the API Gateway's request thread is blocked for several seconds. If thousands of users request rides simultaneously, this could exhaust the gateway's available threads, making it unresponsive and unable to handle any other requests (like fetching user profiles), leading to a system-wide outage.

**Asynchronous Redesign:**

1.  **Client -> API Gateway:** The client sends a `POST /request-ride` request to the API Gateway.
2.  **API Gateway -> Message Queue:** Instead of calling the `RideMatcherService` directly, the API Gateway immediately validates the request and publishes a message (e.g., `ride_request_event` containing user ID, location, etc.) to a **Message Queue** (like RabbitMQ or Kafka).
3.  **Immediate Response to Client:** After successfully placing the message on the queue, the gateway immediately returns a `202 Accepted` response to the client. This response acknowledges that the request has been received and is being processed. The user's app can now show a "Searching for drivers..." screen without being blocked.
4.  **Message Queue -> Worker Service:** A pool of `RideMatcherService` instances are subscribed to the message queue. One of the available workers consumes the `ride_request_event` message from the queue.
5.  **Processing:** The worker performs the long-running task of finding a driver. This happens completely decoupled from the initial API request.
6.  **Notification:** Once a driver is found, the `RideMatcherService` can notify the user through a separate channel, like a WebSocket connection or a push notification.

**Role of Each Component:**
*   **API Gateway:** Acts as the entry point. It handles initial validation and authentication, then offloads the long-running work by producing a message, freeing up its resources immediately to handle other incoming requests.
*   **Message Queue:** Acts as a buffer and decouples the gateway from the processing services. It durably stores the ride requests, ensuring that even if all workers are busy, the requests are not lost. It also allows the system to absorb spikes in traffic.
*   **RideMatcherService (Worker):** Consumes messages from the queue at its own pace and performs the actual business logic. This service can be scaled independently based on the queue's workload.