## Exercises

**Exercise 1**
A financial institution uses an AI model to flag potentially fraudulent credit card transactions. The model is highly accurate but has a low recall for a specific type of complex, multi-stage fraud. When the system fails to flag such a transaction, it is not considered a system failure or crash. From the perspective of building trustworthy AI, which specific principle—reliability, robustness, or fairness—is most compromised in this scenario, and why?

**Exercise 2**
An agricultural tech company deploys a computer vision model in drones to identify crop disease. The model was trained on high-resolution images from the company's proprietary drones. However, some clients use older, lower-resolution drones, and the model's performance degrades significantly on their imagery. Propose two distinct, practical data-centric strategies to improve the model's *robustness* to variations in image quality.

**Exercise 3**
A city's traffic management system uses an AI model to predict traffic flow and adjust traffic light timings. The system is designed to be highly reliable, with multiple redundant servers. During a major, unexpected city-wide event (e.g., a victory parade for a local sports team), the model's predictions become completely inaccurate because its training data has never seen such a traffic pattern. The system continues to operate, implementing poor signal timings that worsen the gridlock. Analyze this failure: how can a system be technically *reliable* (i.e., operational and not crashed) but not *robust*, and what is the key distinction between these two concepts demonstrated by this scenario?

**Exercise 4**
A legal tech firm develops an AI model to summarize long legal documents. To improve robustness, the model is trained to handle documents with significant typographical errors, OCR mistakes, and formatting issues. An internal audit reveals an unintended consequence: the model performs significantly worse on documents written by non-native English speakers, often misinterpreting grammatical structures that are common for that group but which the model has learned to associate with "noise" or "errors". Explain the tension between the goals of robustness and fairness in this specific case, and identify the flawed assumption in the training strategy that led to this discriminatory outcome.

**Exercise 5**
You are the lead engineer for a new AI-powered diagnostic tool that assists radiologists in identifying early-stage cancer from medical scans. You must choose between two models for the initial deployment:
- **Model A (Deep CNN):** Achieves 97% accuracy in lab settings. However, it is a "black box," and its failure modes are unpredictable. It is highly sensitive to variations in scanner calibration, a common issue across different hospitals.
- **Model B (Interpretable Boosting Model):** Achieves 94% accuracy. Its predictions can be visualized using SHAP plots (a high degree of explainability). It is less sensitive to calibration variations but shows a slightly higher rate of false negatives for a specific demographic group with denser breast tissue.

Drawing on the principles of reliability, robustness, fairness, and *model explainability (XAI)*, which model would you recommend for the initial, limited release? Justify your choice by outlining the primary risks of each model and proposing a specific monitoring and feedback mechanism you would implement post-deployment to mitigate the risks of your chosen model.

**Exercise 6**
Your team is responsible for a content moderation AI that operates on a global social media platform. The system uses a large language model (LLM) that is continuously updated via a *CI/CD for ML pipeline*. Management has two high-priority, competing demands:
1.  **Increase Robustness:** Defend against new adversarial attacks where users embed offensive text within images (multimodal attacks).
2.  **Ensure Fairness:** Eliminate recently discovered biases where the model disproportionately flags politically charged, but non-violating, content from certain countries.

Designing a solution that addresses both issues simultaneously is time-consuming. You must propose a strategic plan that integrates concepts from *Adversarial Defenses*, *Managing Technical Debt in ML Systems*, and *A/B Testing*. Justify which problem you would prioritize addressing first in the CI/CD pipeline and explain how your plan manages the short-term risk of the de-prioritized problem.

---

## Answer Key

**Answer 1**
The principle most compromised is **reliability**.

**Reasoning:**
Reliability in an AI system is not just about uptime or avoiding crashes; it's about the system consistently and dependably performing its specified function. In this case, the specified function is to "flag fraudulent transactions." The model's failure to detect a known class of fraud is a failure to perform its core function, even if the software itself remains operational. This is a functional reliability issue.

- It is not primarily a *robustness* issue because the scenario doesn't mention a change in input data distribution (like a new type of data). The model is simply failing on a subset of the existing data it was expected to handle.
- It is not a *fairness* issue because the failure is based on the *type* of transaction, not on a protected attribute of the users involved.

**Answer 2**
Here are two distinct data-centric strategies to improve the model's robustness:

1.  **Data Augmentation:** During the model training phase, apply a variety of augmentation techniques to the existing high-resolution training images. These techniques would simulate the lower-quality input, such as:
    - **Gaussian Blur:** To simulate out-of-focus lenses.
    - **Downsampling and Upsampling:** To reduce the effective resolution of the image and then resize it back to the required input dimensions, mimicking what a lower-resolution sensor produces.
    - **Noise Injection:** Adding random noise (e.g., salt-and-pepper noise) to simulate sensor noise in older hardware.
    This would be implemented during the **Model Training** stage of the MLOps lifecycle.

2.  **Strategic Data Sourcing:** Actively collect or purchase new training data from a diverse range of drone hardware, specifically including the older, lower-resolution models used by clients. This expands the training distribution to explicitly include the types of images the model is currently failing on. This is a more direct and often more effective approach than simulation. This would be implemented during the **Data Collection/Procurement** stage.

**Answer 3**
The key distinction is between **operational uptime** and **functional correctness under changing conditions**.

**Analysis:**
- The system was **technically reliable** because its infrastructure (servers, software) did not fail. It continued to run, accept data, and produce outputs. From an IT infrastructure perspective, there were no errors.
- The system was **not robust** because it could not maintain its performance (functional correctness) when faced with a significant, unforeseen shift in the input data distribution (the parade traffic pattern). Robustness is the ability to handle out-of-distribution or noisy inputs gracefully.

The scenario demonstrates that reliability and robustness are separate but related concepts. A system can meet its service-level objectives for uptime (reliability) but still fail its core mission because it lacks the resilience to changing real-world conditions (robustness). A truly trustworthy system requires both.

**Answer 4**
**Tension:** The effort to make the model robust to one type of "noise" (OCR/typo errors) inadvertently made it treat valid, but less common, linguistic patterns as that same noise, thereby reducing its fairness. The model optimized for robustness against technical errors at the cost of equity for different linguistic groups.

**Flawed Assumption:**
The flawed assumption was that **all deviations from a standard, "clean" text corpus represent errors or noise**. The training strategy did not account for the fact that linguistic variation (like AAVE or grammar from non-native speakers) is a legitimate and meaningful signal, not random noise. By lumping all non-standard text patterns into the category of "errors to be ignored," the model was trained to penalize authors who use those patterns, leading to a biased and unfair outcome.

**Answer 5**
**Recommendation:** I would recommend deploying **Model B (Interpretable Boosting Model)** for the initial limited release.

**Justification & Risk Analysis:**
- **Primary Risk of Model A (Deep CNN):** The critical risk is its lack of explainability combined with unpredictable failure modes in a high-stakes medical setting. A 97% accuracy is meaningless if the 3% of failures are silent, unexplainable, and potentially catastrophic. Its sensitivity to scanner calibration (a robustness issue) makes its real-world performance highly uncertain. Deploying it would risk patient safety and destroy clinical trust if it makes a high-profile mistake that no one can explain.
- **Primary Risk of Model B (Interpretable Model):** The main risk is the known fairness issue (higher false negatives for a specific demographic) and the lower overall accuracy (94% vs 97%). While a false negative is a serious error, the risk is *known*, *measurable*, and can be actively mitigated.

**Mitigation and Monitoring Plan for Model B:**
1.  **Explainability in Workflow:** Integrate SHAP value visualizations directly into the radiologist's user interface. For every prediction, especially "no cancer found," the tool will highlight the key features that led to the decision. This allows the radiologist to use their expert judgment to override the model if the reasoning seems suspect, directly addressing the risk of false negatives.
2.  **Targeted Auditing & Monitoring:** Implement a post-deployment monitoring system that specifically tracks the model's performance (especially false negative rates) broken down by demographic groups. This provides a continuous feedback loop. If the monitored disparity persists or worsens, it triggers an alert for model retraining.
3.  **A/B Testing for Fairness Interventions:** Use the CI/CD for ML pipeline to deploy a new version of Model B, retrained with techniques to mitigate the identified bias (e.g., re-weighting the sample group). This new version can be released as an A/B test (or canary release) to a small subset of hospitals to verify that the fairness intervention works without degrading overall performance before a full rollout.

This strategy prioritizes safety, trust, and transparency over raw accuracy, which is the correct tradeoff for a critical medical application.

**Answer 6**
**Strategic Plan:** Prioritize fixing the **fairness** issue first, while managing the risk of the **robustness** issue.

**Justification for Prioritization:**
A content moderation system that is systematically biased against a political group, even if it's otherwise effective, can cause immediate, large-scale harm to the platform's integrity, user trust, and public perception. This is an active, ongoing harm. The multimodal adversarial attack is a potential (and serious) threat, but it may not yet be exploited at scale. Therefore, fixing the known, active harm (fairness) is more urgent.

**Integrated Strategic Plan:**

1.  **Phase 1: Address Fairness (Immediate Sprint)**
    - **CI/CD Pipeline:** Immediately push a patch or rollback to a previous model version that did not exhibit this severe bias, even if it's slightly less performant. This is a stop-gap measure.
    - **A/B Testing:** Simultaneously, begin fine-tuning the current LLM with a new dataset curated to correct the political bias. Deploy this new model candidate to a small percentage of users (e.g., 1%) in an A/B test. Monitor its flagging behavior on the target content and ensure it doesn't introduce new biases. Iterate until the fairness metrics are acceptable, then gradually roll it out.
    - **Managing Technical Debt:** Document this incident as a form of ML technical debt. The root cause was likely a flaw in the data curation or testing process. Create a backlog task to build a more robust, automated "fairness test suite" that must be passed before any future model can be deployed through the CI/CD pipeline.

2.  **Phase 2: Address Robustness (Next Sprint)**
    - **Adversarial Defenses:** While the fairness fix is being rolled out, the research/engineering team will begin developing defenses for the multimodal attack. This involves sourcing or generating training data of images with embedded text and implementing techniques like multimodal fusion models that can analyze both image and text content simultaneously.
    - **CI/CD & A/B Testing:** Once a candidate defense is ready, integrate it into the now-fairer model from Phase 1. Deploy this new "fair and robust" model via the same A/B testing framework. Test specifically for regressions in fairness while evaluating its effectiveness against the adversarial examples.

**Risk Management of De-prioritized Problem:**
During Phase 1, the platform remains vulnerable to the multimodal attack. This risk is managed by:
- **Active Monitoring:** Implementing enhanced monitoring to specifically detect a sudden rise in this new attack pattern. An anomaly detection system can flag if a large number of images containing text start evading moderation.
- **Human-in-the-Loop:** Temporarily routing a higher percentage of suspicious content (e.g., images with any detectable text) to human moderators as a fallback defense, accepting a temporary increase in operational cost to manage the short-term risk.