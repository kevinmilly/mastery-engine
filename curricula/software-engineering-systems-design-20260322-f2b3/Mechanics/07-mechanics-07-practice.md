## Exercises

**Exercise 1**
An `OrderService` makes repeated calls to a `PaymentGateway` service to process transactions. The `PaymentGateway` suddenly becomes unresponsive due to a database deadlock. The circuit breaker monitoring this connection is currently in the `Closed` state and is configured with a failure threshold.

Describe the sequence of events, including the state changes of the circuit breaker, from the first failed request until the system stops sending requests to the `PaymentGateway`.

**Exercise 2**
A circuit breaker for a `ShippingQuoteService` has been in the `Open` state for 60 seconds. Its configured 'reset timeout' is 30 seconds.

Describe the next two steps the circuit breaker will take, and the two possible outcomes that will result from those steps.

**Exercise 3**
You are monitoring a circuit breaker for a `SearchService`. It has the following configuration:
- Failure Threshold: 3 consecutive failures.
- Reset Timeout: 20 seconds.

A sequence of requests occurs. Trace the state of the circuit breaker at each step below.

1. Request 1: Success
2. Request 2: Fail (Timeout)
3. Request 3: Fail (Timeout)
4. Request 4: Fail (Timeout)
5. Request 5: (What happens to this request, and what is the breaker's state?)
6. (25 seconds pass)
7. Request 6: (What happens to this request, and what is the resulting state of the breaker?)

**Exercise 4**
A social media application's main feed is assembled by a `FeedBuilder` service. This service calls a `TrendingTopics` service to get a list of hashtags to display. This feature is a "nice-to-have" but not essential for the user to see their feed.

Propose two different fallback strategies the `FeedBuilder` service could use when the circuit breaker for the `TrendingTopics` service is in the `Open` state. Explain the user experience implication of each strategy.

**Exercise 5**
An e-commerce platform uses an API Gateway that routes all incoming client requests to dozens of downstream microservices (e.g., `ProductService`, `ReviewService`, `InventoryService`). The engineering team is debating where to implement the Circuit Breaker logic for calls to these services.

- **Option A:** Implement it centrally in the API Gateway. The gateway would have a separate circuit breaker for each downstream service it calls.
- **Option B:** Implement it in each individual microservice that needs to call another. (e.g., `OrderService` would have its own circuit breaker for calls it makes to `InventoryService`).

Analyze the primary advantage of Option A and the primary advantage of Option B.

**Exercise 6**
A flight booking system has a `BookingService` that orchestrates a transaction. It first calls a `PaymentService` and then, if successful, calls a `NotificationService` to send a confirmation email. Both calls are synchronous. The `NotificationService` is known to be less reliable than the `PaymentService`.

If a circuit breaker is added for the `NotificationService` call, what critical flaw exists in the user experience when this breaker is `Open`? How could you use a concept from a previous lesson (Message Queues) to redesign this interaction and resolve the flaw, while still protecting the `BookingService`?

---

## Answer Key

**Answer 1**
1.  **First Failure:** The `OrderService` calls the `PaymentGateway`. The call fails (e.g., times out). The circuit breaker is in the `Closed` state, so it allows the request to pass through. It notes the failure and increments its internal failure counter.
2.  **Subsequent Failures:** Subsequent requests are also allowed to pass through. For each failure, the circuit breaker increments its failure counter.
3.  **Threshold Reached:** Once the failure counter reaches the configured threshold, the circuit breaker transitions its state from `Closed` to `Open`.
4.  **Circuit Opens:** Now in the `Open` state, the circuit breaker immediately rejects any new requests from the `OrderService` to the `PaymentGateway` *without* attempting to make the call. This prevents the `OrderService` from wasting resources on calls that are destined to fail and protects the failing `PaymentGateway` from further load.

**Answer 2**
1.  **Transition to Half-Open:** Because the 60 seconds that have passed is greater than the 30-second reset timeout, the circuit breaker will move from the `Open` state to the `Half-Open` state.
2.  **Trial Request:** The breaker will allow the *very next* request to pass through to the `ShippingQuoteService`. This is a "trial" request to test if the downstream service has recovered.

This leads to two possible outcomes:
-   **Outcome 1 (Success):** If the trial request succeeds, the circuit breaker assumes the service has recovered. It will reset its failure counter and transition back to the `Closed` state, allowing normal traffic to resume.
-   **Outcome 2 (Failure):** If the trial request fails, the circuit breaker assumes the service is still unhealthy. It will immediately transition back to the `Open` state and restart the reset timeout timer, preventing any further requests for another 30 seconds.

**Answer 3**
1.  **Request 1 (Success):** State remains `Closed`. Failure count is 0.
2.  **Request 2 (Fail):** State remains `Closed`. Consecutive failure count is 1.
3.  **Request 3 (Fail):** State remains `Closed`. Consecutive failure count is 2.
4.  **Request 4 (Fail):** State transitions to `Open`. The consecutive failure count reaches the threshold of 3. The breaker "trips".
5.  **Request 5:** This request is immediately rejected by the circuit breaker without being sent to the `SearchService`. The state is `Open`.
6.  **(25 seconds pass):** The reset timeout (20 seconds) has elapsed. The breaker transitions to the `Half-Open` state.
7.  **Request 6:** This request is a trial request. It is allowed to pass through to the `SearchService`.
    -   If this request succeeds, the breaker's state will become `Closed`.
    -   If this request fails, the breaker's state will immediately revert to `Open`.

**Answer 4**
The goal of a fallback is to degrade gracefully without failing the entire user request.

-   **Strategy 1: Return a Cached/Default Response.**
    -   **Implementation:** The `FeedBuilder` service could return an empty list of trending topics or, even better, a pre-computed, cached list of generic popular topics that is updated infrequently.
    -   **User Experience:** The user would still see their main feed, but the "Trending Topics" section would either be empty or show a static, less relevant list. This is a good user experience because the core functionality is unaffected. The user might not even notice the temporary degradation.

-   **Strategy 2: Omit the Data Entirely.**
    -   **Implementation:** The `FeedBuilder` service would simply construct the main feed response without the `trendingTopics` data field. The frontend client would be designed to handle a missing field and would not render that UI component.
    -   **User Experience:** The user sees their feed perfectly, but the "Trending Topics" section of the page simply doesn't appear. This is also a very clean user experience, as it avoids showing empty or potentially stale data. The page layout might shift slightly, which is a minor drawback.

**Answer 5**
-   **Primary Advantage of Option A (Centralized in API Gateway):** **Consistency and Centralized Management.** By placing the logic in the gateway, you can enforce a consistent resilience policy across all services. It simplifies configuration management, monitoring, and updates because all the circuit breaker logic is in one place. A platform team can manage this without requiring changes in dozens of individual microservice codebases.

-   **Primary Advantage of Option B (Decentralized in each client):** **Client-Specific Context and Resilience.** This approach allows each client service to have its own tailored circuit breaker configuration. The `OrderService` might have a very aggressive timeout and threshold for the critical `InventoryService`, while a non-essential `RecommendationService` might have a more lenient configuration. It also provides resilience against gateway failure; if service-to-service communication doesn't go through the gateway, those calls are still protected.

**Answer 6**
-   **Critical Flaw:** The critical flaw is a **failed transaction with no notification**. If the `PaymentService` call succeeds, the user's money is taken. If the `NotificationService`'s circuit breaker is `Open` at that moment, the call to send an email fails immediately. The user is charged but never receives a confirmation email, leading to confusion and support calls. The state of the system is inconsistent from the user's perspective.

-   **Redesign with Message Queues:**
    1.  The `BookingService` successfully completes the synchronous call to the `PaymentService`.
    2.  Instead of immediately calling the `NotificationService`, the `BookingService` publishes a `SendConfirmationEmail` message to a durable message queue. This action is very fast and reliable.
    3.  The `BookingService` can now immediately return a success response to the user, confirming their booking.
    4.  The `NotificationService` acts as a consumer, pulling messages from this queue at its own pace. If the `NotificationService` is down, messages simply accumulate in the queue. When it recovers, it will process the backlog and send all the confirmation emails.

This redesign decouples the services. It makes the booking process more resilient because a failure in the non-critical notification system no longer impacts the critical payment and booking flow. The message queue guarantees that the notification request won't be lost, just delayed, thus resolving the user experience flaw.