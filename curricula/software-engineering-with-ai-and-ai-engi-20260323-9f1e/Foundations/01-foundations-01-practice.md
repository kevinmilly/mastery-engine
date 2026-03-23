## Exercises

**Exercise 1**
For each of the following software tasks, identify whether a traditional or an AI/ML approach is more appropriate. Justify your choice based on the nature of the problem's logic.
a) A program that validates whether a user-submitted password meets complexity requirements (e.g., minimum length, contains a number, contains a special character).
b) A program that looks at a satellite image of a parking lot and estimates how many cars are present.

**Exercise 2**
Imagine you are building a feature to automatically moderate user comments on a news website by flagging them as "inappropriate" or "appropriate".
- In the traditional, rule-based paradigm, what is the primary artifact your team would *write*? Give a simple example of what it might contain.
- In the AI/ML, data-driven paradigm, what is the primary artifact your team would *collect and prepare*? Give a simple example of what a single entry in it might look like.

**Exercise 3**
A video streaming service uses a simple, rule-based algorithm to recommend new shows to users: `IF a user watches a show in the "Science Fiction" genre, THEN recommend other popular shows from the "Science Fiction" genre.` The company finds that user engagement with these recommendations is low. Analyze why this traditional approach is likely failing to capture user preferences effectively. How would an AI/ML approach address this limitation at a fundamental level?

**Exercise 4**
A hospital wants to build a system to triage incoming patient reports from nurses to a doctor's worklist, categorizing them as "Urgent," "High Priority," or "Routine." The hospital has a 200-page manual that details the complex criteria for this categorization, but they also have 10 years of historical reports, each with its final, correct priority label assigned by a senior doctor.

Compare the development process of a traditional, rule-based system versus an AI/ML system for this task. Which approach is likely to have a higher initial development cost, and which is likely to be more difficult to update when medical guidelines change?

**Exercise 5**
You are a software engineer at a financial institution building a system to approve or deny mortgage applications. The system must comply with fair lending laws, which require that if an application is denied, the bank must provide the applicant with specific, verifiable reasons for the denial (e.g., "Credit score is below 720," "Income is insufficient for the loan amount").

The bank has a massive dataset of past applications and their outcomes. A data scientist on your team proposes using a powerful but complex deep learning model that has shown 5% higher accuracy in predicting loan defaults than any other method. Based on the core paradigm difference and the legal constraints, what is the single biggest risk of adopting this high-accuracy AI/ML model? Justify your answer.

**Exercise 6**
A team is building a system to predict inventory needs for a retail chain. The goal is to forecast how many units of a specific product (e.g., "Brand X 1-liter milk") will be sold at a specific store (e.g., "Store #123") next week.

A junior engineer proposes a rule-based solution: `Forecast = (sales of this product over the last 4 weeks) / 4`. A senior engineer suggests this is a good starting point but that the team should immediately start planning for an ML-based system.

Identify two distinct real-world factors or patterns that the simple rule-based system would fail to account for, but that a data-driven ML model could learn. Explain how the ML model's ability to learn from data makes it better suited to handle these factors.

---

## Answer Key

**Answer 1**
a) **Traditional.** The logic is explicit, deterministic, and can be perfectly captured by a series of `if-then` statements. The rules (length, character types) are known in advance and do not change. There is no ambiguity.
b) **AI/ML.** The "rules" for what constitutes a car from a top-down, variable-angle satellite image are incredibly complex and numerous. It would be nearly impossible to write explicit code to account for all possible car shapes, colors, shadows, and partial occlusions. A better approach is to show a model thousands of examples of images with cars and let it learn the visual patterns.

**Answer 2**
- **Traditional Paradigm:** The primary artifact would be a set of explicit **rules or a blocklist of keywords**. For example, the team would write code that says: `IF comment CONTAINS "curse_word_1" OR "curse_word_2" OR "curse_word_3" THEN flag as "inappropriate"`.
- **AI/ML Paradigm:** The primary artifact would be a **labeled dataset**. It would consist of thousands of example comments, each manually labeled with the correct category. A single entry might look like: `{"comment_text": "This is a fantastic article, thank you!", "label": "appropriate"}`. The model learns the patterns of inappropriateness from this data, rather than being given explicit rules.

**Answer 3**
The traditional, rule-based approach is failing because it operates on a single, simplistic dimension (genre). It cannot capture the nuanced and multi-faceted nature of user taste. A user might like "Science Fiction" for its complex characters, not just its genre. Recommending another sci-fi show that is plot-driven might not appeal to them.

An AI/ML approach addresses this by learning from user *behavior* data, not just content metadata. It can discover implicit, complex patterns like "users who watched Show A also tended to watch Show B," even if A and B are in different genres. The model learns the user's "taste" as a complex pattern rather than a simple, pre-defined rule.

**Answer 4**
- **Traditional System Process:** Developers would need to meticulously translate the 200-page manual into code (a complex web of `if-then-else` conditions). This would be a slow, labor-intensive process, highly prone to human error in translation. The initial development cost would be very high due to the manual effort of encoding the expert knowledge.
- **AI/ML System Process:** Developers would process the 10 years of historical reports into a clean, labeled dataset. They would then use this data to train a classification model to learn the relationship between report contents and priority labels. The initial coding effort might be lower, but data cleaning and model training could be time-consuming.

**Comparison:**
- **Initial Cost:** The traditional system would likely have a higher initial development cost due to the significant manual effort required to codify the complex rulebook.
- **Updating:** The traditional system would be more difficult to update. When medical guidelines change, a developer must find and carefully modify the specific lines of code corresponding to the old rule, risking unintended side effects. In the AI/ML system, as long as new, correctly labeled data becomes available reflecting the new guidelines, the model can be retrained to adapt.

**Answer 5**
The single biggest risk is the **"black box" nature** (lack of explainability) of the complex deep learning model.

**Justification:** The core legal constraint is the requirement to provide specific, verifiable reasons for a denial. A traditional, rule-based system is perfectly suited for this. Its logic is transparent; you can trace the exact rule that led to the denial (e.g., `if credit_score < 720 then deny`). A complex deep learning model, however, makes predictions based on intricate, non-linear combinations of thousands of variables. It is extremely difficult, and sometimes impossible, to isolate a simple, human-understandable reason for its decision. The bank would be unable to comply with the law because it could not explain *why* the model denied the application, even if the decision was statistically accurate.

**Answer 6**
The simple rule-based system would fail to account for many factors. Here are two primary examples:

1.  **Seasonality and Events:** The rule-based average cannot account for predictable spikes in demand. For example, milk sales might double in the week before a major snowstorm is forecast, or sales of sunscreen might spike during the first sunny week of spring. An ML model trained on historical sales data alongside weather data and a calendar of local events could learn these complex relationships and predict such spikes automatically.

2.  **Inter-product Relationships (Halo/Cannibalization Effects):** The simple model treats every product in isolation. It doesn't know that a big sale on "Brand Y Cereal" might cause a surge in sales of "Brand X Milk" (a halo effect), or that the introduction of a new organic milk brand might decrease sales of the standard "Brand X Milk" (a cannibalization effect). An ML model can be trained on basket-level data or all product sales simultaneously, allowing it to learn these intricate interdependencies and make more holistic forecasts.