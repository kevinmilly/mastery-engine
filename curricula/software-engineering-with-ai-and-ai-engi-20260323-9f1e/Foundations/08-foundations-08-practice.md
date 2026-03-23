## Exercises

**Exercise 1**
A regression model is developed to predict the time (in minutes) it takes for a support ticket to be resolved. For a small sample of tickets, the model's predictions and the actual resolution times are as follows:

-   Actual Times: [120, 60, 200, 30]
-   Predicted Times: [110, 75, 180, 45]

Calculate the Mean Absolute Error (MAE) and the Mean Squared Error (MSE) for this set of predictions.

**Exercise 2**
You are evaluating two different models that predict server response time in milliseconds (ms). You calculate the errors (Actual - Predicted) for four test data points for each model.

-   Model A Errors: [-10ms, 10ms, -12ms, 12ms]
-   Model B Errors: [25ms, -3ms, -2ms, -1ms]

Which model has the higher Mean Squared Error (MSE)? In a system where very large, infrequent prediction errors can cause system timeouts and are significantly more harmful than small, frequent errors, which model would you likely choose and why?

**Exercise 3**
An AI engineering team is building a model to predict the amount of fuel (in liters) required for a delivery truck's route. After evaluation, they report that the model has an R-squared value of 0.85 and a Mean Absolute Error (MAE) of 7.5. A project manager, who is not technical, asks you to explain what these numbers mean for the business.

Which of these two metrics is more useful for explaining the model's typical prediction error in a direct, business-relevant way? Explain your choice and state what the value of that metric means in the context of this problem.

**Exercise 4**
A data scientist trains a regression model on a dataset and gets an R-squared value of 0.95. Excited, they declare the model a huge success. However, upon inspection, you notice that the dataset has one extreme outlier. When that single outlier is removed and the model is re-evaluated on the remaining data, the R-squared drops to 0.55.

Explain how a single data point could have such a dramatic effect on the R-squared value. What does this situation suggest about the model's true predictive power on typical data points?

**Exercise 5**
Recall the concept of "supervised learning." A team is tasked with building a model to predict customer lifetime value (CLV), a continuous variable. They frame it as a regression problem. They train an initial model and find it has a very high Mean Squared Error (MSE). Upon investigation, they discover that their training data includes many "inactive" customers whose true CLV is zero, but the model consistently predicts a small positive value for them (e.g., $5-$10).

How does this situation relate to the core goal of supervised learning? Explain why these small but numerous errors for inactive customers could contribute significantly to a high MSE, and suggest a potential modeling strategy to better handle this.

**Exercise 6**
You are working on a financial model to predict the percentage change in a stock's price over the next day. A positive value means an increase, and a negative value means a decrease. You have two candidate models:

-   **Model Alpha:** Has a lower Mean Absolute Error (MAE). It is generally close to the actual value but sometimes makes critical sign errors (e.g., predicts a 1% gain when there is a 1% loss).
-   **Model Beta:** Has a lower R-squared value and a higher MAE. However, it is much better at correctly predicting the direction (the sign) of the price change.

If the primary goal of your trading algorithm is to avoid losing money (i.e., to correctly decide whether to buy or sell), which model might you prefer despite its worse regression metrics? How might you blend concepts from regression and classification evaluation to create a better overall assessment for this specific business problem?

---

## Answer Key

**Answer 1**
To calculate the MAE and MSE, we first need to find the errors for each prediction. The error is `Actual - Predicted`.

-   Errors:
    -   120 - 110 = 10
    -   60 - 75 = -15
    -   200 - 180 = 20
    -   30 - 45 = -15

**Mean Absolute Error (MAE):**
The MAE is the average of the absolute values of the errors.
1.  Absolute Errors: `|10|`, `|-15|`, `|20|`, `|-15|` which are `10, 15, 20, 15`.
2.  Sum of Absolute Errors: `10 + 15 + 20 + 15 = 60`.
3.  Divide by the number of data points (4): `MAE = 60 / 4 = 15`.
The MAE is 15 minutes.

**Mean Squared Error (MSE):**
The MSE is the average of the squared errors.
1.  Squared Errors: `10^2`, `(-15)^2`, `20^2`, `(-15)^2` which are `100, 225, 400, 225`.
2.  Sum of Squared Errors: `100 + 225 + 400 + 225 = 950`.
3.  Divide by the number of data points (4): `MSE = 950 / 4 = 237.5`.
The MSE is 237.5 minutes-squared.

**Answer 2**
First, let's calculate the MSE for both models. MSE is the average of the squared errors.

**Model A:**
1.  Squared Errors: `(-10)^2, 10^2, (-12)^2, 12^2` which are `100, 100, 144, 144`.
2.  Sum of Squared Errors: `100 + 100 + 144 + 144 = 488`.
3.  MSE: `488 / 4 = 122`.

**Model B:**
1.  Squared Errors: `25^2, (-3)^2, (-2)^2, (-1)^2` which are `625, 9, 4, 1`.
2.  Sum of Squared Errors: `625 + 9 + 4 + 1 = 639`.
3.  MSE: `639 / 4 = 159.75`.

Model B has the higher MSE.

**Conclusion:**
In a system where large errors are significantly more harmful, I would choose **Model A**.

**Reasoning:**
MSE penalizes larger errors disproportionately because it squares the error term. Model B has one large error (25ms), which results in a squared error of 625. Model A's errors are smaller and more consistent. Even though its largest error (12ms) is not tiny, its squared value (144) is much less than Model B's largest. The high MSE for Model B is a direct warning sign that it produces large, potentially damaging prediction errors, making Model A the safer choice for this specific application.

**Answer 3**
The **Mean Absolute Error (MAE)** is more useful for this explanation.

**Reasoning:**
-   **MAE's Interpretability:** The MAE is 7.5. Because MAE is calculated by averaging the absolute differences between actual and predicted values, its unit is the same as the target variable's unit. In this case, the unit is liters. You can tell the project manager: "On average, our model's fuel prediction is off by about 7.5 liters." This is a direct, understandable measure of the typical error in real-world terms.
-   **R-squared's Abstraction:** An R-squared of 0.85 means that 85% of the variance in the fuel requirements is explained by the model. While this is a good statistical measure of fit, it's not intuitive for a non-technical stakeholder. It doesn't directly translate to an error margin in liters, making it harder to connect to business operations like fuel purchasing or budgeting.

**Answer 4**
**Explanation of the Effect:**
R-squared measures the proportion of the total variance in the dependent variable (the target) that is explained by the model. The total variance is calculated based on how far each data point is from the mean of all data points.

An extreme outlier is, by definition, very far from the mean. This single point can massively inflate the total variance of the dataset. The model, by simply predicting a value close to this outlier, can "explain" a huge portion of that inflated variance. This makes the model appear highly effective, leading to a high R-squared value, even if it performs poorly on all the other, more typical data points.

**Conclusion on Predictive Power:**
The drop from 0.95 to 0.55 after removing the outlier suggests that the model's true predictive power on typical data is much lower than initially thought. The high initial R-squared was an illusion created by the model's ability to "fit" a single, unrepresentative data point. The 0.55 value is a more honest reflection of its performance on the majority of the data. This highlights the importance of not relying on a single metric and investigating outliers.

**Answer 5**
**Relation to Supervised Learning:**
Supervised learning aims to learn a mapping function from input features to an output label (`y = f(x)`). The goal is for the model's predictions (`y_hat`) to be as close as possible to the true labels (`y`). In this case, the model is failing on a large subset of the data (inactive customers) where the true label is `y=0`, by consistently predicting a non-zero `y_hat`.

**Contribution to High MSE:**
MSE squares the errors before averaging them. Let's say the model predicts $5 for 1,000 inactive customers.
-   The error for each is `$0 - $5 = -$5`.
-   The squared error for each is `(-$5)^2 = $25`.
-   The total squared error from just these 1,000 customers is `1000 * 25 = 25,000`.
Even though the individual errors are small, their squared contribution adds up very quickly across a large number of instances, leading to a high overall MSE.

**Potential Strategy:**
This problem has characteristics of both classification and regression. A better strategy would be a **two-part model (or hybrid model)**:
1.  **Classification Part:** First, train a classification model to predict whether a customer is "active" or "inactive" (a binary outcome).
2.  **Regression Part:** If the classifier predicts "active," then a regression model (trained only on active customers) is used to predict their specific CLV. If the classifier predicts "inactive," the model's final output is simply 0.
This approach prevents the regression model from being penalized for trying to fit the large number of zero-value data points.

**Answer 6**
**Model Choice and Justification:**
For a trading algorithm where the primary goal is to avoid losing money, I would prefer **Model Beta**.

**Reasoning:**
The core task is to make a correct directional bet: buy if the price will go up (positive change), and sell/short if it will go down (negative change). Model Beta is better at this core task because it more accurately predicts the *sign* of the price change. Model Alpha, despite having a lower average error (MAE), is dangerous because its sign errors could lead the algorithm to buy before a price drop or sell before a price increase, directly causing financial loss. In this context, getting the direction right is far more important than being precisely correct on the magnitude of the change. A higher MAE is an acceptable trade-off for higher directional accuracy.

**Blended Evaluation Approach:**
A standard regression metric is insufficient here. I would create a blended evaluation framework:
1.  **Treat as Classification:** First, evaluate the models on their ability to predict the sign of the price change. Convert the continuous predictions into categorical labels (+1 for positive, -1 for negative). Then, use classification metrics like **Accuracy**, **Precision** (for positive predictions, to avoid false buys), and **Recall** to measure directional performance. This directly measures the model's utility for the buy/sell decision.
2.  **Use Regression Metrics Conditionally:** Analyze the MAE or MSE, but only for the subset of predictions where the direction was correctly predicted. This would tell you, "When the model is right about the direction, how far off is its magnitude prediction?" This helps in setting profit targets or stop-loss orders.

By combining these approaches, you get a much richer picture of the model's real-world business value beyond what a single regression metric can provide.