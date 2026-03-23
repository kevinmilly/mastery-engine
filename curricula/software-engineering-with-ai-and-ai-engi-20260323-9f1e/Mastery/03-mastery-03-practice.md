## Exercises

**Exercise 1**
A security researcher is probing a commercial AI-powered service that detects fraudulent financial transactions. The researcher has only API access to the service; they can submit transaction data and receive a "fraudulent" or "legitimate" score. They have no information about the model's architecture, parameters, or training data. After thousands of queries, they successfully craft a slightly modified but fraudulent transaction that the system classifies as legitimate.

Classify this attack as either white-box or black-box. Justify your classification and describe one common technique the researcher might have used to generate this example.

**Exercise 2**
An original image pixel is represented by the normalized RGB values (0.8, 0.4, 0.2). To create an adversarial example, an attacker perturbs this pixel to (0.85, 0.38, 0.23).

Calculate the L-infinity (L∞) norm and the L2 norm of the perturbation vector. Explain what each of these norms represents in the context of an adversarial attack's perceptibility.

**Exercise 3**
A company develops a voice assistant that uses a deep learning model to identify a "wake word" (e.g., "Hey, Assistant"). To secure it against adversarial audio attacks, they perform adversarial training. Their process involves generating attacks using only the Fast Gradient Sign Method (FGSM), as it is computationally cheap. After deployment, they find that their system is still highly vulnerable to more complex, iterative attacks like PGD (Projected Gradient Descent).

Explain the fundamental flaw in their defensive strategy. Why did defending against one type of attack leave the model vulnerable to another?

**Exercise 4**
You are designing an AI system for a social media platform to automatically flag and remove hate speech. You must choose between two defense strategies against adversarial text attacks (e.g., misspelling "hateful" as "h8ful" or using synonyms to evade detection):

*   **Strategy A (Reactive):** Deploy a high-performance standard model. Log all user reports of missed hate speech, and use this data to continuously retrain and patch the model every week.
*   **Strategy B (Proactive):** Implement a robust adversarial training regimen before deployment. This makes the model more resilient to unseen attacks but slightly increases its false positive rate (i.e., it may occasionally flag non-hate speech as hateful) and requires significantly more upfront computational cost.

Which strategy would you choose? Justify your decision by analyzing the trade-offs in the context of this specific application, considering factors like platform safety, user experience, and operational cost.

**Exercise 5**
A large e-commerce company is deploying a recommendation engine that uses a sophisticated Graph Neural Network (GNN). The company is concerned about data poisoning attacks, where a malicious user could add fake user profiles and interactions to the training data to manipulate future recommendations for targeted users. They need to design a defense.

Integrating your knowledge of **Designing for Scalability in AI Systems**, propose a defense strategy that is both effective against data poisoning and scalable to millions of users and interactions. Your proposal should address how you would detect and mitigate the influence of poisoned data points during the training or data ingestion phase, keeping computational overhead in mind.

**Exercise 6**
A medical imaging AI, designed to detect pneumonia from chest X-rays, correctly classifies an image as "pneumonia present." An attacker creates an adversarial version of the same image that the model confidently misclassifies as "normal." A hospital safety officer, using an XAI tool like SHAP (SHapley Additive exPlanations), generates explanations for both predictions.

*   The explanation for the original image highlights biologically relevant areas in the lungs.
*   The explanation for the adversarial image highlights a dispersed, faint, and noisy pattern of pixels scattered across the image, which have no medical relevance.

How can the safety officer use this comparative XAI analysis to (a) build a compelling case that this was a malicious adversarial attack, not a standard model error, and (b) propose a specific improvement to the model's training or validation process to make it more robust in the future?

---

## Answer Key

**Answer 1**
This is a **black-box** attack.

**Reasoning:**
The key distinction between black-box and white-box attacks is the attacker's knowledge of the model. In this scenario, the researcher has no access to the model's internal workings (architecture, parameters, gradients). They are limited to observing the input-output behavior of the model via its API.

A likely technique used is a **query-based or transfer-based attack**. For example, the researcher could have employed a **score-based attack**. They would start with a known fraudulent transaction and make tiny, systematic changes, querying the API after each change. By observing how the "fraudulent" score changes, they can approximate the model's decision boundary and "walk" the data point across it until it is misclassified as legitimate, without ever seeing the model's gradient.

**Answer 2**
First, calculate the perturbation vector `δ` by subtracting the original pixel values from the adversarial ones:
`δ = (0.85 - 0.8, 0.38 - 0.4, 0.23 - 0.2) = (0.05, -0.02, 0.03)`

**L-infinity (L∞) Norm:**
The L∞ norm is the maximum absolute value of the elements in the vector.
`L∞(δ) = max(|0.05|, |-0.02|, |0.03|) = 0.05`

**L2 Norm:**
The L2 norm is the square root of the sum of the squared elements (Euclidean distance).
`L2(δ) = sqrt(0.05² + (-0.02)² + 0.03²) = sqrt(0.0025 + 0.0004 + 0.0009) = sqrt(0.0038) ≈ 0.0616`

**Explanation of Norms:**
*   **L-infinity norm** represents the largest change made to any single feature (in this case, any single R, G, or B value). It is often used to create "imperceptible" attacks because it constrains the most extreme perturbation, ensuring no single pixel channel is altered too drastically.
*   **L2 norm** represents the overall magnitude or Euclidean distance of the perturbation. It measures the total amount of change added to the pixel. While L2 also helps control perceptibility, an attack with a small L2 norm could still have a large L∞ norm if all the change is concentrated in one feature.

**Answer 3**
The fundamental flaw in their defensive strategy is its **lack of diversity**. They have only defended against a single, non-iterative, and relatively weak attack method (FGSM). This is analogous to reinforcing a door with a single lock while leaving the windows wide open.

**Reasoning:**
Adversarial attacks exist in a wide spectrum of complexity. FGSM is a "single-step" method that calculates the gradient once and moves the input in that direction. More powerful, iterative methods like PGD (Projected Gradient Descent) take multiple small steps, projecting the result back into a valid range after each step. This allows PGD to find the decision boundary more effectively and create more potent adversarial examples.

By only training on FGSM examples, the model learned a defense that was overfitted to that specific attack's characteristics. It did not learn to be robust against the more general class of gradient-based attacks that iterative methods represent. A robust defense requires adversarial training with a diverse set of strong attacks to prevent such vulnerabilities.

**Answer 4**
While both strategies have merit, **Strategy B (Proactive)** is the superior choice for a hate speech detection system.

**Reasoning & Trade-off Analysis:**
1.  **Platform Safety and Harm:** The primary goal is to protect users from harm. A reactive strategy (A) inherently allows adversarial hate speech to exist on the platform, potentially for days, until it is reported and used for retraining. This "harm-first, patch-later" approach is unacceptable for a critical safety system. The proactive strategy (B) minimizes the initial harm by making the model resilient from the start.
2.  **User Experience:** While Strategy B might have a slightly higher false positive rate, this is often a more acceptable trade-off in content moderation. Incorrectly flagging a benign comment can be appealed and corrected, and while annoying, it is less harmful than failing to remove targeted harassment or hate speech. The experience of the targeted user is prioritized over the minor inconvenience of the user whose post was incorrectly flagged.
3.  **Operational Cost and Scalability:** Strategy A seems cheaper initially but creates a constant, reactive operational cycle. It relies on user labor (reporting) and creates an unending "cat-and-mouse" game for the engineering team. Strategy B requires a large upfront investment in computation but results in a more stable, secure baseline model, reducing the frequency and urgency of reactive patching.

In summary, for a system where failures can cause significant social harm, the robustness and proactive safety provided by adversarial training outweigh the increased upfront cost and slightly higher false positive rate.

**Answer 5**
A scalable and effective defense strategy against data poisoning in a GNN-based recommendation engine would be **anomaly detection during data ingestion combined with robust aggregation methods during training.**

**Integration with Scalability:**
1.  **Scalable Anomaly Detection:** Instead of analyzing the entire graph structure at once (which is computationally expensive), we can implement a scalable, streaming anomaly detection system. As new users or interactions are added, we analyze their local graph properties in near real-time.
    *   **Metrics:** We can calculate metrics like the user's degree distribution (are they interacting with an unusually high number of items in a short time?), clustering coefficient, or the "trustworthiness" of their neighbors.
    *   **Technique:** Use lightweight models like Isolation Forests or autoencoders on feature vectors derived from these metrics. These can process massive amounts of data with low latency. Suspicious nodes/edges can be flagged for down-weighting or manual review rather than being immediately incorporated into the main training set. This avoids costly full-graph analysis.
2.  **Robust Aggregation in GNN Training:** The core of a GNN is the aggregation function where a node gathers information from its neighbors. Standard aggregators like `mean` or `sum` are highly susceptible to outlier nodes (poisoned data).
    *   **Scalable Solution:** We can replace the standard aggregator with a more robust, yet still scalable, alternative. For example, using a **trimmed mean** or **median** aggregator. These functions are more resilient to a few malicious neighbors with extreme feature values. While slightly more computationally intensive than a simple mean, they are parallelizable and offer a strong defense without compromising the overall scalability of the GNN training process on large graphs.

This two-pronged approach addresses the problem at both the data and model level, respecting the scalability constraints of a large e-commerce platform.

**Answer 6**
The safety officer can leverage the comparative XAI analysis to build a strong case for a malicious attack and to inform a robust defense strategy.

**(a) Proving Malicious Attack vs. Standard Error:**
The XAI outputs provide crucial evidence. A standard model error would likely still highlight features that are *plausibly* related to the misclassification, even if incorrect (e.g., mistaking a rib artifact for an infiltrate). However, the SHAP explanation for the adversarial image shows that the model's "normal" prediction is driven by a faint, dispersed pattern of pixels with no anatomical relevance. This is the classic fingerprint of an adversarial attack, which often relies on a high-frequency, human-imperceptible signal distributed across the image. The officer can argue that no competent radiologist or legitimate feature in the image could account for this pattern, making a malicious, gradient-based manipulation the most logical cause.

**(b) Proposing a Robustness Improvement:**
The XAI analysis directly reveals the model's vulnerability: it is overly sensitive to high-frequency, low-magnitude features that are irrelevant to the diagnostic task. This insight leads to a specific improvement proposal:

**Strategy:** Implement **adversarial training with feature-space regularization**.
1.  **Generate Adversarial Examples:** Use strong, iterative attacks (like PGD) to generate adversarial X-rays that fool the current model.
2.  **Augment Training Data:** Add these adversarial examples to the training dataset.
3.  **Incorporate XAI-guided Regularization:** During retraining, add a term to the loss function that penalizes the model if the XAI explanation (e.g., gradient-based saliency map) of its prediction differs significantly between an original image and its adversarial counterpart. The goal is to force the model to rely on the *same robust, medically relevant features* (the lung areas) for both the clean and the adversarial image. This explicitly trains the model to ignore the faint, noisy patterns introduced by the attacker, improving its security and aligning its reasoning with expert knowledge.