# Glossary: Software Engineering with AI and AI Engineering

**A/B Testing (ML context)**
A method for comparing two versions of a machine learning model in a live environment to see which performs better. In this context, users are randomly exposed to either an existing model (A) or a new model (B) to measure the impact on real-world metrics. This enables data-driven decisions on model deployments without affecting all users.

**Accuracy (ML)**
A common way to measure how often a classification model is correct. It is the ratio of correctly predicted instances (both true positives and true negatives) to the total number of instances in the dataset. While simple, it can be misleading for imbalanced datasets where one class is much more common than others.

**Adversarial Attacks**
Malicious attempts to trick machine learning models by providing subtly altered input data that humans would perceive as unchanged. These attacks can cause models to make incorrect predictions, highlighting vulnerabilities in AI systems, especially in security-critical applications. Defenses against such attacks are crucial for building robust AI.

**Agent (Reinforcement Learning)**
The decision-maker in a Reinforcement Learning system that interacts with an environment to learn optimal behavior. The agent observes the environment's state, takes actions, and receives rewards or penalties based on those actions, aiming to maximize cumulative rewards over time.

**AI Engineering Lifecycle**
The complete, structured process involved in developing, deploying, and maintaining AI systems, similar to the software development lifecycle but with added stages specific to data and models. It typically spans from problem definition and data collection through model development, deployment, and continuous monitoring in production.

**Bias (AI/ML)**
A systematic error in a machine learning model or its data that leads to unfair or inaccurate predictions, often disproportionately affecting certain groups. This can stem from biased training data, flawed model assumptions, or societal biases reflected in the data collection process, requiring careful detection and mitigation.

**Canary Releases**
A deployment strategy where a new version of a machine learning model is rolled out to a small subset of users before a full production launch. This allows engineers to monitor the new model's performance and stability with real traffic in a controlled manner, quickly reverting if issues arise, thus minimizing risk.

**CI/CD for ML**
The application of Continuous Integration and Continuous Delivery principles to machine learning projects, automating the pipeline for developing, testing, and deploying ML models. It extends traditional CI/CD to include data validation, model testing, experiment tracking, and automated retraining, ensuring rapid and reliable updates to AI applications.

**Classification**
A type of supervised machine learning task where a model learns to predict a categorical label or class for given input data. Examples include identifying whether an email is spam (spam or not spam) or categorizing images (e.g., cat, dog, bird).

**Clustering**
A type of unsupervised machine learning task that groups similar data points together without any prior knowledge of categories. The goal is to discover inherent structures or patterns in unlabeled data by organizing observations into meaningful clusters based on their features.

**Concept Drift**
A phenomenon in machine learning where the relationship between the input data and the target variable changes over time in a deployed model's environment. This means the underlying concept the model is trying to predict evolves, causing the model's performance to degrade even if the input data distribution remains stable.

**Containerization**
A technology that packages an application and all its dependencies (code, runtime, libraries, settings) into a lightweight, portable, and isolated unit called a container. For AI applications, containerization (e.g., using Docker) ensures that models run consistently across different computing environments, from development to production.

**Cross-Validation**
A technique used to assess how well a machine learning model will generalize to new, unseen data, preventing overfitting. It involves dividing the dataset into multiple subsets, training the model on different combinations of these subsets, and evaluating it on the remaining ones to get a more robust estimate of performance.

**Data Drift**
A change in the statistical properties of the input data that a machine learning model receives over time, leading to a degradation in model performance. This occurs when the distribution of features used for prediction deviates significantly from the distribution of features the model was trained on.

**Data Ingestion**
The process of collecting and importing raw data from various sources into a storage system, making it available for processing and analysis in a machine learning pipeline. This critical first step ensures that relevant and sufficient data is acquired for model training.

**Data-driven Paradigm**
An approach to software development and problem-solving where decisions and system behaviors are primarily determined by patterns and insights learned from data, rather than explicit, pre-defined rules. This contrasts with traditional rule-based programming, forming the core of AI/ML methodologies.

**Dataset Splitting**
The practice of dividing a collected dataset into distinct subsets, typically a training set, a validation set, and a test set. This separation is crucial for developing and evaluating machine learning models effectively, ensuring unbiased assessment of generalization performance.

**Dimensionality Reduction**
An unsupervised learning technique used to reduce the number of input features in a dataset while retaining most of the important information. This simplification helps to mitigate the "curse of dimensionality," making models train faster, reducing overfitting, and improving data visualization.

**Distributed Training**
A method of training machine learning models across multiple processing units (e.g., GPUs, CPUs) or machines simultaneously, often using large datasets or complex models. This allows for faster training times and the ability to handle larger computational demands than a single machine could manage alone.

**Fairness (AI/ML)**
A principle in ethical AI development that aims to ensure AI systems produce equitable outcomes and do not unfairly discriminate against or disadvantage specific groups or individuals. Achieving fairness involves identifying and mitigating biases throughout the AI lifecycle, from data collection to model deployment.

**Feature Engineering**
The process of transforming raw data into a set of meaningful input variables (features) that best represent the underlying problem to a machine learning model. This often involves creating new features, selecting relevant ones, or transforming existing data to improve model performance and interpretability.

**Features (ML)**
The individual, measurable properties or characteristics of the data that are used as input to a machine learning model. These variables act as the pieces of information the model learns from to make predictions or discover patterns.

**Federated Learning**
A privacy-preserving machine learning approach that allows models to be trained across multiple decentralized edge devices or servers holding local data samples, without exchanging the raw data itself. Instead, only model updates (like weights) are shared and aggregated centrally, enhancing data privacy and security.

**F1-score**
A harmonic mean of Precision and Recall, providing a single metric that balances both values. It is particularly useful when dealing with imbalanced classification datasets where a high number of false positives or false negatives is problematic, offering a more robust evaluation than accuracy alone.

**Hyperparameter Tuning**
The process of searching for the optimal combination of hyperparameters for a machine learning model to maximize its performance. This involves systematically experimenting with different values for settings that are not learned from data but configured prior to training.

**Hyperparameters**
Configuration settings of a machine learning model that are set manually before the training process begins, rather than being learned from the data. Examples include the learning rate, the number of layers in a neural network, or the regularization strength, significantly impacting model performance.

**Labeled Data**
Data that has been annotated with a specific target variable or outcome that a machine learning model is intended to predict. Each example in labeled data includes both the input features and the correct output, making it suitable for supervised learning tasks like classification or regression.

**Mean Absolute Error (MAE)**
A common metric for evaluating the performance of regression models, calculated as the average of the absolute differences between the predicted values and the actual values. MAE provides a straightforward measure of the average magnitude of errors, with all errors contributing proportionally to the score.

**Mean Squared Error (MSE)**
A widely used metric for evaluating the performance of regression models, calculated as the average of the squared differences between predicted values and actual values. MSE penalizes larger errors more heavily due to the squaring operation, making it sensitive to outliers.

**MLOps**
A set of practices that combines Machine Learning, DevOps, and Data Engineering to streamline the end-to-end machine learning lifecycle, from experimentation to production deployment, monitoring, and maintenance. MLOps aims to automate and standardize the process, ensuring reliable, scalable, and reproducible AI systems.

**Model (ML)**
In machine learning, a model is the output of a training process, representing the patterns and relationships learned from data. It is essentially a mathematical function or algorithm that can take new input data and make predictions or decisions based on its learned knowledge.

**Model Artifacts**
The various files and assets generated during the machine learning model training process that are necessary for its deployment and use. This typically includes the trained model's saved state (e.g., weights), configuration files, preprocessing scripts, and potentially evaluation metrics.

**Model Cards (AI)**
Documentation accompanying a machine learning model that provides transparent and standardized information about its purpose, training data, performance characteristics (especially across different demographic groups), limitations, and ethical considerations. Model cards promote accountability and aid in responsible AI development.

**Model Explainability (XAI)**
The field of techniques and methods (e.g., LIME, SHAP) focused on making machine learning models, and their predictions, understandable and interpretable to humans. XAI is crucial for building trust, debugging models, ensuring fairness, and meeting regulatory requirements by revealing *why* a model made a specific decision.

**Model Monitoring**
The continuous observation and tracking of a deployed machine learning model's performance, data inputs, and outputs in a production environment. This proactive process helps detect issues like model degradation, data drift, or concept drift, ensuring the model remains accurate and reliable over time.

**Model Persistence**
The process of saving a trained machine learning model to disk in a specific format so that it can be loaded and reused later without needing to retrain it. This is essential for deploying models, sharing them, or continuing training from a saved state.

**Model Serving**
The process of deploying a trained machine learning model to a production environment where it can receive new input data and generate real-time or batch predictions. This typically involves exposing the model through an API that other applications can call.

**ML Pipelines**
A series of automated steps or components that orchestrate the end-to-end workflow of a machine learning project, from data ingestion and preprocessing to model training, evaluation, and deployment. Pipelines ensure reproducibility, efficiency, and scalability in ML development.

**Overfitting**
A common problem in machine learning where a model learns the training data too well, including its noise and outliers, resulting in excellent performance on the training set but poor generalization to new, unseen data. This indicates the model has become too complex for the given data.

**Precision**
A classification metric that measures the proportion of true positive predictions among all positive predictions made by the model. High precision indicates a low rate of false positives, meaning when the model predicts something is positive, it's usually correct.

**Predictions (ML)**
The outputs generated by a trained machine learning model when it is given new, unseen input data. These can be categorical labels (for classification), numerical values (for regression), or probabilities, based on the patterns the model learned during training.

**Preprocessing**
The stage in a machine learning pipeline where raw data is cleaned, transformed, and prepared into a suitable format for model training. This often includes handling missing values, scaling features, encoding categorical variables, and removing noise, crucial for improving model performance.

**Privacy-Preserving ML**
Techniques and methodologies (e.g., federated learning, differential privacy, homomorphic encryption) designed to allow machine learning models to be trained and used while protecting the confidentiality and privacy of the underlying data. This addresses concerns about sensitive data exposure in AI systems.

**R-squared**
A statistical measure that represents the proportion of the variance in the dependent variable that can be explained by the independent variables in a regression model. R-squared (coefficient of determination) indicates how well the model's predictions fit the observed data, with higher values suggesting a better fit.

**Recall**
A classification metric that measures the proportion of true positive predictions among all actual positive instances in the dataset. High recall indicates a low rate of false negatives, meaning the model is good at finding all positive instances.

**Regression**
A type of supervised machine learning task where a model learns to predict a continuous numerical value for a given input. Examples include predicting house prices, stock values, or a patient's blood pressure.

**Reinforcement Learning**
A machine learning paradigm where an intelligent agent learns to make decisions by interacting with an environment, taking actions, and receiving rewards or penalties. The agent's goal is to discover a policy that maximizes its cumulative reward over time through trial and error.

**RESTful API**
An architectural style for designing networked applications, often used for web services, that uses standard HTTP methods (GET, POST, PUT, DELETE) to interact with resources. For AI, RESTful APIs are a common way to expose trained machine learning models as endpoints for other software applications to consume.

**Reward (Reinforcement Learning)**
A numerical signal or feedback received by an agent in a Reinforcement Learning environment after performing an action. The reward quantifies the desirability of an action or the resulting state, guiding the agent's learning process to maximize the total reward over time.

**Robustness (AI/ML)**
The ability of a machine learning model or system to maintain its performance and reliability even when faced with noisy, corrupted, or adversarial input data, or when operating in unexpected conditions. A robust model is resilient to variations and perturbations in its environment.

**Rule-based Software Development**
A traditional software engineering approach where system behavior is defined by explicit, pre-defined rules, conditions, and logic written directly by human programmers. This contrasts with data-driven AI/ML systems where behavior is learned from data rather than hardcoded.

**Scalability (AI Systems)**
The capability of an AI system to handle increasing amounts of data, computational workload, or user requests efficiently without compromising performance. In AI, this involves strategies for distributed training, efficient model serving, and managing large-scale data pipelines.

**Supervised Learning**
A machine learning paradigm where a model learns from a dataset that includes both input features and corresponding labeled outputs (target variables). The model's goal is to learn a mapping function from inputs to outputs, enabling it to make predictions on new, unseen data.

**Technical Debt (ML)**
The long-term cost incurred in machine learning systems due to design choices, poor code quality, or operational compromises that prioritize short-term gains. In ML, this debt is often exacerbated by data dependencies, evolving data schemas, opaque model complexity, and code-data entanglement, hindering future development and maintenance.

**Test Set**
A distinct subset of a dataset used to provide an unbiased evaluation of a fully trained machine learning model's performance on unseen data. The test set is only used once, after model development and hyperparameter tuning are complete, to simulate real-world performance.

**Transparency (AI/ML)**
The principle that AI systems should operate in a way that is understandable and open to scrutiny, allowing stakeholders to comprehend their inner workings, decision-making processes, and potential biases. It often involves providing clear documentation, audit trails, and model explainability techniques.

**Trustworthy AI**
An overarching goal in AI development that encompasses building systems that are not only performant but also reliable, robust, fair, transparent, secure, and respectful of privacy. It aims to foster user confidence and ensure AI technology serves humanity responsibly and ethically.

**Underfitting**
A common problem in machine learning where a model is too simple to capture the underlying patterns in the training data, resulting in poor performance on both the training set and new, unseen data. This indicates the model has not learned enough from the data.

**Unsupervised Learning**
A machine learning paradigm where a model learns to find patterns and structures in unlabeled data without any explicit guidance or target outputs. It's used for tasks like clustering similar data points or reducing the dimensionality of data.

**Validation Set**
A distinct subset of a dataset, separate from the training and test sets, used to tune hyperparameters and evaluate model performance *during* the training process. It helps to select the best model configuration and detect overfitting before final evaluation on the test set.