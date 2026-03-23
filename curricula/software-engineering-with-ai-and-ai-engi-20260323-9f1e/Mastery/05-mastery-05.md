## The Hook
After this lesson, you will understand how to safely release a new AI model to real users and prove, with data, that it's actually better than the old one.

Imagine a world-famous restaurant chain wants to improve its signature sauce. The chefs develop a new recipe that tastes better in their test kitchen. They wouldn't just swap the sauce in all 10,000 locations overnight. The risk is immense. Instead, they might first try the new sauce in a single restaurant, carefully watching for any kitchen problems. This is a **Canary release**. If it runs smoothly, they might then offer both the old and new sauces in several locations, tracking which one customers order more. This is an **A/B test**. These controlled, real-world experiments are exactly how we deploy new ML models—not based on lab results alone, but on proven performance with live users.

## Why It Matters
In the last lesson, you learned how a CI/CD pipeline automates the testing of code, data, and model performance. It's the final quality check that says a new model version is *safe to deploy*. But "safe to deploy" is not the same as "better for the business."

Here’s the wall you hit without understanding online experimentation: You deploy a new recommendation model that your offline tests showed was 5% more accurate at predicting user clicks. A week later, your company's revenue is down 3%. What happened?

The model might be "more accurate" but is recommending cheaper items, lowering the average order value. Or perhaps the new model is slightly slower, causing impatient users to abandon their shopping carts. Offline metrics on a historical dataset can't capture these complex, real-world user behaviors and business trade-offs.

Without A/B testing and Canary releases, you are essentially guessing. You are pushing new models into production and hoping for the best, unable to distinguish between a genuine improvement and a change that quietly hurts your product. These techniques turn deployment from an act of faith into a scientific process.

## The Ladder
Our goal is to safely and confidently replace a running model (Model A, the "champion") with a new, promising version (Model B, the "challenger"). Offline tests suggest B is better, but we need to prove it in the real world.

### Step 1: The Limits of the Lab
First, we must accept that our offline evaluation, while critical, is incomplete. Metrics like accuracy, precision, and recall are calculated on a static, historical dataset. This "lab environment" can't answer crucial questions:
-   How will real users react to the new model's predictions?
-   Will the new model's behavior increase user engagement or cause frustration?
-   Does the model create unintended negative consequences for the business (e.g., lower profit margins, higher server costs)?

To answer these, we must move from offline evaluation to online experimentation—testing with live user traffic.

### Step 2: The Canary Release (Testing for Stability)
Before we even ask if Model B is *better*, we must confirm it is *stable*. A Canary release is our primary tool for this.

**Mechanism:** You configure your system's router to send a tiny fraction of production traffic—say, 1%—to the new Model B. The other 99% continues to go to the proven Model A.

**Measurement:** For this small "canary" group, you aren't focused on business metrics yet. You are watching engineering and system dashboards like a hawk, looking for signs of trouble:
-   **Error Rate:** Is Model B throwing more errors than Model A?
-   **Latency:** Are its predictions significantly slower?
-   **Resource Consumption:** Is it consuming an alarming amount of CPU or memory?

A **Canary release** is a deployment strategy where a new model version is gradually exposed to a small subset of users to detect any immediate technical or operational problems before a full rollout. The name comes from the "canary in a coal mine" analogy, where the bird's distress would warn miners of invisible, toxic gas.

**Decision:** If the canary survives (i.e., the model is stable), you can gradually increase its traffic share (e.g., to 5%, then 20%). If it shows any signs of distress, you immediately roll back, routing 100% of traffic back to Model A, and investigate the issue with minimal impact on your overall user base.

### Step 3: The A/B Test (Testing for Effectiveness)
Once you're confident Model B is stable, you can proceed to determine if it's truly more effective.

**Mechanism:** You split a segment of your users into two random groups.
-   **Group A (Control):** This group continues to receive predictions from the existing Model A.
-   **Group B (Treatment):** This group receives predictions from the new Model B.

This split is crucial. By having two groups experience different models *at the same time*, you control for external factors like holidays, news events, or marketing campaigns that could otherwise skew your results.

**Measurement:** Before starting the test, you must define a primary business metric. This is the "one number that matters" for this experiment. For a movie recommendation model, it might be "minutes of content streamed per user." For a logistics routing model, it could be "average delivery time." You measure this key metric for both groups over a statistically significant period (e.g., days or weeks).

An **A/B test** (or split test) is a randomized, controlled experiment designed to compare the performance of two or more variants (e.g., two model versions) on a specific business outcome.

**Decision:** At the end of the test, you use statistical methods to analyze the results. If Group B shows a statistically significant improvement in your primary metric without harming secondary metrics (like system performance), you have a data-driven reason to declare Model B the new champion and roll it out to 100% of users. If not, you stick with Model A, having avoided a costly mistake.

In short: a Canary release checks if the new model will break things; an A/B test checks if it will improve things.

## Worked Reality
**Scenario:** A financial tech company uses an ML model to predict the risk of a loan application being fraudulent. The current model (Model A) is conservative, declining many borderline applications. The team develops Model B, which uses more sophisticated features and, in offline tests, correctly identifies 10% more legitimate loans without increasing the false positive rate.

**The Plan:** They'll use a combined Canary and A/B testing strategy.

**Phase 1: Canary Release (Risk Mitigation)**

1.  **Deployment:** They configure their loan processing service to route 2% of incoming applications to Model B for a "shadow" prediction. The final approval decision is still made by Model A, but Model B's prediction is logged.
2.  **Monitoring:** The engineering team watches technical dashboards for 48 hours. They're looking for spikes in prediction latency or API errors from the Model B service. They also check resource usage to ensure it isn't drastically more expensive to run.
3.  **Outcome:** Model B runs smoothly. It's 50ms slower per prediction, but this is well within their performance budget. No errors are logged. The canary is healthy.

**Phase 2: A/B Test (Effectiveness Comparison)**

1.  **Setup:** They decide to run a live A/B test. For all incoming applications, a random number generator assigns the application to either Group A or Group B with a 50/50 split.
    -   If assigned to Group A, Model A's prediction (Approve/Decline) is used as the official decision.
    -   If assigned to Group B, Model B's prediction is used as the official decision.
2.  **Metric Definition:** The team agrees on the primary business metric: **"capital deployed to legitimate loans."** This measures the total dollar value of approved loans that do not default within 90 days. A secondary metric is the **"default rate"** to ensure they aren't approving riskier loans.
3.  **Execution & Analysis:** The test runs for four weeks to gather enough data for a reliable conclusion.
    -   At the end of the test, they find that applications in Group B resulted in an 8% increase in deployed capital compared to Group A.
    -   Crucially, the 90-day default rate for Group B was statistically identical to Group A.
4.  **Decision:** The data provides clear evidence. Model B generated more business value (by approving more good loans) without increasing risk (the default rate remained stable). The company's leadership approves the full rollout of Model B to 100% of traffic.

## Friction Point
**The Wrong Mental Model:** "A/B testing is for measuring the live accuracy of my new model."

**Why It's Tempting:** In model development, accuracy is king. We spend weeks tuning our models to get higher accuracy, precision, or recall on a test set. It's natural to want to continue measuring that same thing once the model is live.

**The Correct Mental Model:** A/B testing is for measuring the **impact of your model's predictions on user behavior and business outcomes**.

You almost never measure "accuracy" directly in a live A/B test because you lack the ground truth in real-time. For the loan fraud model, you don't know if a loan will *actually* default until months later. For a product recommendation model, you never know the "perfect" recommendation for a user.

Instead of measuring the model's correctness, you measure a proxy for success. You measure the *consequence* of the model's decisions. Did the user click the recommendation? Did they complete the purchase? Did the approved loan get paid back? The goal shifts from "Is the model right?" to "Does the model's behavior drive the business metric we care about in the right direction?"

## Check Your Understanding
1.  You've just deployed a new spam filter model to 1% of incoming emails (a Canary release). What specific *types* of metrics are you most concerned with in this initial phase, and why?

2.  An A/B test for a new ad-targeting model runs for a week. Model B has a 20% higher click-through rate than Model A. However, the total ad revenue from users exposed to Model B is 5% lower. Which model is "better"? Explain your reasoning.

3.  What is the fundamental difference in purpose between a Canary release and an A/B test?

## Mastery Question
You work for a navigation app company (like Google Maps or Waze). Your team has built a new routing model that aims to find routes that are more "fuel-efficient." Offline simulations show it can save users an average of 5% on fuel compared to the current model, which only optimizes for travel time. Your boss is excited and wants to roll it out to everyone. Propose a comprehensive, data-driven deployment plan. Be specific about the primary business metric you would use for an A/B test and identify at least one critical *negative side-effect* you would need to monitor to ensure the new model isn't making the user experience worse in other ways.