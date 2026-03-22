## Exercises

**Exercise 1**
You type `www.example-news.com` into your web browser and press Enter. The homepage loads, showing the latest headlines. In this interaction, identify the client, the server, and describe the contents of the initial request and the resulting response.

**Exercise 2**
An online banking service has an API endpoint `/check_balance` that requires a user's authentication token to be sent with every request. If a user makes two separate requests to this endpoint a minute apart, the server processes them independently, without relying on any memory of the first request. Explain why this design makes the server "stateless" and identify one key advantage of this approach for the banking service.

**Exercise 3**
A user clicks "Submit Order" in a food delivery app. The app could be designed in two ways:
1.  **Synchronous:** The app freezes, showing a spinner, until the restaurant's system confirms it has accepted the order. The user cannot use the app during this time.
2.  **Asynchronous:** The app immediately shows an "Order submitted! We'll notify you when the restaurant confirms." message. The user can continue browsing the app, and a push notification arrives later with the confirmation.

Which approach provides a better user experience, and why? Justify your answer using the concept of blocking vs. non-blocking requests.

**Exercise 4**
A user adds three different items to their shopping cart on an e-commerce website. According to the principles of a stateless server, the server should not store the contents of this shopping cart in its local memory between the user's requests. How, then, can the server "remember" the cart's contents each time the user navigates to a new page? Describe one common mechanism for achieving this.

**Exercise 5**
You are designing a chat application. When User A sends a message to User B, User B needs to see it immediately without having to manually refresh their app. The basic synchronous request-response pattern (where a client requests data) does not work well for this. Explain why, and propose an alternative interaction model that allows the server to send information to User B's client proactively.

**Exercise 6**
A user wants to upload a 500 MB video file to a cloud storage service through a web interface. A junior developer proposes a simple solution: the client sends a single HTTP request containing the entire 500 MB file, and the server sends a "Success" response after the entire file is received and saved. Identify two significant risks or problems with this synchronous, single-request design, especially on an unreliable network.

---

## Answer Key

**Answer 1**
*   **Client:** The user's web browser. It initiates the communication.
*   **Server:** The web server hosting `www.example-news.com`. It waits for and responds to requests.
*   **Request:** The browser sends an HTTP GET request to the server, asking for the content of the homepage (e.g., `GET /`).
*   **Response:** The server processes the request and sends back an HTTP response containing the HTML, CSS, and JavaScript files needed to render the news homepage.

**Reasoning:** This is the fundamental client-server pattern. The client (browser) makes a specific request for a resource, and the server (web server) provides that resource in a response.

**Answer 2**
The server is "stateless" because it treats every request as a brand new, independent transaction. It relies entirely on the data provided *in the request* (the authentication token) to process it, rather than storing information about the user's session (like "User X is logged in") in its own memory.

**Key Advantage:** Scalability. Since the server doesn't need to store session state, any request from a given user can be handled by any server instance. This makes it easy to add more servers (horizontal scaling) to handle increased load without worrying about which server has which user's data.

**Answer 3**
The **asynchronous** approach provides a better user experience.

**Reasoning:** The synchronous approach uses a "blocking" request. The application's user interface is blocked and unusable until the response is received. For an action that could take an unknown amount of time (waiting for a busy restaurant to confirm), this leads to a frustrating user experience.

The asynchronous approach uses a "non-blocking" request. The client sends the request and can immediately continue its own processing (allowing the user to interact with the app). The response (the confirmation) is handled later when it arrives. This makes the application feel much more responsive and efficient to the user.

**Answer 4**
The server can remain stateless by delegating the storage of the shopping cart state back to the client.

**Mechanism:** When a user adds an item to the cart, the server generates an updated representation of the cart. It then includes this cart data in its response to the client. The client (the browser) stores this data (e.g., in a cookie or in local storage). For every subsequent request the user makes (like visiting a new page), the client sends the shopping cart data back to the server along with the request. This way, the server has all the information it needs to process the request without having to store anything about that specific user's session itself.

**Answer 5**
The standard synchronous request-response pattern is unsuitable because it is client-initiated. User B's client would have no way of knowing a new message has arrived unless it constantly sends requests to the server asking, "Are there any new messages yet?" This technique, called polling, is very inefficient.

**Alternative Model:** A better model is one where the server can *push* data to the client. A common implementation is using a **WebSocket**. A WebSocket establishes a persistent, two-way connection between the client and server. When User A's message arrives at the server, the server can immediately push that message down the open WebSocket connection to User B's client, allowing it to appear instantly. This is far more efficient and provides the real-time experience required for a chat app.

**Answer 6**
This design is problematic for two main reasons:

1.  **High Probability of Failure:** A single, long-running synchronous request for a large file is fragile. If the user's network connection drops for even a moment during the 500 MB transfer, the entire request fails, and the upload has to be restarted from the very beginning. This is incredibly frustrating for the user.
2.  **Resource Inefficiency:** Both the client and server must keep a connection open and resources allocated for the entire duration of the upload. This can be very long. On the server side, this can tie up a worker thread that could be serving other, faster requests, limiting the server's ability to handle concurrent users. The client's browser may also become unresponsive during the upload.

**Reasoning:** A better approach would be to break the file into smaller chunks. The client could send each chunk in a separate request. This allows for resumable uploads (if a chunk fails, only that chunk needs to be resent) and provides better progress feedback to the user. This is an asynchronous process where multiple smaller request-response cycles occur instead of one large, monolithic one.