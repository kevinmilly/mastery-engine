## Exercises

**Exercise 1**
An online gaming platform uses two identical servers for its matchmaking service. All player requests are sent to Server 1. If Server 1 goes offline, an engineer is paged to manually reroute all traffic to Server 2. Which fault tolerance strategy is being used here? Describe the two key characteristics of this setup.

**Exercise 2**
A popular news website is experiencing a massive surge in traffic due to a breaking story, causing its database to slow down significantly. The system automatically responds by temporarily disabling the comment section and personalized recommendations, but it continues to serve the news articles. What fault tolerance principle does this demonstrate? Why is this a better user experience than showing an error page?

**Exercise 3**
A team is building a critical service that processes payment transactions. They have implemented a system with three redundant servers. A "health check" system pings each server every 10 seconds. If a server fails to respond to a single ping, it is immediately removed from service. Another team argues that this is too aggressive and could lead to problems if there's a brief, temporary network glitch. What specific problem might this "aggressive failover" cause, and how would requiring two consecutive failed pings before failover change the system's behavior?

**Exercise 4**
An online retail company wants to ensure its "Add to Cart" service is highly available. They set up three independent servers, each with its own copy of the shopping cart database. When a user adds an item to their cart, the request is sent to all three servers simultaneously. The operation is considered successful if at least two of the three servers confirm the write. If one server is down, how does this system continue to function? What is the maximum number of servers that can fail while still allowing the service to operate correctly?

**Exercise 5**
A company runs its primary application on a server in New York. To ensure fault tolerance, they maintain a "hot standby" server in the same New York data center that is continuously synchronized. They also have a "cold standby" server in San Francisco with a data backup that is 1 hour old. During a complete New York data center outage, the system fails over to San Francisco. Integrating your knowledge of latency, what will be the two most significant impacts on the user experience immediately after this failover occurs?

**Exercise 6**
A social media application's image-upload service is designed for high availability and scalability using an active-active architecture across three data centers (US-East, US-West, EU). When a user uploads a photo, it is sent to the nearest data center and then asynchronously replicated to the other two. However, the user's feed, which must be strictly consistent, relies on a single, powerful database in US-East with a passive replica in US-West (an active-passive setup).

Analyze this hybrid design. Why might the engineers choose a different fault tolerance strategy for the image storage versus the user feed data? Explain the trade-offs they made regarding availability and data consistency.

---

## Answer Key

**Answer 1**
This is an **active-passive** setup with **manual failover**.

*   **Active-Passive:** Only one server (Server 1) is actively handling traffic at any given time, while the other (Server 2) is a passive standby, ready to take over but not processing requests.
*   **Manual Failover:** The process of switching traffic from the failed server to the standby server requires human intervention (an engineer being paged), rather than happening automatically.

**Answer 2**
This demonstrates the principle of **graceful degradation**.

Instead of failing completely (a total outage or an error page), the system identifies a component under stress (the database) and reduces its functionality to a core, essential service (serving articles). This is a better user experience because the primary function of the website—reading news—is preserved, even though secondary features are temporarily unavailable. It prioritizes availability of the core service over full functionality.

**Answer 3**
The problem with this aggressive failover is the risk of a **false positive**. A temporary network blip lasting a few seconds could cause a healthy server to miss a single ping. The system would mistakenly declare the server "dead" and remove it from service, unnecessarily reducing the system's capacity.

By requiring two consecutive failed pings, the system becomes more resilient to transient, short-lived issues. The detection time for a genuine failure would increase from 10 seconds to 20 seconds, but it would drastically reduce the chances of unnecessarily removing a healthy server due to a temporary network glitch.

**Answer 4**
This system uses redundancy with a quorum-based approach to continue functioning.

If one server is down, a user's request is still sent to the two remaining healthy servers. Since both will confirm the write, the condition "at least two of the three servers confirm" is met, and the operation succeeds.

The maximum number of servers that can fail is **one**. If two servers were to fail, only one would remain to process the request. It could not achieve the required quorum of two confirmations, and the "Add to Cart" service would stop working.

**Answer 5**
The two most significant impacts on user experience will be related to **data loss** and **increased latency**.

1.  **Data Loss:** Because the San Francisco standby relies on a backup that is one hour old, any data written to the primary database in the last hour before the failure (e.g., new user sign-ups, orders placed) will be lost. Users may find that their most recent actions never happened.
2.  **Increased Latency:** Users who are geographically closer to New York will now have their requests travel all the way to San Francisco and back. This significant increase in physical distance will result in higher network latency, making the application feel slower and less responsive.

**Answer 6**
The engineers chose different strategies to balance competing requirements for different parts of the application.

*   **Image Upload Service (Active-Active):** The primary goal here is high availability and low latency for a global user base. Storing image files does not require strict, immediate consistency. If a photo takes a few extra seconds to replicate to other data centers, the user experience is not impacted. The active-active design allows users to upload to their nearest server, improving performance (lower latency) and ensuring the service remains available even if an entire data center fails.
*   **User Feed Data (Active-Passive):** A user's feed (e.g., who follows whom, list of posts) requires strong data consistency. Seeing an inconsistent feed would be confusing and break the user experience. An active-active database setup for this is extremely complex to keep perfectly synchronized. The simpler active-passive design guarantees that all writes go to a single primary source, ensuring consistency.

**Trade-offs:**
*   The image service **trades immediate consistency for higher availability and lower latency**.
*   The user feed service **trades some availability (failover to the passive replica is not instant and is a single point of failure) for guaranteed data consistency**. This is a classic architectural decision where different components of a system are optimized for their specific use case.