## Exercises

**Exercise 1**
A data scientist on your team has written the following Python function to preprocess user data for a churn prediction model. The input `user_df` is a pandas DataFrame.

```python
def preprocess_features(user_df):
    # Calculate user tenure in years
    user_df['tenure_years'] = (pd.to_datetime('2023-10-26') - pd.to_datetime(user_df['signup_date'])) / np.timedelta64(1, 'Y')
    
    # One-hot encode the 'plan_type' column (index 4)
    plan_dummies = pd.get_dummies(user_df.iloc[:, 4], prefix='plan')
    
    # Combine and select final features
    final_features = pd.concat([user_df[['tenure_years', 'monthly_spend']], plan_dummies], axis=1)
    
    return final_features
```

Identify one specific source of machine learning technical debt in this code snippet. Explain why it represents a long-term risk to the system.

**Exercise 2**
A team deploys a new sentiment analysis model that relies on user-generated text from a third-party social media API. For the first two months, the model performs well. In the third month, its accuracy suddenly drops by 20%, but the model code itself has not changed. An investigation reveals the third-party API silently started replacing all emojis in the text with the string `"[emoji]"`.

Propose a specific, automated technical strategy to mitigate this type of "data dependency" debt in the future. Describe what component you would build and where it would fit in the ML pipeline.

**Exercise 3**
You are leading the development of a system to predict manufacturing defects on an assembly line using image data. You have two options:
- **Model A (Simpler):** A classic computer vision approach using hand-crafted feature extractors (e.g., edge detection, color histograms) fed into a Random Forest classifier. It achieves 96% accuracy, is fast to train, and its decisions are relatively easy to trace back to the input features.
- **Model B (More Complex):** A large pre-trained Convolutional Neural Network (CNN) fine-tuned on your data. It achieves 98.5% accuracy but requires expensive GPU hardware for training, and its internal logic is opaque.

Choosing Model B introduces a higher risk of "model complexity" debt. Describe two distinct ways this form of debt could manifest as a concrete problem for the engineering team post-deployment.

**Exercise 4**
A financial services company is struggling with its anti-money laundering (AML) transaction monitoring system. The system, built two years ago, has the following symptoms:
1.  When new AML regulations are released, it takes the ML team over a month to update the feature engineering logic and retrain the model without breaking downstream dependencies.
2.  The lead data scientist who built the original model has left, and no one on the current team is confident they can reproduce the exact training run that created the currently deployed model artifact.
3.  The model's performance has been slowly degrading, but it's unclear whether this is due to concept drift or subtle bugs introduced during past maintenance.

Diagnose three distinct types of technical debt plaguing this system, linking each type to one of the specific symptoms described.

**Exercise 5**
A team is building a CI/CD for ML pipeline for their customer lifetime value (LTV) prediction model. Their current pipeline automates the following steps: `Code Commit -> Unit Tests -> Build Docker Image -> Deploy to Staging`.

This pipeline effectively manages traditional software debt but does little to address ML-specific technical debt. Propose two additional, automated stages to integrate into this pipeline that would specifically help manage "data debt" and "model debt". For each proposed stage, explain what it would do and what type of debt it prevents.

**Exercise 6**
You've inherited a critical, high-performing "propensity to buy" model that is a key part of your company's marketing engine. The model is a complex ensemble of several gradient-boosted trees, and its code is tightly entangled with the data preprocessing logic. Recently, an A/B test showed that a new, simpler logistic regression model performs almost as well (within 0.5% AUC) on the general population.

However, your product manager is concerned that the simpler model might be less effective for high-value customer segments. The original complex model is a maintenance nightmare and a source of significant technical debt.

Synthesizing concepts from Model Explainability (XAI) and technical debt management, outline a plan to decide whether to pay down the debt by switching to the simpler model. How would you use XAI techniques to de-risk the decision?

---

## Answer Key

**Answer 1**
The most significant source of ML technical debt here is **code-data entanglement**.

**Reasoning:**
1.  **Hardcoded Date:** The line `pd.to_datetime('2023-10-26')` hardcodes the current date. As time passes, this will become stale, and the `tenure_years` feature will become increasingly inaccurate for new data, leading to model performance degradation. The code is entangled with an assumption about the real world (the current date) that is not guaranteed to hold.
2.  **Hardcoded Column Index:** The line `user_df.iloc[:, 4]` refers to the "plan_type" column by its integer position (the 5th column). If anyone changes the order of columns in the upstream data source, this code will silently start using the wrong data to create the `plan_dummies`, corrupting the model's inputs and leading to unpredictable behavior. The code is tightly coupled to the data's structural schema.

This debt creates a fragile system where changes in external data can break the model in non-obvious ways, making maintenance difficult and risky.

**Answer 2**
A robust strategy is to implement an **automated data validation and schema enforcement stage** early in the ML pipeline.

**Component:** A "Data Validator" component or service.

**Pipeline Placement:** This stage should run immediately after data ingestion and before feature engineering.
`Data Ingestion -> Data Validator -> Feature Engineering -> Model Training/Inference`

**Reasoning:**
1.  **Schema Enforcement:** The validator would check the incoming data against a predefined schema. This schema would define expected data types (e.g., `user_text` is a string), column names, and value ranges.
2.  **Data Distribution and Property Checks:** More importantly, it would run statistical checks on the data properties. For this specific problem, it would check the distribution of characters or tokens in the text field. A sudden, massive spike in the frequency of the string `"[emoji]"` and a corresponding drop in actual emoji characters (e.g., `U+1F600`) would be flagged as a distributional anomaly.
3.  **Action:** If the validation fails (i.e., the data does not conform to the expected schema or its statistical properties have drifted significantly), the validator would halt the pipeline and trigger an alert. This prevents the "bad" data from ever reaching the model, thus preventing the performance drop and immediately notifying the team that the upstream API contract has been violated.

**Answer 3**
Choosing Model B (the complex CNN) could introduce technical debt that manifests in the following ways:

1.  **Increased Debugging and Maintenance Costs:** When the model makes an incorrect prediction on a critical defect, the team will be asked "Why?". With the opaque CNN (Model B), it's extremely difficult to debug the failure. The team would need to use complex XAI techniques like Grad-CAM, which are computationally intensive and may not give a clear answer. With Model A, they could directly inspect the feature values and the Random Forest's decision paths. This opaqueness means bug-fixing cycles are longer and require more specialized expertise, increasing the long-term cost of ownership.
2.  **Reproducibility and Dependency Debt:** The complex CNN likely depends on specific versions of deep learning libraries (e.g., TensorFlow, PyTorch), CUDA drivers, and GPU hardware. A year later, trying to retrain the model on new infrastructure can become a nightmare of broken dependencies. This "reproducibility debt" makes it difficult to reliably update the model or even verify past results, hindering continuous improvement and creating a fragile system that is locked into its original environment. Model A, with fewer and more stable dependencies, would be far more robust to environmental changes.

**Answer 4**
The three types of technical debt are:

1.  **Symptom:** Takes over a month to update feature logic due to downstream dependencies.
    **Debt Type:** **Pipeline Jungle / Code-Data Entanglement.** The description implies that the feature engineering code is not modular. It's likely a complex, monolithic script where changes have unpredictable ripple effects. This tight coupling between different logical parts of the pipeline and the code's assumptions about the data makes it brittle and slow to change.
2.  **Symptom:** No one can reproduce the original training run.
    **Debt Type:** **Reproducibility Debt.** This is a classic ML-specific debt. It stems from a failure to version control not just the code, but also the training data, the environment configuration (library versions), and the model hyperparameters used for that specific run. Without this, the model becomes an unreproducible artifact, making it impossible to debug, audit, or reliably build upon.
3.  **Symptom:** Unclear if performance degradation is due to concept drift or bugs.
    **Debt Type:** **Monitoring and Validation Debt.** A healthy ML system includes robust monitoring to track both data distributions and model performance over time. The team's inability to distinguish between concept drift (a change in the world) and bugs (a change in the system) indicates a lack of automated data validation to detect data drift and a lack of systematic model performance logging against a known test set to detect regressions.

**Answer 5**
Two valuable stages to add would be:

1.  **Stage: Data Validation**
    -   **Placement:** After `Code Commit`, running in parallel with `Unit Tests`, or as the first step after checking out the code in the pipeline.
    -   **What it does:** This stage runs a script that fetches a sample of the latest production data and validates it against a stored data schema and statistical properties (e.g., using a library like `Great Expectations` or `TFDV`). It would check for correct data types, null value percentages, and distributional drift in key features compared to the training data.
    -   **Debt Prevented:** **Data Debt.** This proactively catches issues like upstream schema changes, data corruption, or significant data drift before a new model is even trained. It prevents the pipeline from creating a new model based on bad data, which would otherwise lead to silent performance degradation in production.

2.  **Stage: Model Evaluation & Validation**
    -   **Placement:** After a new model is trained (a stage that also needs to be added) and before deployment to staging.
    -   **What it does:** This stage automatically evaluates the newly trained model against a holdout test set. It would compare key metrics (e.g., RMSE for LTV) against the currently deployed production model's performance on the same test set. The pipeline would fail if the new model shows a significant performance regression. It could also evaluate performance on critical data slices (e.g., for high-value customers).
    -   **Debt Prevented:** **Model Debt.** This acts as a quality gate, preventing the deployment of poorly performing models. It automates regression testing for models, ensuring that code changes or new data haven't inadvertently created a worse model. It prevents the accumulation of underperforming "black box" models in production.

**Answer 6**
This plan uses XAI to inform the technical debt decision, de-risking the move to a simpler model.

**Plan:**

1.  **Quantify the Debt (Analysis):** First, formally acknowledge and quantify the technical debt of the complex model. Estimate the engineering hours spent per quarter on its maintenance, debugging strange predictions, and managing its brittle dependencies. This provides the business case for making a change.

2.  **Global Performance Parity Check (Hypothesis Validation):** Confirm the A/B test result by re-evaluating both the complex model and the new simple model on a fresh, held-out dataset. Ensure the overall performance difference is indeed minimal ( < 0.5% AUC). This confirms the premise of the change.

3.  **Segment-Level Analysis with XAI (De-risking):** This is the crucial step. The product manager's concern is about high-value segments.
    *   **Identify Key Drivers:** Use a global XAI technique like **SHAP** on the *complex model* to identify the top 5-10 features that are most influential for its predictions, especially for the high-value customer segment.
    *   **Compare Feature Importance:** Generate the feature importance/coefficients for the *simple logistic regression model*. Compare this to the SHAP values from the complex model. Do they agree on what features are important? If the simple model is ignoring a key feature that the complex one relies on for high-value customers, that's a major red flag.
    *   **Local Explanations (Error Analysis):** Find specific instances of high-value customers where the two models disagree. Use a local XAI technique like **LIME or individual SHAP plots** to explain *why* each model made its prediction for these specific customers. This might reveal that the complex model learned a subtle but important interaction that the simpler model missed.

4.  **Decision and Rollout Strategy:**
    *   **Scenario A (Go):** If XAI analysis shows that both models rely on similar features for high-value segments and the disagreements are minor, the risk is low. Proceed with replacing the complex model. The benefit of paying down the massive technical debt outweighs the negligible performance difference.
    *   **Scenario B (No-Go / Hybrid):** If XAI reveals the complex model has learned a critical, non-linear pattern for high-value customers that the simple model misses, a full replacement is too risky. The recommendation would be to either:
        *   Keep the complex model but allocate a dedicated "debt pay-down" sprint to refactor and document it.
        *   Explore a hybrid approach: use the simple model for the general population and route only high-value segment predictions to the old, complex model. This contains the problem while still reducing overall system complexity.

This approach uses XAI not just for transparency, but as a core tool for strategic decision-making, allowing the team to make an informed trade-off between model performance and long-term system health.