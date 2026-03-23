## Exercises

**Exercise 1**
A data science team has developed a sentiment analysis model to classify customer support emails as "Urgent" or "Non-Urgent". They create a model card that includes only the model's architecture (DistilBERT), the training dataset size, and its performance metrics (94% accuracy, 0.92 F1-score). A senior engineer reviews this model card and deems it insufficient for internal governance and audit purposes. Identify two critical categories of information missing from this model card and explain why their absence undermines the goal of traceability.

**Exercise 2**
An AI-powered system for approving business loans denies an application from a small business owner. The owner files a formal complaint, alleging that the model is biased against businesses in her specific industry. Your audit team must investigate this claim. To reconstruct the decision for this specific denial, what four essential pieces of information would you need to pull from the system's audit trail? Be specific about what each piece of information represents.

**Exercise 3**
A startup is building an AI tool to help recruiters screen candidates by analyzing their video interviews for "professionalism" and "cultural fit". To accelerate their product launch, they propose a streamlined ethics review process: the lead data scientist will run a set of fairness tests and personally "self-certify" that the model is unbiased before deployment. Analyze the primary governance risk of this "self-certification" approach. How would a formal, multi-stakeholder ethical review process specifically mitigate this risk?

**Exercise 4**
An online retail company uses a multi-stage ML pipeline for its "You might also like" feature:
1.  A model generates user embeddings based on browsing history.
2.  These embeddings are written to a central feature store.
3.  A recommendation model retrieves data from the feature store to generate candidate products.
4.  A final ranking model sorts these candidates for display.

A new version of the initial user embedding model (Stage 1) is deployed. Two weeks later, the analytics team reports a significant drop in user engagement with recommendations for the "Outdoor Gear" category. How would a well-implemented governance framework with robust data and model lineage tracking help diagnose the root cause of this issue? Describe the specific chain of connections an engineer would need to trace.

**Exercise 5**
You are the MLOps lead for a FinTech company deploying a model that predicts credit card fraud. You must integrate responsible AI governance directly into your automated CI/CD for ML pipeline. Propose two distinct automated checks to add to the pipeline that function as governance controls. For each check, specify (a) where in the pipeline it would run (e.g., on code commit, during integration testing, pre-deployment) and (b) which prior AI engineering concept (e.g., Model Explainability/XAI, Adversarial Defenses) it leverages.

**Exercise 6**
A consortium of hospitals uses Federated Learning to train a cancer detection model on distributed medical images, preserving patient privacy. To meet a tight deadline, Hospital A's team uses a slightly different image normalization technique than the others, logging it as technical debt to be standardized later. The federated training process completes, and the model reports a high aggregate accuracy of 98%. However, after a quiet canary release, the model is found to have a dangerously high false-negative rate specifically for images originating from Hospital A. From a responsible AI governance perspective, what was the primary process failure? How could a governance framework, designed *before* the project began, have prevented this technical debt from becoming a patient safety risk?

---

## Answer Key

**Answer 1**
The model card is insufficient because it lacks context about the model's intended use and limitations, which is critical for traceability.

Two missing categories and their impact on traceability are:

1.  **Training Data Details & Biases:** The card should describe the source, demographics, and preprocessing of the training data. For example, were the support emails primarily from one region or one customer segment?
    *   **Traceability Impact:** Without this, an auditor cannot trace a biased outcome (e.g., misclassifying emails written in a specific dialect) back to its source in the training data. It's impossible to know if the model's "reality" matches the production environment.

2.  **Intended Use & Out-of-Scope Use Cases:** The card must explicitly state what the model is designed for (e.g., "prioritizing new support tickets for human review") and what it is *not* for (e.g., "automatically sending replies or closing tickets without human oversight").
    *   **Traceability Impact:** If the model is later used for an out-of-scope purpose and fails, this documentation provides a clear audit point. It allows governance teams to trace the failure not to a model flaw, but to a violation of its intended operational domain, holding the implementation team accountable.

**Answer 2**
To reconstruct the decision, the audit team would need the following four items from the audit trail:

1.  **Input Features:** The exact, versioned snapshot of the business data used for this specific prediction. This includes annual revenue, years in business, industry code, cash flow statements, etc. This is needed to see what the model "saw".
2.  **Model Version Identifier:** The unique ID or hash of the predictive model and all its components (e.g., pre-processing logic) that were used to score this application. This is crucial because a different model version might have produced a different outcome.
3.  **Raw Model Output (Score):** The raw numerical score or probability the model produced *before* it was converted into a binary "deny" decision. This helps determine if the decision was borderline or a clear denial according to the model's logic.
4.  **Explainability Output (e.g., SHAP values):** The output from the XAI tool that identifies which specific input features contributed most to the final decision. This is the most direct way to investigate the bias claim—for example, it would show if the "industry code" feature was the primary driver of the negative score.

**Answer 3**
The primary governance risk of the "self-certification" approach is **conflict of interest and lack of independent oversight.** The lead data scientist is incentivized by the product launch and may have inherent biases or blind spots regarding their own work. They are both the creator and the judge, which undermines the integrity of the review.

A formal, multi-stakeholder ethical review process mitigates this risk by introducing **diverse perspectives and accountability**:
*   **Diverse Stakeholders:** The board would include not just engineers, but also legal experts, ethicists, domain experts (in this case, HR professionals or sociologists), and potentially representatives from affected communities. They would question the very definition of "professionalism" or "cultural fit," concepts the data scientist might take for granted, and identify potential proxies for discrimination (e.g., analyzing speech patterns that correlate with race or socioeconomic background).
*   **Independence:** The review board is an independent body that is not directly tied to the product's launch timeline. Its function is to act as a check on the development team, providing an objective assessment of risks. This separation of duties is a core principle of good governance and ensures that ethical concerns are not sacrificed for speed.

**Answer 4**
A robust governance framework would establish clear data and model lineage, making this diagnosis systematic instead of a guessing game. Lineage tracking creates a traceable graph of dependencies.

The engineer would trace the problem backward as follows:

1.  **Start from the Business Impact:** The investigation begins with the "15% drop in engagement for Outdoor Gear".
2.  **Trace to the Display Model:** Using the lineage graph, the engineer checks which model is directly responsible for displaying recommendations: the ranking model (Stage 4). They can query logs to see if the ranking model stopped showing "Outdoor Gear" items for some reason. Let's assume it was; the items were no longer being passed to it.
3.  **Trace to the Recommendation Model:** The next step back in the lineage is the recommendation model (Stage 3). The engineer would query its historical inputs and outputs. They would find that, starting two weeks ago, the model stopped generating candidate products from the "Outdoor Gear" category for a large segment of users.
4.  **Trace to the Feature Store:** The engineer then inspects the inputs the recommendation model was receiving from the feature store (Stage 2). They would discover that the user embeddings for "outdoorsy" users had fundamentally changed.
5.  **Identify the Root Cause:** This leads directly back to the user embedding model (Stage 1). The lineage system would confirm that the new version was deployed exactly two weeks ago. The change in this model produced embeddings that no longer clustered "outdoorsy" users correctly, breaking the downstream logic.

Without this explicit lineage, engineers would have to manually investigate each component, a slow and error-prone process.

**Answer 5**
Here are two automated checks integrated into a CI/CD pipeline for governance:

1.  **Check: Adversarial Robustness Test**
    *   **(a) Where:** This check would run during the **integration testing stage**, after a model has been trained and packaged as an artifact but before it's a candidate for deployment.
    *   **(b) Concept Leveraged:** **Adversarial Defenses**. The pipeline would automatically run a suite of tests (e.g., using a library like ART or CleverHans) that generate subtle, malicious perturbations to a test set of known fraudulent transactions. The test fails the build if the model's accuracy drops below a predefined threshold (e.g., a 50% drop), preventing a non-robust model from ever being deployed. This enforces a governance policy that models must be resilient to basic attacks.

2.  **Check: Explainability Drift Detection**
    *   **(a) Where:** This check would run in the **pre-deployment (staging) environment**, just before a model is promoted to production.
    *   **(b) Concept Leveraged:** **Model Explainability (XAI)**. The pipeline would compare the new model candidate against the currently deployed model. It would use an XAI technique (like SHAP) to calculate the global feature importance for both models on a standardized validation dataset. The check would fail if the relative importance of the top 5 features has drastically changed (e.g., if "transaction time of day" suddenly becomes more important than "transaction amount"). This acts as a governance gate to prevent "silent failures" where a model is technically accurate but is working in a nonsensical or unstable new way that could indicate data drift or training errors.

**Answer 6**
The primary process failure was **conflating a data consistency issue with acceptable technical debt.** In a standard software project, a minor UI misalignment might be acceptable technical debt. In a federated learning system for healthcare, inconsistent data preprocessing across silos is a fundamental threat to model integrity and patient safety. It violates the core assumption of FL that participants are training on data with a shared feature space and distribution.

A governance framework designed *before* the project could have prevented this with two key components:

1.  **Federated Data and Preprocessing Agreement (FDPA):** This is a formal, upfront contract that all participating institutions must computationally verify and sign off on. It would go beyond a document; it would include a shared, version-controlled library or container image for all data preprocessing. The governance protocol would require that each hospital's local training job must run inside this exact container, ensuring byte-for-byte identical processing. Any deviation would cause the local training job to fail, preventing its corrupted model updates from ever being sent to the central aggregator.

2.  **Mandatory Per-Silo Model Evaluation:** The governance framework would mandate that before the final federated model is approved, it must be tested against a held-out, standardized test set from *each* participating hospital. The results, including accuracy, recall, and fairness metrics for each silo, would be reported to a central governance dashboard. In this scenario, the dashboard would have immediately flagged that the model's performance on Hospital A's test set was dangerously low. This would have triggered an automatic halt to the deployment process and an audit, revealing the preprocessing discrepancy before any patient was put at risk. This moves accountability from post-hoc monitoring to a required pre-deployment gate.