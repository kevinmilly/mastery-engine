## Exercises

**Exercise 1**
A social media company wants to train a personalized content recommendation model. They are considering two approaches:
1.  **Centralized:** Collect user interaction data (likes, shares, time spent) on a central server and train a single large model.
2.  **Federated:** Train the model directly on users' devices using their local data, sending only model updates to a central server.

Describe the primary privacy risk inherent in the centralized approach that is directly mitigated by the federated learning approach. Be specific about the type of data and where it is exposed.

**Exercise 2**
A hospital consortium uses federated learning to train a diagnostic model on patient records. The process involves each hospital training a model on its local data and sending the calculated gradients back to a central server for aggregation. A security analyst points out that even without access to the raw patient records, an attacker who compromises the central server could potentially re-identify individual patient data from the submitted gradients. What is this type of attack called, and how does incorporating Differential Privacy into the process help mitigate this specific threat?

**Exercise 3**
You are designing a federated learning system to develop a predictive maintenance model for a fleet of vehicles from two different logistics companies.
- **Company A:** Operates a fleet of 1,000 long-haul trucks that drive primarily on highways in warm, dry climates. Their data is abundant.
- **Company B:** Operates a fleet of 200 delivery vans that drive in a dense, urban environment with frequent stops and cold, wet weather. Their data is less plentiful but represents a different operational domain.

If you use the standard Federated Averaging (FedAvg) algorithm, where updates are averaged based on the amount of data each client has, what is the likely negative consequence for the final global model's performance, especially for Company B? Propose a simple modification to the server-side aggregation strategy to counteract this issue.

**Exercise 4**
A financial services company is building a federated learning system to detect fraudulent transactions across several partner banks. They are concerned about a malicious actor on the central server inspecting the model updates sent by each bank. They are evaluating two cryptographic techniques to prevent this: Secure Aggregation and Homomorphic Encryption.

Compare these two techniques by explaining:
a) The specific capability each technique grants the server during the aggregation process.
b) The primary technical trade-off (e.g., in terms of computation, communication, or implementation complexity) associated with choosing one over the other.

**Exercise 5**
You are the lead engineer for a federated learning system that improves spam filters on a popular email client installed on millions of devices. The system is vulnerable to a model poisoning attack where malicious clients intentionally send corrupted model updates to degrade the global spam filter, causing it to misclassify spam as legitimate email.

Drawing on your knowledge of Adversarial Attacks and Defenses, propose a two-part defense mechanism to be implemented on the central server.
1.  **Detection:** A method to identify and filter potentially malicious updates before they are aggregated.
2.  **Robust Aggregation:** A change to the aggregation algorithm itself to reduce the influence of any malicious updates that slip past the detection phase.

**Exercise 6**
Your team manages a large-scale federated learning system that retrains a language model for a smartphone keyboard every night. As the MLOps engineer, you are responsible for the CI/CD pipeline that deploys the newly aggregated global model to all users. A key risk is deploying a poorly performing model that results in a bad user experience (e.g., worse predictions).

Design a safe deployment strategy for the new global model that integrates the principles of Canary Releases. Describe the steps involved, from the moment a new global model is aggregated to the point it's fully rolled out. Specify a key business or performance metric you would monitor to make the final "go/no-go" decision.

---

## Answer Key

**Answer 1**
The primary privacy risk in the centralized approach is the exposure of raw user data. To train the model, the company must collect and store all user interaction data—every like, share, and view—on its central servers. This creates a single, high-value target for data breaches. If compromised, the attacker gains access to the sensitive behavioral data of all users.

The federated learning approach directly mitigates this risk by ensuring that this raw, user-specific data never leaves the user's device. The model is trained locally, and only the resulting abstract mathematical updates (gradients or weights) are sent to the server. This prevents the creation of a central data repository, thus protecting against the mass exposure of raw user activity data.

**Answer 2**
The attack the analyst is worried about is a **model inversion** or **reconstruction attack**. Even though gradients are not raw data, they contain detailed information about the data used to calculate them. With a sophisticated attack, one could analyze these gradients to reconstruct or infer sensitive features from the training data, such as specific details of a patient's medical record.

Incorporating **Differential Privacy (DP)** helps mitigate this by adding precisely calibrated statistical noise to the gradients on the client's device before they are sent to the server. This noise masks the contribution of any single data point (e.g., one patient's record), making it mathematically difficult, if not impossible, for an attacker to reliably reconstruct the original data from the update. It provides a formal privacy guarantee that the presence or absence of a single individual in the dataset has a negligible effect on the output.

**Answer 3**
The likely negative consequence is that the final global model will be heavily biased towards the operational conditions of Company A. Since FedAvg weights client contributions by data volume, Company A's 1,000 trucks will dominate the aggregation process. The model will become highly specialized for highway driving in warm climates and will perform poorly for Company B's urban, stop-and-go, cold-weather conditions. This is a classic non-IID (Not Independent and Identically Distributed) data problem, specifically domain shift.

A proposed modification is to switch from data-size-based averaging to a **uniform or balanced averaging** strategy. Instead of weighting Company A's update by `1000 / 1200` and Company B's by `200 / 1200`, the server would treat both clients more equally, for instance, by averaging their model updates with a 50/50 weight. This ensures that the unique and valuable data from Company B's different operational domain is not drowned out, leading to a more robust and generalizable final model.

**Answer 4**
a) **Server Capability:**
- **Secure Aggregation:** This technique allows the server to see only the final, summed-up result of all client updates. The server learns the aggregate gradient but cannot inspect any individual bank's contribution. It is a specialized protocol for computing a sum securely.
- **Homomorphic Encryption (HE):** This is a more general technique. It allows the server to perform mathematical operations (like addition for aggregation) directly on encrypted data without ever decrypting it. The server receives encrypted updates from each bank, computes the encrypted sum, and still has an encrypted result. It never sees the updates in plaintext, not even the final sum.

b) **Primary Technical Trade-off:**
- **Secure Aggregation:** The primary trade-offs are increased communication overhead and protocol complexity. It requires multiple communication rounds between clients and the server to coordinate the secure summation, which can be a bottleneck and fragile if clients drop out. However, its computational overhead is generally lower than full HE.
- **Homomorphic Encryption:** The primary trade-off is extremely high computational overhead. Performing calculations on encrypted data is orders of magnitude slower than on plaintext data. This makes it impractical for complex models or large-scale federated learning systems today, despite its strong security properties.

**Answer 5**
This requires a defense-in-depth strategy at the server.

1.  **Detection:** Before aggregation, the server can implement an anomaly detection system on the incoming model updates. A practical method is to calculate the **cosine similarity** between each incoming update vector and the current global model's weight vector (or an average of recent updates). Updates that are vastly different (low similarity or pointing in an opposite direction) are likely malicious and can be rejected or flagged for inspection. Another check could be on the magnitude (L2 norm) of the update vector, rejecting those that are unusually large.

2.  **Robust Aggregation:** To protect against malicious updates that pass the detection phase, the aggregation algorithm can be made more robust. Instead of using Federated Averaging (which is sensitive to outliers), we can use a **robust aggregator like Federated Median or a Trimmed Mean**.
    - **Federated Median:** For each weight in the model, the server would compute the median of all client updates for that weight, rather than the mean. The median is naturally resistant to extreme outliers.
    - **Trimmed Mean:** The server would discard a certain percentage of the highest and lowest update values for each weight before calculating the mean. This effectively ignores the most extreme (and likely malicious) updates.

**Answer 6**
A safe deployment strategy would integrate a Canary Release workflow into the federated learning cycle.

**Steps:**
1.  **Aggregation and Validation:** The central server aggregates the client updates to produce the new global model candidate (let's call it `v2`). This model passes basic automated sanity checks (e.g., loss on a holdout validation set).
2.  **Canary Group Selection:** Instead of deploying `v2` to all users, the server pushes it to a small, predefined subset of the user base, the "canary group" (e.g., 1% of active users). The remaining 99% (the "control group") continue to use the current production model (`v1`).
3.  **Modified FL Round:** For the next training round (e.g., the next 24 hours), the server instructs the canary devices to start training from `v2`, while the control group starts from `v1`. Both groups will perform local training and inference.
4.  **Metric Monitoring:** During this period, the system must monitor key metrics from both the canary and control groups. The crucial metric to watch would be **user engagement with the keyboard's predictions**, such as the **word prediction Click-Through Rate (CTR)** or **autocompletion acceptance rate**. A secondary metric could be the local model's performance (e.g., accuracy or perplexity) reported back from the devices.
5.  **Go/No-Go Decision:** At the end of the monitoring period, the performance of the canary group is compared to the control group.
    - **Go:** If the canary group shows a statistically significant improvement or at least no degradation in the key metric (e.g., higher CTR), `v2` is deemed safe and effective. It is then promoted to be the new production model (`v1` for the next cycle) and rolled out to 100% of users.
    - **No-Go:** If the canary group shows a performance drop, `v2` is discarded. The canary group is reverted to using `v1`, and the engineering team investigates the failure. The system avoids a full-scale negative impact.