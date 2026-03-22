## Exercises

**Exercise 1**
An e-commerce platform uses two separate microservices: `OrderService` and `PaymentService`. A user places an order. The `OrderService` successfully creates an order in its database. It then makes a direct, synchronous API call to the `PaymentService` to charge the user's credit card, but this call fails due to a network timeout. Describe the final state of the system's data and explain why this presents a data consistency problem.

**Exercise 2**
To fix the inconsistency from the previous exercise, the team implements a Saga pattern. The flow is: 1) `OrderService` creates the order with a "PENDING" status. 2) It then requests payment from the `PaymentService`. If the payment fails, a compensating transaction is triggered. What specific action must this compensating transaction perform, and what is the final, consistent state of the system's data after it runs successfully?

**Exercise 3**
A financial institution is building a system for internal fund transfers between a customer's checking and savings accounts. The two account types are managed by separate microservices. The business requires that a transfer must be *atomic*: it either fully succeeds or fully fails, with no intermediate states (like money debited from one account but not yet credited to the other) ever visible to any other part of the system. Between Two-Phase Commit (2PC) and a Saga, which pattern is more appropriate and why? Justify your choice by explaining the key trade-off you are making.

**Exercise 4**
A "place order" Saga involves three steps: 1) `OrderService` creates an order, 2) `PaymentService` processes payment, 3) `InventoryService` reserves the item. If the `InventoryService` fails (e.g., the item is out of stock), compensating transactions are triggered to refund the payment and then cancel the order. What is the critical problem if the `PaymentService`'s refund operation (the compensating transaction) also fails due to its payment gateway being temporarily offline? Describe one strategy to handle this "failure of a compensating transaction."

**Exercise 5**
You are designing a choreography-based Saga for a flight booking system using a **Message Queue** for communication. The flow is: `BookingService` publishes a `BookingCreated` event, which is consumed by the `PaymentService`. If payment succeeds, `PaymentService` publishes a `PaymentSucceeded` event. However, if payment fails, it publishes a `PaymentFailed` event, which the `BookingService` must consume to trigger its compensating transaction (cancelling the booking). Due to the nature of message queues, the `PaymentFailed` event might be delivered more than once. What key property must the `BookingService`'s compensation logic have to handle this safely, and why is it so important in this scenario?

**Exercise 6**
A social media platform is designing its "post a photo" feature. This action involves multiple services: 1) `UploadService` stores the image, 2) `PostService` creates the post record, and 3) `FanoutService` asynchronously pushes the post to followers' timelines. The platform prioritizes high availability and a fast user experience; the user must get an immediate confirmation that their photo is posted. Rolling back the entire operation if the `FanoutService` is slow or temporarily fails is unacceptable. Propose a Saga-based design for this flow. How would your design handle a failure in the `FanoutService` without cancelling the user's post? How could the **Circuit Breaker** pattern be integrated to improve the resilience of the interaction with the `FanoutService`?

---

## Answer Key

**Answer 1**
*   **Final State:** The `OrderService` database contains a record for a new order, but the `PaymentService` has no record of a successful payment for that order. The user's credit card has not been charged.
*   **Consistency Problem:** The system is in an inconsistent state because it holds an order that has not been, and now cannot be, paid for. This violates the business rule that every valid order must have a corresponding payment. The atomicity of the "place order" operation has been broken; part of it succeeded (order creation) and part of it failed (payment). This can lead to issues like reserving inventory for an unpaid order or incorrect sales reporting.

**Answer 2**
*   **Action of Compensating Transaction:** The compensating transaction, triggered by the payment failure, must instruct the `OrderService` to update the order's status from "PENDING" to "CANCELLED" or to delete the order record entirely.
*   **Final Consistent State:** After the compensating transaction runs, the `OrderService` database shows the order as "CANCELLED", and the `PaymentService` has no record of payment. The system is now in a consistent state because it no longer represents an unpaid order as a valid, pending transaction. The overall operation has been cleanly rolled back.

**Answer 3**
*   **Appropriate Pattern:** Two-Phase Commit (2PC) is more appropriate for this scenario.
*   **Justification and Trade-off:** The key requirement is strict atomicity where no intermediate states are visible. A Saga achieves eventual consistency by executing a series of local transactions, which means for a brief period, money could be debited from checking but not yet credited to savings. This intermediate state is visible and unacceptable in this banking context. 2PC, while more complex and less available, provides this strict atomicity. It uses a coordinator to ensure all participating services (the two account services) either all commit or all roll back together, as a single atomic unit. The trade-off is sacrificing some availability and performance for guaranteed, immediate consistency, which is the correct priority for a core banking transaction.

**Answer 4**
*   **Critical Problem:** The system enters a dangerous, inconsistent state where the customer has been charged (`PaymentService` transaction succeeded), the item is not reserved (`InventoryService` failed), and the refund cannot be processed (`PaymentService` compensation failed). The customer has paid for a product they will not receive. This is often worse than the initial inconsistency.
*   **Handling Strategy:** A robust strategy is to implement a **retry mechanism with exponential backoff** for the failing compensating transaction. The system should persist the fact that a refund is required (e.g., in a "refund_pending" table). A separate worker process can then periodically retry the refund operation. If it continues to fail after a set number of retries, it should be flagged for manual intervention by a human operator, ensuring the customer is eventually refunded.

**Answer 5**
*   **Key Property:** The compensation logic in the `BookingService` must be **idempotent**.
*   **Importance:** Idempotency means that an operation can be performed multiple times without changing the result beyond the initial application. If the `PaymentFailed` message is delivered twice, an idempotent "cancel booking" operation would work as follows: the first time it receives the message, it finds the "PENDING" booking and changes its status to "CANCELLED". The second time it receives the message, it looks up the booking, sees it is already "CANCELLED", and does nothing further. Without idempotency, the service might try to cancel an already-cancelled booking, which could throw an error, trigger false alerts, or cause other unintended side effects.

**Answer 6**
*   **Saga Design:** The flow can be designed as a Saga where the first two steps are considered the "point of no return" for the user's experience.
    1.  `UploadService` stores the image.
    2.  `PostService` creates the post record. At this point, the user receives a success response.
    3.  `PostService` then triggers the `FanoutService` asynchronously (e.g., via a message queue).
*   **Handling `FanoutService` Failure:** A failure in the `FanoutService` would **not** trigger a compensating transaction for the `PostService` or `UploadService`. The post remains created. Instead, the fanout request should be handled with a reliable delivery mechanism. The request could be placed in a dead-letter queue after several failed attempts, where a separate recovery process or an administrator can investigate and re-trigger the fanout later. This prioritizes the user's action (the post is "live") while ensuring eventual consistency for follower timelines.
*   **Circuit Breaker Integration:** A **Circuit Breaker** can be placed around the call from the `PostService` to the `FanoutService`. If the `FanoutService` starts failing repeatedly, the circuit breaker will "trip" (open). For a short period, the `PostService` will not even attempt to call the `FanoutService`, instead immediately failing fast (e.g., queueing the fanout request for later). This prevents the `PostService` from wasting resources on calls to an unhealthy service and protects the `FanoutService` from being overwhelmed while it recovers.