## Exercises

**Exercise 1**
A sentiment analysis model takes a single string of text (`"review_text"`) and returns a sentiment label (`"positive"`, `"negative"`, or `"neutral"`) and a confidence score (a float between 0.0 and 1.0). Design a valid JSON payload for a `POST` request to this model's `/predict` endpoint and a corresponding JSON response for a successful prediction.

**Exercise 2**
An API serves a customer churn prediction model. A client application needs to perform two actions: (1) get the version of the currently loaded model and (2) send a customer's data to get a churn prediction. For each action, which HTTP verb (`GET`, `POST`, `PUT`, `DELETE`) is most appropriate and why? Also, what HTTP status code would you expect the API to return if the client sends prediction data with a missing required feature?

**Exercise 3**
Your team has deployed a 500MB image classification model via a REST API. Users report that the first request after a period of inactivity is extremely slow (takes 10-15 seconds), but subsequent requests are fast (~200ms). The model inference itself is known to take only ~150ms. What is the most likely cause of this initial delay, based on how a web server for a model API is typically implemented? Explain the underlying mechanism.

**Exercise 4**
A fraud detection API currently processes one transaction at a time via a `POST` request to `/predict`. The input is a JSON object representing a single transaction. The team wants to improve efficiency by allowing clients to send up to 100 transactions in a single request. How would you modify the JSON structure of the request body and the corresponding response body to support this batch prediction functionality? Provide an example of both the new request and response format.

**Exercise 5**
You are tasked with deploying two versions of a spam detection model (v1.1 and v1.2) simultaneously for A/B testing. You have two persisted model files (`spam_model_v1.1.pkl` and `spam_model_v1.2.pkl`) and a Dockerized Flask application that serves the model. How would you design the REST API endpoints and leverage containerization to run both versions and route requests to them independently? Describe the API routes and the Docker command(s) you might use to achieve this.

**Exercise 6**
A model API is used to generate personalized product recommendations for users on an e-commerce site. The model requires a user's entire click history (which can be large) as input. The current API design requires the client to send the full click history with every single request to the `/recommend` endpoint. This is causing high network latency and bandwidth usage. A colleague suggests creating a stateful endpoint `/sessions` where a client first `POST`s the user's history to create a session ID, and then makes subsequent `GET` requests to `/recommendations/{session_id}`. Critically evaluate this proposal. What core REST principle does it violate? What are the practical benefits and drawbacks of this stateful design compared to the pure RESTful approach in this specific scenario?

---

## Answer Key

**Answer 1**
**Reasoning:** The request payload must contain the data the model needs, structured in a key-value format. The response should contain the model's output, also structured clearly.

**Example Request JSON:**
The JSON object should have a key, for instance `review_text`, that the API server code will expect, and the value will be the text to analyze.
```json
{
  "review_text": "The battery life on this new phone is incredible!"
}
```

**Example Response JSON:**
The response should contain the prediction results. Using keys like `sentiment_label` and `confidence_score` makes the output self-describing.
```json
{
  "sentiment_label": "positive",
  "confidence_score": 0.987
}
```

**Answer 2**
**Reasoning:** HTTP verbs should be chosen based on the action's semantics: `GET` for retrieving data without side-effects, and `POST` for submitting new data to be processed. HTTP status codes communicate the outcome of the request, with the `4xx` series indicating client-side errors.

1.  **Get model version:** The most appropriate verb is **`GET`**.
    *   **Why:** This action is a request to retrieve information (the model version) from the server. It's a read-only, safe, and idempotent operation, which is the primary use case for `GET`. An example endpoint could be `GET /model/version`.

2.  **Get churn prediction:** The most appropriate verb is **`POST`**.
    *   **Why:** This action involves sending a payload of customer data to the server for processing. `POST` is used to submit an entity to the specified resource, often causing a change in state or side-effects on the server (in this case, running a computation). The customer data is sent in the request body, which is standard practice for `POST`. An example endpoint would be `POST /predict`.

3.  **HTTP Status Code for Missing Feature:** The API should return a **`400 Bad Request`** status code.
    *   **Why:** This status code indicates that the server cannot process the request due to a client error. A missing required feature in the input data is a form of malformed syntax or an invalid request from the client's perspective. An accompanying error message in the response body explaining which feature is missing would be best practice.

**Answer 3**
**Reasoning:** The issue is not the model inference time but the one-time setup cost. In a web application context, this points directly to loading a large asset (the model) into memory.

**Most Likely Cause:** Lazy loading of the model on the first request.

**Mechanism:**
A simple implementation of a model serving API might load the 500MB model file from disk into memory *inside* the prediction endpoint function. Web server frameworks (like Gunicorn or uWSGI) often use a pool of worker processes to handle requests. When the application is idle, these workers may be shut down or recycled.

1.  **Cold Start:** After a period of inactivity, when a new request arrives, the web server starts a new worker process.
2.  **Model Loading:** This new worker executes the prediction function, which first has to perform the I/O-intensive operation of reading the 500MB model file from disk and deserializing it into a usable model object in RAM. This step accounts for the long 10-15 second delay.
3.  **Inference:** Once the model is in memory, the actual prediction is fast (~150ms).
4.  **Warm State:** For subsequent requests that are handled by the *same* worker process, the model is already loaded in memory. The API can skip the loading step and go straight to inference, resulting in the fast ~200ms response time.

The best practice to fix this is to load the model once when the application server starts (globally, outside the request handler function), so all workers can access the model in memory from the moment they are ready to serve requests.

**Answer 4**
**Reasoning:** To support batching, the JSON structure must be changed from a single object to a collection of objects, typically an array (or list). The response should mirror this structure, providing a result for each item in the request, maintaining the order.

**Modified Request Body:**
The request body should contain a JSON object with a single key (e.g., `"transactions"`) whose value is an array of the individual transaction objects.

*Example Batch Request:*
```json
{
  "transactions": [
    {
      "transaction_id": "a1b2-c3d4",
      "amount": 150.75,
      "merchant_category": "online_retail"
    },
    {
      "transaction_id": "e5f6-g7h8",
      "amount": 25.00,
      "merchant_category": "transport"
    }
  ]
}
```

**Modified Response Body:**
The response should also be an array, where each element corresponds to the prediction for the transaction at the same index in the input array. This ensures the client can easily map results back to their original requests.

*Example Batch Response:*
```json
{
  "predictions": [
    {
      "transaction_id": "a1b2-c3d4",
      "is_fraud": false,
      "score": 0.05
    },
    {
      "transaction_id": "e5f6-g7h8",
      "is_fraud": true,
      "score": 0.92
    }
  ]
}
```

**Answer 5**
**Reasoning:** This requires combining knowledge of API route design with containerization principles. Each model version should be logically separated. This can be achieved through different API routes within a single service, or more robustly, by running separate container instances for each model version.

**Solution:**

**1. API Endpoint Design:**
The API routes should be versioned to allow clients to explicitly target a specific model. A clear and conventional way to do this is by including the version number in the URL path.

*   **Endpoint for v1.1:** `POST /v1.1/predict`
*   **Endpoint for v1.2:** `POST /v1.2/predict`

The Flask application code would load both model files and use routing decorators (`@app.route('/v1.1/predict', methods=['POST'])`) to direct incoming requests to the correct prediction logic using the corresponding loaded model.

**2. Leveraging Containerization (Docker):**
A more scalable and isolated approach is to run each model version in its own container. The application code inside the Docker image would be configured (e.g., via an environment variable) to load only one specific model file.

*   **Dockerfile:** The Dockerfile would be generic, but it would be designed to accept an environment variable like `MODEL_PATH` to specify which model file to load at startup.

*   **Docker Commands:** You would run two separate containers from the same image, but provide a different environment variable and map them to different host ports.

    ```bash
    # Run container for model v1.1 on host port 8001
    docker run -d \
      -p 8001:8080 \
      -e MODEL_PATH="models/spam_model_v1.1.pkl" \
      --name spam-detector-v1-1 \
      my-spam-app:latest

    # Run container for model v1.2 on host port 8002
    docker run -d \
      -p 8002:8080 \
      -e MODEL_PATH="models/spam_model_v1.2.pkl" \
      --name spam-detector-v1-2 \
      my-spam-app:latest
    ```
    An API gateway or load balancer would then be configured to route traffic for `api.example.com/v1.1/...` to port `8001` and traffic for `api.example.com/v1.2/...` to port `8002`. This provides better isolation and allows for independent scaling of each model version.

**Answer 6**
**Reasoning:** This question requires evaluating a design trade-off. The proposed solution knowingly breaks a core REST principle (statelessness) to solve a practical performance problem (high latency/bandwidth). A good answer will identify the principle, then analyze the pros and cons of this pragmatic compromise.

**Evaluation of the Proposal:**

**1. Core REST Principle Violation:**
The proposal violates the principle of **Statelessness**. In a stateless architecture, every request from a client to a server must contain all the information needed to understand and complete the request. The server should not store any client context (or session state) between requests. The proposed design explicitly creates server-side state by storing the user's click history and associating it with a `session_id`.

**2. Practical Benefits (Pros):**
*   **Reduced Network Latency:** After the initial `POST` to create the session, subsequent requests to `/recommendations/{session_id}` are much smaller. The client only sends a short session ID instead of the entire, potentially large, click history. This significantly reduces upload bandwidth and network transit time.
*   **Improved Client-side Simplicity:** The client application no longer needs to manage and re-transmit the large history object for every recommendation request.
*   **Potential for Server-side Caching:** The server can pre-process the user's history upon session creation and cache the results (e.g., user embeddings). Subsequent recommendation requests for that session would be much faster computationally, not just from a network perspective.

**3. Practical Drawbacks (Cons):**
*   **Increased Server-side Complexity:** The server now has to manage session state. This includes creating, storing, retrieving, and eventually expiring/cleaning up session data. This adds complexity to the application logic and infrastructure.
*   **Reduced Scalability and Reliability:** Storing state on the server makes horizontal scaling more difficult. If you have multiple API server instances behind a load balancer, you must ensure that a request for a given `session_id` is routed to the server that holds that session data (sticky sessions), or use a shared state store like Redis or a database, which adds another dependency and potential point of failure.
*   **Violates REST Conventions:** While not a functional blocker, it breaks the standard, easy-to-understand model of a RESTful API. This can make the API harder for new developers to use and may complicate caching at HTTP layers (e.g., in proxies or CDNs).

**Conclusion:**
The colleague's proposal is a pragmatic engineering trade-off. While it violates the purity of RESTful design by introducing state, the performance benefits from reduced network payload size for a high-frequency operation (getting recommendations) likely outweigh the drawbacks of increased server complexity in this specific scenario. The choice to adopt this pattern depends on how severe the latency problem is and the team's capacity to manage a stateful service.