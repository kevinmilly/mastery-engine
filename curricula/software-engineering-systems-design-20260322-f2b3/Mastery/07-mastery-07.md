# The Hook
After this lesson, you will understand the playbook for replacing a critical, legacy system piece by piece, without your users ever noticing the change.

Imagine you're in charge of replacing a very old, heavily used city bridge. The problem is, you can't just close it for two years to build a new one; the city's economy would grind to a halt. Instead, you build the new, modern steel bridge right alongside the old, creaky one. First, you open one lane of the new bridge and divert a small amount of traffic to it. Once you're sure it's safe and stable, you open another lane and divert more traffic. You repeat this until all traffic is flowing over the new bridge. Only then, with the new bridge fully operational, do you safely dismantle the old one.

This is the core mental model for evolving a large software system: build the new alongside the old and gradually shift the load, ensuring the service is never disrupted.

## Why It Matters
Systems, like bridges, age. Code written five or ten years ago under different assumptions and constraints becomes slow, brittle, and difficult to change. This is often called **technical debt**: the future cost of choosing an easy solution now over a better approach that would have taken longer.

The moment a practitioner hits a wall without this knowledge is when they are tasked with modernizing a critical legacy system—like a company's original payment processing monolith. The business demands new features and better reliability, but every small change to the old system causes unpredictable bugs.

The naive engineer might propose a "big bang" rewrite: "We'll spend the next 18 months building a replacement, and then one weekend we'll switch everything over." This approach is famously risky. The project can drag on for years, the new system may not actually meet all the subtle requirements of the old one, and the final cutover is a high-stakes, all-or-nothing event that often leads to catastrophic failure. Understanding system evolution strategies is the difference between proposing a high-risk gamble and a professional, incremental plan that delivers value safely and continuously.

## The Ladder
Successful system evolution isn't about a single, heroic effort. It’s about a set of disciplined techniques that allow you to manage technical debt and migrate complex systems safely over time.

### The Problem: The Monolithic Beast
Most long-lived companies have a "monolith" at their core. This is a single, large application where all the business logic is tightly intertwined. Trying to change one part, like how shipping costs are calculated, can break an unrelated part, like user authentication. As we've seen with event-driven architectures, the goal is often to break this monolith into smaller, independent services that are easier to understand, scale, and update. But how do you do that without shutting down the business?

### Strategy 1: The Strangler Fig Pattern
This pattern provides a roadmap for gradually replacing a monolith. It's named after a type of fig vine that grows around a host tree, eventually enveloping it and becoming a new, robust structure as the original tree inside withers away.

The mechanism works like this:
1.  **Introduce a Façade:** Place a routing layer, often an API Gateway or a reverse proxy, in front of the monolith. Initially, this router does nothing but pass 100% of the incoming traffic directly to the old system. To the outside world, nothing has changed.
2.  **Identify and Build a New Service:** Choose one piece of functionality to carve out—for example, "user profile lookup." Build this as a new, independent microservice. You can use modern technology and best practices.
3.  **Divert Traffic:** Configure the router. Tell it that any incoming request for `/api/users/...` should now go to your new `UserProfileService` instead of the old monolith. All other requests (e.g., `/api/orders/...`, `/api/products/...`) are still passed through to the monolith.
4.  **Repeat:** Continue this process. Identify another piece of the monolith (e.g., "product search"), build a new service for it, and update the router to send the relevant traffic there.

The implication is powerful: over months or years, you systematically "strangle" the traffic to the old monolith. Each new service is a small, manageable project. Eventually, the monolith might have no responsibilities left and can be safely decommissioned. You've migrated to a new architecture with zero downtime.

### Strategy 2: Feature Flagging
The Strangler Fig pattern decides *where* traffic goes. Feature flags provide fine-grained control over *what code executes* for that traffic, decoupling deployment from release.

A **feature flag** (or feature toggle) is essentially an `if/else` statement in your code that can be controlled remotely without a new code deployment.

```
if (featureIsEnabled("use-new-payment-service")) {
  // Call the new, separate payment microservice
  callNewPaymentService(order);
} else {
  // Execute the old, internal payment logic
  runLegacyPaymentCode(order);
}
```

The `featureIsEnabled()` function checks a central configuration service. An engineer or product manager can flip a switch in a dashboard to change its return value from `false` to `true`.

This mechanism allows you to:
*   **Deploy "dark":** You can deploy the new code to production with the flag turned off. The new code is present but not executed.
*   **Test in production:** You can turn the flag on just for your internal development team to test the new feature with real production data and infrastructure.
*   **Perform a canary release:** You can enable the feature for a small percentage of users (e.g., 1%). Using the observability practices you've learned, you can closely monitor error rates and performance for this cohort. If all looks good, you can gradually ramp up the percentage to 100%.
*   **Instantly roll back:** If the new feature causes problems, you don't need to do a frantic, stressful redeployment. You just flip the flag off, and the system instantly reverts to using the old, stable code path. This is a key part of modern Disaster Recovery (DR) planning.

### Strategy 3: Parallel Run and Schema Migration
For critical refactoring where the output must be identical (e.g., a new billing calculation engine), you can't just switch over and hope for the best.
*   **Parallel Run:** You modify your code to execute *both* the old and the new logic. The old logic's result is returned to the user, but the new logic's result is compared to the old one and any discrepancies are logged. This lets you verify the new code's correctness against real-world inputs without any user impact. Once the logs show no discrepancies for a long period, you can confidently switch to using the new logic.
*   **Database Schema Migration:** Changing a database without downtime is a classic challenge. A safe pattern is "Expand and Contract." To rename a column, for example:
    1.  **Expand:** Deploy code that can write to *both* the old and new column names, but still reads from the old one.
    2.  **Migrate:** Run a background script to copy data from the old column to the new column for all existing rows.
    3.  **Expand 2:** Deploy code that writes to both but now reads from the *new* column.
    4.  **Contract:** Deploy code that only reads and writes to the new column.
    5.  **Cleanup:** After a safe period, you can drop the old column from the database.

Each step is small, safe, and reversible.

## Worked Reality
A large online retailer has a single, massive `Monolith` application that handles everything: product catalog, user accounts, shopping cart, and order processing. The order processing code is particularly brittle and slow. The engineering team decides to migrate it to a new, highly-available `OrderService` using the Strangler Fig pattern combined with feature flags.

**Phase 1: Interception.**
They deploy an API Gateway in front of the `Monolith`. They configure it to forward all traffic, like `POST /api/orders`, directly to the `Monolith`. From the user's perspective, nothing has changed. The system is still fully functional.

**Phase 2: Build and Deploy Dark.**
The team builds the new `OrderService`. Inside the old `Monolith`'s code for creating an order, they add a feature flag:

```
func createOrder(details) {
  if (featureIsEnabled("route-orders-to-new-service", user: details.user_id)) {
    // Forward the request to the new service and return its response
    return callOrderService(details);
  } else {
    // Run the old, existing order creation logic
    return legacyCreateOrder(details);
  }
}
```
They deploy this change to production with the feature flag turned **off** for everyone. The new `OrderService` is also deployed, but it's receiving no traffic.

**Phase 3: Canary Release.**
The rollout begins.
*   **Monday:** They enable the feature flag for internal employee accounts only. The team places dozens of test orders, carefully watching the logs and dashboards for the new `OrderService` (leveraging their system's **observability**).
*   **Tuesday:** All tests pass. They configure the flag to be enabled for 2% of all incoming requests. They closely monitor business metrics: Is the order success rate the same? Are there any new errors?
*   **Wednesday:** A bug is found in the new service that affects international orders. Instead of a panic rollback, they simply dial the flag's percentage back down to 0%. The system is instantly stable again. They fix the bug and deploy the fix to the `OrderService`.
*   **Friday:** They re-start the canary release, going from 2% to 10% to 50% over the course of the day. All metrics remain healthy.

**Phase 4: Full Rollout and Cleanup.**
By the next week, they are confident and set the flag to 100%. All new orders are now being processed by the new, robust `OrderService`. The old monolith code is no longer being executed. After a few weeks of proven stability, they remove the feature flag and the old legacy code from the `Monolith` codebase. One part of the monolith has been successfully strangled.

## Friction Point
The most common misunderstanding is confusing **refactoring** with **rewriting**.

**The Wrong Mental Model:** "Our code is a mess. We need to refactor it. Let's spend the next quarter building a brand-new version from scratch on the side. When it's done, we'll replace the old one."

**Why It's Tempting:** The idea of a "clean slate" is very appealing. Old code can be complex and intimidating, and a ground-up rewrite feels like a way to escape that complexity. It feels more decisive than making small, careful changes.

**The Correct Mental Model:**
*   **Refactoring** is the process of restructuring existing code *without changing its external behavior*. It's like cleaning and organizing the tools in a workshop. The tools do the same job afterward, but they are easier to find and use. This is done in small, continuous, behavior-preserving steps.
*   **Rewriting** is replacing old code with new code. This is what the team in the wrong model is doing. This is a high-risk activity because it's nearly impossible to fully capture all the subtle behaviors of the old system.
*   The **Strangler Fig pattern** is a strategy for a *gradual rewrite*. It avoids the "big bang" risk by replacing the system piece by piece.

The key distinction is incrementalism vs. all-or-nothing. True refactoring is inherently incremental. A rewrite is inherently all-or-nothing. The strategies in this lesson show how to turn a risky rewrite into a safe, incremental migration. Confusing these terms leads to underestimating risk and proposing fragile, dangerous project plans.

## Check Your Understanding
1.  What is the primary role of the router/proxy in the Strangler Fig pattern, and why is it introduced at the very beginning of the process?
2.  Explain the difference between deploying code and releasing a feature. How do feature flags enable this separation?
3.  A team needs to split a single `address` database column into three new columns: `street`, `city`, and `zip_code`. Why is it unsafe to deploy a single change that alters the database and the application code at the same time?

## Mastery Question
Your team manages a large, monolithic e-commerce application. The logic for calculating shipping costs is deeply embedded in the order processing workflow and is becoming a major performance bottleneck. This logic is complex, with dozens of rules based on product weight, destination, user subscription level, and active promotions. You are tasked with extracting this logic into a new, high-performance `ShippingCalculator` microservice. The business cannot tolerate any incorrect shipping charges, even for a few minutes.

How would you combine the Parallel Run technique with Feature Flagging to migrate to the new service with maximum safety? Describe the specific steps you would take and what you would be monitoring at each stage to gain confidence before making the final switch.