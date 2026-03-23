## Exercises

**Exercise 1**
A bank is developing a system to predict whether a credit card transaction is fraudulent. They have two models in final consideration:
*   **Model A (Deep Neural Network):** Achieves 99.8% accuracy. Its predictions are based on complex, non-linear interactions between hundreds of features, making it a "black box."
*   **Model B (Isolation Forest):** Achieves 99.2% accuracy. It identifies anomalies by isolating observations, and the path to isolation for any given transaction can be traced and understood by an analyst.
Given that the system will automatically block transactions flagged as fraudulent, which can be highly disruptive for customers, which model is the better choice? Justify your decision based on the primary tradeoff involved.

**Exercise 2**
A team is building a feature for a smartphone camera app that suggests optimal camera settings (ISO, shutter speed, aperture) based on analyzing the live viewfinder image. The model must run entirely on the device in real-time. The team has prototyped two architectures:
*   **Architecture 1:** A large, custom Convolutional Neural Network (CNN) trained from scratch. It provides highly tailored suggestions but has an inference time of 250ms and occupies 150MB of storage.
*   **Architecture 2:** A MobileNetV3 model, pre-trained on ImageNet and fine-tuned for the task. It is slightly less accurate for niche lighting conditions, has an inference time of 30ms, and occupies 15MB.
Which architecture should the team select for production? Explain your reasoning by evaluating the tradeoffs in the context of the product's requirements.

**Exercise 3**
A city's traffic management authority uses a predictive model to adjust traffic light timings, aiming to reduce overall commuter travel time. The current model is a statistical time-series model (ARIMA) that is computationally cheap but does not account for non-recurring events like accidents or public holidays. A new proposal suggests replacing it with a Graph Neural Network (GNN) that models the entire road network. The GNN is projected to improve traffic flow by 10-15% on average but requires a cluster of high-end GPUs for real-time processing, a significant increase in operational cost. As the lead engineer, what specific data and metrics would you need to collect and analyze to make a sound decision on whether to adopt the GNN?

**Exercise 4**
An agricultural technology company provides a service that analyzes drone imagery to detect early signs of crop disease. Their current system uses a ResNet-152 model, which is highly accurate but was trained on a dataset primarily from North American farms. They are planning to expand their services to Southeast Asia, where crop types, farming practices, and disease manifestations differ significantly. They have a small, newly collected dataset from the new region. Simply retraining the existing large model on this small dataset leads to severe overfitting. What is a more appropriate modeling strategy to adapt to this new market, and what tradeoffs does this strategy entail compared to their current approach?

**Exercise 5**
A financial services company is mandated by a new regulation to provide an "Adverse Action Notice" to any customer denied a loan, detailing the principal reasons for the decision. Their existing loan approval model is a highly accurate ensemble of gradient-boosted trees that consistently outperforms simpler models but is difficult to interpret directly. The ML Ops team is concerned that swapping this model for a simpler, interpretable one (like logistic regression) would harm business metrics and require a complete overhaul of their CI/CD pipeline, which is optimized for XGBoost models. Propose a solution that balances regulatory compliance, model performance, and operational efficiency. Your solution must integrate concepts from Model Explainability (XAI).

**Exercise 6**
A major online streaming service wants to build a "proactive churn prediction" system to identify users at risk of canceling their subscription. The goal is to offer them targeted promotions.
*   **Initial Proposal:** A real-time system using a large Recurrent Neural Network (RNN) that processes every user interaction (play, pause, search, etc.) to generate an up-to-the-minute churn risk score. This offers maximum accuracy and timeliness.
*   **Constraint:** The engineering leadership has determined that the computational cost of deploying this real-time RNN for 100 million active users is prohibitively expensive and would overload the data streaming infrastructure.

Design a more practical, multi-phased system architecture that balances cost, performance, and scalability. Describe how your architecture represents a deliberate choice in managing technical debt and how you would use A/B testing to validate your approach over time.

---

## Answer Key

**Answer 1**
**Model B (Isolation Forest) is the better choice.**

*   **Reasoning:** The primary tradeoff here is between raw accuracy and interpretability/fairness. While the DNN is slightly more accurate, the cost of a false positive (incorrectly blocking a legitimate transaction) is very high for the customer experience. Because Model B's decisions can be traced and explained, the bank can:
    1.  Have human analysts quickly verify suspicious flags before blocking, reducing false positives.
    2.  Provide clear reasons to customers who call to inquire about a blocked transaction, improving customer service.
    3.  Audit the model for biases more easily than the "black box" DNN.
    In a high-stakes, customer-facing system, the small loss in accuracy is a worthwhile price for the significant gains in transparency, trust, and operational oversight.

**Answer 2**
**Architecture 2 (fine-tuned MobileNetV3) is the clear choice.**

*   **Reasoning:** The key constraints are real-time performance and on-device deployment.
    1.  **Computational Cost (Latency):** An inference time of 250ms (Architecture 1) is far too slow for a real-time camera application. It would create noticeable lag, making the feature feel unresponsive. The 30ms latency of Architecture 2 is well within the acceptable range for a smooth user experience.
    2.  **Computational Cost (Resource Footprint):** A 150MB model (Architecture 1) is a significant storage and memory burden for a mobile app, potentially discouraging downloads or causing the app to be terminated by the OS on lower-end devices. The 15MB footprint of Architecture 2 is much more practical.
    The marginal accuracy loss of Architecture 2 is a necessary tradeoff to meet the critical non-functional requirements of low latency and a small footprint for this use case.

**Answer 3**
To make a sound decision, I would need to analyze the cost-benefit tradeoff. This requires collecting the following:

*   **Performance Metrics:**
    *   **Baseline:** Establish a precise baseline of the current ARIMA model's performance (e.g., average commute time, vehicle throughput at key intersections) over a representative period.
    *   **Simulation/Pilot Data:** Run the GNN model in a sandboxed simulation using historical data, or as a pilot project in a small, isolated section of the city. This would validate the projected 10-15% improvement.
    *   **Edge Case Performance:** Analyze how both models perform during non-recurring events (using historical data of accidents, holidays, etc.). The GNN's primary advantage is likely here, so this must be quantified.

*   **Cost Metrics:**
    *   **Total Cost of Ownership (TCO):** Calculate the full TCO for the GNN, including GPU hardware acquisition/leasing, electricity, cooling, and maintenance personnel.
    *   **Cost per Commuter-Minute Saved:** Frame the analysis in business terms. For example: "The GNN will cost an additional $500,000/year but is projected to save 2 million commuter-hours annually. Is this a worthwhile public investment?"

*   **Operational Metrics:**
    *   **Robustness & Latency:** Measure the GNN's inference latency and reliability. Can it consistently provide new timings within the required interval, even under heavy load?
    *   **Maintainability:** Assess the complexity of maintaining the GNN system versus the simpler ARIMA model.

The decision hinges on whether the quantified economic and social benefit of reduced congestion outweighs the significantly higher TCO of the GNN.

**Answer 4**
The most appropriate strategy is **Transfer Learning with Fine-Tuning**.

*   **Strategy Description:** Instead of retraining the entire ResNet-152 model from scratch, the team should use the existing model with its weights pre-trained on the large North American dataset. They would then "freeze" the early convolutional layers (which have learned general features like edges, textures, and colors) and retrain only the final, deeper layers on the new, smaller Southeast Asian dataset. This allows the model to leverage the vast knowledge from the original dataset while adapting its more specialized, task-specific layers to the new data.

*   **Tradeoffs:**
    *   **Data Availability vs. Performance:** This approach is highly effective with smaller datasets where training a large model from scratch is infeasible. It avoids the overfitting seen in their initial attempt. The tradeoff is that performance may not reach the same level as a model trained on a massive, region-specific dataset, but it is a vast improvement over the poorly-performing overfitted model.
    *   **Computational Cost:** Fine-tuning only the top layers is significantly faster and cheaper than retraining the entire network, reducing the time and cost required to enter the new market.
    *   **Generalization vs. Specialization:** The model becomes specialized for the new region. This means the company will likely need to maintain separate model "heads" (the unfrozen, retrained layers) for each geographic market, adding a small amount of architectural complexity.

**Answer 5**
The optimal solution is to **keep the high-performance ensemble model and implement a post-hoc explainer from the XAI toolkit.**

*   **Reasoning:** This approach balances all three constraints:
    1.  **Regulatory Compliance:** By integrating a tool like **SHAP (SHapley Additive exPlanations)** or **LIME (Local Interpretable Model-agnostic Explanations)** into the prediction pipeline, they can generate on-demand explanations for each individual loan decision. For any denied application, they can produce a report showing the top features that contributed negatively to the outcome (e.g., "high debt-to-income ratio," "short credit history"). This report directly fulfills the "Adverse Action Notice" requirement.
    2.  **Model Performance:** The company does not need to sacrifice the accuracy of its existing, well-performing model. They avoid the business risk of deploying a less accurate but more interpretable model.
    3.  **Operational Efficiency:** The core prediction model and its CI/CD pipeline can remain largely unchanged. The work involves adding a new step to the inference service: after a prediction is made, it is passed to the SHAP/LIME library to generate the explanation. This is an additive change rather than a disruptive replacement.

This solution presents a practical tradeoff: it adds a small amount of computational overhead for generating explanations in exchange for maintaining performance and satisfying legal requirements without a major engineering overhaul.

**Answer 6**
A practical, multi-phased architecture would be a **hybrid batch-and-stream system that manages cost and complexity over time.**

*   **Phase 1: Batch-based MVP (Managing Technical Debt)**
    *   **Architecture:** Instead of a real-time RNN, start with a simpler gradient boosting model (e.g., LightGBM) that runs daily as a batch job. It would use aggregated user features from the past 24-48 hours (e.g., session count, time watched, search frequency).
    *   **Tradeoff:** This is a deliberate acceptance of **technical debt**. The model is less accurate and not real-time, but it is vastly cheaper to build and operate, allowing the service to launch quickly and validate the business case for proactive intervention. It avoids the massive initial investment in streaming infrastructure and expensive models.
    *   **Scalability:** This batch architecture scales easily by adding more nodes to the daily processing cluster, a well-understood paradigm.

*   **Phase 2: Hybrid Model with Canary/A/B Testing**
    *   **Architecture:** Introduce the more complex RNN model, but only for a small segment of users. Use this as a "smart trigger" for the batch model.
        *   **A/B Test:** Route 95% of users to the batch model (Control Group A) and 5% to the new real-time RNN (Treatment Group B). Measure the uplift in user retention from the more timely interventions of Group B against its much higher operational cost. This provides the data needed to justify a wider rollout.
        *   **Canary Deployment:** Alternatively, deploy the RNN to a small user cohort (e.g., new sign-ups in a specific country) to monitor its performance and cost in a live environment before expanding.

*   **Phase 3: Mature, Tiered System**
    *   **Architecture:** Based on the results of Phase 2, develop a tiered system. For example, the cheap batch model could run on all users to identify a "potentially at-risk" cohort. The expensive, real-time RNN model would then *only* be activated for users within this smaller cohort, providing high-accuracy monitoring where it's most needed.
    *   **Scalability & Cost Management:** This tiered approach solves the scalability problem. Instead of running the expensive model on 100 million users, it might only run on the 5 million identified as being at-risk, making the solution financially viable while still capturing most of the benefit. This strategy effectively pays down the initial technical debt by incrementally building a more sophisticated and cost-effective final system.