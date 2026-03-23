## Exercises

**Exercise 1**
You are building a model to predict employee attrition (i.e., whether an employee will leave the company). Your raw dataset contains a `last_login_timestamp` for each employee, showing the date and time they last accessed a company system. Why is this timestamp, in its raw format (e.g., `2023-10-26 09:15:00`), a poor feature for the model, and what is one simple feature you could engineer from it that would be more useful?

**Exercise 2**
A model is being trained to predict the price of a used car. The dataset includes a `drivetrain` column with three possible text values: 'FWD' (Front-Wheel Drive), 'RWD' (Rear-Wheel Drive), and 'AWD' (All-Wheel Drive). A linear regression model can only process numerical inputs. How would you transform this single `drivetrain` column into a set of numerical features that the model can use? Show what the new columns and values would look like for a car that is 'RWD'.

**Exercise 3**
An e-commerce company built a regression model to predict `time_to_delivery` for customer orders. The model takes two features as input: `distance_to_customer_km` (a number) and `shipping_method` (a category like 'Standard', 'Express'). The model performs well for 'Standard' shipping but is highly inaccurate for 'Express' shipping, often predicting much longer delivery times than what actually occurs. What kind of essential information, likely available in the raw data, is missing from the features, and what new feature could be engineered to help the model differentiate between the two shipping methods more effectively?

**Exercise 4**
You are trying to predict whether a credit card transaction is fraudulent. You have the `transaction_time` (e.g., `2023-10-26 23:30:00`) and the `transaction_amount` (e.g., `$150.00`). Your colleague proposes two different features to capture the time of the transaction:

*   **Feature A:** `hour_of_day` (an integer from 0 to 23).
*   **Feature B:** `is_night_transaction` (a binary 1 if the hour is between 00:00 and 06:00, and 0 otherwise).

Analyze the trade-offs between these two features. In what scenario might Feature A be better, and in what scenario might Feature B be better?

**Exercise 5**
Imagine you are building a classification model to determine if a movie review is `positive` or `negative`. You have access to the raw review text. Drawing on your knowledge of supervised learning, design two distinct features you could engineer from the raw text. For each feature, explain *why* it would help a classifier (like Logistic Regression) separate the two classes.

**Exercise 6**
A ride-sharing company wants to predict surge pricing multipliers for different city regions at different times. Their goal is to proactively balance car supply with rider demand. They have a raw data stream of ride requests, each with a `request_id`, `user_id`, `timestamp`, and `pickup_location_GPS`.

Propose a feature engineering strategy that transforms this raw event stream into a set of features suitable for a regression model predicting the `surge_multiplier` for a specific region at a specific time (e.g., for "Downtown" at "4:00 PM"). Describe at least three features you would create and justify how your strategy bridges the gap between the raw data and the prediction goal.

---

## Answer Key

**Answer 1**
A raw timestamp like `2023-10-26 09:15:00` is a poor feature because it's an absolute point in time. A machine learning model would struggle to find a meaningful pattern from this; a login on October 26th isn't inherently more or less indicative of attrition than one on November 1st. The model needs information relative to the present.

A more useful engineered feature would be **`days_since_last_login`**.

*   **Reasoning:** This feature transforms the absolute timestamp into a relative duration that directly relates to employee engagement. A larger number of days since the last login is a strong signal of disengagement and a potential precursor to attrition. The model can easily learn a relationship like "the higher the `days_since_last_login`, the higher the probability of attrition."

**Answer 2**
The technique used to convert a categorical feature into a numerical format is called **One-Hot Encoding**.

*   **Method:** You would create a new binary column for each possible category in the original `drivetrain` column. In this case, you would create three new columns: `is_FWD`, `is_RWD`, and `is_AWD`. For each car (row), the column corresponding to its drivetrain would get a '1', and the other columns would get a '0'.

*   **Example for an 'RWD' car:**
    *   Original Column: `drivetrain` = 'RWD'
    *   New Columns:
        *   `is_FWD` = 0
        *   `is_RWD` = 1
        *   `is_AWD` = 0

This allows the linear model to assign a separate weight (importance) to each drivetrain type without assuming a false ordinal relationship (e.g., that RWD is "greater" than FWD).

**Answer 3**
The problem is that the model treats 'Standard' and 'Express' as simple categories, but it doesn't understand the *implicit promise* or Service Level Agreement (SLA) associated with each. The `distance_to_customer_km` feature affects both, but 'Express' shipping is supposed to be fast regardless of distance (up to a point).

A critical engineered feature would be **`is_weekend` or `day_of_week`**.

*   **Reasoning:** Shipping logistics change dramatically over the weekend. 'Standard' shipping might not process orders on Saturdays or Sundays, adding 1-2 full days to the delivery time. 'Express' shipping often includes weekend delivery. By creating a feature like `is_weekend` (a binary 1 or 0), the model can learn that for 'Standard' orders, if `is_weekend` is 1, the delivery time increases significantly. For 'Express' orders, this feature would have much less impact. This allows the model to learn the distinct behavior of each shipping method.

**Answer 4**
The choice depends on the underlying pattern of fraud you expect to find.

*   **Feature A (`hour_of_day`) might be better if:** The risk of fraud changes throughout the day in a complex but continuous way. For example, if fraud is low in the morning, gradually increases in the afternoon, peaks in the evening, and then drops off late at night. This feature preserves the granularity of the time information, allowing the model to find such a complex, non-linear pattern if one exists.

*   **Feature B (`is_night_transaction`) might be better if:** The primary pattern is a simple, strong distinction between "safe" hours and "risky" hours. If fraudulent transactions overwhelmingly occur in the dead of night (e.g., when the real cardholder is likely asleep), this binary feature provides a very clear, strong signal. It simplifies the problem for the model ("is this a night transaction or not?") and can be more robust against noise than trying to learn a pattern across 24 distinct hours.

**Trade-off Summary:** Feature A is more expressive but may require more data for the model to learn the pattern. Feature B is less expressive (loses information) but creates a simpler, stronger signal based on a specific hypothesis.

**Answer 5**
Here are two distinct features that could be engineered from raw review text and why they would help a classifier.

1.  **Feature: `positive_word_count`**
    *   **Engineering Process:** Create a pre-defined list of positive words (e.g., 'amazing', 'excellent', 'loved', 'great', 'best'). For each review, count how many times words from this list appear.
    *   **Reasoning for Classifier:** A classification model works by finding a "decision boundary". This feature creates a numerical axis on which to separate the data. Reviews with a high `positive_word_count` will cluster at one end of this axis, while reviews with a low count will cluster at the other. This gives the classifier a clear, quantitative signal to distinguish `positive` reviews from `negative` ones.

2.  **Feature: `review_length_in_characters`**
    *   **Engineering Process:** For each review, simply calculate the total number of characters in the text.
    *   **Reasoning for Classifier:** This feature is based on the hypothesis that emotional intensity correlates with review length. Extremely positive (e.g., "Best movie I've ever seen! Absolutely incredible...") or extremely negative reviews (e.g., "I can't believe I wasted my time on this terrible film...") are often longer than neutral ones. While not as direct as word counts, this feature can provide another dimension for the classifier to use. It might discover that very short reviews are often negative, while very long ones are more likely to be positive, helping it to separate the classes.

**Answer 6**
The core challenge is to convert a stream of individual ride requests into a summary of market conditions (supply vs. demand) for a given region at a given time.

**Feature Engineering Strategy:** The strategy is to **aggregate request data over a specific time window and geographical region**. Instead of looking at one request, we will look at all requests in a region (e.g., "Downtown") over a recent time period (e.g., the last 15 minutes) to create features for the model.

Here are three features that could be created using this strategy:

1.  **Feature: `demand_rate`**
    *   **Calculation:** Count the number of unique `request_id`s within the target region ("Downtown") in the 15 minutes leading up to the prediction time ("4:00 PM").
    *   **Justification:** This directly quantifies rider demand. A high count indicates a surge in requests, which is the primary driver of a surge pricing multiplier. This transforms many individual events into a single, highly relevant metric.

2.  **Feature: `supply_gap` (or `active_drivers_in_area`)**
    *   **Calculation:** To truly do this, you'd need driver location data. Assuming we don't, we can proxy it. A simple proxy would be to count the number of *completed* rides in the previous time window in that area. A more advanced feature would be to count the number of unique drivers who either completed a ride or made a request in the area. Let's stick with the simpler `demand_rate` for this foundation exercise. A better third feature would be:

3.  **Feature: `demand_rate_short_term_change`**
    *   **Calculation:** Calculate `demand_rate` for the most recent 15-minute window (e.g., 3:45-4:00 PM) and subtract the `demand_rate` from the prior 15-minute window (e.g., 3:30-3:45 PM).
    *   **Justification:** This feature captures the *trend* or momentum of demand. A high positive value means demand is increasing rapidly, which is a strong predictor that a surge multiplier will be needed very soon, even if the absolute demand isn't yet at its peak. This helps the model be proactive rather than reactive.

4.  **Feature: `time_of_day` / `is_rush_hour`**
    *   **Calculation:** Extract the hour from the timestamp and create a binary feature `is_rush_hour` (e.g., 1 if the hour is between 7-9 AM or 4-6 PM, 0 otherwise).
    *   **Justification:** Demand is not random; it follows predictable daily patterns. This feature explicitly provides the model with this crucial context. It allows the model to learn that a `demand_rate` of 50 requests/min at 2 PM is normal, but the same rate at 5 PM (rush hour) might require a much higher surge multiplier.

This strategy successfully converts a raw log of events into a rich, contextualized set of features that directly describe the state of the market, which is exactly what a regression model needs to predict the `surge_multiplier`.