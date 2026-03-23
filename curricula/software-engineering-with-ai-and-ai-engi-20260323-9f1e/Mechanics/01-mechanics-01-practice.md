## Exercises

**Exercise 1**
You are given a small dataset of customer information to be used in a model that predicts purchase frequency.

| customer_id | sign_up_date | city | age |
| :--- | :--- | :--- | :--- |
| 101 | 2022-03-15 | "New York" | 34 |
| 102 | 2021-11-20 | "chicago" | |
| 103 | 2023-01-05 | "Los Angeles"| 28 |
| 104 | 2022-08-10 | "New York" | 45 |

Identify two distinct preprocessing steps that are necessary for the `city` and `age` columns before this data can be used by a typical machine learning algorithm. For each step, state which column it applies to and why it is needed.

**Exercise 2**
A data scientist proposes a preprocessing pipeline for a dataset containing a `user_income` feature. The two key steps are:
1.  **Normalization:** Scale the `user_income` values to be between 0 and 1.
2.  **Imputation:** Fill any missing `user_income` values with the median income of the entire dataset.

Explain the problem with performing step (1) Normalization *before* step (2) Imputation. How would the result of the imputation be flawed?

**Exercise 3**
Your team is building a model to predict delivery times for a food delivery service. The raw data is ingested from the mobile app's tracking system. One of the features is `preparation_time_seconds`. The data validation step in your pipeline checks if this value is a positive number.

The pipeline encounters the following anomalous values for this feature: `-10`, `NULL`, and `90000`. For each of these three values, classify the likely type of data quality error (e.g., data entry error, system bug, etc.) and propose a specific handling strategy that the pipeline could implement.

**Exercise 4**
A pipeline is designed to ingest user event data from two different sources for a recommendation engine:
*   **Source A (Web App):** Provides a JSON object with a `timestamp` field in ISO 8601 format (e.g., `2023-10-27T10:00:00Z`).
*   **Source B (Mobile App):** Provides a JSON object with a `created_at` field in Unix epoch format (e.g., `1698397200`).

Both fields represent the same information. Describe the transformation steps required in the preprocessing pipeline to create a single, unified `event_timestamp` feature that a model can use effectively. Justify the need for these steps.

**Exercise 5**
You are developing a churn prediction model for a telecom company. You have a `customer_tenure_months` feature and a `plan_type` feature (values: 'Basic', 'Premium', 'Family'). Your goal is to create a new, engineered feature called `plan_adjusted_tenure`.

You hypothesize that tenure on a 'Premium' plan is more indicative of loyalty than tenure on a 'Basic' plan. Propose a specific formula or rule-based logic to create the `plan_adjusted_tenure` feature. Describe how this transformation combines the two original features and what assumption you are making about the relative value of each plan type.

**Exercise 6**
A machine learning pipeline for a real estate pricing model has been running successfully for a year. It ingests property data, cleans it, and transforms features like `square_footage` and `num_bedrooms`. Recently, the model's predictive accuracy has started to degrade significantly.

An investigation reveals that the distribution of `square_footage` in newly listed properties has shifted; a new luxury condo development has added many properties with much larger-than-average square footage. The original pipeline uses min-max normalization to scale this feature. Explain why this "data drift" would cause problems for the existing pipeline and the model. Suggest a change to the preprocessing pipeline to make it more robust to this kind of future shift.

---

## Answer Key

**Answer 1**
1.  **Column:** `age`.
    **Step:** Missing Value Imputation.
    **Reasoning:** The record for `customer_id` 102 has a missing `age`. Most machine learning models cannot handle missing data and will fail. The pipeline must fill this value, for example, by using the mean (39) or median (34) age of the other customers.

2.  **Column:** `city`.
    **Step:** Normalization/Categorical Unification.
    **Reasoning:** The `city` column is a categorical feature, but the same city is represented with different capitalization ("New York" vs. "chicago"). A model would treat these as two distinct categories. The pipeline should standardize these values, for instance, by converting all city names to a consistent format like lowercase ('new york', 'chicago', 'los angeles').

**Answer 2**
**Problem:** Performing normalization before imputation will corrupt the imputed value.
**Reasoning:**
1.  The normalization step scales all existing `user_income` values to a range between 0 and 1 based on the current minimum and maximum values in the dataset.
2.  The imputation step then calculates the median of this *new, scaled data*. The median will therefore be a value between 0 and 1 (e.g., 0.45).
3.  When this median (0.45) is used to fill the missing value, it is being inserted into a column that is supposed to represent scaled income. The original, true income that this 0.45 represents is lost. The imputed value does not reflect the actual median income of the original distribution.

The correct order is to first impute the missing values using the median of the *original* `user_income` data, and then normalize the entire column (including the newly imputed values).

**Answer 3**
1.  **Value:** `-10`
    *   **Likely Error:** Logic error or bug in the source system (time cannot be negative).
    *   **Handling Strategy:** Quarantine the record for manual review and flag it as an error. Alternatively, the pipeline could automatically transform the value to its absolute value (10) if it's a known, recurring data entry issue, but this is risky without confirmation.

2.  **Value:** `NULL`
    *   **Likely Error:** Missing data. This could be due to a system failure during data transmission or because the value was never recorded.
    *   **Handling Strategy:** Impute the value. A good strategy would be to fill it with the mean or median `preparation_time_seconds` from the rest of the batch or from historical data.

3.  **Value:** `90000` (which is 25 hours)
    *   **Likely Error:** Unit error or extreme outlier. The value might have been recorded in milliseconds instead of seconds, or it could be a genuine but highly improbable outlier (e.g., an order that was paused for a day).
    *   **Handling Strategy:** Flag the record as a potential outlier. The pipeline could cap the value at a reasonable maximum (e.g., the 99th percentile of historical prep times) or remove the record from the training set to avoid skewing the model.

**Answer 4**
**Required Steps:**
1.  **Ingestion & Parsing:** Ingest the JSON data from both sources. For Source A, parse the ISO 8601 string. For Source B, read the Unix epoch integer.
2.  **Standardization/Unification:** Convert both timestamp formats to a single, consistent standard. The most common and robust choice is to convert both to a UTC-aware datetime object or a Unix timestamp (seconds since epoch). For example, the ISO string `2023-10-27T10:00:00Z` would be converted to the Unix timestamp `1698397200`.
3.  **Feature Creation:** Store the standardized value in a new, single column named `event_timestamp`.

**Justification:**
Machine learning models require features to be in a consistent, numerical format. By having two different formats (`timestamp` string and `created_at` integer) for the same piece of information, the model cannot make a meaningful comparison or learn a pattern. The standardization step ensures that the time of an event from the web app is directly comparable to the time of an event from the mobile app, creating a valid, unified feature for the model.

**Answer 5**
**Proposed Formula:**
Create a mapping of `plan_type` to a weight: `{'Basic': 1.0, 'Premium': 1.5, 'Family': 1.2}`.
The formula for `plan_adjusted_tenure` would be:
`plan_adjusted_tenure = customer_tenure_months * plan_weight`

**Description of Transformation:**
This transformation creates a new feature by multiplying the customer's raw tenure in months by a predefined weight corresponding to their subscription plan. For example, a 'Premium' customer with 10 months of tenure would have an adjusted tenure of `10 * 1.5 = 15`. A 'Basic' customer with 10 months of tenure would have an adjusted tenure of `10 * 1.0 = 10`.

**Assumption:**
The core assumption is that a month of tenure is not equally valuable across all plans. Specifically, this logic assumes that a month as a 'Premium' customer is 1.5 times more indicative of loyalty/less likely to churn than a month as a 'Basic' customer, and a 'Family' plan member is 1.2 times more valuable. These weights are hypotheses that would need to be validated by the model's performance.

**Answer 6**
**Problem Explanation:**
Min-max normalization scales features to a fixed range (usually 0 to 1) using the formula: `(x - min) / (max - min)`. The `min` and `max` values are calculated from the *training data* the pipeline originally saw. When the new data with much larger `square_footage` arrives, its values are likely to be far greater than the original `max`. When plugged into the formula, this will result in normalized values greater than 1. This violates the assumption of the model, which was trained on data scaled strictly between 0 and 1, and can lead to poor predictions. This is a classic problem where the preprocessing statistics become "stale."

**Suggested Change:**
Switch from min-max normalization to **Standardization (or Z-score normalization)**. Standardization rescales data based on the formula: `(x - mean) / standard_deviation`.

**Reasoning for Change:**
Standardization is more robust to outliers and data drift. Unlike min-max scaling, it does not enforce a strict 0-1 range. When a new, large value appears, it will be converted to a high Z-score (e.g., 3, 4, or 5), but it won't fundamentally break the scaling scheme in the way that exceeding the 'max' does. While the mean and standard deviation of the data might still shift over time (requiring the pipeline's statistics to be periodically re-calculated), the method itself is less brittle to unexpected new ranges in the incoming data.