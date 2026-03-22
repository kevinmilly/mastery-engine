## Exercises

**Exercise 1**
A user signs up for a new social media app. The 'User Service' handles the request, saves the user's details to a database, and then a welcome email needs to be sent. Which communication pattern (synchronous API call vs. asynchronous message queue) is more appropriate for triggering the welcome email, and why?

**Exercise 2**
A mobile app team and a backend 'Inventory Service' team are working in parallel. The mobile app needs to display whether an item is "In Stock" or "Out of Stock." For these two teams to work without constantly waiting for each other, what single component must they agree on first? Explain its role as a "contract."

**Exercise 3**
An online food delivery service has a single, large application that takes an order, processes payment, and alerts the restaurant. During a flash sale, the payment processing part of the system becomes very slow. Because everything is one system, this slowdown causes the entire website to become unresponsive, and new orders can't even be placed. How could you decompose this system into separate services and use a message queue to prevent the payment slowdown from affecting new order placement?

**Exercise 4**
Consider a ride-sharing app. When a ride is completed, the system must:
1.  Calculate the final fare.
2.  Charge the rider's credit card.
3.  Notify the driver of their earnings.
4.  Generate a receipt for the rider.

Compare a design where the main 'Ride Service' makes four consecutive, synchronous API calls to handle these tasks versus a design where it handles the critical tasks and then publishes a "RideCompleted" event for other services to process. What is the primary advantage of the event-based approach in this scenario?

**Exercise 5**
A social media application has a 'Post Service' for creating posts and a 'Timeline Service' for generating a user's feed. To generate a timeline, the 'Timeline Service' makes a synchronous API call to the 'Post Service' to get the 100 most recent posts from people the user follows. Drawing on the concept of partial failure in distributed systems, describe a specific problem that could make the entire timeline feature unusable, even if the 'Timeline Service' itself is running perfectly.

**Exercise 6**
You are designing a flight booking system. The checkout process involves two steps that must happen in order: reserving a specific seat with the airline's system and then processing the payment. The user needs immediate confirmation of the booking. An engineer on your team suggests the following workflow:
1.  The 'Booking Service' receives a request.
2.  It sends a "ReserveSeat" message to a queue.
3.  It immediately sends a "ProcessPayment" message to the same queue.
4.  It returns a "Booking in progress" message to the user.

Evaluate this design. Is it appropriate for this specific use case? Justify your answer by considering the requirements of the transaction and the user's expectations.

---

## Answer Key

**Answer 1**
An asynchronous message queue is more appropriate.

**Reasoning:**
Saving the user's profile is a critical, core task that must be completed before confirming success to the user. This should be a synchronous operation (e.g., the service writes to its database). However, sending an email can be slow or even fail temporarily (e.g., the email provider's API is down). If the User Service made a synchronous API call to an Email Service, the user would have to wait for the email to be sent before their sign-up was confirmed. If the email service failed, the entire sign-up might fail.

By placing a "SendWelcomeEmail" message on a queue, the User Service can immediately confirm the sign-up to the user. A separate worker or service can then process this message from the queue independently and at its own pace, retrying if necessary, without affecting the core user sign-up experience.

**Answer 2**
They must agree on the **API (Application Programming Interface)** for the 'Inventory Service'.

**Reasoning:**
The API acts as a formal "contract" between the client (the mobile app) and the server (the Inventory Service). This contract defines exactly how to ask for information—for example, that the mobile app must make a `GET` request to a specific URL like `/api/v1/inventory/{itemId}` and that the service will respond with a specific JSON format, like `{"status": "In Stock"}`.

By defining this contract first, the mobile team can build their user interface using a "mock" or fake version of this API that returns predictable data. The backend team can work on the real logic that provides the data. As long as both teams adhere to the contract, their separate parts will work together when integrated, allowing for parallel development.

**Answer 3**
The system can be decomposed into an 'Order Service', a 'Payment Service', and a 'Restaurant Notification Service'. A message queue can be used to decouple them.

**Reasoning:**
1.  **Decomposition:** The monolithic application would be broken down. The 'Order Service' would be responsible only for accepting initial order requests from users. The 'Payment Service' would handle credit card processing, and the 'Restaurant Notification Service' would handle communications with the restaurant.
2.  **New Workflow:** When a user places an order, the request goes to the 'Order Service'. This service validates the order and places an "OrderReceived" message onto a message queue. It can then immediately respond to the user that their order has been accepted.
3.  **Benefit:** The slow 'Payment Service' would pick up messages from this queue at its own pace. Even if it's backed up during the sale, it doesn't stop the 'Order Service' from accepting new orders and putting them on the queue. This makes the user-facing part of the system remain fast and responsive, isolating the bottleneck's impact.

**Answer 4**
The primary advantage of the event-based approach is **improved resilience and decoupling**.

**Reasoning:**
In the synchronous API call design, the 'Ride Service' is tightly coupled to the other four services. If any one of them fails (for example, the receipt generation service is down), the entire chain of operations could halt, and the process would fail. This creates a fragile system where a non-critical component failure (like generating a receipt) can impact critical operations.

In the event-based design, the 'Ride Service' would handle only the most critical, synchronous tasks: calculating the fare and charging the rider. It would then publish a "RideCompleted" event to a message queue. Other services (like a 'Notification Service' and a 'Receipt Service') would subscribe to this event and perform their jobs independently. If the 'Receipt Service' is down, it doesn't stop the driver from being notified of their earnings. The system is more resilient because the failure of one subscriber does not affect the others.

**Answer 5**
A partial failure in the 'Post Service' could make the timeline feature unusable.

**Reasoning:**
The 'Timeline Service' has a direct, synchronous dependency on the 'Post Service'. If the 'Post Service' experiences a failure (e.g., its database connection pool is exhausted, it crashes, or there's a network issue preventing the 'Timeline Service' from reaching it), it will be unable to return data.

Because the API call is synchronous, the 'Timeline Service' will wait for a response. It will either time out or receive an error. In either case, it cannot get the posts it needs to build the user's feed. Therefore, even though the 'Timeline Service' is running perfectly, its inability to communicate with its dependency renders it unable to perform its core function. This cascading failure, where the failure of one component brings down another, is a common and critical challenge in distributed systems.

**Answer 6**
No, this design is not appropriate for this use case.

**Reasoning:**
The core problem is the asynchronous, "fire-and-forget" nature of putting messages on a queue. This design violates two key requirements:

1.  **Transactionality:** Reserving a seat and processing a payment are part of a single logical transaction. Both must succeed for the booking to be valid. If you reserve the seat but the payment fails, the seat needs to be released. If you take the payment but the seat reservation fails, the money needs to be refunded. A simple message queue does not guarantee this all-or-nothing execution. The two messages are processed independently, which could lead to an inconsistent state (e.g., payment taken for a seat that was never reserved).
2.  **User Expectation:** The user expects *immediate* and *definitive* confirmation. A "Booking in progress" message is unacceptable because they don't know if they successfully purchased the ticket. The asynchronous nature of the queue means the final result isn't known for some time.

A better design would use synchronous API calls within a transaction management system to ensure that both steps are completed successfully before confirming the booking to the user. While message queues are excellent for decoupling non-critical, deferrable tasks, they are not suitable for the core, transactional steps of a process that requires immediate, consistent feedback.