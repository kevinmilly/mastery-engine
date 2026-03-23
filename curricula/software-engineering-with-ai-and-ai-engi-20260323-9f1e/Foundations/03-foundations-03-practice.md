## Exercises

**Exercise 1**
An online retail company wants to build a feature that predicts the total dollar amount a customer will spend during their next visit. The model will use the customer's past purchase history, browsing activity, and time since their last visit as inputs. Is this a classification or a regression task? Explain your reasoning.

**Exercise 2**
A software development team is building a tool to automatically review code pull requests. The tool is intended to analyze the submitted code and label the request as either "Requires Human Review" or "Approved for Merge". What type of supervised learning problem is this? Explain why.

**Exercise 3**
A ride-sharing company wants to use machine learning to predict driver availability. They have historical data including the time of day, weather conditions, location, and the number of active drivers. How could this business goal be framed as (a) a regression task and (b) a classification task? For each, describe what the model's prediction would represent.

**Exercise 4**
You are an engineer at a fintech company building a model to detect fraudulent credit card transactions. You have a large dataset of transactions, each with features like transaction amount, merchant category, time of day, and location. To train a supervised learning model for this purpose, what specific piece of information (the "label") would you need for every transaction in your historical dataset?

**Exercise 5**
A company’s IT department currently uses a system of hand-written rules to manage incoming server alerts. For example: "IF CPU_usage > 95% AND service = 'database' THEN page the on-call database administrator." This system is brittle and requires constant manual updates. Using the concepts of supervised learning, describe how you would re-frame this manual alerting process as an ML task. Identify the type of task, explain what the model would predict, and specify the features and labels you would need in your training data.

**Exercise 6**
A shipping logistics company wants to predict delivery delays. The product team is debating two potential models:
1.  **Model A:** Predict the exact number of days a shipment will be late (e.g., 0, 1, 2, 3.5 days).
2.  **Model B:** Predict whether a shipment will fall into one of three categories: "On Time", "Minor Delay" (1-2 days late), or "Major Delay" (3+ days late).

Identify which model represents a regression task and which represents a classification task. From a business and software engineering perspective, what is a key advantage of using Model B, even though its output is less precise?

---

## Answer Key

**Answer 1**
This is a **regression** task.

**Reasoning:** The goal is to predict a continuous numerical value—the exact dollar amount a customer will spend. Regression models are used for predicting quantities on a continuous scale, such as price, temperature, or in this case, spending amount. A classification model would not be suitable as it predicts discrete categories (e.g., 'high-spender' vs. 'low-spender'), not a specific number.

**Answer 2**
This is a **classification** task.

**Reasoning:** The model's output is a discrete category from a predefined set of labels: "Requires Human Review" or "Approved for Merge". Classification models are designed to categorize inputs into one of several distinct classes. The model is not predicting a numerical value; it is assigning a label.

**Answer 3**
(a) As a **regression task**, the model would predict the exact number of active drivers in a given area at a specific time. The output would be a continuous numerical value (e.g., 157.5, which could be interpreted as an average expectation of 157 or 158 drivers).

(b) As a **classification task**, the model would predict a driver availability *category*. For this to work, the company would first need to define discrete states, such as 'Low Availability', 'Medium Availability', and 'High Availability'. The model would then categorize the situation into one of these predefined labels, which could be used to trigger surge pricing or driver incentives.

**Answer 4**
To train a supervised model, you would need a **label** for each historical transaction indicating whether it was **fraudulent or not fraudulent**.

**Reasoning:** Supervised learning requires labeled data. The model learns by finding patterns in the transaction features (amount, merchant, etc.) that correlate with the known outcome. In this case, the outcome is a binary category (fraud/not fraud), making this a classification problem. Without this historical label for each transaction, the model would have no "ground truth" to learn from.

**Answer 5**
This can be re-framed as a **multi-class classification** task.

**Reasoning:**
*   **ML Task:** Instead of rules, a model would learn the relationship between alert patterns and the correct action to take.
*   **Model Prediction:** The model would predict which action to take for any given incoming alert. The possible outputs (classes) would be discrete actions like 'Page Database Admin', 'Page Network Engineer', 'Create Low-Priority Ticket', or 'Ignore'.
*   **Features:** The inputs to the model would be the data from the server alert, such as `CPU_usage`, `memory_usage`, `service_name`, `error_log_text`, and `time_of_day`.
*   **Labels:** The training data would be a historical log of alerts (the features) paired with the label of the correct action that a human expert took for each one. This labeled dataset teaches the model the patterns that a human expert follows.

**Answer 6**
*   **Model A** is a **regression** task because it predicts a specific, continuous numerical value (the number of days late).
*   **Model B** is a **multi-class classification** task because it predicts one of three discrete, predefined categories.

**Key Advantage of Model B:**
A key advantage of the classification approach (Model B) is that it can be more **robust and directly tied to business actions**. Predicting a precise number of days late is difficult and small errors can be misleading (is a prediction of 0.1 days late meaningfully different from 0.2 days?). In contrast, bucketing outcomes into categories like "On Time" or "Major Delay" often aligns better with business processes (e.g., automatically notify customers only for "Major Delay" shipments). It transforms a noisy prediction problem into a more stable one, where the model only needs to be right about the category, not the exact number. This can often lead to a model that is more reliable in production.