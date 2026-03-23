## Exercises

**Exercise 1**
A team is building its first automated training pipeline. Below are the core steps they've identified. Arrange these steps into a logical sequence that represents a standard automated pipeline, starting from new data being available.

*   A. Evaluate model performance on a test set.
*   B. Ingest and preprocess the new dataset.
*   C. Version and register the trained model if it meets performance criteria.
*   D. Train the model on the preprocessed data.

**Exercise 2**
A data scientist manually trained a sentiment analysis model. For preprocessing, they converted all text to lowercase. Six months later, they retrained the model on new data but forgot this step. When the new model was deployed, its accuracy was significantly lower. Explain specifically how an automated ML pipeline would have prevented this exact issue.

**Exercise 3**
A financial institution has an automated pipeline for a loan approval model. The pipeline is: Data Ingestion -> Feature Engineering -> Model Training -> Model Evaluation. A new regulatory requirement mandates that before any new model version is deployed, it must be audited to ensure it doesn't exhibit significant bias against protected demographic groups. Where should a new "Bias Audit" step be inserted into the pipeline, and why is that the most logical location?

**Exercise 4**
An e-commerce company has an MLOps pipeline that automatically retrains their product recommendation model every night using the previous day's user interaction data. For the first few months, this worked well. Now, the operations team reports that the model's recommendation quality is slowly but consistently decreasing, even though the pipeline runs successfully every night. What critical MLOps concept is most likely missing from the beginning of their pipeline that could help diagnose or prevent this problem?

**Exercise 5**
A team is designing an automated retraining pipeline for a model that predicts manufacturing defects on a factory floor. They are debating two different triggers to automatically start the pipeline:

1.  **Schedule-based Trigger:** Run the pipeline at the end of every week.
2.  **Monitoring-based Trigger:** Run the pipeline only when a data drift monitor detects a significant change in the sensor readings from the factory machines.

Analyze the primary trade-off between these two triggering strategies for this specific use case.

**Exercise 6**
You are designing a complete, end-to-end automated ML pipeline for a house price prediction service. The pipeline should be triggered by a code change in the project's Git repository. It must handle everything from data preparation to deploying the model as a containerized API endpoint.

Drawing on concepts from prior topics, list at least six essential stages of this pipeline in order. For each stage, name the key prior concept that enables it.

---

## Answer Key

**Answer 1**
The correct logical sequence is **B -> D -> A -> C**.

*   **Reasoning:**
    1.  **B. Ingest and preprocess the new dataset:** You cannot train a model on raw data. Ingestion and preprocessing must happen first to clean, format, and transform the data into features.
    2.  **D. Train the model on the preprocessed data:** The model is trained using the features generated in the previous step.
    3.  **A. Evaluate model performance on a test set:** Before deciding if the model is good, you must objectively measure its performance on unseen data.
    4.  **C. Version and register the trained model if it meets performance criteria:** Only if the model's evaluation meets a predefined threshold (e.g., accuracy > 90%) should it be saved and versioned for potential deployment. This prevents bad models from being promoted.

**Answer 2**
An automated ML pipeline would have prevented this by codifying the preprocessing steps into a reusable, automated script or component.

*   **Reasoning:** In an automated pipeline, the step "convert all text to lowercase" would be a line of code in the preprocessing script. This script would be version-controlled and automatically executed every single time the pipeline runs. This removes the possibility of human error or forgetfulness. The pipeline ensures that the exact same transformations applied to the original training data are applied to all future retraining data, guaranteeing consistency and reproducibility.

**Answer 3**
The "Bias Audit" step should be inserted **after "Model Evaluation" but before any potential deployment step.**

*   **Reasoning:**
    1.  You must have a fully trained and evaluated model artifact before you can audit it for bias. The audit checks the *behavior* of the trained model, so it must logically follow the training and initial performance evaluation steps.
    2.  The audit must occur *before* the model is registered or deployed. The purpose of the audit is to act as a gate. If the model is found to be biased, it should be prevented from moving further in the pipeline and becoming a candidate for production use.

**Answer 4**
The most likely missing concept is **Data Validation and Schema Enforcement** at the beginning of the pipeline.

*   **Reasoning:** The pipeline is "blindly" retraining on new data. The decreasing performance suggests that the incoming data's statistical properties (distribution, range, etc.) might be changing over time (concept drift), or its structure (schema) might be changing (e.g., a data source was changed, leading to null values or different encodings). A dedicated data validation step would automatically check each new batch of data against a predefined schema and expected statistical properties. This would flag data quality issues or drift, preventing the model from training on corrupted or fundamentally different data and alerting the team to the underlying problem.

**Answer 5**
The primary trade-off is between **Proactive Consistency (Schedule-based) and Reactive Efficiency (Monitoring-based).**

*   **Schedule-based Trigger:**
    *   **Pro:** It's simple to implement and predictable. The model is guaranteed to be refreshed with the latest week's data, capturing gradual changes. This ensures the model is never too "stale."
    *   **Con:** It can be inefficient. If the manufacturing process and sensor data are stable, the pipeline might run and retrain a new model that is functionally identical to the old one, wasting computational resources. It also might be too slow to react to a sudden, critical change in the middle of the week.
*   **Monitoring-based Trigger:**
    *   **Pro:** It's highly efficient. It only consumes resources when retraining is actually needed because the data has fundamentally changed. This allows for a rapid response to sudden events (e.g., a new raw material batch, a machine recalibration) that could immediately impact defect patterns.
    *   **Con:** It's more complex. It requires setting up and maintaining a robust drift detection system. If the monitor is too sensitive, it will trigger unnecessary runs; if it's not sensitive enough, it may miss important changes.

**Answer 6**
Here is a sequence of six essential stages for the house price prediction pipeline, connecting each to a prior concept:

1.  **Data Validation:** Checks the incoming housing data for schema errors and statistical drift.
    *   *Enabling Concept:* **Data Ingestion and Preprocessing Pipelines.**
2.  **Model Training:** Trains the regression model on the validated data, possibly using a predefined set of optimal parameters.
    *   *Enabling Concept:* **Model Training Workflows** (and **Hyperparameter Tuning Strategies** for finding the parameters initially).
3.  **Model Evaluation:** Scores the trained model on a hold-out test set using metrics like Mean Absolute Error (MAE).
    *   *Enabling Concept:* **Dataset Splitting and Cross-Validation.**
4.  **Model Versioning:** If the new model's MAE is better than the current production model, it is saved, tagged with a version number (e.g., Git commit hash), and stored in a model registry.
    *   *Enabling Concept:* **Model Persistence and Versioning.**
5.  **Containerization:** The versioned model and its serving code are packaged into a standardized, portable Docker image.
    *   *Enabling Concept:* **Containerization for AI Applications (e.g., Docker).**
6.  **Automated Deployment:** The new Docker image is automatically deployed to a serving environment, replacing the old model endpoint.
    *   *Enabling Concept:* **RESTful APIs for Model Serving.**
7.  **(Bonus) Post-Deployment Monitoring:** The live endpoint is monitored for prediction latency, traffic, and potential drift in incoming prediction requests.
    *   *Enabling Concept:* **Monitoring Deployed Models: Drift Detection.**