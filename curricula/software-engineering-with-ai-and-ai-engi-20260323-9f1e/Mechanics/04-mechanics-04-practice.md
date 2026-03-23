## Exercises

**Exercise 1**
A machine learning engineer is using Grid Search to tune a Random Forest classifier. They have defined the following hyperparameter grid:
- `n_estimators`: [50, 100, 200]
- `max_depth`: [10, 20, 30, None]
- `min_samples_split`: [2, 5, 10]
- `bootstrap`: [True, False]

To evaluate each combination, they are using 5-fold cross-validation. How many individual model trainings will be performed in total during this Grid Search? Show your calculation.

**Exercise 2**
Imagine you are tuning two hyperparameters for a model:
- Hyperparameter A: `learning_rate` (a continuous value between 0.001 and 0.1), which you suspect is very important.
- Hyperparameter B: `dropout_rate` (a continuous value between 0.1 and 0.5), which you suspect is less important.

Your computational budget allows for exactly 16 trials. If you use a 4x4 Grid Search, you will test 4 distinct values for `learning_rate` and 4 for `dropout_rate`. If you use Random Search for 16 trials, you will test 16 distinct values for each.

Which search strategy is more likely to find a better value for the more important hyperparameter, `learning_rate`? Justify your answer.

**Exercise 3**
You are tuning a complex deep learning model for image recognition. The model takes 6 hours to train for a single epoch, and you plan to train for 10 epochs. You have identified 7 hyperparameters to tune. You have a limited budget that allows for a maximum of 15 complete model trainings. Grid Search is clearly not feasible.

Between Random Search and Bayesian Optimization, which would you choose? Explain the primary advantage of your chosen method in this specific high-cost, low-budget scenario.

**Exercise 4**
An engineer is tuning the `C` (regularization strength) parameter for an SVM model. They hypothesize that the best value is somewhere between 0.1 and 100 and set up a Random Search to sample 50 values from a log-uniform distribution in this range. After the search, they plot the validation score against the value of `C` and find that the top 5 performing models all used a `C` value less than 0.5.

What does this result suggest about the initial search range, and what is the most logical next step to continue the tuning process?

**Exercise 5**
A team runs an extensive hyperparameter search for a model using 5-fold cross-validation. Their best-performing hyperparameter set achieves an average validation accuracy of 92%. They then retrain a single model on the *entire* training dataset using these "best" hyperparameters. When this final model is evaluated on the held-out test set (which was never used during tuning), the accuracy is only 81%.

Assuming the test set is representative of the problem, explain how a well-run hyperparameter search process can still lead to this significant performance drop. What specific type of overfitting has likely occurred?

**Exercise 6**
You are tasked with designing a hyperparameter tuning strategy for a new type of Gradient Boosting model. Training is moderately expensive. Based on a research paper, you know that the `learning_rate` is the most critical hyperparameter, but its optimal value is highly dependent on the `n_estimators` (number of boosting stages). A low `learning_rate` works best with a high `n_estimators`, and vice-versa. You have 4 other, less critical hyperparameters to tune as well.

Propose a two-stage tuning plan to efficiently find a good configuration. Describe which search strategy (or strategies) you would use in each stage and why this approach is well-suited to handle the known interaction between `learning_rate` and `n_estimators`.

---

## Answer Key

**Answer 1**
The total number of model trainings is the product of the number of hyperparameter combinations and the number of cross-validation folds.

1.  **Calculate the number of combinations:**
    - `n_estimators`: 3 options
    - `max_depth`: 4 options
    - `min_samples_split`: 3 options
    - `bootstrap`: 2 options
    - Total combinations = 3 * 4 * 3 * 2 = 72

2.  **Multiply by the number of CV folds:**
    - Each of the 72 combinations must be evaluated using 5-fold cross-validation.
    - Total trainings = 72 combinations * 5 folds = 360

**Method:**
Total Trainings = (Number of `n_estimators` options) × (Number of `max_depth` options) × (Number of `min_samples_split` options) × (Number of `bootstrap` options) × (Number of CV folds)
Total Trainings = 3 × 4 × 3 × 2 × 5 = 360

A total of 360 individual model trainings will be performed.

**Answer 2**
Random Search is more likely to find a better value for the important `learning_rate` hyperparameter.

**Reasoning:**
With a 4x4 Grid Search, you are locked into testing only 4 pre-defined values for `learning_rate`. Every trial for a given `learning_rate` value will be spent exploring different values of the less important `dropout_rate`.

With Random Search, each of the 16 trials will sample a *new, unique* value for `learning_rate` (and also for `dropout_rate`). This means you effectively get to explore 16 different `learning_rate` values instead of just 4. Because performance is most sensitive to `learning_rate`, exploring more distinct values of it gives you a higher probability of discovering a value that is closer to the true optimum.

**Answer 3**
Bayesian Optimization would be the recommended choice.

**Reasoning:**
The core constraint here is the extremely high cost per trial (60 hours per model) and the very small budget (15 trials).

-   **Random Search** would treat each trial as an independent experiment. It doesn't learn from previous results. With only 15 trials in a 7-dimensional space, it's highly likely to sample sub-optimal regions and may not find a good configuration.
-   **Bayesian Optimization** is designed for exactly this scenario. It builds a surrogate model of the objective function (e.g., validation accuracy vs. hyperparameters). After each trial, it uses the result to update its beliefs about which hyperparameter regions are most promising. It then intelligently chooses the next set of hyperparameters to try, balancing exploration (trying new areas) and exploitation (refining promising areas). This "informed" search is far more likely to find a good solution within a very small number of expensive trials.

**Answer 4**
The result suggests that the initial search range for `C` (0.1 to 100) was likely too broad and that the optimal value is located at the low end of this range. The search "wasted" many trials exploring values much larger than the optimal region (e.g., C > 0.5).

**Next Step:**
The most logical next step is to perform a new, more focused search in the promising region. For example, one could start a second Random Search or a Bayesian Optimization with a much narrower range, such as between 0.01 and 1.0. This allows the search to concentrate its budget on refining the parameter in the area that has already been shown to yield better results.

**Answer 5**
The most likely problem is **overfitting to the validation set**.

**Reasoning:**
The hyperparameter search process iteratively tries many different configurations, and the one that performs best on the validation folds is selected. When the search space is large or the search is very long, the process can inadvertently find a set of hyperparameters that are not just good at the general task, but are *exceptionally good* at modeling the specific quirks, noise, and data distribution of the validation sets.

The model hasn't "seen" the test set, but the hyperparameter *selection process* has effectively used the validation set as its sole benchmark for performance. The chosen hyperparameters are therefore "fit" to the validation data. When the final model is evaluated on the truly unseen test set, which has its own unique quirks, the performance drops because the model was implicitly optimized for a different data sample.

**Answer 6**
A suitable two-stage tuning plan would be:

**Stage 1: Broad Exploration with Bayesian Optimization or Random Search**
-   **Strategy:** Use Bayesian Optimization (preferred) or Random Search.
-   **Search Space:**
    -   Keep the `learning_rate` and `n_estimators` on a very wide range.
    -   Include the 4 other, less critical hyperparameters in the search.
-   **Goal:** The objective of this stage is not to find the perfect configuration, but to identify the most promising *regions* of the hyperparameter space and to understand the general impact of the less critical hyperparameters. Bayesian Optimization is ideal here as it will efficiently map out the high-performing areas even with a limited number of trials.

**Stage 2: Focused Grid Search on the Key Interacting Parameters**
-   **Strategy:** Use Grid Search.
-   **Search Space:**
    -   Based on the results from Stage 1, define a narrow grid around the best-performing values for `learning_rate` and `n_estimators`. For example, if Stage 1 suggested a learning rate around 0.05 and n_estimators around 500, the grid could be `learning_rate`: [0.03, 0.05, 0.07] and `n_estimators`: [400, 500, 600].
    -   For the other 4 hyperparameters, fix them to the best values found in Stage 1.
-   **Goal:** Grid Search is excellent for exhaustively exploring the interaction between a small number of parameters. Since we know `learning_rate` and `n_estimators` have a strong, dependent relationship, this focused grid will systematically test their combinations in the most promising region, allowing us to precisely nail down the best trade-off between them. This approach avoids the high cost of a full grid search while still allowing for a detailed exploration of the key parameter interaction.