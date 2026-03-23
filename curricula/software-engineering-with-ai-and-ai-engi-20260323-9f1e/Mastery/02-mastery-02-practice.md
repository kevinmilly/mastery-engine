## Exercises

**Exercise 1**
A simple logistic regression model predicts whether a user will click on an ad (`click` = 1, `no_click` = 0) based on two features: `time_on_page` (in seconds) and `ad_position` (1-5). The model's accuracy on a small validation set is 90%.

You decide to calculate the permutation importance of the `time_on_page` feature. You shuffle only the values in the `time_on_page` column of the validation set and re-evaluate the model. The new accuracy is 65%.

Calculate the permutation importance for `time_on_page` based on these results. Show your calculation.

**Exercise 2**
A team has trained a deep learning model to classify images of skin lesions as either "benign" or "malignant". They want to use LIME to explain to a dermatologist why a specific image was classified as "malignant".

Describe the sequence of steps LIME would take to generate this local explanation. You do not need to include mathematical formulas, but you must describe the process conceptually.

**Exercise 3**
A financial services company uses a complex XGBoost model to predict credit default risk. The internal audit team has two distinct requests for the AI engineering team:

1.  They need a report that summarizes the overall impact of features like `income_level`, `credit_history`, and `debt_to_income_ratio` on the model's predictions across all customers. They want to understand the model's general logic.
2.  A specific customer, Ms. Jane Doe, has filed a complaint after being denied a loan. The audit team needs a detailed breakdown showing how each of Ms. Doe's specific financial details contributed to her high-risk score.

Which explainability technique, SHAP or LIME, is better suited for each request? Justify your choices.

**Exercise 4**
You are working on a machine learning model to predict the energy consumption of a commercial building. Your model includes several features, two of which are `outside_air_temperature` and `hvac_power_draw`. These two features are very highly correlated because the HVAC system works harder on hotter days.

When you calculate permutation importance for all features, you are surprised to see that both `outside_air_temperature` and `hvac_power_draw` have relatively low importance scores, even though you know they are critical for the prediction.

Explain this counter-intuitive result. What specific limitation of permutation importance does this scenario highlight?

**Exercise 5**
Your company is deploying a large language model (LLM) for real-time customer support chat. To ensure quality and allow for agent review, the system must generate an explanation for every generated response, highlighting the key tokens from the input prompt that influenced the final output. The system must handle over 1,000 concurrent chats, so the explanation generation must be extremely fast (sub-second latency).

You are considering two approaches: a full, game-theoretically sound explanation using a SHAP-based method (like KernelSHAP) or a faster, local approximation using LIME.

Drawing on your knowledge of designing for scalability, analyze the trade-offs between these two XAI techniques for this specific use case. Which would you recommend, and what is the primary engineering challenge your choice presents?

**Exercise 6**
A ride-sharing company deploys a new surge pricing model. After a week, drivers in a suburban area complain that the model consistently gives them lower surge multipliers than drivers in the downtown core, even for trips of similar length and demand. The model is a complex ensemble of deep neural networks and gradient-boosted trees, making it a "black box."

As the lead AI engineer, you are tasked with investigating this potential geographic bias. Propose a two-step diagnostic plan using two different explainability techniques (from LIME, SHAP, and permutation importance). For each step, state which technique you would use, what you would do with it, and what you expect to learn.

---

## Answer Key

**Answer 1**
The formula for permutation importance is: `Importance = Baseline Metric - Permuted Metric`.

-   **Baseline Metric (Original Accuracy):** 90% or 0.90
-   **Permuted Metric (Accuracy after shuffling `time_on_page`):** 65% or 0.65

**Calculation:**
`Importance = 0.90 - 0.65 = 0.25`

The permutation importance for the `time_on_page` feature is **0.25**. This indicates that shuffling this feature caused a 25-percentage-point drop in model accuracy, making it a very important feature.

**Answer 2**
LIME would take the following conceptual steps to explain the "malignant" classification for the specific image:

1.  **Generate a Neighborhood:** LIME creates a new dataset of "neighboring" images by perturbing the original image. For an image, this means turning parts of it on or off (e.g., hiding or graying out superpixels, which are groups of similar pixels).
2.  **Get Predictions for the Neighborhood:** The complex deep learning model is used to predict the classification ("benign" or "malignant") for each of these new, slightly-modified images.
3.  **Weight the Samples:** The perturbed images are weighted based on their proximity to the original image. Samples that are more similar to the original are given a higher weight.
4.  **Train a Simple, Interpretable Model:** LIME then fits a simple, interpretable model (like a linear model) to this new dataset. The model learns to map the presence/absence of the superpixels (the features) to the black-box model's predictions.
5.  **Extract the Explanation:** The explanation is derived from the simple model. For this image, the explanation would be the set of superpixels that the simple model found to have the most positive weight towards the "malignant" class. These superpixels are then highlighted on the original image for the dermatologist to see.

**Answer 3**
1.  **For the overall impact report (global explanation), SHAP is the better choice.**
    *   **Reasoning:** SHAP (SHapley Additive exPlanations) values are designed to provide consistent and locally accurate feature attributions. Crucially, SHAP values for individual predictions can be aggregated to create robust global explanations. A SHAP summary plot, for instance, could show the distribution of impacts for each feature across the entire customer base, perfectly fulfilling the audit team's request for understanding the model's general logic. LIME is designed for local explanations only and does not provide these global consistency guarantees.

2.  **For Ms. Doe's specific case (local explanation), either SHAP or LIME could work, but SHAP is generally preferred.**
    *   **Reasoning:** Both techniques provide local explanations. However, SHAP has a stronger theoretical foundation in cooperative game theory, ensuring that the sum of the feature contributions equals the final prediction score (minus the base value). This property, called "additivity," makes the explanation complete and highly defensible for an audit. A SHAP force plot for Ms. Doe's application would clearly show which features "pushed" her risk score up and which "pulled" it down, and by how much. While LIME would also provide a local explanation, its approximation is less theoretically grounded and lacks the additivity property.

**Answer 4**
The counter-intuitive result is due to **multicollinearity**, which is a key limitation of permutation importance.

*   **Explanation:** `outside_air_temperature` and `hvac_power_draw` contain very similar information. When you shuffle just one of them, say `outside_air_temperature`, the model can still get most of the information it needs from the other unshuffled, correlated feature (`hvac_power_draw`). Therefore, the model's performance doesn't drop much, leading to a low importance score for `outside_air_temperature`. The same thing happens in reverse when you shuffle `hvac_power_draw`. The model is resilient to the permutation of one feature because its correlated partner provides a redundant signal.
*   **Limitation Highlighted:** This shows that permutation importance measures how much the model *relies* on a feature in its current state, not the feature's intrinsic predictive power. When features are redundant, the model can spread its reliance across them, causing permutation importance to under-report the true importance of the entire group of correlated features.

**Answer 5**
This is a classic trade-off between explainability rigor and system performance/scalability.

*   **Analysis of Trade-offs:**
    *   **SHAP (KernelSHAP):**
        *   **Pro:** Provides game-theoretically sound, consistent, and additive explanations. The results are highly reliable.
        *   **Con (Major Scalability Issue):** KernelSHAP is computationally very expensive. It needs to sample the input space and run the model many times for *each explanation*. In a system with 1,000+ concurrent chats requiring real-time explanations, this computational overhead would introduce unacceptable latency and require a massive, costly compute infrastructure.
    *   **LIME:**
        *   **Pro:** LIME is generally much faster than KernelSHAP. It creates a local neighborhood and fits a simple model, which is a less computationally intensive process. This makes it far more suitable for low-latency, high-throughput applications.
        *   **Con:** The explanations are approximations and lack the theoretical guarantees of SHAP. The definition of the "neighborhood" can be unstable, leading to potentially inconsistent explanations for very similar inputs.

*   **Recommendation:**
    For this use case, **LIME is the recommended approach.** The hard constraint of sub-second latency in a highly concurrent system makes the computational cost of KernelSHAP prohibitive. The business requirement for speed outweighs the need for perfect theoretical rigor in the explanations.

*   **Primary Engineering Challenge:**
    The main challenge with choosing LIME would be **ensuring the stability and reliability of the explanations.** The team would need to invest significant engineering effort in:
    1.  **Tuning LIME's parameters:** Carefully selecting the perturbation method and neighborhood size to get meaningful and consistent results for text data.
    2.  **Implementing robust monitoring:** Tracking the quality and stability of the explanations over time to catch cases where LIME produces nonsensical or highly variable results.
    3.  **Building fail-safes:** Creating a fallback mechanism in case the LIME explainer fails or times out, ensuring the user-facing system is not impacted.

**Answer 6**
Here is a two-step diagnostic plan to investigate the potential geographic bias:

**Step 1: Global Analysis with SHAP to Confirm and Characterize the Bias**

*   **Technique:** SHAP
*   **Action:**
    1.  Run the model on a large, representative dataset of recent trips, ensuring it includes data from both the suburban and downtown areas.
    2.  Calculate SHAP values for every prediction.
    3.  Generate a SHAP summary plot that segments the data by geographic area (e.g., `is_suburban` vs. `is_downtown`). We would specifically look at the SHAP values for features like `pickup_latitude`, `pickup_longitude`, or `zone_id`.
*   **Expected Learning:** This will provide a global, statistically robust view. We can definitively see if features related to the suburban area systematically receive negative SHAP values (pushing the surge multiplier down) compared to downtown features. This moves beyond anecdotal complaints to data-driven evidence of a systemic bias in the model's logic. It answers the question: "Does the model *consistently* treat suburban locations differently?"

**Step 2: Local Analysis with LIME (or SHAP) to Understand a Specific Instance of Bias**

*   **Technique:** LIME (or a single SHAP force plot)
*   **Action:**
    1.  Identify a pair of "matched" trips: one suburban and one downtown trip that are otherwise very similar (similar time of day, trip duration, initial demand signals). The suburban trip should have a surprisingly low surge multiplier.
    2.  Generate a LIME explanation for both predictions. The explanation should highlight which features contributed most to the final surge price calculation.
*   **Expected Learning:** This provides a concrete, interpretable example of the bias in action. For the suburban trip, LIME might show that a feature like `zone_id = 'suburb_3'` had a strong negative contribution, while for the downtown trip, `zone_id = 'downtown_1'` had a strong positive one, even when other factors were equal. This granular, instance-level explanation is crucial for debugging. It helps pinpoint the specific feature interactions or model artifacts causing the unwanted behavior, answering the question: "In this specific case, *why* did the model penalize the suburban trip?" This can guide the team toward a solution, such as retraining the model with more balanced data or adding fairness constraints.