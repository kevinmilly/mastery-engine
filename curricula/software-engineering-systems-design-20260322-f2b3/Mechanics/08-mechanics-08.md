# Rate Limiting Algorithms

## The Hook
After this lesson, you will be able to design a system that remains fair and stable for all users, even when some clients accidentally or maliciously bombard it with requests.

Imagine a busy highway toll plaza. The goal is to let traffic flow smoothly without letting any single on-ramp flood the highway and cause a total standstill. Different tolling strategies are like different rate limiting algorithms: some count cars per minute, some sell a limited number of "fast passes" that replenish over time. Rate limiting is how we install a fair and orderly toll plaza for our digital services.

## Why It Matters
Rate limiting is a fundamental defense mechanism for any service exposed to the internet. Without it, a system is vulnerable to simple failures that can cascade into total outages.

Imagine your team launches a new public API. A developer using your API writes a buggy script that accidentally creates an infinite loop, sending thousands of requests per second to your service. Without rate limiting, this single, unintentional bug consumes all your server resources—CPU, memory, database connections. Suddenly, your service becomes slow or completely unresponsive for *every other user*. Your monitoring alarms go off, your team is paged in the middle of the night, and your company's reputation suffers.

Understanding rate limiting isn't just about preventing malicious attacks; it's about building resilient systems that can withstand a simple, common class of bugs and ensure fair access for everyone. It’s the difference between a robust service and a fragile one.

## The Ladder
At its core, rate limiting is about one thing: counting requests over a period of time and rejecting them if a limit is exceeded. The challenge is in *how* you count. Let's walk up the ladder of common algorithms, from the simplest to the most flexible.

### 1. Fixed Window Counter
This is the most intuitive approach. You set a time window and a request limit.

*   **Mechanism:**
    *   Define a window, say, "one minute."
    *   Define a limit, say, "100 requests."
    *   For every incoming request, we increment a counter for the current minute.
    *   If the counter is less than 100, we process the request.
    *   If the counter is 100 or more, we reject the request.
    *   When a new minute begins, we reset the counter to zero.

*   **Implication:** This is simple to implement. However, it has a major flaw. Imagine a user sends 100 requests in the last second of a minute (e.g., at 12:00:59). The requests are all allowed. Then, they send another 100 requests in the first second of the next minute (at 12:01:00). These are also allowed because the counter was reset. The user has successfully sent 200 requests in just two seconds, completely bypassing the intended rate of "100 per minute." This burst at the "edge" of the window can still overwhelm your service.

### 2. Sliding Window Counter
This algorithm fixes the "edge" problem of the fixed window. It provides a much smoother and more accurate rate limit.

*   **Mechanism:**
    *   We still have a window (e.g., 60 seconds) and a limit (e.g., 100 requests).
    *   Instead of resetting a counter on the dot, the window is continuous. At any given moment, we look back and count the requests in the *last 60 seconds*.
    *   For example, at 12:01:30, we count all requests that arrived between 12:00:30 and 12:01:30.
    *   If this count is less than 100, the new request is allowed. Otherwise, it's rejected.

*   **Implication:** This approach smooths out bursts. The user who sent 200 requests across the minute boundary in our last example would be blocked. At 12:01:00, the sliding window would count all requests from 12:00:00 to 12:01:00, see the 100 requests from the previous second, and reject the new ones. This is more robust but requires storing timestamps for recent requests, making it more memory-intensive than a simple counter.

### 3. Token Bucket
This is one of the most common and flexible algorithms, especially for APIs. It allows for bursts of traffic while maintaining a fair average rate over time.

*   **Mechanism:**
    *   Imagine each user has a bucket. The bucket has a maximum capacity of **tokens**, say 100.
    *   The bucket is refilled with new tokens at a fixed rate, say 1 token per second.
    *   When a request arrives, we check if there is at least one token in the bucket.
        *   If yes, we remove a token and process the request.
        *   If no, the bucket is empty, and we reject the request.
    *   If the bucket is already full, any new tokens that are supposed to be added are simply discarded.

*   **Implication:** This model elegantly handles bursts. A user who has been inactive for a while will have a full bucket (100 tokens). They can then make a "burst" of 100 requests all at once. After that, their bucket is empty, and they can only make new requests at the refill rate (1 per second). This is a great model for APIs because it allows clients to perform brief, intensive tasks without being unfairly punished, while still protecting the service from sustained high traffic.

### 4. Leaky Bucket
The Leaky Bucket algorithm is similar in name to the Token Bucket but serves a different purpose: to enforce a *constant* processing rate.

*   **Mechanism:**
    *   Imagine a bucket with a small hole at the bottom. Requests flow into the bucket.
    *   The bucket is actually a queue (first-in, first-out).
    *   Requests are processed (drip out of the hole) at a fixed, constant rate, for example, 5 requests per second.
    *   If requests arrive faster than they are processed, they fill up the bucket (the queue).
    *   If the bucket becomes full, any new incoming requests are discarded.

*   **Implication:** The key difference is that Leaky Bucket smooths out incoming traffic into a steady, predictable outbound stream. It does *not* allow for bursts. It's ideal for situations where the downstream system can only handle a specific, fixed rate and would break if it received a sudden spike of traffic.

Connecting back to our prior lessons, rate limiting is a feature often implemented in an **API Gateway**. The gateway sits in front of all your other services and applies these rules, protecting your entire system without each individual service needing to worry about it.

## Worked Reality
A small fintech company provides a real-time stock price API. They offer a "hobbyist" plan for free, which they want to protect from overuse. Their goal is to allow developers to build small applications but prevent a single user from hogging the expensive data feed.

They decide to implement rate limiting using the **Token Bucket** algorithm for the hobbyist tier.

**Here are the parameters they set for each user:**
*   **Bucket Capacity:** 60 tokens.
*   **Refill Rate:** 1 token every 2 seconds (or 30 tokens per minute).

**Let's walk through a scenario with a developer, Alex:**

1.  **Initial State:** Alex signs up and gets their API key. Their token bucket is created and immediately filled to its capacity of 60 tokens.
2.  **First Burst:** Alex's application starts up and needs to fetch initial data for 50 different stocks. It sends 50 requests in rapid succession. Since the bucket has 60 tokens, all 50 requests are processed. 50 tokens are consumed, leaving 10 in the bucket.
3.  **Sustained Usage:** Now, Alex's app is running and polls for updates for a single stock every second.
    *   The first request arrives. The bucket has 10 tokens. The request is allowed. 9 tokens remain.
    *   A second later, another request arrives. The bucket has 9 tokens. The request is allowed. 8 tokens remain.
    *   A second later, another request arrives. During these two seconds, one new token has been added (refill rate is 1 per 2 seconds). The bucket now has 8 + 1 = 9 tokens. The request is allowed. 8 tokens remain.
    *   Alex's app is consuming tokens faster than they are refilled. After about 18 seconds of this, the bucket will be empty.
4.  **Hitting the Limit:** The bucket is now empty. Alex's app sends another request. The API gateway checks the bucket, sees zero tokens, and rejects the request with an `HTTP 429 Too Many Requests` status code. The response headers also inform Alex that they can retry in 2 seconds (when the next token is due to arrive).
5.  **Recovery:** Alex's app stops sending requests for a minute. During this 60-second pause, 30 new tokens are added to the bucket (60 seconds / 2 seconds per token). The bucket now has 30 tokens, ready for another, smaller burst.

By choosing Token Bucket, the company allows developers like Alex a helpful initial burst, while ensuring the long-term average usage stays within the fair limit of 30 requests per minute.

## Friction Point
The most common point of confusion is thinking that **Token Bucket** and **Leaky Bucket** are just two different names for the same thing. They are not.

**The Wrong Mental Model:** "Both use a 'bucket' to control requests. One uses tokens, the other uses a queue, but the result is the same: requests get limited."

**Why It's Tempting:** The "bucket" metaphor is very strong and sounds similar in both cases. Both are indeed rate-limiting algorithms.

**The Correct Mental Model:**
*   **Token Bucket's primary purpose is to allow for bursts while enforcing an average rate.** It's a "permission-based" system. You spend a token to get permission to send a request *now*. If you've saved up tokens, you can burst.
*   **Leaky Bucket's primary purpose is to smooth out traffic into a constant, steady stream.** It's a "traffic-shaping" system. All requests are forced into a single-file line (a queue) and processed at a fixed pace, regardless of how bursty they were when they arrived.

Think of it this way:
*   A **Token Bucket** is like a mobile phone plan with rollover data. You have a monthly data limit (the average rate), but if you used less data last month, you can use more this month (a burst).
*   A **Leaky Bucket** is like the security line at an airport. Even if three buses of people arrive at once (a burst), the agents will only process travelers at a fixed, steady pace. The line gets longer, but the processing rate at the front remains constant.

Choose Token Bucket when you want to be flexible and allow users to have short periods of high activity. Choose Leaky Bucket when the system you're protecting *must* receive traffic at a constant rate and cannot handle spikes.

## Check Your Understanding
1.  What is the "edge problem" with the Fixed Window Counter algorithm, and how does the Sliding Window approach solve it?
2.  An API uses a Token Bucket with a capacity of 100 and a refill rate of 2 tokens per second. A client has been idle for a full minute. How many requests can they make in a quick burst before being rate-limited?
3.  Under what conditions would you choose a Leaky Bucket algorithm over a Token Bucket algorithm to protect a service?

## Mastery Question
You are designing a system that sends push notifications to users' mobile phones. Your internal services might generate thousands of notification requests in a few seconds (e.g., during a major breaking news alert). However, the external push notification service provider (like Apple or Google) has a strict policy: your account will be temporarily suspended if you send them traffic that exceeds 500 requests per second, even for a moment.

Which rate limiting algorithm would you place between your internal services and the external provider? Justify your choice by explaining why it's a better fit than the other algorithms discussed for this specific problem.