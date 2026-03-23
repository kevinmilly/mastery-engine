## Exercises

**Exercise 1**
An e-commerce company uses a model to predict the probability that a customer will purchase an item based on features like browsing history, time on site, and number of items in the cart. The model was trained on data from a period of normal business operations. During a major holiday sale, site traffic doubles, and the average number of items in customers' carts increases from 2 to 7. The model's predictions become less reliable. Which primary type of drift is this an example of, and why?

**Exercise 2**
You are monitoring a deployed credit risk model. One of the input features is `applicant_income`. The training dataset for the model had a mean income of $55,000 with a standard deviation of $10,000. Your monitoring system collects incoming prediction requests. Describe a specific, simple statistical method you could implement to automatically flag potential data drift for the `applicant_income` feature based on a weekly batch of new applications.

**Exercise 3**
A medical imaging AI is used to classify skin lesions as benign or malignant. After a software update to the hospital's imaging machines, the new images have a slightly higher resolution and different color saturation than the images the model was trained on. The model's overall accuracy begins to decline. Your data drift monitors, which check the statistical distribution of pixel intensity values, do not flag a significant change. Explain why this might be happening and identify the most likely type of drift.

**Exercise 4**
You are responsible for a sentiment analysis model that classifies user comments into "Positive," "Negative," and "Neutral." To monitor for drift, your team sets up a system that tracks the distribution of the model's *output predictions* on a daily basis. The system will alert you if, for example, the percentage of "Negative" classifications suddenly spikes from its baseline of 15% to 30%. What is a critical blind spot of this monitoring approach? Describe a realistic scenario where the model's performance could be degrading significantly, yet this monitoring system would fail to raise an alert.

**Exercise 5**
A fraud detection model (v2.1, served via a RESTful API) shows a steady increase in its false negative rate over two months. A deeper analysis confirms significant concept drift: fraudsters are using a new attack pattern the model has never seen. You have an automated MLOps pipeline that can trigger retraining. Outline the sequence of high-level steps your automated system should execute to address this issue, from detection to resolution. Incorporate concepts from prior topics like data pipelines, model versioning, and deployment.

**Exercise 6**
You are the lead engineer for a model that predicts inventory needs for a large retail chain. Your monitoring dashboard presents two key metrics:
1.  **Data Drift Index:** A composite score (0-1) indicating how much the live feature distributions (e.g., sales velocity, seasonality) have deviated from the training data. A score above 0.6 is considered high drift.
2.  **Prediction Accuracy (WAPE):** The Weighted Absolute Percentage Error, calculated with a 7-day delay as actual sales data becomes available. Lower is better.

For the past month, the Data Drift Index has been high, hovering around 0.75. However, the model's WAPE has remained stable and well within the acceptable range. The business team is happy with the model's performance. Retraining the model is a resource-intensive process. Should you recommend immediate retraining? Justify your decision by analyzing the risks of both acting and not acting.

---

## Answer Key

**Answer 1**
This is an example of **data drift** (specifically, feature drift).

**Reasoning:**
The underlying relationship between the features and the outcome (purchase) has likely not changed; customers who browse more and add more items to their cart are still more likely to buy. However, the statistical distribution of the input features (`time on site`, `number of items in cart`) has changed significantly due to the holiday sale. The model is now seeing data points that are outside the range of what it learned from, causing its performance to degrade. This change in the input data's distribution is the definition of data drift.

**Answer 2**
A simple and effective method is to track the mean and standard deviation of `applicant_income` for each weekly batch and compare them to the training data's statistics using a threshold-based alert.

**Reasoning:**
1.  **Establish a Baseline:** The training data provides a baseline: mean μ₀ = $55,000 and standard deviation σ₀ = $10,000.
2.  **Collect Live Data:** For each weekly batch of N applications, calculate the sample mean (μ_live) and sample standard deviation (σ_live).
3.  **Implement a Statistical Check:** A common approach is to use a Z-score or set a threshold. For example, you can flag drift if the live mean shifts by more than 3 standard deviations from the original mean. A simpler, more direct rule could be: `if |μ_live - μ₀| > 3 * σ₀ / sqrt(N) then ALERT`. Alternatively, a two-sample Kolmogorov-Smirnov (K-S) test could be used to compare the entire distribution of the new batch to the training distribution, which is more robust than just checking the mean. The key is to automate the comparison of a statistical property of the live data against the training data baseline.

**Answer 3**
The most likely type of drift is **concept drift**, even though it was triggered by a change in the data-generating process.

**Reasoning:**
The data drift monitors for pixel intensity might not flag a change because the overall brightness and color balance could be statistically similar. However, the *relationship* between the patterns in the pixels and the diagnosis (benign/malignant) has changed from the model's perspective. The subtle changes in resolution and saturation act as a new "concept" for the model. The features that it learned to associate with malignancy in the old-style images may not be present in the same way in the new, higher-resolution images. Therefore, the mapping from input features to the output label is no longer valid, which is the definition of concept drift.

**Answer 4**
The critical blind spot is that **this approach only monitors the model's predictions, not its correctness.** It assumes that a stable output distribution correlates with stable performance, which is not always true.

**Scenario:**
Imagine a competitor launches a successful negative marketing campaign. As a result, the true sentiment of user comments shifts, becoming 30% "Negative" instead of the usual 15%. However, our model fails to recognize the new language patterns in these negative comments and continues to classify most of them as "Neutral." The model's output distribution would remain stable (e.g., 15% Negative, 70% Neutral, 15% Positive) while its actual performance has plummeted because it is now misclassifying a large portion of the new negative comments. The system would fail to raise an alert because the output it's monitoring appears unchanged.

**Answer 5**
An automated sequence of steps would be:
1.  **Alert & Triage:** The monitoring system confirms concept drift and triggers a high-priority alert to the engineering team.
2.  **Trigger Data Pipeline:** The system automatically initiates a data ingestion job to collect the most recent production data, including the features and the ground-truth labels (fraud/not-fraud) that confirmed the poor performance.
3.  **Data Labeling/Annotation (if needed):** A crucial step for concept drift is to label the new attack patterns correctly. This might require a human-in-the-loop or a rule-based system to flag suspicious cases for review and add them to the training set.
4.  **Trigger Retraining Workflow:** The MLOps pipeline starts a new training job using the updated dataset, which now includes examples of the new fraud pattern.
5.  **Evaluate & Version:** The newly trained model candidate (e.g., v2.2) is rigorously evaluated against a holdout dataset that includes the new attack pattern. If its performance is superior to the current v2.1, it is saved as a new version.
6.  **Deploy Gradually:** The new model v2.2 is deployed, ideally using a canary release or blue-green deployment strategy. This allows for monitoring the new model on a small fraction of live traffic before rolling it out completely, minimizing risk. The RESTful API endpoint is updated to route traffic to the new model.
7.  **Update Monitoring Baselines:** The baselines for performance and data distributions are updated to reflect the new reality post-deployment.

**Answer 6**
The recommendation should be to **wait on immediate deployment but start the retraining process in the background.**

**Reasoning:**
This situation presents a classic trade-off between proactive maintenance and operational stability ("if it ain't broke, don't fix it").

*   **Risk of Not Acting:** The high data drift is a strong leading indicator that the model is operating "out-of-distribution." Its continued high accuracy could be coincidental or temporary. There is a significant risk of a sudden, sharp drop in performance if the input data shifts just a little bit more. The model's robustness is currently unknown, and relying on it is a gamble.
*   **Risk of Acting (Immediate Retraining & Deployment):** Retraining is costly. More importantly, there is no guarantee that a retrained model will perform better, especially if the new data distribution is temporary or noisy. Deploying a new model that performs *worse* than the current stable one would be a negative outcome that disrupts business operations.

**Justified Recommendation:**
The most prudent course of action is a balanced one:
1.  **Do Not Deploy Immediately:** Since the business-critical metric (WAPE) is stable, there is no immediate need to replace the production model.
2.  **Initiate Proactive Retraining:** Trigger the retraining pipeline using the latest data. This creates a new model candidate that is adapted to the current data distribution.
3.  **Perform Shadow/Offline Evaluation:** Evaluate the new model candidate rigorously against the current production model (v_prod) on live data (in a non-serving "shadow" mode) for at least one full business cycle (e.g., a week). Compare their WAPE.
4.  **Make a Data-Driven Decision:** If the new model demonstrates superior or equal performance, deploy it. If it performs worse, discard it and continue to monitor the production model closely while investigating the cause of the drift and its lack of impact on accuracy. This approach mitigates the risk of future failure without disrupting current stable operations.