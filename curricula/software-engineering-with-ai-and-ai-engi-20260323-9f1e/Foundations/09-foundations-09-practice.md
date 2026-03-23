## Exercises

**Exercise 1**
An AI engineering team is working on a system to predict house prices. A team member is currently calculating the average error (in dollars) of their model's predictions on a set of 10,000 houses that the model has never seen before. Which stage of the AI Engineering Lifecycle is this activity part of?

**Exercise 2**
A company has successfully developed and deployed a model that predicts which customers are likely to churn (cancel their subscription). For the past six months, the model has been live and its performance has been stable. The marketing department now introduces a brand new subscription tier with different features. What lifecycle stage should the AI team immediately prioritize in response to this business change?

**Exercise 3**
A retail company builds a sentiment analysis model to classify customer reviews as "positive" or "negative." They train it on a large dataset of reviews from 2018-2020. They are so happy with the results on their test set that they immediately deploy it in 2024 without planning for a monitoring phase. What is a likely problem they will face, and which lifecycle concept does this problem illustrate?

**Exercise 4**
Two teams are starting new AI projects.
-   **Team A** is building a system to identify cracks in aircraft engine turbines from images. The cost of missing a crack (a false negative) is extremely high.
-   **Team B** is building a system to recommend funny videos to users on a social media app. The cost of a bad recommendation is very low.

How should the difference in project goals influence the relative amount of effort they spend on the **Model Evaluation** stage of the lifecycle?

**Exercise 5**
A team is building a loan default prediction system. After training a model, they move to the evaluation stage. They discover their model has an excellent overall accuracy of 98%. However, when they use a confusion matrix to look deeper, they find that it correctly identifies only 30% of the applicants who actually default on their loans. Integrating your knowledge of model evaluation metrics, explain why deploying this model would be a bad idea and what the team's next step in the lifecycle should be.

**Exercise 6**
A startup wants to build an AI-powered hiring assistant that scans resumes and predicts whether a candidate is a good fit for a software engineering role. They have two options for the "Data Collection & Preparation" stage:

1.  **Option A:** Use a publicly available dataset of 100,000 resumes, but with no information on whether those candidates were actually successful hires. The team would have to manually create rules to label them as "good fit" or "not a good fit."
2.  **Option B:** Spend six months working with HR to collect and carefully label 5,000 internal resumes based on actual historical hiring and performance data.

Analyze the trade-offs between these two options. How would the choice of Option A versus Option B impact the downstream stages of the lifecycle (Model Development, Evaluation, and Monitoring)?

---

## Answer Key

**Answer 1**
This activity is part of the **Model Evaluation** stage.

**Reasoning:** The key is that the model is being tested on data it has *not seen before* (a hold-out or test set). The purpose of this stage is to get an unbiased estimate of the model's performance on new, real-world data before deploying it. Calculating the average error is a classic evaluation task for a regression problem (predicting a number like house price).

**Answer 2**
The team should immediately prioritize the **Monitoring & Maintenance** stage.

**Reasoning:** The introduction of a new subscription tier is a significant change to the business environment. This could cause **model drift**, where the patterns in customer behavior that the model learned are no longer accurate. For example, customers on the new tier might have completely different churn behaviors. The monitoring system should detect if the model's predictive performance starts to degrade, which would signal that the model needs to be retrained with new data.

**Answer 3**
The likely problem is a significant drop in model performance over time. This illustrates the concept of **model drift** or **concept drift**.

**Reasoning:** The language, slang, and topics discussed in customer reviews can change significantly between 2020 and 2024. The model was trained on historical data and has no knowledge of these new patterns. Without monitoring, the company would be unaware that the model's classifications are becoming increasingly inaccurate as the real-world data "drifts" away from the data it was trained on.

**Answer 4**
Team A (aircraft turbines) must spend significantly more effort on Model Evaluation than Team B (video recommendations).

**Reasoning:** The consequences of model failure are vastly different.
-   For **Team A**, a missed crack (false negative) could be catastrophic. Their evaluation must be rigorous, using metrics like Recall to ensure almost no cracks are missed. They might need multiple layers of testing, formal verification, and extensive documentation to prove the model's reliability before deployment.
-   For **Team B**, a bad recommendation is a minor annoyance. Their evaluation can be much lighter. They can focus on metrics like precision or simple A/B testing in production to see if users engage with the recommendations. The cost of an error is low, so the cost of extensive pre-deployment evaluation is not justified.

**Answer 5**
Deploying this model would be a bad idea because while its overall accuracy is high, its **recall** on the positive class (default) is very low (30%).

**Reasoning:**
-   **Problem:** In this context, the model is failing at its primary business purpose: identifying defaulters. It misses 70% of the people who will actually default. The high accuracy is misleading because most applicants don't default, so the model can be "accurate" by simply predicting "no default" most of the time.
-   **Next Step:** The team must not proceed to the "Deployment" stage. They should return to the **Model Development** (or even "Feature Engineering") stage. They need to try different algorithms, adjust model parameters, use techniques to handle the imbalanced data (since defaults are rare), or create better features to improve the model's ability to identify the rare but critical cases of default.

**Answer 6**
This scenario presents a classic trade-off between data quantity/speed and data quality/cost.

**Option A (Large, weakly-labeled public dataset):**
-   **Impact on Model Development:** Development could start faster. However, the model would be trained on noisy, potentially incorrect labels based on proxies ("rules"). This is a form of weak supervision. The model might learn the biases of the rules created by the team rather than the true signals of a good candidate.
-   **Impact on Evaluation:** It would be very difficult to create a reliable test set. If the team uses the same rules to create the test set, the evaluation metrics will be artificially high and will not reflect real-world performance.
-   **Impact on Monitoring:** The model is likely to perform poorly in production. Monitoring would quickly reveal a large gap between predicted performance and actual business outcomes, likely forcing a complete restart of the project.

**Option B (Small, high-quality internal dataset):**
-   **Impact on Model Development:** This is a much slower start. The team has less data, which might limit the complexity of the models they can train. However, the data directly reflects the business problem ("ground truth"), which is a major advantage.
-   **Impact on Evaluation:** The evaluation will be far more meaningful. The team can be confident that a model performing well on a test set of this data will likely perform well in production, as the labels correspond to real-world success.
-   **Impact on Monitoring:** The model deployed is more likely to be successful from the start. Monitoring would focus on tracking performance and identifying when the definition of a "successful hire" changes, signaling the need for retraining.

**Conclusion:** Option B is the much safer and more professional approach, despite the initial delay. It prioritizes data quality, which is crucial for building a reliable AI system, especially in a sensitive area like hiring where fairness and accuracy are critical. Option A is a high-risk shortcut that is likely to fail in the long run.