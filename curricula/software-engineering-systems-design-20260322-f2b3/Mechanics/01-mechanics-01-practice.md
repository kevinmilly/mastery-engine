## Exercises

**Exercise 1**
A load balancer distributes incoming requests to three servers: Server A, Server B, and Server C. It uses a simple Round Robin algorithm, starting with Server A. Assuming no servers fail, determine which server handles each of the first 6 incoming user requests.

**Exercise 2**
A load balancer is configured with the Least Connections algorithm. It manages three servers with the following current open connections:
- Server X: 120 connections
- Server Y: 85 connections
- Server Z: 88 connections

A burst of three new, long-lasting requests arrives. To which server will each request be routed, in order?

**Exercise 3**
A video streaming service uses a load balancer with the IP Hash algorithm to direct users to one of several media servers. A large company reports that their employees, all working from the same office building, are experiencing buffering and poor streaming quality, even though the service works perfectly for them at home. Other users are not reporting issues. Based on the IP Hash algorithm, what is the most likely technical cause of this problem?

**Exercise 4**
An e-commerce site uses a load balancer to manage traffic for its shopping cart service. They want to ensure that once a user adds an item to their cart, all their subsequent requests in that session go to the same server. They have enabled sticky sessions. A user reports that after 45 minutes of inactivity on the site, they returned to find their shopping cart empty. The server they were connected to never went down. What is the most probable reason for the user's session data being lost?

**Exercise 5**
You are designing a system for a high-traffic online document collaboration tool (like Google Docs). Multiple users need to be connected to the same server to see real-time edits for a specific document. The system must be resilient to server failures.

Your team is debating two load balancing configurations:
1.  **IP Hash:** Simple to implement.
2.  **Least Connections with Sticky Sessions:** Ensures better load distribution.

Which configuration is a better choice for this specific application? Justify your answer by explaining a critical weakness of the rejected option in this context.

**Exercise 6**
A load balancer manages four servers (S1, S2, S3, S4) using a Round Robin algorithm. The load balancer is configured to perform a health check on each server every 5 seconds. If a server fails a health check, it is immediately removed from the rotation. If it passes a subsequent check, it is added back.

At T=0s, all servers are healthy. The request sequence is S1, S2, S3, S4, S1, ...
At T=7s, server S2 crashes and stops responding.

Trace the destination server for each of the next 6 requests that arrive starting at T=8s. Explain the state of the load balancer's server pool at T=11s.

---

## Answer Key

**Answer 1**
The Round Robin algorithm cycles through the list of servers in order.

- **Request 1:** Goes to Server A (the starting point).
- **Request 2:** Goes to Server B.
- **Request 3:** Goes to Server C.
- **Request 4:** The cycle repeats, goes to Server A.
- **Request 5:** Goes to Server B.
- **Request 6:** Goes to Server C.

**Answer 2**
The Least Connections algorithm always sends the next request to the server with the fewest active connections at that moment. Since the requests are long-lasting, each one will increase the connection count of the server it's assigned to.

1.  **First Request:** Server Y has the fewest connections (85). The request is routed to Server Y. Its new connection count becomes 86.
2.  **Second Request:** The counts are now X=120, Y=86, Z=88. Server Y still has the fewest connections. The second request is also routed to Server Y. Its new connection count becomes 87.
3.  **Third Request:** The counts are now X=120, Y=87, Z=88. Server Y still has the fewest connections. The third request is also routed to Server Y.

**Answer 3**
The most likely cause is that all employees at the company are accessing the internet through a single corporate gateway or proxy. This means they all appear to the load balancer as having the same public IP address.

The IP Hash algorithm creates a hash of the source IP address to determine which server to send the request to. Since all employees share the same source IP, the algorithm consistently routes all of their traffic to a single media server. This one server becomes overloaded, leading to poor performance for all users from that office, while the other servers remain underutilized.

**Answer 4**
The most probable reason is that the sticky session had a timeout configured. Sticky sessions are often implemented using cookies with an expiration time. To conserve server resources, it's common to set a session timeout (e.g., 30 minutes). After 45 minutes of inactivity, the user's session cookie likely expired. When they returned, the load balancer did not have a valid session identifier and treated them as a new user, routing them to a potentially different server that did not have their previous cart data.

**Answer 5**
The better choice is **Least Connections with Sticky Sessions**.

**Reasoning:** The critical requirement is that all collaborators on a single document are on the same server. IP Hash attempts to solve this by hashing the user's IP, but it does not guarantee this outcome. If collaborators are in different locations (with different IP addresses), IP Hash would likely send them to *different* servers, breaking the real-time editing feature.

The weakness of IP Hash here is that it links a *user* to a server, but the application requires linking a *document session* to a server.

Least Connections with Sticky Sessions is superior because the application can create a session identifier for the specific document (e.g., `doc-ID-123`). The load balancer can then be configured to use an application-level cookie to make the session "sticky," ensuring anyone working on `doc-ID-123` is routed to the correct server. This approach correctly groups users by their activity (the document) rather than their network location (IP address), while also distributing the load of different documents evenly across servers.

**Answer 6**
**Sequence of Events and Routing:**

1.  **T=0s to T=7s:** The system is normal. The load balancer routes requests to S1, S2, S3, S4, and so on. The last health check at T=5s showed all servers as healthy.
2.  **T=7s:** Server S2 crashes.
3.  **T=8s to T=10s:** The load balancer does not yet know S2 has crashed. Its last health check at T=5s passed. It will continue to use its full server pool (S1, S2, S3, S4) until the next health check fails for S2. Assuming the last request went to S1, the sequence would attempt to continue as normal.
4.  **T=10s:** The load balancer performs its next scheduled health check. It detects that S2 is unresponsive and fails the check. It immediately removes S2 from the active server pool. The new active pool is now {S1, S3, S4}.
5.  **T=11s:** The load balancer's server pool is {S1, S3, S4}. It will now route traffic in a round-robin fashion only among these three healthy servers.

**Tracing the 6 requests starting at T=8s:**
Let's assume the request just before T=8s went to S4.

- **Request 1 (T=8s):** Load balancer's pool is {S1, S2, S3, S4}. The next server is S1. Request goes to **S1**.
- **Request 2 (T=8-9s):** Load balancer's pool is {S1, S2, S3, S4}. The next server is S2. Request is sent to **S2**, but it will fail/timeout because S2 is down.
- **Request 3 (T=9-10s):** Load balancer's pool is {S1, S2, S3, S4}. The next server is S3. Request goes to **S3**.
- **Request 4 (T=10-11s):** The health check at T=10s has just completed. The pool is now {S1, S3, S4}. The next server in the *original sequence* was S4. S4 is healthy, so the request goes to **S4**.
- **Request 5 (T=11s+):** The new routing is now based on the smaller, healthy pool. The cycle continues from S4 to the next available server, which is S1. Request goes to **S1**.
- **Request 6 (T=11s+):** The next server in the healthy pool {S1, S3, S4} is S3. Request goes to **S3**.