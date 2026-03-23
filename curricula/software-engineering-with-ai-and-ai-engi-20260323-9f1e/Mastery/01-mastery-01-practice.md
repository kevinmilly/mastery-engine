## Exercises

**Exercise 1**
A genomics research institute is training a large language model to understand protein sequences. The model architecture itself is extremely large (over 100 billion parameters) and cannot fit into the memory of a single available accelerator (GPU/TPU). The training dataset, while substantial, can be loaded by a single powerful machine. To train the model, they have a cluster of 8 high-memory GPUs. What distributed training strategy is necessary in this scenario, and why is the alternative strategy less suitable?

**Exercise 2**
An online video streaming service wants to add a "content moderation" feature. An AI model will scan every newly uploaded video to detect and flag violations of the platform's terms of service. The service level objective (SLO) is that any violating video must be flagged and sent for human review within 1 hour of the upload completing. Videos are uploaded 24/7, with significant peaks in the evening. Given this requirement, should the inference system be designed primarily for batch processing or for real-time serving? Justify your choice.

**Exercise 3**
A ride-sharing company uses an AI model to predict surge pricing in real-time. The system works by feeding live data (number of active drivers, pending ride requests, traffic conditions) into a model that outputs a price multiplier for each city zone. The system is currently struggling to keep up with request volume, leading to stale pricing data. The team is proposing to add a caching layer that would store the surge multiplier for each zone for 60 seconds. Analyze the primary benefit and the most significant risk of introducing this caching strategy for this specific use case.

**Exercise 4**
An API for a document summarization service receives 50 requests per second. The model takes 200ms to process a single document. By batching requests, the model can process a batch of up to 16 documents in just 400ms due to parallelization on the GPU. The engineering team decides to implement dynamic batching with a maximum wait time of 150ms.
a) What is the average number of requests that will form a batch, given the maximum wait time?
b) What is the new effective processing time per request, including the maximum wait time and the batched inference time?
c) How many concurrent requests can a single server now handle compared to the non-batched approach? Show your calculations.

**Exercise 5**
You are designing the architecture for an AI-powered fraud detection system for a major credit card processor. The system must meet two distinct requirements:
1.  **Real-time Transaction Scoring:** Every single transaction (~10,000 per second at peak) must be scored for fraud risk in under 50ms. High-risk transactions are automatically declined.
2.  **Weekly Account Review:** A more complex, computationally intensive model must analyze the entire past week's transaction history for every active account to identify subtle, long-term patterns of fraud. This process must be completed over the weekend.

Propose a high-level architecture that accommodates both of these requirements. Describe the two distinct inference pathways and justify why a single, unified architecture would be a poor choice.

**Exercise 6**
A company has a successful AI system that provides personalized workout recommendations to users via a mobile app. The current architecture uses a large, monolithic model served from a cluster of powerful GPU instances. The system is expensive to run and slow to update; deploying a newly retrained model takes hours and involves significant downtime. The business wants to start experimenting with new recommendation features (e.g., meal suggestions, mindfulness exercises) and wants to be able to A/B test different recommendation algorithms simultaneously without deploying a whole new monolith.

Design a new architectural strategy that addresses the business's need for cost savings, faster iteration, and A/B testing capabilities. Describe the key components of your proposed architecture and explain how it resolves the problems of the current monolithic approach.

---

## Answer Key

**Answer 1**
The necessary strategy is **Model Parallelism**.

**Reasoning:**
The core problem is that the model itself is too large to fit in a single GPU's memory.
*   **Model Parallelism** addresses this directly by splitting the model's layers or parameters across multiple GPUs. For example, some layers of the neural network would reside on GPU 1, subsequent layers on GPU 2, and so on. During a forward and backward pass, the data flows sequentially through the model parts on each GPU.
*   **Data Parallelism**, the alternative, is unsuitable here. Data parallelism involves replicating the *entire* model on each GPU and then feeding each replica a different slice of the data batch. This strategy is excellent for speeding up training on large datasets, but it fundamentally requires that the model can fit on each individual worker. Since the problem states the model is too large for a single GPU, data parallelism is not a viable option.

**Answer 2**
The system should be designed for **batch processing**.

**Reasoning:**
The key requirement is the SLO of flagging a video within **1 hour**. This is a very generous time window in the context of computing.
*   **Real-time serving** is optimized for low-latency (<1 second) responses, which is not required here. Building a real-time system would be an over-engineered and more expensive solution, as it would need to maintain a fleet of servers ready to process a request the instant it arrives.
*   **Batch processing** is a much better fit. The system can be designed to collect uploaded videos into a queue. A pool of workers can then process these videos in batches (e.g., every 5-10 minutes or once a batch reaches a certain size). This approach is more cost-effective and resource-efficient because it allows for high hardware utilization and can smooth out the processing load from peak upload times. It can easily meet the 1-hour SLO while being significantly cheaper to operate than a real-time system.

**Answer 3**
**Primary Benefit:** The main benefit would be a significant reduction in system load and improved latency. Instead of running a model inference for every request for a given zone, the system would perform one inference and then serve the cached result for all subsequent requests within the 60-second window. This would drastically cut down on the number of expensive model computations, reducing server costs and freeing up resources to handle requests for other zones.

**Most Significant Risk:** The most significant risk is **serving stale data that could negatively impact business outcomes**. Surge pricing is highly dynamic and reflects market conditions that can change in seconds. If a large, unexpected event occurs (e.g., a concert ends), demand in a zone could spike instantly. A 60-second cache would mean that for up to a minute, the system would serve an outdated, lower price multiplier. This would lead to a poor user experience (no available drivers), lost revenue for the company, and frustrated drivers who aren't being compensated for the actual real-time demand. The staleness of the cache is in direct conflict with the "real-time" nature of the problem.

**Answer 4**
**a) Average batch size:**
The service receives 50 requests/second. The maximum wait time is 150ms (0.15 seconds).
Average requests in window = Rate × Time
Average requests in window = 50 req/sec × 0.15 sec = **7.5 requests**
Since the batch can hold up to 16, this is a valid batch size.

**b) New effective processing time per request:**
This is the sum of the maximum wait time and the time it takes to process the batch, divided by the number of items in the batch.
Total time for a batch = Max Wait Time + Batch Inference Time = 150ms + 400ms = 550ms
Effective time per request = Total time / Average requests in batch = 550ms / 7.5 = **73.3ms**

**c) Concurrent requests handled (throughput):**
*   **Non-batched:** A single server takes 200ms (0.2 seconds) per request.
    Throughput = 1 / Time per request = 1 / 0.2s = **5 requests/second**.
*   **Batched:** A single server can process a batch of 7.5 requests in 550ms (0.55 seconds).
    Throughput = Requests per batch / Time per batch = 7.5 / 0.55s = **13.6 requests/second**.

The server can now handle **~2.7 times** more concurrent requests (13.6 / 5). The batching strategy is a net improvement for throughput, but it increases the best-case latency from 200ms to 550ms for a request that has to wait the full 150ms.

**Answer 5**
A dual-path architecture is required, separating the real-time and batch workloads. A single architecture would be a poor choice because the requirements (latency, data volume, model complexity, cost) are fundamentally different.

**High-Level Architecture:**

1.  **Real-time Transaction Scoring Pathway (Low-Latency Stream Processing):**
    *   **Ingestion:** A high-throughput message queue (e.g., Kafka) ingests transaction events in real-time.
    *   **Feature Engineering:** A stream processing service (e.g., Flink, Kinesis Data Analytics) consumes events, enriches them with user features from a low-latency database (e.g., Redis, DynamoDB), and prepares feature vectors.
    *   **Inference Service:** A horizontally-scalable microservice hosts the lightweight fraud model. It's built for low latency (e.g., using a high-performance serving framework like NVIDIA Triton Inference Server) and auto-scales based on the transaction rate. It reads from the stream processor and outputs a risk score.
    *   **Decision Engine:** The score is evaluated, and a decision (approve/decline) is made.
    *   **Scalability Consideration:** The key is horizontal scalability at each step and minimizing network hops. The model must be optimized for speed (e.g., smaller architecture, quantization).

2.  **Weekly Account Review Pathway (Batch Processing):**
    *   **Data Lake:** All transaction data is archived in a scalable, low-cost data lake (e.g., S3, Google Cloud Storage).
    *   **Scheduled Job:** A weekly scheduled job (e.g., using Airflow, Cron) triggers a distributed data processing job (e.g., Spark).
    *   **Large-Scale Feature Engineering:** The Spark job reads all transaction data for the past week for all accounts, performing complex aggregations and feature calculations that would be impossible in real-time.
    *   **Batch Inference:** The job then applies the complex, computationally intensive model to the generated features for all accounts. This can be done on a large cluster of machines that are spun up for the job and shut down afterward to save costs.
    *   **Output:** The results (e.g., a list of flagged accounts) are written to a database for review by human analysts.
    *   **Scalability Consideration:** The key is the ability to parallelize data processing over a large dataset. The cost is managed by using ephemeral compute resources.

**Why a unified architecture is a poor choice:** The real-time path requires expensive, always-on servers optimized for p99 latency. The batch path requires massive but temporary compute power optimized for throughput. Trying to use the real-time infrastructure for the batch job would be slow and inefficient. Trying to use the batch infrastructure for real-time scoring would fail to meet the 50ms latency requirement.

**Answer 6**
The proposed new architecture is a **Microservices-based Model Ensemble** served via a central API Gateway. This pattern is often called a "multi-armed bandit" or "model router" approach.

**Architectural Components:**

1.  **API Gateway / Model Router:** This is the single entry point for all recommendation requests from the mobile app. Its key responsibility is to route incoming requests to one or more of the downstream model services based on defined rules (e.g., route 80% of traffic to the main model, 10% to experiment A, 10% to experiment B). It also handles authentication and logging.
2.  **Recommendation Model Microservices:** Instead of one monolith, each distinct recommendation algorithm (workout, meal plan, A/B test variant) is deployed as a separate, independent microservice.
    *   Each service has its own container, can be scaled independently, and can be deployed without affecting the others.
    *   This allows for using the best hardware for the job. The main workout model might still need a GPU, but a simpler meal suggestion model might run perfectly on a much cheaper CPU instance.
3.  **Shared Feature Store:** To avoid data duplication and ensure consistency, a centralized feature store is used. This service provides low-latency access to pre-computed user features (e.g., workout history, user goals) for all model microservices.
4.  **Experimentation & Configuration Service:** A central service that the API Gateway consults to get the current routing rules (e.g., "send user IDs ending in '1' to model B"). This allows product managers to change A/B test allocations without requiring a code deployment.

**How this resolves the problems:**

*   **Cost Savings:** By breaking up the monolith, we can right-size the infrastructure for each specific model. Simpler models can run on cheap CPU instances, drastically reducing the reliance on expensive GPUs. Independent scaling also means we don't have to scale the entire monolith just because one feature is popular.
*   **Faster Iteration:** A new meal suggestion model can be developed, tested, and deployed as its own microservice in isolation. A deployment failure in this new service will not bring down the core workout recommendation feature. Deployment times are reduced from hours to minutes.
*   **A/B Testing:** This is now a core function of the API Gateway/Router. The business can easily allocate a small percentage of live traffic to a new experimental model. Performance can be measured in a real-world setting, and a gradual rollout can be performed by simply adjusting the routing percentages in the configuration service. This allows for data-driven decisions on which new features to launch.