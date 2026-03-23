## Exercises

**Exercise 1**
A data scientist is building a sentiment analysis model. They have a dataset of 25,000 customer reviews. They decide to use a standard 80/10/10 split for training, validation, and testing. Calculate the number of reviews in each set. What is the primary purpose of the test set, and why must it be kept separate until the very end of the development process?

**Exercise 2**
A team is using 10-fold cross-validation to tune a model on a dataset containing 5,000 data points (after the final test set has already been separated). For the first fold of this process, describe how the 5,000 data points are divided. How many times will the model be trained from scratch during the entire 10-fold cross-validation procedure?

**Exercise 3**
An engineer is building a model to predict user churn. Their workflow is as follows:
1. Load the entire dataset of 100,000 users.
2. Identify users with high engagement scores (top 5%) and create a new binary feature called `is_power_user`.
3. Split the data into an 80% training set and a 20% test set.
4. Train a model on the training set.
5. Evaluate on the test set.

The model performs exceptionally well on the test set, but fails to generalize in production. Identify the subtle but critical flaw in this workflow and explain how it violates the principles of dataset splitting.

**Exercise 4**
You are working with a dataset for credit card fraud detection. The dataset is highly imbalanced: 99.5% of transactions are non-fraudulent, and 0.5% are fraudulent. A colleague suggests using 5-fold cross-validation to evaluate a new model. They implement a standard k-fold split. What potential problem could arise during one or more of the validation folds with this approach? What specific variation of k-fold cross-validation should be used instead to guarantee a more reliable evaluation?

**Exercise 5**
Your team is faced with two projects, both requiring model evaluation:
- **Project A:** A high-stakes model for predicting equipment failure in a factory. An incorrect prediction could lead to costly shutdowns. The dataset is relatively small, with only 1,500 historical failure records.
- **Project B:** A low-stakes model to categorize customer support tickets to the correct department. An incorrect prediction is easily fixed by a human agent. The dataset is very large, with over 2 million labeled tickets.

Which project is a better candidate for using k-fold cross-validation instead of a simple train/validation split? Justify your choice by comparing the two projects on the basis of (1) the need for a robust performance estimate and (2) the computational cost.

**Exercise 6**
You are responsible for building an automated model retraining pipeline. The pipeline ingests raw user data, which includes features like `age`, `country`, and `last_login_date`. The preprocessing stage must handle missing `age` values by imputing the mean age, and convert the `country` feature into numerical dummy variables (one-hot encoding). The final model will be evaluated on a holdout test set.

Design the correct sequence of operations. Specifically, where in the sequence should the train/test split occur relative to the mean imputation for `age` and the one-hot encoding for `country`? Justify your ordering to prevent data leakage.

---

## Answer Key

**Answer 1**
**Calculations:**
- Training set: 80% of 25,000 = 20,000 reviews
- Validation set: 10% of 25,000 = 2,500 reviews
- Test set: 10% of 25,000 = 2,500 reviews

**Reasoning:**
The primary purpose of the test set is to provide a final, unbiased estimate of the chosen model's performance on unseen data. It simulates how the model will perform in the real world.

It must be kept separate until the end because any decision made based on the test set's performance (e.g., changing a hyperparameter, trying a different model architecture) effectively "leaks" information from the test set into the model development process. If the test set influences model design, it is no longer truly "unseen," and the final performance metric will be an overly optimistic and unreliable measure of generalization.

**Answer 2**
**Data Division for the First Fold:**
The 5,000 data points are first divided into 10 equal "folds" of 500 points each. In the first iteration, the model is trained on 9 of these folds (Folds 2 through 10) and validated on the remaining one (Fold 1).
- **Training data:** 9 folds * 500 points/fold = 4,500 data points.
- **Validation data:** 1 fold * 500 points/fold = 500 data points.

**Total Training Runs:**
The process of training on k-1 folds and validating on one fold is repeated 'k' times, with each fold getting a turn as the validation set. Therefore, the model will be trained from scratch **10 times** in total.

**Answer 3**
**Flaw:** The flaw is in step 2: creating the `is_power_user` feature using information from the *entire* dataset *before* splitting the data.

**Reasoning:**
This is a form of data leakage. The threshold for being a "power user" (the top 5%) is calculated using all 100,000 users. This means information about the users who will eventually be in the test set has been used to create a feature for the training set. The model is implicitly learning a global property of the dataset that it would not have access to in a real production scenario (where it must evaluate one user at a time). This leads to the model performing artificially well on the test set, as the test data was part of the calculation that defined one of its most predictive features. The model's true ability to generalize is therefore much lower than the evaluation suggests.

**Answer 4**
**Potential Problem:**
With a standard k-fold split on a highly imbalanced dataset, the random distribution of samples into folds might result in one or more validation folds containing very few, or even zero, instances of the minority class (fraudulent transactions). If a validation fold has no fraudulent cases, metrics like Precision and Recall become undefined or misleading for that fold, making the model evaluation unreliable and highly variable.

**Recommended Technique:**
**Stratified k-fold cross-validation** should be used. This technique modifies the splitting process to ensure that each fold has approximately the same percentage of samples of each target class as the complete dataset. For this fraud detection case, it would guarantee that every fold contains approximately 0.5% fraudulent transactions, leading to a much more stable and trustworthy performance estimate across all folds.

**Answer 5**
**Project A (Equipment Failure)** is the far better candidate for k-fold cross-validation.

**Justification:**
1.  **Need for a Robust Performance Estimate:** Project A is a high-stakes application where model error is costly. A simple train/validation split on a small dataset (1,500 records) is highly sensitive to which specific records end up in the validation set. A lucky split could make a poor model look good, and an unlucky one could discard a promising model. K-fold cross-validation mitigates this by training and evaluating on all the data, providing a more stable and reliable estimate of the model's true performance, which is critical when stakes are high.
2.  **Computational Cost:** Project A's small dataset means that training the model 5 or 10 times for cross-validation is computationally cheap and fast. In contrast, for Project B with 2 million records, training the model multiple times could be extremely time-consuming and expensive. Given that the stakes are low for Project B, a simple (and much faster) train/validation split is a reasonable and practical trade-off.

**Answer 6**
**Correct Sequence of Operations:**
1.  **Train/Test Split:** First, split the raw user data into a training set and a test set. All subsequent steps will be performed on these two sets independently.
2.  **Imputation and Encoding on Training Set:**
    a. Calculate the mean of the `age` column using **only the training data**. Impute the missing `age` values in the training set with this calculated mean.
    b. Fit the one-hot encoder on the `country` column using **only the training data**. Transform the training set's `country` column.
3.  **Imputation and Encoding on Test Set:**
    a. Impute the missing `age` values in the **test set** using the mean `age` that was **calculated from the training set**.
    b. Transform the **test set's** `country` column using the one-hot encoder that was **fitted on the training set**.
4.  **Train and Evaluate:** Train the model on the preprocessed training data and evaluate it on the preprocessed test data.

**Justification:**
This sequence prevents data leakage. The test set must simulate new, unseen data. In a real-world scenario, you wouldn't know the mean `age` or the complete list of possible `country` values from future data.
- By calculating the mean `age` *after* the split and using only training data, we ensure the model doesn't have "knowledge" of the test set's distribution. The same value (the *training* mean) is then used to fill missing values in the test data, simulating how you'd handle a new data point in production.
- Similarly, fitting the one-hot encoder only on the training data prevents the model from knowing about categories that might exclusively appear in the test set. This ensures the entire preprocessing pipeline is based solely on information available at training time.