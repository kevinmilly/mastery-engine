## Exercises

**Exercise 1**
An engineer has just completed a single training run for a house price prediction model. To ensure this run is reproducible and can be compared against future experiments, list three distinct categories of information they should log. For each category, provide one concrete example relevant to this scenario.

**Exercise 2**
A team is training a sentiment classification model. After their first training run, the model achieves 99% accuracy on the training set but only 75% accuracy on the validation set. They save the final model artifact. Based on a standard iterative training workflow, what is the most critical flaw in their next step if they decide to immediately start a new experiment by increasing model complexity?

**Exercise 3**
You are reviewing the experiment tracking log for two models (Model A and Model B) trained on the same dataset.
- **Model A Log**: `run_id: run_a`, `learning_rate: 0.01`, `epochs: 20`, `final_val_accuracy: 0.88`, `model_artifact: model_a.pkl`.
- **Model B Log**: `run_id: run_b`, `learning_rate: 0.001`, `epochs: 20`, `final_val_accuracy: 0.85`.
You notice that the log for Model B is missing a record of the saved model artifact. Explain the operational risk this creates, even if the team has a separate, unlogged file named `model_b.pkl` in their directory.

**Exercise 4**
An engineer trains a model to detect manufacturing defects. They run two experiments and track the metrics over time.
- **Experiment 1**: The validation loss starts at 1.2, decreases steadily to 0.4 by epoch 50, and stays near 0.4 until the training ends at epoch 100.
- **Experiment 2**: The validation loss starts at 1.1, decreases to 0.35 by epoch 40, but then slowly increases to 0.6 by epoch 100.
Which experiment produced the more promising model? At which point in the training process should the model artifact for that experiment have been saved? Justify your answers.

**Exercise 5**
You are designing a training workflow for a credit card fraud detection model. You know from the "Overfitting and Underfitting" lesson that a large gap between training accuracy and validation accuracy indicates overfitting. How would you incorporate this knowledge into your automated training script to both save the best possible model and stop training efficiently if performance degrades? Describe the logic your script would follow.

**Exercise 6**
You are setting up a complete training workflow for an image classification task. The goal is to find the best hyperparameters for a convolutional neural network. You will use a 5-fold cross-validation strategy. Your colleague suggests the following workflow: "For each set of hyperparameters, train the model on all 5 folds simultaneously, average the final validation metrics, and save the model that was trained on the first fold." Identify the primary flaw in this proposed workflow regarding the final model artifact. Propose a corrected workflow that properly integrates cross-validation for hyperparameter tuning with the goal of producing a single, final, production-ready model.

---

## Answer Key

**Answer 1**
To ensure reproducibility and comparability, the engineer should log the following three categories of information:

1.  **Experiment Configuration/Parameters:** This includes all the inputs and settings that define the experiment. A concrete example is the set of hyperparameters used, such as `learning_rate: 0.001` or `optimizer: 'Adam'`.
2.  **Performance Metrics:** These are the quantitative results that evaluate the model's performance. For a house price prediction model, a relevant example is the Mean Absolute Error (MAE) on the validation set, tracked at the end of each epoch.
3.  **Output Artifacts:** This includes the persistent, usable outputs of the training run. A key example is the path to the saved model file itself, such as `/models/house_predictor_v1.2.h5`. A code version (e.g., a Git commit hash) is another critical artifact.

**Answer 2**
The flaw is that their decision is based on an incomplete diagnosis of the problem. A 99% training accuracy versus a 75% validation accuracy is a classic sign of severe overfitting. The model has learned the training data extremely well but does not generalize to new data.

Increasing model complexity (e.g., adding more layers or neurons) would likely make the overfitting *worse*, as a more complex model has even more capacity to memorize the training data. The standard workflow requires them to first *analyze* the tracked metrics, *diagnose* the overfitting problem, and then start a new experiment specifically designed to *address* it (e.g., by adding regularization, using dropout, or reducing model complexity).

**Answer 3**
The operational risk is a loss of **traceability** and **reproducibility**. Without an explicit entry in the experiment log linking `run_id: run_b` to a specific model artifact file, the team cannot be certain that the file `model_b.pkl` actually corresponds to that specific training run.

Another engineer might later overwrite `model_b.pkl`, or it could be a leftover from an even older experiment. If someone later wants to deploy the model from `run_b`, they might grab the wrong file, leading to deploying a model with unknown and potentially poor performance. The experiment tracking log must serve as the single source of truth that connects the exact code, data, and configuration to the specific outputs (metrics and artifacts).

**Answer 4**
Experiment 2 produced the more promising model, but only up to a certain point.

*   **Reasoning:** Experiment 2 achieved a lower minimum validation loss (0.35) than Experiment 1 (0.4), indicating it found a better-performing state. However, the subsequent increase in loss after epoch 40 shows that the model began to overfit to the training data. Experiment 1's performance plateaued, suggesting it was not improving further but also not getting worse.

*   **When to Save:** The model artifact for Experiment 2 should have been saved around epoch 40, which is the point where the validation loss was at its minimum. A well-designed training workflow includes logic (often called "early stopping") to monitor the validation metric and save the model "checkpoint" from the best-performing epoch, rather than just saving the model from the final epoch.

**Answer 5**
To handle this, you would implement a mechanism commonly known as **Early Stopping** with **Model Checkpointing**.

The logic in the training script would be:
1.  **Initialization:** Before the training loop begins, initialize two variables: `best_validation_metric` to a very poor value (e.g., infinity for loss, or zero for F1-score) and `patience_counter` to 0. Define a `patience` threshold (e.g., 10 epochs).
2.  **Inside the Training Loop (at the end of each epoch):**
    *   Calculate the validation metric (e.g., F1-score, since fraud is an imbalanced problem).
    *   **Model Checkpointing Logic:** If the current epoch's validation metric is better than `best_validation_metric`, update `best_validation_metric` with the new value, save the current state of the model to a file (e.g., `best_model.pth`), and reset `patience_counter` to 0.
    *   **Early Stopping Logic:** If the current validation metric is *not* better than `best_validation_metric`, increment `patience_counter`. If `patience_counter` exceeds the `patience` threshold, break the training loop.

This workflow ensures that the final saved artifact (`best_model.pth`) is the one that performed best on the validation data, and it prevents wasting computational resources by stopping the training run once the model ceases to improve.

**Answer 6**
The primary flaw is that **the final artifact is not representative of the knowledge gained from the entire cross-validation process.** The model saved from the first fold was only trained on a subset (80% if using 5-fold) of the data and has not been validated on the data from that first fold. Cross-validation is excellent for getting a robust estimate of a hyperparameter set's performance, but it doesn't directly produce a single, final model.

**Corrected Workflow:**

1.  **Stage 1: Hyperparameter Tuning with Cross-Validation.**
    *   For each candidate set of hyperparameters (e.g., learning rate, batch size):
    *   Perform 5-fold cross-validation. In each fold, train on 4 parts of the data and validate on the 1 held-out part.
    *   Record the validation metric (e.g., accuracy) for each of the 5 folds.
    *   Calculate the *average* validation metric across all 5 folds for that hyperparameter set.
    *   **Do not save any of these models as the final artifact.** The goal here is only to find the best-performing set of hyperparameters.

2.  **Stage 2: Final Model Training.**
    *   Identify the set of hyperparameters that yielded the best average performance in Stage 1.
    *   Using this optimal set of hyperparameters, train a *new* model on the **entire training dataset** (all 5 folds combined).
    *   This newly trained model is the final, production-ready artifact that has benefited from both the robust hyperparameter selection process and being trained on all available data. This final model should then be evaluated on a separate, held-out test set that was not used at all during cross-validation.