## Exercises

**Exercise 1**
A system uses a token bucket algorithm to rate limit an API endpoint. The bucket has a capacity of 10 tokens and is refilled at a rate of 2 tokens per second. At time t=0, the bucket is full. A client makes the following requests:
- t=0s: 3 requests
- t=1s: 4 requests
- t=2.5s: 5 requests

Trace the state of the token bucket at each timestamp and determine which of the requests are accepted and which are rejected.

**Exercise 2**
A video streaming platform needs to send data packets to a client device with a low-powered, fixed-bandwidth network connection. The platform generates video chunks in bursts, but the client's buffer can overflow if it receives data faster than it can process it. Of the algorithms discussed (token bucket, leaky bucket, window counters), which would be most suitable for managing the *outbound* traffic from the platform's server to the client? Justify your choice by explaining how the algorithm's mechanism addresses the specific problem.

**Exercise 3**
A promotions service for an e-commerce site offers a "lightning deal" that starts precisely at the top of every hour. The service uses a fixed window counter algorithm to limit coupon claims to 1000 per user per hour. Immediately after the deal starts (e.g., at 10:00:00 AM), a user's automated script sends 1000 requests, which are all successful. What specific problem might this user encounter if they try to send another 1000 requests at 10:59:59 AM, and why does this happen with this particular algorithm?

**Exercise 4**
An API uses a sliding window log algorithm to enforce a rate limit of 5 requests per 60 seconds. A user has made requests with the following timestamps (in seconds since epoch): `[1000, 1015, 1020, 1035]`.
If a new request arrives at timestamp `1065`, will it be accepted or rejected? Show the state of the request log that is evaluated for this new request and explain your reasoning.

**Exercise 5**
You are designing the architecture for a new multi-tenant SaaS application. All API requests from different tenants (customers) are routed through a central API Gateway before reaching the various microservices. You need to implement a rate-limiting strategy to ensure fair usage and prevent any single tenant from overwhelming the system.
Describe where you would implement this rate limiting and which algorithm you would choose. Justify your decision by referencing the role of the API Gateway and the specific requirements of a multi-tenant environment.

**Exercise 6**
A critical payment processing microservice in your system is protected by a Circuit Breaker. When the service experiences high error rates or latency, the circuit breaker trips, temporarily blocking all requests to prevent a cascading failure. However, you've noticed that the service is frequently overloaded by legitimate but spiky traffic, causing the circuit breaker to trip too often.
Explain how you could use a rate-limiting algorithm *in combination with* the existing Circuit Breaker to create a more resilient system. Describe the role each component would play and why this dual approach is more effective than relying on the circuit breaker alone.

---

## Answer Key

**Answer 1**
Here is the step-by-step trace of the token bucket's state:

1.  **t=0s (Initial state):**
    *   Tokens in bucket: 10 (full).
    *   Requests arrive: 3.
    *   Are 3 tokens available? Yes (10 >= 3).
    *   **Action:** Accept all 3 requests.
    *   Tokens remaining: 10 - 3 = 7.

2.  **t=1s (1 second has passed):**
    *   Tokens to add: 1s * 2 tokens/s = 2 tokens.
    *   Tokens before requests: 7 + 2 = 9.
    *   Requests arrive: 4.
    *   Are 4 tokens available? Yes (9 >= 4).
    *   **Action:** Accept all 4 requests.
    *   Tokens remaining: 9 - 4 = 5.

3.  **t=2.5s (1.5 seconds have passed since last event):**
    *   Tokens to add: 1.5s * 2 tokens/s = 3 tokens.
    *   Tokens before requests: 5 + 3 = 8.
    *   Requests arrive: 5.
    *   Are 5 tokens available? Yes (8 >= 5).
    *   **Action:** Accept all 5 requests.
    *   Tokens remaining: 8 - 5 = 3.

**Conclusion:** All requests from the client are accepted.

**Answer 2**
The most suitable algorithm is the **Leaky Bucket**.

**Reasoning:**
The problem is about smoothing out bursty *outbound* traffic to match a consumer with a fixed processing rate.

*   **Leaky Bucket Mechanism:** This algorithm works like a funnel. It takes an incoming burst of requests (or data packets) and places them in a queue (the bucket). It then processes them at a fixed, constant rate.
*   **Application to the Problem:** The server can dump a burst of video chunks into the leaky bucket queue. The bucket will then "leak" these packets out to the client at a steady, predictable rate that matches the client's network bandwidth. This prevents overwhelming the client's buffer and ensures a smooth playback experience.
*   **Why Not Token Bucket?** A token bucket is designed to handle incoming bursts by allowing a certain number of requests through quickly as long as tokens are available. For outbound traffic, this would just pass the burst directly on to the client, which is the exact problem we are trying to solve.

**Answer 3**
The problem the user will encounter is that their requests at 10:59:59 AM will be rejected. This is due to the "edge boundary" issue inherent in the fixed window counter algorithm.

**Reasoning:**
*   **Fixed Window Behavior:** The algorithm defines a fixed time window (e.g., 10:00:00 to 10:59:59). The counter for a user is reset only at the beginning of the next window (11:00:00).
*   **Scenario Analysis:**
    *   The user's first 1000 requests at 10:00:00 AM use up their entire quota for the 10:00 AM window.
    *   When they send more requests at 10:59:59 AM, they are still within the same 10:00:00-10:59:59 window.
    *   The counter is still at 1000, so all new requests are rejected.
*   **The Flaw:** This allows a user to consume their entire quota for a period in a very short burst at the beginning of the window, and then do the same thing immediately when the next window starts (e.g., at 11:00:00). This can effectively allow a burst of 2000 requests in a very short time frame (e.g., from 10:59:59 to 11:00:01), which can still overload the system.

**Answer 4**
The request will be **accepted**.

**Reasoning:**
The sliding window log algorithm works by checking the timestamps of all requests in the last 60 seconds *relative to the new request's timestamp*.

1.  **New Request Timestamp:** 1065.
2.  **Window Start Time:** 1065 - 60 = 1005.
3.  **Evaluate Existing Log:** The current log is `[1000, 1015, 1020, 1035]`.
4.  **Filter Log for Window:** We must discard any timestamps that are older than the window's start time (1005).
    *   Timestamp `1000` is less than `1005`, so it is discarded.
    *   The relevant log for this new request is `[1015, 1020, 1035]`.
5.  **Count Requests in Window:** The number of requests in the relevant log is 3.
6.  **Compare to Limit:** The current count (3) is less than the rate limit (5).
7.  **Conclusion:** The new request is accepted. After it is accepted, the new log will be `[1015, 1020, 1035, 1065]`.

**Answer 5**
**Implementation Location:** The rate limiting should be implemented at the **API Gateway**.

**Reasoning for Location:**
*   **Centralized Control:** The API Gateway is a single entry point for all requests. Implementing rate limiting here provides a centralized place to manage and apply policies without duplicating logic in every microservice.
*   **Decoupling:** It keeps the rate-limiting concern separate from the business logic of the individual microservices. Services can focus on their core tasks, and the gateway handles the cross-cutting concern of traffic management.
*   **Efficiency:** The gateway can reject excessive traffic early, before it consumes resources from backend services, protecting the entire system.

**Algorithm Choice:** A **Token Bucket** algorithm configured on a **per-tenant (or per-API-key) basis**.

**Reasoning for Algorithm:**
*   **Fairness:** Applying the limit per-tenant ensures that one misbehaving or high-traffic customer cannot impact the service availability for other customers. This is crucial in a multi-tenant architecture.
*   **Flexibility for Bursts:** The token bucket algorithm is ideal because it allows tenants to have short bursts of traffic (e.g., running a report, syncing data) up to the bucket's capacity, which provides a good user experience. The refill rate ensures that over the long term, their average usage stays within the defined limit. This is more flexible than a strict leaky bucket or fixed window.

**Answer 6**
Combining a rate limiter with a circuit breaker creates a layered defense that is more resilient and proactive.

**Role of Each Component:**
1.  **Rate Limiter (The Proactive Guard):** The rate limiter acts as the first line of defense. It would be configured at the client or API gateway level to cap the number of requests sent to the payment service within a given time period. Its primary role is **load-shedding**—preventing the service from becoming overloaded in the first place by smoothing out traffic spikes.
2.  **Circuit Breaker (The Reactive Failsafe):** The circuit breaker remains wrapped around the calls to the payment service. Its primary role is **fault tolerance**. It monitors the health of the service (via error rates, latency). If the service fails *for any reason* (not just overload, but also bugs, downstream failures, network issues), the circuit breaker will trip and stop sending requests to it.

**Why the Dual Approach is More Effective:**
*   **Preventing the Trip:** The rate limiter's main benefit is that it can prevent the conditions (high load) that would cause the circuit breaker to trip. This leads to higher availability, as the service remains operational instead of being taken offline by the breaker.
*   **Handling Different Failure Modes:** The circuit breaker is still essential because rate limiting can't prevent all failures. The payment service might fail due to a bad deployment, a database crash, or a failure in a downstream dependency. In these cases, the rate limiter would be ineffective, but the circuit breaker would correctly trip to protect the overall system.
*   **Graceful Degradation:** The rate limiter gracefully degrades the user experience by slowing them down, whereas the circuit breaker results in a hard failure (requests are immediately rejected). The combined approach ensures that hard failures only happen when the service is truly unhealthy, not just busy.