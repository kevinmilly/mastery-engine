## Exercises

**Exercise 1**
An online retail company has two versions of a product recommendation model. Model A is the current production model. Model B, a new challenger, has 2% higher accuracy on offline test sets but also has a 20ms higher average latency. The goal is to determine which model leads to a higher overall purchase value per user session. Which deployment strategy, A/B testing or a canary release, is more appropriate for making this decision? Justify your choice by identifying the primary goal of the experiment.

**Exercise 2**
A team is deploying a new version of a sentiment analysis model for customer support tickets. The primary concern is not business metrics but technical stability; the previous deployment caused a major outage due to a memory leak in the model's preprocessing code. The team decides to route 1% of live traffic to the new model for 6 hours while closely monitoring system health dashboards. If no critical errors occur, they will roll it out to all users. Is this a canary release or an A/B test? Explain what specific types of metrics the team would be monitoring during this 6-hour window.

**Exercise 3**
A streaming service runs an A/B test on a new content discovery model (Model B) against the old one (Model A). The primary metric for the test is "user engagement," defined as the average number of videos watched per user per week. After running the test for three weeks on 10% of users, the results show that Model B has a statistically significant 5% lift in the primary metric. However, the support team reports a 20% increase in complaints about "irrelevant recommendations" from the test group. Why might the primary metric be insufficient for making a deployment decision, and what kind of secondary, or "guardrail," metric should have been included in the test design?

**Exercise 4**
A logistics company is considering a new route optimization model that promises a 10% reduction in fuel costs. The model is highly complex and its predictions are difficult to interpret. The company decides to run a canary release, deploying the model's suggested routes to 2% of its delivery fleet. After one day, the monitoring dashboard shows no technical errors and fuel consumption for the canary fleet is indeed 9% lower. However, three drivers from the canary group have called in to report that their routes seemed "illogical" and "inefficient," sending them through heavy residential traffic. How did the canary release succeed in this scenario, even though the primary success metric (fuel cost) looked positive? What should be the team's next step?

**Exercise 5**
You are the MLOps architect for a bank's real-time transaction fraud detection system. A new model is ready for deployment. Due to the high cost of both false negatives (missed fraud) and false positives (declined legitimate transactions), the deployment process must be extremely cautious but also data-driven. Design an automated, two-stage deployment strategy within a CI/CD pipeline that uses *both* a canary release and an A/B test. For each stage, define:
1.  The percentage of traffic it receives.
2.  Its primary goal.
3.  The specific criteria for automatically promoting the model to the next stage (or to full production).
4.  The specific criteria for an automatic rollback.

**Exercise 6**
A large e-commerce platform is A/B testing a new, more personalized search ranking model (Challenger) against its existing model (Control). The Challenger is a large transformer-based model, while the Control is a simpler gradient-boosted tree model. The A/B test is configured to split traffic 50/50. Two days into the test, analysts observe the following:
- The Challenger shows a 4% lift in click-through rate (CTR) on search results.
- The Challenger has a p99 inference latency of 400ms, while the Control is 80ms.
- Infrastructure costs for the Challenger's half of the traffic have increased by 300% due to the need for GPU servers.

The product team wants to ship the Challenger based on the CTR lift. The finance and SRE teams are against it due to the cost and latency. Drawing on concepts from **Model Explainability (XAI)** and **Scalable System Design**, propose a plan to resolve this conflict. How can you move beyond simple A/B metrics to make a more nuanced, business-aware decision?

---

## Answer Key

**Answer 1**
**A/B testing is the more appropriate strategy.**

**Reasoning:**
The goal is not to check for system stability, but to *compare the business performance* of two viable models. The core question is whether the 2% offline accuracy improvement of Model B translates into a tangible business outcome (higher purchase value) that outweighs its negative impact (higher latency). An A/B test is designed for this kind of comparative analysis, where traffic is split between versions and a key business metric is measured until statistical significance is reached. A canary release, which focuses on safety and stability, would not provide the statistical rigor needed to make a confident decision about which model better achieves the business goal.

**Answer 2**
**This is a canary release.**

**Reasoning:**
The primary goal is to mitigate risk and ensure technical stability, not to compare performance on a business metric. The team's main concern is preventing a catastrophic failure like the one they experienced before.

The specific metrics they would monitor are operational and system-level, not business-level KPIs. These would include:
- **Memory Utilization:** To detect potential memory leaks.
- **CPU/GPU Utilization:** To check for unexpected processing load.
- **Application Error Rate:** To catch any unhandled exceptions or crashes in the new model's code.
- **p95/p99 Latency:** To ensure the new model responds within service level objectives (SLOs).
A canary release is successful if these metrics remain stable and within acceptable bounds, indicating the new version is safe for a wider rollout.

**Answer 3**
**Reasoning:**
The primary metric, "average videos watched," is insufficient because it captures user activity but not user *satisfaction*. A model could create "clickbait" or short, unsatisfying loops of content that increase the number of videos watched but lead to a poor long-term user experience. The rise in complaints is a clear signal that the primary metric is not telling the whole story.

A crucial **guardrail metric** should have been included. A good choice would be a metric that captures user satisfaction or recommendation quality directly. Examples include:
- **Negative Feedback Rate:** The rate at which users downvote, hide, or report a recommendation as "not relevant."
- **Session Abandonment Rate:** The percentage of users who stop interacting with the service after a short period.
- **Watch Time of Recommended Videos:** Instead of just counting videos, measuring the percentage of a recommended video that was actually watched.

The 20% increase in complaints would have caused this guardrail metric to fail its threshold, preventing the team from deploying a model that optimized for a narrow metric at the expense of overall product quality.

**Answer 4**
**Reasoning:**
The canary release succeeded because its primary purpose is to act as an early warning system for *any* kind of production issue, not just technical bugs or regressions in a single metric. It successfully surfaced a critical flaw in the model's real-world performance—its lack of alignment with driver expertise and real-world context—that was invisible in offline simulations and simple metric monitoring. The drivers' qualitative feedback is a crucial data point that the canary test enabled the team to collect safely.

**Next Step:**
The team should **not** roll the model out further. Instead, they should:
1.  **Halt the experiment and analyze:** Treat the driver feedback as high-priority data. Use **Model Explainability (XAI)** techniques to understand *why* the model generated these "illogical" routes.
2.  **Instrument and measure:** If possible, enhance the test to measure new metrics like "number of manual route deviations by drivers" or collect structured feedback.
3.  **Iterate on the model:** Use the insights from the analysis and new data to improve the model's objective function, potentially adding constraints or features that account for factors like traffic patterns in residential areas or driver preferences. The goal is to create a new version to test, not to push the current one forward.

**Answer 5**
**Two-Stage Automated Deployment Strategy:**

**Stage 1: Canary Release**
- **Traffic:** 1% of live transaction traffic.
- **Primary Goal:** Ensure technical stability and safety. The model must not crash, introduce extreme latency, or generate catastrophic outputs (e.g., classifying all transactions as fraud).
- **Promotion Criteria (to A/B Test):** The model runs for 24 hours with **zero** critical errors, and its p99 latency and memory usage remain within a 5% tolerance of the production model.
- **Rollback Criteria:** Automatic rollback is triggered if the model's container crashes more than 3 times in an hour, if its p99 latency exceeds the SLO for more than 5 minutes, or if it produces a rate of fraud predictions that is statistically anomalous (e.g., 3 standard deviations above the mean).

**Stage 2: A/B Test**
- **Traffic:** 10% of traffic (5% for the challenger, 5% for the control group). The traffic is ramped up from the canary stage.
- **Primary Goal:** Validate that the new model provides a statistically significant improvement in key business metrics without harming others.
- **Promotion Criteria (to 100% Production):** The test runs for 7 days (to capture weekly patterns). The challenger must show a statistically significant decrease in the total dollar value of fraudulent transactions (primary metric) *without* causing a statistically significant increase in the number of false positives (a key guardrail metric).
- **Rollback Criteria:** Automatic rollback is triggered if the challenger is statistically worse on the primary metric after 3 days, or if it ever shows a significant regression on the false positive rate guardrail metric. If results are inconclusive after 7 days, the control (old model) is declared the winner and the challenger is rolled back.

**Answer 6**
This scenario requires moving beyond the single A/B test metric (CTR) to a holistic business value evaluation, using concepts from XAI and Scalable Design.

**Proposed Plan:**

1.  **Decompose Performance with XAI (Don't just ask *if* it's better, ask *where* and *why*):**
    -   **Segmented Analysis:** Instead of a single CTR lift number, break down the results. Is the Challenger model providing the most lift for high-value user segments, or for long-tail, low-intent searches? Use XAI techniques like SHAP to identify the features driving the Challenger's new rankings. This helps determine if the lift is coming from valuable personalization or just surfacing more popular "head" items.
    -   **Latency Analysis:** Use XAI and performance profiling to understand the source of the 400ms latency. Is it uniform across all queries, or are there specific types of complex searches (e.g., long text, many filters) that are disproportionately slow? This could inform targeted optimizations.

2.  **Reframe the Problem with Scalable Design and Business Metrics:**
    -   **Cost-Benefit Analysis:** The decision is not CTR vs. Cost. It's `(Value of CTR Lift) - (Incremental Infrastructure Cost) - (Cost of Higher Latency)`.
    -   **Quantify the Value:** Translate the 4% CTR lift into projected revenue. A/B test a third metric: "Revenue Per Search Session." This is a much better business-level metric than CTR.
    -   **Quantify the Cost of Latency:** Analyze user behavior correlated with latency. Is there an increase in session abandonment or zero-click searches for users who experience the 400ms latency? This quantifies the negative impact of the slowdown.
    -   **Architectural Mitigation:** The 300% cost increase is a design problem. Can we use a **model cascade**? Use the cheap, fast Control model for 90% of "easy" queries and only invoke the expensive Challenger model for high-value or complex queries where it provides the most benefit. This hybrid approach, a core concept in scalable system design, could provide 80% of the revenue lift for 20% of the cost.

**Decision:**
Instead of a simple "yes/no" on the Challenger, the outcome of this analysis would be a more nuanced strategy. For example: "We will deploy the Challenger model, but only for logged-in, high-value customer segments where the revenue lift justifies the cost, while all other traffic continues to use the Control model. We will simultaneously work on optimizing the Challenger's performance for the slow query types identified by XAI." This data-driven compromise directly addresses the concerns of all stakeholders.