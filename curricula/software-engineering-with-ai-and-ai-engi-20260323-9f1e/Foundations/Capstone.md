## Capstone: Foundations — Software Engineering with AI and AI Engineering

### The Scenario
You are a junior AI Engineer at **AuraCart**, a mid-sized e-commerce company. The company has recently been dealing with a surge in sophisticated fraudulent transactions. Their current anti-fraud system is a traditional, rule-based engine. It checks for simple red flags like multiple transactions from the same IP address in a short time or mismatches between the shipping address and the IP location. However, this system is failing to catch newer, more subtle patterns of fraud and is also incorrectly flagging legitimate customers, causing frustration and lost sales.

The Chief Technology Officer (CTO) is convinced that a machine learning approach is the answer. She has tasked you with preparing a preliminary analysis and proposal for building an ML-based fraud detection model. The data science team has provided a sample of historical transaction data that has been manually labeled by fraud analysts. Each row represents a single transaction with the following fields: `transaction_amount`, `time_of_day_utc`, `user_account_age_days`, `num_prior_transactions`, `is_guest_checkout` (True/False), and the label `is_fraudulent` (True/False). Your proposal will be the first step in deciding whether to move forward with this AI initiative.

### Your Tasks
1.  **Justify the Paradigm Shift:** The CTO needs to explain the value of this project to non-technical stakeholders. Write a concise justification for why a machine learning approach is better suited for this fraud detection problem than the company's existing rule-based system. Reference the specific limitations of the current system mentioned in the scenario.

2.  **Frame the Machine Learning Problem:** Based on the scenario and the sample data provided, identify the specific type of machine learning problem this is. State the learning paradigm (e.g., Supervised, Unsupervised, Reinforcement) and the specific task (e.g., Classification, Regression, Clustering). Justify your choices.

3.  **Select Appropriate Evaluation Metrics:** An initial prototype model was trained and achieved **98% accuracy**. Explain why accuracy might be a dangerously misleading metric for this specific business problem. Propose two other evaluation metrics that would provide a more complete picture of the model's performance, and explain what each one measures in the context of fraud detection.

4.  **Propose an Engineered Feature:** Looking at the provided data fields (`transaction_amount`, `time_of_day_utc`, `user_account_age_days`, `num_prior_transactions`, `is_guest_checkout`), propose one new, meaningful feature that you could create by combining or transforming the existing ones. Explain what this new feature would represent and why it could help the model better identify fraudulent behavior.

5.  **Identify a Primary Ethical Risk:** Deploying an AI fraud detection system has real-world consequences. Identify one significant ethical risk associated with this system (e.g., related to bias, fairness, or transparency). Describe a potential negative impact this risk could have on AuraCart's customers and suggest one high-level strategy to help mitigate it.

### What Good Work Looks Like
*   Demonstrates a clear understanding of ML problem framing by logically connecting the business goal, the available data, and the appropriate learning paradigm.
*   Connects the choice of evaluation metrics directly to the specific business risks and operational consequences of the e-commerce fraud scenario.
*   Provides a compelling argument for the AI/ML paradigm by contrasting its data-driven, adaptive nature with the limitations of traditional, rule-based systems in the given context.
*   Shows creative and practical thinking about data, explaining *how* a new feature could capture underlying patterns that the raw data might miss.
*   Articulates ethical risks with specificity, moving beyond generic statements to describe plausible, real-world negative impacts on users or the business.