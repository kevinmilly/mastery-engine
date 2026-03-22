## Exercises

**Exercise 1**
An online ticket booking service has a monolithic architecture. When a user books a ticket, the `OrderService` synchronously calls the `ConfirmationEmailService`. During a major concert sale, the `ConfirmationEmailService` becomes overloaded and crashes. As a result, users cannot complete their ticket bookings, even though payment and seat reservation are working fine. Explain how introducing a message queue between these two services resolves this specific failure scenario.

**Exercise 2**
A mobile application allows users to upload short video clips. These clips must be processed to create a thumbnail image and a low-resolution preview version. This processing is computationally intensive. Identify the Producer, the Consumer, and the essential contents of a message for a system that uses a message queue to manage this workload.

**Exercise 3**
You are designing a system to process expense report submissions. When an employee submits a report, a message is sent to a queue to trigger an approval workflow and, eventually, a reimbursement payment. You must choose between "at-least-once" and "at-most-once" message delivery guarantees. Which guarantee should you choose, and what is the critical side effect your consumer service must be designed to handle as a result of this choice?

**Exercise 4**
A log processing service consumes messages from a queue, where each message contains a single log line. Due to a bug in a client application, it occasionally sends a malformed log message (e.g., invalid JSON). The consumer service crashes every time it tries to process this specific message. After the service restarts, it fetches the same message again and crashes repeatedly. How does a dead-letter queue (DLQ) solve this problem, and what action should an engineer take with the messages that end up in the DLQ?

**Exercise 5**
An e-commerce platform experiences a massive, unpredictable spike in orders during a flash sale. The order processing system uses a message queue; a single "Order Placed" queue is fed by the web servers. To handle the load, the company runs a large fleet of "Order Processor" services that consume messages from this queue. How does this producer-consumer setup with multiple consumers inherently perform load balancing without a traditional load balancer component (like an Nginx or ALB) in front of the consumers?

**Exercise 6**
You are designing a system for a food delivery app. When a customer places an order, the system must perform three actions asynchronously:
1.  Notify the restaurant to prepare the food.
2.  Charge the customer's credit card.
3.  Assign a delivery driver.

The payment processing service (Action 2) is a third-party API that is reliable but can sometimes be slow to respond or fail transiently. The restaurant notification (Action 1) must happen, but sending it twice would be a minor inconvenience. A driver should never be assigned (Action 3) if the payment fails.

Design a system using one or more message queues to orchestrate this workflow. Specify the delivery guarantee you would use for the message that initiates the payment processing and justify your choice. Explain how a dead-letter queue would be critical for handling persistent payment failures.

---

## Answer Key

**Answer 1**
By placing a message queue between the `OrderService` (producer) and the `ConfirmationEmailService` (consumer), the two services are decoupled.

**Reasoning:**
When the `OrderService` needs to trigger an email, it simply writes a message to the queue (e.g., "Send confirmation for Order #123") and its job is done. The user's booking request can immediately complete successfully. The message queue stores this message until the `ConfirmationEmailService` is available to process it.

This resolves the failure because a crash in the email service no longer causes the entire booking process to fail. The `OrderService` remains available, and emails are simply delayed until the consumer service recovers, at which point it will begin processing the backlog of messages from the queue. This improves the system's overall availability and resilience.

**Answer 2**
**Producer:** The web server that handles the initial video upload from the user's mobile app. After successfully receiving and storing the raw video file, it produces a message and sends it to the queue.

**Consumer:** A dedicated video processing worker service. It continuously polls the queue for new messages. When it receives a message, it downloads the specified video, performs the transcoding, and saves the thumbnail and preview files.

**Message Contents:** The message should contain the necessary information for the consumer to do its job, but not the video data itself (which is too large). Essential contents would include:
*   `video_id`: A unique identifier for the video.
*   `original_file_path`: A location (e.g., an S3 bucket URL) where the raw video file is stored.
*   `user_id`: To associate the processed files with the correct user.

**Answer 3**
The correct choice is **at-least-once** delivery.

**Reasoning:**
In a financial transaction system, losing a message is unacceptable, as it would mean an employee's expense report is never processed and they are never reimbursed. "At-most-once" delivery risks losing messages in the event of a network failure or consumer crash, so it is not appropriate here.

The critical side effect of "at-least-once" delivery is the possibility of duplicate messages. The consumer service might successfully process a payment, but crash before acknowledging the message. The queue would then re-deliver the same message to another consumer instance, leading to a duplicate payment.

Therefore, the consumer service must be designed to be **idempotent**. This means it must be able to safely process the same message multiple times with no additional effect. This is typically achieved by checking if the transaction ID from the message has already been processed before initiating a new payment.

**Answer 4**
A dead-letter queue (DLQ) solves the problem by isolating the problematic message.

**Reasoning:**
The message queue can be configured with a "redrive policy." After a message has been delivered and failed processing a certain number of times (e.g., 3 attempts), the queue will automatically move the message from the main queue to a designated DLQ.

This action unblocks the main queue, allowing the consumer services to move on and process subsequent, valid messages. The system's processing is no longer halted by a single "poison pill" message.

An engineer's action for messages in the DLQ should be:
1.  **Investigate:** Examine the message content to understand why it failed. In this case, they would identify the malformed JSON.
2.  **Remediate:** Fix the bug in the client application that produced the bad message.
3.  **Decide:** Decide what to do with the message. It might be discarded, manually fixed and re-queued, or archived for auditing purposes.

**Answer 5**
This setup performs load balancing because multiple, independent consumer services are all pulling messages from a single, shared queue.

**Reasoning:**
Unlike a traditional load balancer that *pushes* traffic to servers, a message queue facilitates a *pull*-based model. When a consumer instance finishes its current task, it polls the queue for the next available message. The message queue guarantees that a single message is only delivered to one consumer at a time.

This inherently balances the load because a consumer that is busy will not ask for more work, while a consumer that is free will immediately pull the next message. If one consumer is slow or crashes, other consumers simply pick up the slack. This "work-stealing" model naturally distributes the load across the available consumers without needing a central load balancing decision-maker.

**Answer 6**
**Design:**
A single message, "OrderPlaced", is sent to a primary queue when the customer checks out. Three separate consumer services (or consumer groups) subscribe to this message to perform their actions in parallel: `RestaurantNotifier`, `PaymentProcessor`, and `DriverAssigner`. However, this parallel approach is problematic because driver assignment depends on payment success.

A better, more robust design uses a chain of events:
1.  Customer places order -> Web Server sends a message `ProcessPayment` to a `payment-queue`.
2.  `PaymentProcessor` consumes from `payment-queue`.
    *   On success, it publishes a `PaymentSuccessful` message to a `fulfillment-queue`.
    *   On failure, it publishes a `PaymentFailed` message to a `failed-order-queue` (or notifies the user directly).
3.  `RestaurantNotifier` and `DriverAssigner` both consume messages from the `fulfillment-queue`.

**Delivery Guarantee Justification:**
For the message sent to the `payment-queue`, **at-least-once** delivery is essential.
*   **Justification:** A lost payment message means the customer is never charged and the order is never fulfilled, resulting in a lost sale and a poor customer experience. The risk of not processing the payment is far greater than the risk of processing it twice. The `PaymentProcessor` service must be made idempotent (e.g., by using the unique `order_id` to prevent double charges) to handle potential message duplicates.

**Role of the Dead-Letter Queue:**
A DLQ is critical for the `payment-queue`.
*   **Reasoning:** If the third-party payment API is down for an extended period, or if a specific order message contains invalid data that always causes the `PaymentProcessor` to fail, the message would get stuck in a retry loop. A DLQ configured on the `payment-queue` would move a message to the `payment-dlq` after a set number of failed processing attempts. This prevents a single failed payment from blocking all subsequent orders. An operations team can then inspect the `payment-dlq` to manually investigate the failure, contact the customer if necessary, or retry the payment later once the external API is restored.