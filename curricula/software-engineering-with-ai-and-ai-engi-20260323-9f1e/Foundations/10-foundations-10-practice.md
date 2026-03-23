## Exercises

**Exercise 1**
A new mobile health app tracks users' daily moods and stress levels through self-reported surveys. To improve its personalized recommendations, the app's developers use this mood and stress data to train a new machine learning model. The app's terms of service mention that data is used for "product improvement," but do not specify that it will be used for training a new predictive model that could be sold to corporate wellness programs. Which of the four core ethical principles is most directly compromised by this specific use of the data, and why?

**Exercise 2**
A startup is building an AI model to automatically transcribe spoken interviews. They train their model exclusively on a large dataset of audio from national news broadcasts. When they test the model, they find it performs excellently for native English speakers with standard accents but has a very high error rate for speakers with strong regional or non-native accents. What type of bias is this an example of, and how did the data collection strategy contribute to this unfair outcome?

**Exercise 3**
A financial institution uses a complex deep learning model to approve or deny credit card applications. When a customer is denied, they receive a letter stating that the "decision was made by our automated system based on a proprietary risk assessment." The customer service representatives do not have access to the specific factors that led to any individual's denial because the model's internal logic is not interpretable. Analyze this situation from the perspective of the principle of Transparency. What is the key failure, and what is a potential negative consequence for the customer?

**Exercise 4**
An AI-powered recruitment tool is designed to screen résumés and identify the top 10% of candidates for a software engineering role. The model was trained on the company's hiring data from the past 15 years. An audit reveals that the model recommends male candidates at a significantly higher rate than female candidates, even when qualifications are equivalent. The company claims the model cannot be biased because "gender" was explicitly excluded as a feature during training. Explain why this claim is likely incorrect.

**Exercise 5**
You are part of a team developing a machine learning model to predict student dropout risk at a university. A teammate suggests using the student's home ZIP code as a key feature, arguing that it's a strong predictor in the historical data. Integrating your knowledge of Feature Engineering and Ethical AI, evaluate this suggestion. Identify the ethical risk and propose two alternative, less problematic features that could capture similar information about a student's support system or environment.

**Exercise 6**
A city government is deploying an AI system to optimize public resource allocation (e.g., park maintenance, library hours, road repairs) based on citizen service requests filed through a mobile app. To ensure fairness, they want to make sure the system serves all neighborhoods equitably. However, they know that residents in wealthier neighborhoods have higher smartphone adoption and are more likely to use the app, while residents in lower-income areas are more likely to report issues via phone calls or in person, which are not fed into the AI system. As the lead AI engineer, you must propose a plan to mitigate this issue. Your plan must address both the data collection process (part of the AI Lifecycle) and the model's evaluation metrics.

---

## Answer Key

**Answer 1**
The principle most directly compromised is **Privacy**.

**Reasoning:** While the terms of service mention "product improvement," this language is vague. Using personally sensitive data (mood and stress levels) to train a model for a new, unspecified commercial purpose (selling to corporate wellness programs) goes beyond what a user might reasonably expect. This constitutes a secondary use of data for which explicit consent was not obtained, violating the user's reasonable expectation of privacy. The lack of specificity also touches on a lack of transparency, but the core issue is the unconsented use of personal data.

**Answer 2**
This is an example of **Sampling Bias** (or representation bias).

**Reasoning:** The training data was not representative of the full population of potential users. National news broadcasters typically feature speakers with standardized, professionally trained accents. By exclusively using this unrepresentative sample, the developers created a model that is biased against groups that were underrepresented in the training data, such as people with regional or non-native accents. This directly leads to an unfair outcome where the system provides a lower quality of service for these groups.

**Answer 3**
The key failure in Transparency is the lack of **Explainability**.

**Reasoning:** The system is a "black box." Although a decision has been made, neither the company nor the customer can understand the reasoning behind it. The negative consequence for the customer is that they have no recourse or path to improvement. They don't know if they were denied because of their credit history, income level, a data error, or a spurious correlation in the model. Without an explanation, they cannot contest the decision effectively or know what steps to take to improve their chances in the future.

**Answer 4**
The company's claim is likely incorrect because the model is probably learning gender bias from **proxy variables**.

**Reasoning:** Even if the 'gender' feature was excluded, other features in the résumé data can act as proxies for gender. For example, a model trained on 15 years of historical data from a male-dominated field might learn to associate certain universities, prior companies, or even hobbies and extracurricular activities (e.g., "captain of the wrestling team" vs. "captain of the field hockey team") with the successful (and historically male) candidates. This creates a discriminatory model that perpetuates historical biases, even without a direct 'gender' feature.

**Answer 5**
The ethical risk of using ZIP code is that it acts as a strong **proxy for socioeconomic status and race**, which can introduce systemic bias into the model. A model that penalizes students from low-income ZIP codes could perpetuate a cycle of disadvantage, creating a self-fulfilling prophecy where students from certain backgrounds are flagged as high-risk and are not given the same opportunities.

**Alternative Feature Proposals:**
1.  **Student-reported support:** Instead of using a proxy like ZIP code, the university could gather more direct and relevant data through surveys, such as asking students about their access to study resources, their sense of belonging on campus, or their financial stability. These are more direct indicators of risk than geography.
2.  **Behavioral/Engagement data:** Use features that reflect the student's actual university experience, such as library check-ins, attendance at academic support workshops, login frequency to the online learning system, or participation in extracurricular activities. These features are less likely to be correlated with protected attributes and are more causally related to student success.

**Answer 6**
The core problem is sampling bias in the data collection process, which will lead to an unfair allocation of resources. My plan would have two parts:

1.  **Data Collection Process (AI Lifecycle):** The current data collection method is flawed. To mitigate this, we must create a unified data pipeline that incorporates service requests from all channels, not just the app.
    *   **Action:** Digitize the phone and in-person reporting systems. When a report comes in via phone, the operator inputs it into the same standardized database that the app uses.
    *   **Justification:** This creates a more representative dataset of citizen needs across all demographics, directly addressing the sampling bias.

2.  **Model Evaluation Metrics:** Relying on overall performance metrics will hide inequities. We must use fairness-aware evaluation.
    *   **Action:** Before deployment, we must evaluate the model's performance and resource allocation recommendations on a per-neighborhood or per-ZIP-code basis. We would use metrics like "equality of opportunity," ensuring that the true positive rate for detecting service needs is similar across all neighborhoods, regardless of their average income or primary reporting method.
    *   **Justification:** This ensures the model is not just accurate on average but is also fair in its outcomes. If the model consistently under-allocates resources to neighborhoods with less app usage, it would fail this fairness test, and we would need to retrain it, possibly by up-weighting the data from those neighborhoods.