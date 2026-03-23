## Exercises

**Exercise 1**
A data scientist trains a `scikit-learn` model that uses a `StandardScaler` to preprocess input data. They save the trained model object to a file named `model.pkl` using `pickle`. When a colleague tries to load `model.pkl` and use it for prediction on new data, they get significantly worse performance than reported. What is the most likely component missing from the saved artifacts that is causing this issue, and why?

**Exercise 2**
You have trained a PyTorch model for image classification. You need to deploy it to two different environments: a Python-based web server and a C++ application for edge devices. You are considering two persistence formats: Python's `pickle` and the ONNX (Open Neural Network Exchange) format. Which format is more suitable for this deployment scenario, and what specific advantage does it offer over the other?

**Exercise 3**
Your team uses a model versioning scheme like `v2.1.3-a7c3f1b`, where `v2.1.3` is the semantic version and `a7c3f1b` is the Git commit hash of the training script. A customer reports a critical bug in the model's predictions that started appearing yesterday. The currently deployed model is `v2.1.3-a7c3f1b`. The model deployed two days ago was `v2.1.2-f9b0d4e`. How would you use this versioning information to begin your investigation into the root cause of the bug? Describe the first two steps you would take.

**Exercise 4**
A machine learning model was trained and saved using `scikit-learn` version 1.2. The model artifact is stored in an S3 bucket. A year later, a new developer attempts to load this model in a production environment running `scikit-learn` version 1.4. The `joblib.load()` command fails with a cryptic `AttributeError`. What is the most probable cause of this error, and what essential piece of versioned information, if it had been saved with the model, would have prevented this issue?

**Exercise 5**
Your team has just completed a large-scale hyperparameter tuning job for a recommendation model using a grid search over 50 different parameter combinations. Each trial produced a trained model artifact. You need to design a persistence and versioning strategy for these 50 artifacts to ensure you can identify the best-performing model, reproduce its training, and promote it to staging. Describe three key pieces of metadata you would save alongside each model artifact and explain how this metadata helps achieve the stated goals.

**Exercise 6**
A fraud detection model, `v1.2.0`, has been running in production for six months. Monitoring shows its F1-score has degraded by 15% due to data drift. Your team has retrained the model on a new dataset that includes the most recent data. The new model shows promising results in offline validation. Propose a versioning and deployment plan for this new model. Your plan should specify:
1.  What the new model's version number should be, and why (based on semantic versioning principles).
2.  A safe deployment strategy that allows you to compare the new model against the old one (`v1.2.0`) in the live environment before completely replacing it.

---

## Answer Key

**Answer 1**
**Missing Component:** The fitted `StandardScaler` object.

**Reasoning:** The `StandardScaler` learns the mean and standard deviation from the *training data* and uses these exact values to scale both the training and any future data. Saving only the trained model (`model.pkl`) means the scaling parameters are lost. When the colleague tries to make predictions, the new data is either not scaled at all, or it is scaled with a new `StandardScaler` fitted on the new data, leading to a mismatch in data distribution between what the model was trained on and what it is predicting on. The correct procedure is to persist both the model and the scaler object used in the training pipeline.

**Answer 2**
**More Suitable Format:** ONNX (Open Neural Network Exchange).

**Reasoning:** The key requirement is deployment across different programming languages and frameworks (Python and C++).
- `pickle` is Python-specific. It serializes Python objects, and a C++ application cannot deserialize or execute them.
- `ONNX` is a language- and framework-agnostic format designed for interoperability. A PyTorch model can be exported to an `.onnx` file, which can then be loaded and executed by various "runtimes," including one for Python (for the web server) and one for C++ (for the edge device). This allows you to "train in one framework, deploy in another."

**Answer 3**
This versioning scheme allows for precise traceability of code changes. The first two steps to investigate the bug would be:

1.  **Code Differential Analysis:** Use Git to compare the code between the two commit hashes. The command would be `git diff f9b0d4e a7c3f1b`. This will show every line of code that changed between the last known good version (`v2.1.2`) and the current buggy version (`v2.1.3`). The investigation would focus on changes in feature engineering, model architecture, or data handling logic.
2.  **Reproduce Both Models:** Check out each commit hash (`git checkout a7c3f1b` and `git checkout f9b0d4e`) and rerun the training scripts (assuming the data version is also tracked). This confirms that you can reproduce the exact artifacts. You can then run both models on a controlled test dataset to isolate the specific inputs that trigger the buggy behavior in the new version.

**Answer 4**
**Probable Cause:** A breaking change in the internal API or object structure of `scikit-learn` between versions 1.2 and 1.4. Serialization formats like `pickle` (which `joblib` uses) save the object's structure. If that structure changes in a new library version, the old saved object can no longer be correctly reconstructed, leading to errors like `AttributeError`.

**Essential Information:** A `requirements.txt` or similar dependency manifest file, with pinned versions. If `scikit-learn==1.2` had been saved and versioned alongside the model artifact, the developer would have known to create a virtual environment with that exact version to load the model, avoiding the incompatibility error.

**Answer 5**
Here are three key pieces of metadata to save with each of the 50 model artifacts:

1.  **Hyperparameters:** A JSON or YAML file containing the exact dictionary of hyperparameters used for that specific training run (e.g., `{'learning_rate': 0.01, 'n_estimators': 200}`). This is essential for reproducibility and for understanding which parameters led to which outcomes.
2.  **Performance Metrics:** The validation metrics (e.g., `{'accuracy': 0.92, 'precision': 0.88, 'recall': 0.91}`) calculated during the model's evaluation. This is the primary data used to rank the 50 models and identify the best-performing one to promote.
3.  **Dataset Version/Hash:** An identifier for the exact version of the training and validation dataset used. This ensures that if you need to reproduce the model training a year from now, you are using the identical data, which is crucial for a true reproduction of the results.

This metadata allows the team to sort the models by a key metric, select the winner, and have all the necessary components (code via Git, hyperparameters, and data version) to reliably reproduce the "winning" model.

**Answer 6**
1.  **New Version Number:** The new version should be `v2.0.0`.

    **Reasoning:** We apply semantic versioning (`MAJOR.MINOR.PATCH`).
    - A `PATCH` (e.g., `v1.2.1`) is for backward-compatible bug fixes. This is not a bug fix.
    - A `MINOR` (e.g., `v1.3.0`) is for adding functionality in a backward-compatible manner.
    - A `MAJOR` (e.g., `v2.0.0`) version change is used for incompatible API changes or, in the context of ML models, significant changes that alter the model's contract or behavior. Since the model was retrained on a fundamentally different data distribution to address performance degradation, its predictive behavior has intentionally changed. This constitutes a "breaking change" from the perspective of a consumer expecting the behavior of `v1.2.0`, justifying a major version increment.

2.  **Safe Deployment Strategy:** A **Shadow Deployment** (or Dark Launch).

    **Reasoning:** This strategy allows for live comparison without impacting users.
    - The production system would be configured to route live traffic to both the old model (`v1.2.0`) and the new model (`v2.0.0`) simultaneously.
    - The old model's predictions would continue to be returned to the user, so the service operates as normal.
    - The new model's predictions would be logged and saved but not returned to the user.
    - This allows the team to compare the predictions of both models on real-world, live data. You can analyze performance metrics, prediction latency, and error rates for `v2.0.0` to confirm that it is indeed performing better than the old model before making the decision to switch all traffic over to it. This de-risks the deployment significantly compared to a direct cut-over.