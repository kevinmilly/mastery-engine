## Exercises

**Exercise 1**
A machine learning engineer trains a decision tree classifier to predict customer churn. After training, they report the following performance metrics:
- Training Set Accuracy: 99.2%
- Validation Set Accuracy: 81.5%

Based on these two metrics, what is the most likely problem with the model? Explain your reasoning by describing the relationship between the two metrics.

**Exercise 2**
The plot below shows the Root Mean Squared Error (RMSE) for a regression model, plotted against the number of training examples used. The blue line represents the error on the training data, and the orange line represents the error on the validation data.

![A learning curve plot where the training error (blue) starts high and decreases to a very low value. The validation error (orange) starts very high, decreases, but then plateaus at a level significantly higher than the final training error, leaving a noticeable gap between the two lines.](https://i.imgur.com/wVv3E0p.png)

Does this learning curve indicate that the model is primarily suffering from underfitting (high bias) or overfitting (high variance)? Justify your conclusion by interpreting the trend and the final gap between the two curves.

**Exercise 3**
A team is building a model to detect a rare manufacturing defect that occurs in only 0.5% of products. They achieve a training accuracy of 99.6% and a validation accuracy of 99.5%. A junior engineer on the team declares victory, stating that the tiny gap between training and validation accuracy means there is no overfitting.

Why is this conclusion potentially dangerously misleading? Explain what underlying issue with the *dataset* could be masked by the high accuracy scores and suggest a more appropriate type of evaluation metric to use in this scenario.

**Exercise 4**
You are developing a model to predict house prices. You train the model on a dataset of house sales from 2010-2020. You create a validation set using a random 20% split of this data. Your evaluation results are:
- Training Set Mean Absolute Error (MAE): $25,000
- Validation Set MAE (from random split): $28,000

Satisfied, you deploy the model. However, when you test its performance on brand-new sales data from 2024, the MAE balloons to $95,000. Is the large performance drop on 2024 data a classic sign of overfitting as indicated by your initial validation? Or does it point to a different kind of generalization failure? Explain your reasoning.

**Exercise 5**
An engineer is using 5-fold cross-validation to evaluate a complex neural network. The goal is to get a robust estimate of the model's performance. The results for each fold are as follows:

- **Fold 1:** Training Accuracy: 98.1%, Validation Accuracy: 92.5%
- **Fold 2:** Training Accuracy: 98.3%, Validation Accuracy: 91.9%
- **Fold 3:** Training Accuracy: 97.9%, Validation Accuracy: 92.1%
- **Fold 4:** Training Accuracy: 98.5%, Validation Accuracy: 76.2%
- **Fold 5:** Training Accuracy: 98.2%, Validation Accuracy: 92.3%

The average validation accuracy is 89.0%. What two distinct problems regarding model performance and reliability are indicated by these results? How does the result from Fold 4 challenge the trustworthiness of using the simple average as the final performance metric?

**Exercise 6**
You are debugging a model and observe a classic overfitting symptom: the training loss steadily decreases epoch after epoch, while the validation loss decreases for a while and then begins to consistently increase. Your first instinct is to add more regularization to the model.

However, your colleague suggests investigating the data preprocessing pipeline first. Describe a specific flaw in a data preprocessing pipeline that could *cause* this exact pattern of training and validation loss. Explain the mechanism by which this flaw leads to the model appearing to overfit, even if the model architecture itself is appropriate.

---

## Answer Key

**Answer 1**
The model is suffering from **overfitting**.

**Reasoning:**
Overfitting occurs when a model learns the training data too well, including its noise and specific quirks, but fails to generalize to new, unseen data. The key indicator here is the large gap between the training set performance and the validation set performance. A training accuracy of 99.2% shows the model has memorized the training examples, while the significantly lower validation accuracy of 81.5% shows it cannot maintain that performance on data it hasn't seen before.

**Answer 2**
This learning curve indicates **overfitting** (high variance).

**Reasoning:**
1.  **Low Training Error:** The training error (blue line) decreases to a very low value, which means the model is capable of fitting the training data very well.
2.  **High Validation Error & Significant Gap:** The validation error (orange line) plateaus at a much higher level than the training error. This gap between the final training error and the final validation error is the hallmark of overfitting. It visually represents the model's failure to generalize what it learned from the training set.

If the model were underfitting, both the training and validation error curves would have converged and plateaued at a high error level, with little to no gap between them.

**Answer 3**
The conclusion is misleading because accuracy is a poor metric for highly **imbalanced datasets**.

**Reasoning:**
In this scenario, the "defect" class is the positive class (0.5%) and the "no defect" class is the negative class (99.5%). A trivial model that always predicts "no defect" would achieve 99.5% accuracy without learning anything meaningful. The team's model, with 99.5% validation accuracy, might be doing exactly this. The small gap between training and validation accuracy is irrelevant if the metric itself doesn't measure the model's ability to identify the rare, important class.

**Suggested Metric:**
Metrics like **Precision, Recall, or F1-score** for the positive (defect) class would be far more appropriate. These metrics evaluate how well the model identifies the rare defect cases, providing a true picture of its performance and whether it's genuinely generalizing or simply ignoring the minority class.

**Answer 4**
This points to a different kind of generalization failure, likely caused by **data drift** or **concept drift**, not classic overfitting.

**Reasoning:**
Classic overfitting is identified by a performance gap between the training set and a statistically similar validation set. Here, the validation set (a random split from 2010-2020) is very similar to the training set, and the performance is also very similar (MAE of $25k vs. $28k). This indicates the model *did* generalize well to unseen data *from the same time period*.

The massive performance drop on 2024 data suggests that the underlying data distribution has changed. Factors like inflation, changes in architectural trends, or new neighborhood developments have altered the relationship between features and house prices. The model, trained on historical data, cannot generalize to this new, future distribution. This is a problem of the training data no longer being representative of the deployment environment.

**Answer 5**
The results indicate two problems: **1) Overfitting** and **2) High Instability/Variance in performance.**

**Reasoning:**
1.  **Overfitting:** In every fold, there is a significant gap (around 6-7 percentage points, except for fold 4) between the high training accuracy (~98%) and the lower validation accuracy (~92%). This consistent gap across multiple data splits is strong evidence that the model is overfitting the training data.

2.  **High Instability:** The validation accuracy for Fold 4 (76.2%) is a severe outlier compared to the other folds (~92%). This indicates the model's performance is highly sensitive to the specific subset of data it is trained on. The poor performance on Fold 4 could mean that this specific 20% of the data contains patterns or examples that the overfit model is completely unable to handle. Relying on the simple average (89.0%) would hide this instability and give a false sense of the model's expected worst-case performance. The result from Fold 4 suggests the model is not reliable.

**Answer 6**
A specific flaw is **data leakage** during preprocessing, for example, fitting a scaler on the entire dataset before splitting it.

**Mechanism:**
Suppose you use a `StandardScaler` (which centers data by subtracting the mean and scaling by the standard deviation).
1.  **The Mistake:** You compute the mean and standard deviation from the *entire dataset* (training + validation) and then use these statistics to transform both sets.
2.  **The Consequence (Data Leakage):** By doing this, information about the validation set's distribution (its mean and standard deviation) has "leaked" into the training process. The training set is now scaled using knowledge of the data it is supposed to be blind to.
3.  **Apparent Overfitting:** The model learns to perform exceptionally well on the training data, which has been preprocessed using global information. During validation, the validation loss initially decreases because the model is still learning the general patterns. However, as training progresses, the model begins to exploit the subtle statistical information that leaked from the validation set. It fine-tunes its parameters based on this leaked knowledge, which doesn't generalize to the true, underlying patterns. This causes the validation loss to increase, as the model becomes "brittle" and over-specialized to the contaminated training data, even though the model architecture itself might be fine.