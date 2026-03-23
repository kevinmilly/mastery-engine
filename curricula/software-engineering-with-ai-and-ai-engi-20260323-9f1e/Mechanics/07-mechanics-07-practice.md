## Exercises

**Exercise 1**
An AI developer trains a sentiment analysis model using TensorFlow 2.10 on their Ubuntu laptop. The model works perfectly. They send the prediction script and the saved model file to a colleague who runs macOS with TensorFlow 2.9 installed. The script immediately fails with a cryptic error related to an operation not found in their TensorFlow version.

Explain specifically how using Docker to package the application would have prevented this "works on my machine" problem.

**Exercise 2**
A developer is creating a Docker image to serve a scikit-learn model. They have written the following `Dockerfile`:

```Dockerfile
# Base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

# Command to run
CMD ["python", "app.py"]
```

Their `requirements.txt` contains `scikit-learn==1.1.0`. The model was trained using `scikit-learn==1.0.2`. When they run the container, the application crashes when trying to load the model. What is the fundamental containerization principle they have overlooked, and how should they fix their `Dockerfile` and `requirements.txt` to ensure consistency?

**Exercise 3**
A team has developed a computer vision model for object detection. They need to deploy this model in two different environments:
1.  A powerful cloud server with an NVIDIA A100 GPU for high-throughput batch processing of videos.
2.  An array of CPU-only edge devices for real-time inference on a single camera feed.

Can they use the *exact same* Docker image for both deployments? Explain the key environmental difference that containerization must account for here and describe a likely strategy for managing images for these two targets.

**Exercise 4**
An ML engineer is building a container image for a large language model (LLM) application. The `Dockerfile` first copies the 5GB model file into the image, and then copies the 1KB `requirements.txt` file and runs `pip install`. Every time the engineer makes a one-line change to their Python application code and rebuilds the image, the build process takes over 5 minutes, mostly spent re-copying the huge model file.

Explain why this is happening based on how Docker builds images in layers. Propose a specific change to the order of commands in the `Dockerfile` to dramatically speed up rebuilds during development.

**Exercise 5**
A team is deploying a fraud detection API using Docker. Their model artifacts are versioned and stored in an artifact repository (e.g., `model_v1.0.h5`, `model_v1.1.h5`). When they deploy a new model, they build a new Docker image that bundles the updated model file. Their current image tagging strategy is to always use the `latest` tag: `fraud-detector:latest`.

After deploying the new model (`v1.1`), they discover it has a lower accuracy on real-world data than the previous version (`v1.0`). They need to roll back immediately. How does their `latest`-only tagging strategy make this rollback difficult and risky? Propose a better image tagging strategy that integrates model versioning and enables reliable, one-command rollbacks.

**Exercise 6**
A data science team needs to perform a large-scale hyperparameter tuning search for a new recommendation model. The search space involves 100 different combinations of learning rate, batch size, and network depth. Running these 100 training jobs sequentially on a single machine would take weeks.

Drawing on your knowledge of model training workflows and containerization, describe how you would design a single, parameterized Docker image to accomplish this task in parallel on a cloud platform. What key components would you include in the image? How would you launch 100 distinct container instances from this single image so that each one executes a unique training job?

---

## Answer Key

**Answer 1**
The problem is caused by a dependency mismatch between the developer's and the colleague's environments (TensorFlow 2.10 vs. 2.9).

Containerization, using Docker, would have prevented this by packaging the application with its *exact* dependencies into a single, isolated unit called a container image. The developer would create a `Dockerfile` specifying Python 3.x, Ubuntu, and *exactly* `tensorflow==2.10`. When the colleague runs the container from this image, Docker creates an environment on their machine that perfectly mirrors the developer's environment, including the correct TensorFlow version, regardless of what is installed on their host macOS system. The application runs inside this isolated environment, guaranteeing consistency and eliminating the "works on my machine" issue.

**Answer 2**
The developer has overlooked the principle that a container should package the application with the **exact versions of dependencies used for both training and inference**. The model was trained with `scikit-learn==1.0.2` but the container is installing `scikit-learn==1.1.0`. Model serialization formats (like pickle) are often brittle and can break between even minor library version changes.

**Fix:**
1.  The `requirements.txt` file should be updated to pin the version used during training: `scikit-learn==1.0.2`.
2.  The `Dockerfile` itself is correct in its structure, but by fixing the `requirements.txt` it references, it will now build an image with the correct, consistent environment, resolving the model loading crash.

This ensures the runtime environment inside the container precisely matches the training environment, a core benefit of containerization for AI.

**Answer 3**
No, they cannot use the exact same Docker image. The key environmental difference is the **hardware dependency**: one requires a GPU, and the other is CPU-only.

*   **GPU-enabled Image:** This image must be built on a special base image provided by NVIDIA (e.g., `nvidia/cuda:11.8.0-base-ubuntu22.04`). It includes the necessary CUDA libraries that allow the containerized application to communicate with the host machine's NVIDIA drivers and GPU. It would also contain a GPU-enabled version of the ML framework (e.g., `tensorflow-gpu`).

*   **CPU-only Image:** This image can be built on a standard, lightweight base image (e.g., `python:3.9-slim`). It will contain the standard CPU version of the ML framework, resulting in a much smaller and more portable image.

**Strategy:** The team should maintain two different `Dockerfiles` (e.g., `Dockerfile.gpu` and `Dockerfile.cpu`) and use a tagging convention to distinguish the images, such as:
*   `my-model:1.2-gpu`
*   `my-model:1.2-cpu`

This allows them to deploy the correct image to the corresponding hardware target, ensuring performance on the cloud server and compatibility on the edge devices.

**Answer 4**
Docker builds images in a sequence of layers, and it caches each layer. A layer is only rebuilt if the command that created it changes, or if a file it depends on (like one being copied) changes.

The current `Dockerfile` copies all files (including the huge model) *before* installing dependencies. The engineer's one-line code change invalidates the cache for the `COPY . .` layer. Because the model file is part of this copy operation, it gets re-copied. This also invalidates the cache for all subsequent layers, forcing them to re-run.

**Proposed Change:**
The order of commands should be changed to copy only the files needed for dependency installation first, install them, and then copy the larger, less frequently changing assets like the model file and the application source code.

**Improved `Dockerfile` Order:**
```Dockerfile
FROM python:3.9-slim
WORKDIR /app

# 1. Copy only the requirements file first
COPY requirements.txt .

# 2. Install dependencies. This layer will be cached as long as requirements.txt doesn't change.
RUN pip install -r requirements.txt

# 3. Copy the large model file.
COPY model.gb .

# 4. Copy the rest of the application code. A change here only invalidates this layer and the CMD.
COPY . .

CMD ["python", "app.py"]
```
With this structure, a change to `app.py` will only invalidate the final `COPY . .` layer, making the rebuild almost instantaneous because the slow `pip install` and 5GB model copy layers are already cached.

**Answer 5**
Using only the `latest` tag is problematic because it's mutable; it's a pointer that moves with each new build. When they built the image for `model_v1.1`, the `fraud-detector:latest` tag was moved from the `v1.0` image to the `v1.1` image. There is no simple tag to identify and redeploy the previous, working version. The team would have to find the old image by its unique hash (Image ID), which is inconvenient and error-prone, or rebuild it from the old source code.

**Better Strategy:**
The team should adopt a semantic versioning or model-version-based tagging strategy. For each new build, they should apply multiple tags:
1.  **A version-specific tag:** `fraud-detector:v1.1` (immutable)
2.  **The `latest` tag:** `fraud-detector:latest` (mutable)

When they build the image for `model_v1.1.h5`, they would tag it `fraud-detector:v1.1` and `fraud-detector:latest`. The previous image for `model_v1.0.h5` would still retain its `fraud-detector:v1.0` tag.

To perform the rollback, they can now simply redeploy the container using the immutable, specific tag: `docker run fraud-detector:v1.0`. This is a reliable, one-command rollback that points directly to the correct, previously-validated image.

**Answer 6**
To parallelize the hyperparameter tuning, we can create a single, generic training image that can be configured at runtime.

**1. Docker Image Design:**
The Docker image should contain all necessary components for a *single* training run:
*   A base image with Python and the required ML framework (e.g., PyTorch, TensorFlow).
*   A copy of the training script (`train.py`).
*   A `requirements.txt` file to install all necessary libraries (e.g., `pandas`, `scikit-learn`).
*   The training script must be modified to accept hyperparameters as command-line arguments or environment variables (e.g., `--learning-rate 0.01`, `--batch-size 32`).

**2. Enabling Parallel Execution:**
The container orchestrator (like Kubernetes or a cloud service like AWS Batch/SageMaker) would be responsible for launching 100 instances of this container. Each launch command would be slightly different, passing in a unique combination of hyperparameters.

**Example Launch Commands:**
This demonstrates how the *same image* (`my-training-image:1.0`) is used for different jobs by overriding the default command at runtime.

*   **Container 1 (Job 1):**
    `docker run my-training-image:1.0 python train.py --learning-rate 0.01 --batch-size 32`

*   **Container 2 (Job 2):**
    `docker run my-training-image:1.0 python train.py --learning-rate 0.01 --batch-size 64`

*   **Container 3 (Job 3):**
    `docker run my-training-image:1.0 python train.py --learning-rate 0.001 --batch-size 32`
    ...and so on for all 100 combinations.

By parameterizing the training script and packaging the entire training environment into a container, we create a reproducible and scalable unit of work. This allows us to leverage cloud infrastructure to run all 100 experiments in parallel, drastically reducing the time required for hyperparameter tuning from weeks to hours.