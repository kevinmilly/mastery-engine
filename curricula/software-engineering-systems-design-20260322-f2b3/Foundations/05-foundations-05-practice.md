## Exercises

**Exercise 1**
An e-commerce site's inventory management service was monitored for a 30-day period (720 hours). During this time, it experienced a total of 3.6 hours of downtime. When the service was operational, it was discovered that 1 in every 1,000 requests for an item's stock level returned an incorrect count due to a data synchronization bug. Calculate the availability of the service and comment on whether it is reliable.

**Exercise 2**
A user of a cloud-based document editor complains: "I can always open the application, and it never crashes. However, every time I save a document, the formatting gets corrupted. I have to manually fix the tables and fonts after every single save." Is the user's primary complaint about the system's availability or its reliability? Justify your answer.

**Exercise 3**
You are a system architect choosing a critical database for a new hospital's patient record system. You have two options:
- **Database X:** This is a new, cutting-edge distributed database. It is designed to never go down and has an availability of 99.999%. However, due to its complex consistency model, there is a 0.01% chance that a write operation will be silently lost under high load.
- **Database Y:** This is a traditional, single-server database. It requires 1 hour of scheduled downtime for maintenance each month. When it is online, its data writing operations are 100% correct and durable.

Which database is the better choice for this specific application? Justify your choice by analyzing the trade-offs between availability and reliability.

**Exercise 4**
A team building a real-time stock ticker application decides to implement a "circuit breaker" pattern. If the primary, high-speed data feed from the stock exchange becomes unavailable, the system automatically switches to a secondary, slower, and less accurate backup feed. This switch is seamless to the end-user, but the data they see might be delayed by up to 60 seconds and missing some trades. How does this design choice affect the system's availability and its reliability?

**Exercise 5**
A content delivery network (CDN) is responsible for serving images for thousands of websites. The CDN's servers are always online and responding to requests (99.999% availability) and always serve the exact image that was requested (100% reliability). However, due to a routing misconfiguration, all requests from users in Europe are being served from a data center in Australia. This introduces significant latency, causing images to load very slowly for European users. Based on the pure definitions, the system is performing well. How does this scenario challenge the sufficiency of using only availability and reliability metrics to measure system quality?

**Exercise 6**
Imagine you are designing an online multiplayer game's chat system. During periods of extremely high server load (e.g., a major in-game event), the system is designed to purposefully drop 10% of non-critical messages (e.g., general "hello" messages) to ensure that critical messages (e.g., private messages or team-strategy chats) are delivered with low latency. Is this a trade-off that prioritizes availability or reliability? Justify your reasoning and explain why this might be an acceptable design for this specific use case.

---

## Answer Key

**Answer 1**
**Calculation:**
- Total time = 720 hours
- Downtime = 3.6 hours
- Uptime = Total time - Downtime = 720 - 3.6 = 716.4 hours
- Availability = (Uptime / Total time) * 100
- Availability = (716.4 / 720) * 100 = 99.5%

**Analysis:**
The system has an availability of 99.5%. While this might be acceptable for some systems, it is not considered highly available. More importantly, the system is **unreliable**. The fact that 1 in 1,000 requests returns incorrect data means the system is not performing its function correctly, even when it is available. For an inventory system, this is a critical flaw, as it could lead to selling items that are out of stock.

**Answer 2**
The user's primary complaint is about the system's **reliability**.

**Reasoning:**
The user explicitly states they can "always open the application" and it "never crashes," which are indicators of high availability. The system is operational and responsive. However, the core function—saving a document correctly—is failing. The system is not performing its specified function correctly under normal conditions, which is the definition of low reliability.

**Answer 3**
**Database Y** is the better choice.

**Reasoning:**
For a hospital's patient record system, the correctness and integrity of the data are paramount. A system that might silently lose a patient's medical data, even rarely, is unacceptably dangerous. This is a failure of reliability.

Database X offers extremely high availability but poor reliability (data loss is a correctness issue). Database Y has lower availability (scheduled downtime of 1 hour/month, which is ~99.86% availability), but it is highly reliable. In a medical context, it is far better to have a system that is predictably unavailable for a short, scheduled period than one that is always on but might lose critical information at any time. The trade-off overwhelmingly favors reliability.

**Answer 4**
This design choice **increases availability at the cost of reliability**.

**Reasoning:**
- **Availability is increased:** From the user's perspective, the system is "always on." Instead of receiving an error or a blank screen when the primary feed fails, they continue to receive data. The system remains operational, thereby increasing its total uptime.
- **Reliability is decreased:** The system's specified function is to provide *real-time, accurate* stock data. By knowingly switching to a delayed and less complete data source, the system is no longer performing its function correctly under those conditions. The data is stale and potentially inaccurate, which means the system's reliability is compromised.

**Answer 5**
This scenario shows that availability and reliability metrics do not capture the entire user experience, specifically the performance dimension (covered by concepts like latency).

**Reasoning:**
- The system is **available** because it is up and successfully responding to 100% of requests.
- The system is **reliable** because it is correctly fulfilling those requests by returning the proper image.
- However, the high latency makes the system *unusable* for many users, who perceive it as "broken" or "unavailable." This demonstrates that a third pillar of system quality, performance (latency and throughput), is also critical. A system can be technically available and reliable but still fail to meet user expectations if its performance is poor. This is why Service Level Objectives (SLOs) often include latency metrics in addition to availability.

**Answer 6**
This trade-off prioritizes **availability** (and performance) over perfect **reliability**.

**Reasoning:**
- **Prioritizing Availability:** The system is designed to remain operational and responsive even under extreme load. By dropping some messages, it prevents the entire chat service from crashing or becoming so slow that it's unusable for everyone. It stays available for its most critical functions.
- **Compromising Reliability:** The reliability of a chat system is defined by its ability to deliver every message sent. By intentionally dropping messages, the system is not performing its complete function correctly 100% of the time. It is knowingly becoming unreliable for a subset of messages.
- **Why it's acceptable:** For a game chat, the temporary loss of non-critical messages is often a better outcome than the entire chat system freezing or lagging severely. The designers made a conscious judgment that a partially-functional but responsive system is better than a perfectly reliable but unavailable one during peak moments. They prioritized the core user experience (critical comms) over the completeness of the non-critical experience.