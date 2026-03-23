## Exercises

**Exercise 1**
A model is trained to identify defective parts on an assembly line. Out of a batch of 200 parts, the model's performance is as follows:
- Correctly identified 40 defective parts (True Positives).
- Incorrectly identified 10 good parts as defective (False Positives).
- Correctly identified 145 good parts (True Negatives).
- Missed 5 defective parts, classifying them as good (False Negatives).

Calculate the model's accuracy, precision, and recall.

**Exercise 2**
You are building an email spam filter where the "positive" class is "spam." Between precision and recall, which metric is more important to prioritize for this system? Justify your answer by explaining the real-world consequence of a false positive versus a false negative in this context.

**Exercise 3**
An engineer proudly reports that their new fraud detection model achieves 99% accuracy. However, you know that fraudulent transactions make up only 1% of all transactions. Explain why accuracy is a misleading metric in this scenario. As a point of comparison, what accuracy would a naive model achieve if it simply predicted "not fraud" for every single transaction?

**Exercise 4**
Two models are being evaluated for a preliminary airport security screening system that flags baggage for further manual inspection. The "positive" class is "contains prohibited item."
- Model A: Precision = 90%, Recall = 75%
- Model B: Precision = 60%, Recall = 98%

Which model is a better choice for this task? Justify your decision by analyzing the trade-off and the potential real-world impact of each model's typical errors.

**Exercise 5**
Your team is developing a predictive maintenance model for critical factory machinery. The model predicts when a machine is likely to fail soon (the "positive" class). The cost of an unexpected failure is extremely high (production halts), while the cost of a scheduled maintenance check (triggered by a positive prediction) is moderate. You have two candidate models:
- Model S: Precision = 0.95, Recall = 0.70
- Model T: Precision = 0.75, Recall = 0.95

First, calculate the F1-score for both models. Then, recommend which model to deploy, using both the F1-score and the specific business context to justify your choice.

**Exercise 6**
You are the lead AI engineer on a project to build a system that identifies rare, but highly valuable, mineral deposits from geological survey data. The AI model's role is to flag promising sites. Every site flagged by the model will be investigated by a human geology team, which involves an expensive on-site visit. The company has a limited budget for these expeditions. How should you guide your team to tune the model's performance? Should they prioritize maximizing precision or maximizing recall? Explain your reasoning in terms of the project's goals and constraints.

---

## Answer Key

**Answer 1**
To solve this, we first identify the values:
- True Positives (TP) = 40
- False Positives (FP) = 10
- True Negatives (TN) = 145
- False Negatives (FN) = 5
- Total = TP + FP + TN + FN = 40 + 10 + 145 + 5 = 200

Now we apply the formulas:
- **Accuracy**: (TP + TN) / Total = (40 + 145) / 200 = 185 / 200 = **0.925 or 92.5%**
  *Reasoning: This represents the overall fraction of correct predictions.*
- **Precision**: TP / (TP + FP) = 40 / (40 + 10) = 40 / 50 = **0.80 or 80%**
  *Reasoning: Of all the parts the model flagged as defective, 80% actually were.*
- **Recall**: TP / (TP + FN) = 40 / (40 + 5) = 40 / 45 = **~0.889 or 88.9%**
  *Reasoning: The model successfully found 88.9% of all the actual defective parts.*

**Answer 2**
For a spam filter, **precision should be prioritized**.

- **Reasoning:** Let's analyze the errors:
  - A **False Positive** occurs when a legitimate email (e.g., a job offer, a personal message) is incorrectly classified as spam and sent to the junk folder. The user might miss this important email, which is a very poor and potentially harmful user experience.
  - A **False Negative** occurs when a spam email is incorrectly classified as legitimate and appears in the user's inbox. This is annoying, but the user can simply delete it.
- **Conclusion:** The consequence of a false positive (missing an important email) is far more severe than the consequence of a false negative (seeing an extra spam email). Therefore, we want the model to be very *precise*—when it says something is spam, we want to be very sure it's right.

**Answer 3**
Accuracy is misleading here because the dataset is highly imbalanced. The majority class ("not fraud") makes up 99% of the data.

A model can achieve very high accuracy simply by guessing the majority class every time. Let's analyze the naive model:
- It predicts "not fraud" for all 100% of transactions.
- It correctly identifies all the legitimate transactions (99% of the total). These are True Negatives.
- It incorrectly identifies all the fraudulent transactions (1% of the total). These are False Negatives.
- It makes zero positive predictions, so TP = 0 and FP = 0.
- The accuracy of this naive model is (TP + TN) / Total = (0 + 99) / 100 = **99%**.

The new model's 99% accuracy is no better than a useless model that does no learning at all. For imbalanced problems like this, metrics like precision and recall are necessary to understand if the model is actually successful at identifying the rare, positive class.

**Answer 4**
For an airport security screening system, **Model B is the better choice**.

- **Reasoning:** We must analyze the cost of each type of error in this high-stakes context.
  - A **False Negative** (Model fails to flag a bag with a prohibited item) is a catastrophic security failure. This is the worst possible outcome.
  - A **False Positive** (Model flags a safe bag) results in an inconvenient manual inspection for the passenger. While not ideal, it is a far more acceptable outcome than a security breach.
- **Conclusion:** The primary goal is to minimize false negatives, which means maximizing recall. Model B has a 98% recall, meaning it successfully identifies 98 out of every 100 prohibited items. Its lower precision (60%) is an acceptable trade-off, as it simply means more bags will be manually checked, but the system as a whole will be much safer.

**Answer 5**
First, let's calculate the F1-scores.
The formula is F1 = 2 * (Precision * Recall) / (Precision + Recall).

- **F1-score for Model S:**
  F1 = 2 * (0.95 * 0.70) / (0.95 + 0.70) = 2 * 0.665 / 1.65 = 1.33 / 1.65 ≈ **0.806**
- **F1-score for Model T:**
  F1 = 2 * (0.75 * 0.95) / (0.75 + 0.95) = 2 * 0.7125 / 1.70 = 1.425 / 1.70 ≈ **0.838**

**Recommendation:** Deploy **Model T**.

**Justification:**
Model T has a slightly higher F1-score, suggesting it has a better balance between precision and recall. More importantly, the business context dictates that avoiding unexpected failures is the top priority because the cost is "extremely high." This means we must minimize false negatives (failing to predict a failure that then occurs). Model T has a much higher recall (0.95) than Model S (0.70), meaning it successfully identifies 95% of impending failures. The lower precision is an acceptable trade-off because the cost of a false positive (an unnecessary maintenance check) is only "moderate" and far less damaging than an actual failure.

**Answer 6**
The team should be guided to **prioritize maximizing precision**.

**Reasoning:**
The core constraint of this system is the "limited budget for these expeditions." This means every false positive has a significant, real-world monetary cost.

- **Impact of High Precision:** If the model has high precision, it means that when it flags a site as "promising," it is highly likely to be correct. This ensures that the expensive on-site visits by the geology team are not wasted. The budget is used efficiently, maximizing the return on investment for each expedition.

- **Impact of High Recall:** If the model were tuned for high recall, it would find a higher percentage of all possible mineral deposits. However, it would do so at the cost of generating many more false positives—flagging numerous sites that are actually barren. This would quickly deplete the limited expedition budget on fruitless searches, making the entire project financially unviable.

- **Conclusion:** While we might miss some potential deposits (the trade-off for lower recall), prioritizing precision ensures that the project operates within its financial constraints and focuses the expert team's efforts where they are most likely to succeed.