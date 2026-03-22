## Exercises

**Exercise 1**
An engineer is building a `DataProcessing` module for a new analytics platform. The module contains functions to:
1.  Connect to a PostgreSQL database.
2.  Read raw user event data from a specific table.
3.  Clean the data by removing null values and standardizing formats.
4.  Generate a weekly PDF report from the cleaned data.
5.  Email the PDF report to a list of subscribers.

Evaluate the cohesion of this `DataProcessing` module. Is it high or low? Justify your answer by identifying the distinct responsibilities it holds.

**Exercise 2**
A `ShoppingCartService` and a `ProductCatalogService` are two components in an e-commerce system. To display an item in the cart with its current price, the `ShoppingCartService` makes a direct database query to the `ProductCatalogService`'s private database. The team maintaining the `ProductCatalogService` decides to optimize their database by renaming the `price_in_cents` column to `price_micros`. The next deployment causes the entire shopping cart page to fail.

Explain this failure using the concept of coupling. What specific type of tight coupling is demonstrated here?

**Exercise 3**
You are designing a user notification system. When a user receives a new message, they should get an email and a push notification. Consider two design approaches:

*   **Approach A:** A single `NotificationService`. It contains the logic for formatting both emails and push notifications. It connects to an SMTP server for emails and to APNS/FCM for push notifications. It manages templates and retry logic for both channels within the same module.
*   **Approach B:** An `EmailService` and a `PushNotificationService`. A third `OrchestrationService` receives a "new message" event and calls the other two services. The `EmailService` only knows how to send emails, and the `PushNotificationService` only knows how to send push notifications.

Analyze the trade-offs between Approach A and Approach B, focusing specifically on how each design impacts cohesion within services and coupling between them.

**Exercise 4**
A team has built an `APIGateway` service that sits in front of all other microservices. Over time, its responsibilities have grown. It currently performs all of the following tasks:
1.  **Routing:** Directs incoming HTTP requests to the correct downstream service (e.g., `/users` to `UserService`).
2.  **Authentication:** Validates API keys or user session tokens for every request.
3.  **Billing Calculation:** After a request to a premium service is completed, it fetches the result, calculates the cost of the API call, and updates the user's monthly bill in the billing database.
4.  **Rate Limiting:** Checks if a user has exceeded their request quota for the minute.

Identify the responsibility that most harms the cohesion of the `APIGateway`. Propose a refactoring to improve the system's design by creating a new, more cohesive service for this responsibility.

**Exercise 5**
A large, monolithic social media application handles user profiles, post creation, and a real-time messaging feed. All three features share the same large database and application server. The "real-time messaging" feature is extremely popular and requires significant server resources. When it experiences a spike in traffic, users report that loading profiles and creating posts becomes extremely slow or fails entirely.

Explain this system's problem using the concepts of coupling and cohesion. How does this design negatively impact the system's fault tolerance and scalability?

**Exercise 6**
You are designing a banking system with a `TransactionService` responsible for moving money between accounts and an `AuditService` that logs every transaction for regulatory compliance. The business rule is strict: no transaction can be considered complete unless it has been successfully logged by the `AuditService`.

An architect proposes two potential interaction patterns between the services:

*   **Pattern 1 (Synchronous Call):** The `TransactionService` makes a direct, synchronous blocking call to the `AuditService`'s `logTransaction` endpoint. The `TransactionService` only commits the fund transfer *after* receiving a "success" response from the `AuditService`.
*   **Pattern 2 (Asynchronous Event):** The `TransactionService` commits the fund transfer and then publishes a `transaction_completed` event to a message queue. The `AuditService` subscribes to this queue and processes the event eventually.

Evaluate the trade-offs of Pattern 1 vs. Pattern 2. Analyze how each choice impacts coupling, but also consider the system's overall reliability and consistency (strong vs. eventual). Which pattern is more appropriate for this specific use case, and why?

---

## Answer Key

**Answer 1**
This `DataProcessing` module exhibits **low cohesion**.

**Reasoning:**
Cohesion is a measure of how related the responsibilities within a single module are. This module is responsible for several distinct, unrelated tasks that could logically be separated:
*   **Data Access:** Connecting to and reading from a database.
*   **Data Transformation:** Cleaning and standardizing data.
*   **Reporting:** Generating a PDF from data.
*   **Distribution:** Emailing the report.

Because it handles everything from data extraction to final delivery, the module has multiple reasons to change. A change in the database schema, the report format, or the email delivery mechanism would all require modifying this single module. A more cohesive design would separate these into different modules, such as a `DataAccessLayer`, a `ReportGenerator`, and a `NotificationService`.

**Answer 2**
This failure is a direct result of **tight coupling**, specifically **implementation coupling** (also known as content or database coupling).

**Reasoning:**
Coupling describes the degree of dependency between modules. In this scenario, the `ShoppingCartService` is not just dependent on the `ProductCatalogService`'s data, but on the *internal implementation details* of how that data is stored (the database schema, table names, and column names).

When the `ProductCatalogService` team changed their private database schema, they broke the contract their service had implicitly formed with the `ShoppingCartService`. A loosely coupled design would have the `ProductCatalogService` expose its data through a stable API (e.g., a REST endpoint like `GET /products/{id}`). This would allow the catalog team to change their internal database freely without breaking dependent services, as long as the API contract remains the same.

**Answer 3**
*   **Approach A (Single `NotificationService`)**:
    *   **Cohesion:** This approach has lower cohesion. The module is responsible for two distinct notification channels (email, push). A change in push notification certificate management would require deploying a service that also contains email logic, increasing risk. The concerns of "what" to send (the message) are mixed with "how" to send it across multiple channels.
    *   **Coupling:** This design results in high internal coupling within the module itself, but it presents a single, simple interface to the rest of the system. External services are only coupled to the `NotificationService`, not its internal components.

*   **Approach B (Separate Services)**:
    *   **Cohesion:** This approach has much higher cohesion. The `EmailService` does one thing well: send emails. The `PushNotificationService` does one thing well: send push notifications. Each can be developed, deployed, and scaled independently.
    *   **Coupling:** This approach promotes loose coupling between the sending logic of each channel. However, it introduces coupling at the orchestration level. The `OrchestrationService` is now coupled to the interfaces of both the `EmailService` and the `PushNotificationService`.

**Conclusion:** Approach B is generally preferred in modern system design. The benefits of high cohesion (independent deployment, scalability, and maintenance) typically outweigh the complexity of managing an orchestrator service.

**Answer 4**
The responsibility that most harms the cohesion of the `APIGateway` is **Billing Calculation**.

**Reasoning:**
The other three responsibilities (Routing, Authentication, Rate Limiting) are all classic "gateway" or "cross-cutting" concerns. They are directly related to managing and securing the flow of incoming API requests.

Billing Calculation, however, is a business logic concern. It is not related to the primary responsibility of request management. It requires knowledge of pricing models and write access to the billing database, which are unrelated to routing or authentication. This low cohesion means that a change in the company's pricing strategy would force a deployment of the critical `APIGateway` component, which is a major risk.

**Refactoring Proposal:**
A new, more cohesive `BillingService` should be created. The `APIGateway`'s role would be reduced to publishing an event (e.g., "PremiumAPICallCompleted") to a message queue after the request is finished. The new `BillingService` would subscribe to these events, perform the necessary calculations, and update the billing database. This decouples the business logic of billing from the infrastructure concern of API management.

**Answer 5**
This system's problems stem from **high coupling** and **low cohesion** inherent in its monolithic architecture.

**Reasoning:**
*   **Coupling & Cohesion:** In a monolith, all features are tightly coupled by sharing the same process, application server, and database. The system is one large module with very low cohesion because it mixes unrelated concerns (profiles, posts, messaging).
*   **Impact on Fault Tolerance:** Because the components are tightly coupled, a failure in one can cascade to others. A resource-intensive bug or traffic spike in the messaging feature consumes all available server/database resources (CPU, memory, connections), effectively causing a denial-of-service for the profile and post features. This demonstrates poor fault tolerance, as the system has a single, large blast radius for failures.
*   **Impact on Scalability:** The different features have different performance profiles. Messaging might be memory-intensive, while post creation is write-intensive. Because they are coupled into one unit, you cannot scale them independently. To handle more messaging traffic, you must scale the entire monolith, which is inefficient and expensive. A decoupled, microservices-based architecture would allow the team to scale only the messaging service resources, which is more cost-effective and targeted.

**Answer 6**
**Pattern 1 (Synchronous Call)** is the more appropriate choice for this specific use case, despite creating tighter coupling.

**Reasoning:**
This problem highlights that loose coupling is a goal, not an absolute rule. It must be balanced against other system requirements.

*   **Pattern 1 (Synchronous Call):**
    *   **Coupling:** Creates tight temporal coupling. The `TransactionService` is blocked until the `AuditService` completes its work and is directly dependent on its immediate availability. If the `AuditService` is down, transactions fail.
    *   **Reliability & Consistency:** This pattern provides **strong consistency**. It creates an atomic operation; the transaction and its audit log are guaranteed to be created together or not at all. This directly enforces the critical business rule. The reliability of the *entire transaction* is high, even if the availability of the `TransactionService` is reduced by its dependency.

*   **Pattern 2 (Asynchronous Event):**
    *   **Coupling:** Creates loose coupling. The `TransactionService` is not dependent on the `AuditService`'s availability and can continue processing even if the audit system is slow or temporarily down.
    *   **Reliability & Consistency:** This pattern provides **eventual consistency**. There is a time window where the money has moved, but the audit log does not yet exist. This introduces significant risk. What if the `AuditService` fails to process the event from the message queue? The system would be in an inconsistent, non-compliant state. While message queues can offer delivery guarantees, it complicates the system and still does not achieve the atomicity of the synchronous call.

**Conclusion:** For a critical regulatory requirement where a transaction and its audit log must be inseparable, strong consistency is non-negotiable. Therefore, the tight coupling introduced by the synchronous call (Pattern 1) is a necessary and justified trade-off to ensure the system's correctness and reliability.