## Capstone: Mechanics — software engineering systems design

### The Scenario
You are a senior systems design engineer at "LuxeLane," a high-end online retailer known for its exclusive, limited-edition product "drops." Your next major event is the release of the "Aura" sneaker, a collaboration with a famous designer. The last major drop resulted in a site-wide crash, overselling of inventory, and thousands of failed payments, causing significant brand damage.

This time, management has made it clear that failure is not an option. The system must remain stable and responsive.

**System Constraints and Expected Load:**
*   **Traffic:** The marketing team predicts that 2 million users will attempt to access the product page in the first 10 minutes of the sale. Peak requests per second (RPS) are expected to hit 50,000.
*   **Inventory:** There are only 10,000 pairs of "Aura" sneakers available.
*   **Architecture:** The current platform is a set of microservices: Product Catalog, User Accounts, Inventory, Checkout, and Payments. The Payments service relies on a third-party payment processor which has a history of becoming slow during high-traffic events.
*   **Business Goal:** Ensure a fast, fair, and reliable purchasing experience. The "Place Order" button click should return a confirmation to the user in under 2 seconds, even if the full backend processing takes longer. Overselling the limited stock is strictly forbidden.

### Your Tasks
Your deliverable is a concise system design document. For each task below, provide a diagram and a written explanation of your design choices.

1.  **Design the Ingress Layer:** Architect the "front door" to the LuxeLane system. How will you manage the initial flood of 50,000 RPS? Your design must handle traffic distribution, protect the system from being overwhelmed, and route requests to the correct internal services.

2.  **Architect the Data Strategy for the Product Page:** The "Aura" sneaker product page will be read-heavy, receiving millions of views, while the inventory count is write-heavy, updated with every sale. Design a database and caching strategy that ensures the product page loads quickly for all users without overwhelming the primary database that manages the critical inventory count.

3.  **Redesign the Order Processing Workflow:** The current process handles inventory checks, payment processing, and order confirmation synchronously, which is slow and brittle. Design a new, asynchronous workflow that begins once a user clicks "Place Order." This system must be able to reliably process 10,000 orders amidst the chaos of the sale, ensuring no orders are lost and the user gets a fast initial response.

4.  **Build a Resilient Payment System:** The external payment processor is a known point of failure. Design the interaction between your `Payments` service and the third-party processor to be highly resilient. Your design must prevent a slow or failing processor from causing a cascade failure in your system. It must also guarantee that a user who retries a failed payment is not charged twice.

### What Good Work Looks Like
*   **Justifies trade-offs with context:** A strong response doesn't just name a pattern (e.g., "use a message queue"), but explains *why* that pattern is the right choice for this specific scenario, acknowledging and defending the trade-offs made (e.g., choosing at-least-once delivery and designing for idempotency to handle potential message duplicates).
*   **Connects technical decisions to business outcomes:** The design choices are clearly linked to the business goals. For example, the rationale for a caching strategy should be tied directly to improving user-perceived latency and reducing server load, which in turn prevents a site crash.
*   **Demonstrates deep understanding of failure modes:** A good design anticipates specific, realistic failures (e.g., "What happens if the inventory service is slow to respond?") and shows how the proposed architecture mitigates them. The explanation of patterns like Circuit Breaker or Sagas will be grounded in these potential failures.
*   **Integrates concepts logically:** The solution shows how different components and patterns work together as a cohesive system. For instance, it explains how the asynchronous order processing system (Task 3) relies on the idempotent API design of the payments service (Task 4) to function correctly.