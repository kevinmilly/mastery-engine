## Exercises

**Exercise 1**
An e-commerce platform processes a new order using three microservices: `PaymentService`, `InventoryService`, and `ShippingService`. The business logic requires that payment is processed first, then inventory is reserved, and finally, shipping is arranged. Contrast how this workflow would be implemented using an orchestration pattern versus a choreography pattern. Identify the key architectural component that is central to one pattern but absent in the other.

**Exercise 2**
A `UserSignedUp` event is published to a message bus. An `OnboardingService` consumes this event to send a welcome email. Due to a temporary failure in the third-party email provider's API, the `OnboardingService` fails to send the email. Describe a robust, asynchronous error-handling strategy for this service, explaining the distinct roles of immediate retries with exponential backoff and a dead-letter queue (DLQ).

**Exercise 3**
A food delivery platform uses an event-choreographed architecture. When a customer places an order, a `OrderPlaced` event is emitted. This event is independently consumed by the `RestaurantService` (to notify the restaurant) and the `CourierService` (to find a nearby courier). The business now wants to introduce a dynamic "delivery fee" calculation that depends on both real-time restaurant prep time and courier availability. This fee must be calculated and approved by the payment system *before* the restaurant and courier are confirmed. How does this new requirement create a challenge for the existing pure choreography model?

**Exercise 4**
A "Create Account" process for a new fintech application involves three steps managed by separate services: `IdentityVerificationService`, `CreditCheckService`, and `AccountCreationService`. This is implemented as a Saga. The process is initiated, and the `IdentityVerificationService` succeeds, emitting an `IdentityVerified` event. The `CreditCheckService` consumes this, but the check fails, emitting a `CreditCheckFailed` event. Describe the mechanism and sequence of events required to ensure the system returns to a consistent state without leaving a partially provisioned, unusable account. What is this rollback mechanism called in the context of Sagas?

**Exercise 5**
You are the lead engineer for a system that uses event choreography to manage a complex, multi-step document processing pipeline (Upload -> Virus Scan -> OCR -> Index -> Notify). A user reports that their document upload is "stuck"—it was uploaded hours ago, but they never received a notification of completion or failure. In a choreographed system with no central workflow definition, how would you apply principles from "Designing for Observability" to diagnose where in the pipeline the process failed? Describe at least two specific observability tools/techniques you would use and what information they would provide.

**Exercise 6**
You are designing a critical patient admissions system for a large hospital network. The admission process involves coordinating several services: `PatientRegistry`, `BedAssignment`, `InsuranceVerification`, and `InitialCarePlan`. The system must have extremely high availability and a clear, auditable trail for every admission, especially during system failures or disaster recovery events. You must choose between orchestration and choreography for the overall workflow. Which pattern would you advocate for? Justify your decision by analyzing the trade-offs of your chosen pattern with respect to system observability, state management complexity during partial failures, and the ease of performing a disaster recovery drill.

---

## Answer Key

**Answer 1**
**Orchestration:**
The workflow would be managed by a central `OrderProcessor` (the orchestrator).
1.  The `OrderProcessor` would first call the `PaymentService`.
2.  Upon successful response, it would then call the `InventoryService`.
3.  Upon successful response, it would finally call the `ShippingService`.
If any step fails, the `OrderProcessor` is responsible for handling the error, perhaps by initiating a refund from the `PaymentService`. The key component is the central **orchestrator** which explicitly commands the other services.

**Choreography:**
The services react to events on a shared message bus without a central coordinator.
1.  An initial `OrderPlaced` event is published.
2.  The `PaymentService` listens for this event, processes the payment, and publishes a `PaymentSucceeded` event.
3.  The `InventoryService` listens for `PaymentSucceeded`, reserves stock, and publishes an `InventoryReserved` event.
4.  The `ShippingService` listens for `InventoryReserved` and arranges shipping.
The key component in orchestration (the central `OrderProcessor`) is absent here. The workflow is implicitly defined by the chain of events and the services that listen to them.

**Answer 2**
A robust strategy would involve a combination of retries and a DLQ.

1.  **Retries with Exponential Backoff:** Upon the initial failure, the `OnboardingService` should not immediately give up. It should retry sending the email a configured number of times (e.g., 3-5 attempts). To avoid overwhelming the failing downstream API, it should use exponential backoff, meaning the delay between retries increases with each failure (e.g., wait 2s, then 4s, then 8s). This handles transient issues like temporary network blips or brief API outages.

2.  **Dead-Letter Queue (DLQ):** If the message still fails after all retry attempts, the service should not discard it. The message is likely failing due to a persistent issue (e.g., an invalid email address, a bug in the message format, a prolonged provider outage). The message is moved to a separate queue called a Dead-Letter Queue. This action prevents the poison pill message from blocking the main queue. An operator or a separate process can then inspect the messages in the DLQ to debug the problem, manually re-process them, or trigger an alert without halting the entire onboarding system.

**Answer 3**
The new requirement challenges the pure choreography model by introducing a need for a synchronous-like, coordinated decision point in the middle of the workflow.

**The Challenge:**
In the existing choreographed model, the `RestaurantService` and `CourierService` operate in parallel, independently reacting to the `OrderPlaced` event. There is no central point to pause the workflow, gather data from both domains (restaurant prep time and courier availability), perform a calculation, and then proceed. The decoupled nature of choreography makes it difficult to enforce a strict sequence and aggregation step like `Calculate Fee -> Charge Fee -> Notify Participants`. The `PaymentService` would need to know when both the restaurant and courier data are available, which couples it to the internal state of two other services.

**Proposed Change:**
Introduce a temporary orchestration step for this part of the process. A new service, `DeliveryFeeCalculatorService`, could act as a short-lived orchestrator or state machine.
1.  The `OrderPlaced` event is consumed by the `DeliveryFeeCalculatorService`.
2.  This service then queries or awaits events from the `RestaurantService` and `CourierService` to get the necessary data.
3.  Once it has the required information, it calculates the fee, calls the `PaymentService` to authorize the new amount, and upon success, emits a new `OrderConfirmedWithFee` event.
4.  The `RestaurantService` and `CourierService` would then listen for this new event to proceed with the final confirmation, instead of the initial `OrderPlaced` event. This hybrid approach preserves decoupling where possible but introduces orchestration for the complex, state-dependent coordination step.

**Answer 4**
The mechanism required is a series of **compensating transactions**. In a Saga, when a step fails, the system must execute operations that semantically undo the work of the preceding successful steps.

**Sequence of Events:**
1.  **Initiation:** A `CreateAccount` command starts the Saga.
2.  **Step 1 Success:** `IdentityVerificationService` succeeds and emits `IdentityVerified`.
3.  **Step 2 Failure:** `CreditCheckService` consumes `IdentityVerified`, fails its check, and emits `CreditCheckFailed`.
4.  **Compensation Trigger:** A compensating transaction is now triggered by the `CreditCheckFailed` event. The `IdentityVerificationService` (or a Saga orchestrator) must listen for this failure event.
5.  **Compensation Action:** The `IdentityVerificationService` consumes the `CreditCheckFailed` event and executes its own compensating transaction. This might involve marking the verified identity as "void" or deleting the temporary record, effectively undoing the initial step. It would then emit a final event like `AccountCreationRolledBack`.

This ensures that no "ghost" identity record exists for an account that was never fully created, thus returning the system to a consistent state.

**Answer 5**
To diagnose the failure in a choreographed system without a central orchestrator, I would rely heavily on distributed tracing and structured, centralized logging.

1.  **Distributed Tracing:** Every event published to the message bus must be injected with a unique `correlation_id` (or trace ID) that originated from the initial user upload request. Each service that consumes and produces events must propagate this ID.
    *   **How it works:** Using a tool like Jaeger or OpenTelemetry, you can query for the `correlation_id` associated with the "stuck" document.
    *   **Information provided:** This would generate a visual timeline (a Gantt chart) showing every service that processed the event chain. We could see that the `Upload` service published an event, the `VirusScan` service consumed it and published a new event, and the `OCR` service also succeeded. If the trace ends there, it immediately tells us the problem lies with either the `OCR` service failing to publish its `OcrCompleted` event, or the `Index` service failing to consume it. This pinpoints the exact point of failure in the distributed workflow.

2.  **Structured, Centralized Logging:** Each service should log its actions in a structured format (e.g., JSON) and ship these logs to a central platform (e.g., an ELK stack - Elasticsearch, Logstash, Kibana). Every log entry must include the `correlation_id`.
    *   **How it works:** When the trace identifies the `Index` service as the likely culprit, we can filter all logs in our central platform by that specific `correlation_id`.
    *   **Information provided:** This would give us the detailed, service-specific logs for that single transaction. We could see log entries like "Consumed OcrCompleted event for correlation_id XYZ", followed by "Starting indexing...", and then perhaps an error message with a full stack trace that was never handled correctly, or simply an absence of a "Successfully published IndexCompleted event" log. This allows for deep, root-cause analysis that tracing alone might not provide.

**Answer 6**
For a critical patient admissions system, I would strongly advocate for an **orchestration** pattern.

**Justification:**
1.  **Observability and Auditability:** In a hospital setting, having a clear, explicit, and easily auditable trail of the admission process is a non-negotiable requirement. An orchestrator provides a natural "single source of truth" for the state of any given admission. If an admission for Patient X is in progress, we can query the orchestrator and see it is "pending insurance verification." In a choreographed system, determining the overall state requires synthesizing information from multiple services' event logs, which is complex and error-prone, especially during an incident.

2.  **State Management During Partial Failures:** A patient admission cannot be left in an inconsistent state (e.g., bed assigned but insurance not verified). An orchestrator centralizes the logic for handling failures, timeouts, and compensation. If the `InsuranceVerification` service fails, the orchestrator can explicitly execute compensating transactions, like calling the `BedAssignment` service to release the reserved bed. Managing this complex, stateful error handling is significantly more difficult in a choreographed system, where each service would need to be aware of downstream failures to know when to self-correct, leading to a web of dependencies.

3.  **Disaster Recovery (DR) and Failover:** During a DR drill or a real failover event, we need to know exactly which admissions were in-flight and what their last completed step was. The orchestrator's state store is the manifest for this. We can recover the orchestrator and it can resume the workflows from their last known good state. In a choreographed system, it's much harder to reconstruct the state of all in-flight processes across multiple, distributed event consumers, risking lost or duplicated process steps during recovery. The explicit workflow definition in orchestration makes the system's behavior more deterministic and predictable under stress.

While choreography offers greater service decoupling, the trade-off in lost visibility, complex error handling, and operational uncertainty is too high for this specific critical domain. The safety and correctness provided by orchestration are paramount.