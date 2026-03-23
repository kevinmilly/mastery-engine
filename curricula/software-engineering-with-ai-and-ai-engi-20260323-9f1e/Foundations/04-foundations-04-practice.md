## Exercises

**Exercise 1**
An online news platform wants to automatically group its articles into emerging story categories without having a predefined list of topics like "Sports" or "Politics." They have the full text of 10,000 recent articles. Is this a clustering or a classification task? Explain your reasoning.

**Exercise 2**
You are working with a dataset of user activity logs from a mobile app. The dataset has 200 features, including `time_spent_on_screen_A`, `time_spent_on_screen_B`, `taps_on_button_X`, `taps_on_button_Y`, and so on. Many of these features are highly correlated (e.g., users who spend time on screen A also tend to tap button X). You apply dimensionality reduction to reduce the data to 10 principal components. What is the primary goal of this step in relation to the model's performance and the data itself?

**Exercise 3**
A security team runs a clustering algorithm on network traffic data, analyzing packets based on features like `port_number`, `packet_size`, and `protocol_type`. The algorithm identifies three clusters:
- **Cluster 1 (95% of data):** Small packets, using standard web ports (80, 443), various protocols.
- **Cluster 2 (4.9% of data):** Large packets, using file transfer ports (20, 21), FTP protocol.
- **Cluster 3 (0.1% of data):** A very small, dense group of medium-sized packets sent to an unusual, high-numbered port in rapid succession from a single source IP.

Which cluster would you investigate first for a potential security threat, and why?

**Exercise 4**
You are trying to group your company's servers into operational profiles based on two metrics: `CPU_usage` (measured as a percentage, 0-100) and `disk_io_requests` (measured in thousands per second, 5,000-2,000,000). When you run a standard clustering algorithm, the resulting groups seem to be based almost entirely on `disk_io_requests`, while `CPU_usage` is ignored. What is the most likely technical reason for this skewed result?

**Exercise 5**
Imagine you are building a supervised learning model to predict whether a software commit will introduce a bug. Your available features include `number_of_lines_changed`, `files_edited`, and `author_experience_level`. You also have a large history of unlabeled commit data. How could you use dimensionality reduction on the text content of the commit messages (which you aren't currently using) to create a new, powerful feature for your supervised model?

**Exercise 6**
A product manager wants to use machine learning to improve a photo-hosting service. They have two goals: 1) Automatically identify and flag photos containing prohibited content, based on a set of 50,000 already-labeled examples. 2) Discover natural groupings of photos in users' libraries to suggest new album ideas (e.g., "Summer Beach Trips," "City Skylines").

Which task requires a supervised approach and which requires an unsupervised approach? Justify your answer by connecting the problem's requirements to the core strengths of each learning type.

---

## Answer Key

**Answer 1**
This is a **clustering** task.

**Reasoning:** The key factor is that the platform does not have a "predefined list of topics." In a classification task (a supervised method), you need labeled data—in this case, articles that have already been assigned a correct category. Since the goal is to discover *emerging* and *unknown* groups in unlabeled data, clustering is the appropriate unsupervised approach. The algorithm would group articles based on text similarity, and engineers could then inspect the clusters to assign meaningful names to the discovered topics.

**Answer 2**
The primary goal is to **reduce multicollinearity and simplify the model.**

**Reasoning:**
1.  **Reduce Multicollinearity:** With many highly correlated features, the model might struggle to distinguish their individual impacts, leading to instability. Dimensionality reduction techniques like PCA create new, uncorrelated components that capture the most important variance in the data, making the subsequent model more robust.
2.  **Simplify the Model (and potentially speed up training):** Fewer features mean a less complex model. This can reduce the risk of overfitting (where the model learns noise instead of the underlying pattern) and significantly decrease the computational resources and time required to train the prediction model.

**Answer 3**
You should investigate **Cluster 3** first.

**Reasoning:** In anomaly or threat detection, the most interesting findings are often the rare and unusual patterns.
-   **Cluster 1** represents typical, everyday web traffic and is expected "normal" behavior.
-   **Cluster 2** represents file transfers, which is also a standard and legitimate network activity.
-   **Cluster 3**, however, is an outlier. It is very small (0.1% of data), involves an unusual port, and shows a suspicious pattern (rapid succession from one source). This deviation from the norm makes it the most likely candidate for a security issue, such as a port scan, a data exfiltration attempt, or the activity of malware.

**Answer 4**
The most likely reason is that the **features are on vastly different scales.**

**Reasoning:** Many clustering algorithms, like K-Means, are based on calculating distances between data points. The `disk_io_requests` feature has a range in the millions, while `CPU_usage` has a range of 0-100. When calculating distance, the huge numerical values of disk I/O will completely dominate the small values of CPU usage. A change of 50,000 in disk I/O is arithmetically "larger" than a change of 100 in CPU. To fix this, you should apply feature scaling (e.g., standardization or normalization) to bring both metrics to a comparable scale before running the clustering algorithm.

**Answer 5**
You could use dimensionality reduction to perform **feature extraction** from the commit message text.

**Reasoning:**
1.  **Vectorize the Text:** First, convert the raw text of each commit message into a high-dimensional numerical vector (e.g., using TF-IDF or word embeddings). This might result in thousands of features, where each feature represents a word or token.
2.  **Apply Dimensionality Reduction:** A supervised model would likely overfit on thousands of sparse text features. Apply a technique like PCA or LSA (Latent Semantic Analysis) to these vectors to reduce them from thousands of dimensions to a much smaller number (e.g., 50-100).
3.  **Create New Feature:** The resulting lower-dimensional vector for each commit message captures its essential semantic meaning. This vector can now be added as a new, powerful feature to your supervised bug prediction model, alongside the existing features like `lines_changed` and `author_experience_level`.

**Answer 6**
-   **Task 1 (Flagging prohibited content):** This requires a **supervised** approach.
-   **Task 2 (Suggesting new albums):** This requires an **unsupervised** approach.

**Reasoning:**
-   **Task 1** is a classic **classification** problem. The goal is specific and well-defined ("identify prohibited content"), and you have a large dataset of *labeled examples* (50,000 photos already marked as "prohibited" or "not prohibited"). A supervised model can learn the patterns from these labels to make predictions on new, unseen photos.
-   **Task 2** is a classic **clustering** problem. The goal is exploratory—to "discover natural groupings" without a predefined list of album types. The data is unlabeled in this context (you don't know the "correct" album for each photo). An unsupervised clustering algorithm can analyze the visual content of the photos and group similar ones together, revealing themes like "beach," "city," or "pets" that can then be suggested to the user as new albums.