## Exercises

**Exercise 1**
A developer is designing an API for a social media platform. They have created an endpoint `POST /users/{userId}/followers` that allows one user to follow another. The request body is empty. A client application might accidentally send this request twice in a row for the same user. Explain why this endpoint, as designed, is not idempotent and describe the unintended side effect of a duplicate request.

**Exercise 2**
You are building an inventory management system. You have an endpoint `PATCH /products/{productId}` to update product details. A user wants to increase the stock quantity of a product. They propose adding a `change_by` field to the request body, like so: `{"change_by": 5}`. The server would read the current quantity, add 5, and save the new value. Is this operation idempotent? Justify your answer and suggest a simple change to the request body structure to make the stock update operation idempotent.

**Exercise 3**
A mobile banking app uses an API endpoint `POST /transfers` to move money between accounts. The request includes a unique `Request-ID` header for idempotency. A user initiates a $100 transfer. The app sends the request, but due to a brief network outage, it doesn't receive a response and shows an error. The user, seeing the error, taps the "Retry" button. Describe the sequence of events on the server for both the initial, timed-out request and the subsequent retry, explaining how the idempotency key prevents a duplicate transfer.

**Exercise 4**
Your team is implementing the server-side logic for idempotency. You are storing idempotency keys in a database table with the columns: `idempotency_key` (primary key), `status` ('processing' or 'completed'), `response_code`, and `response_body`. A request comes in with an `Idempotency-Key` header. Outline the two distinct logical paths the server should take if it finds a matching key already exists in the database. One path for when the status is 'processing', and another for when the status is 'completed'.

**Exercise 5**
Consider a video hosting platform where users upload large video files. The upload process is handled by an API Gateway which accepts a request to `POST /videos`. Instead of processing the video synchronously, the gateway immediately stores the video file, creates a job record in a database with a "pending" status, and places a message with the `job_id` onto a message queue. A separate fleet of "transcoding workers" consumes messages from this queue to perform the actual video processing.

The client might retry the `POST /videos` request if it fails. The message queue guarantees "at-least-once" delivery, meaning a worker might receive the same message more than once. Where in this distributed system (API Gateway, Transcoding Worker, or both) should idempotency checks be implemented? Justify your design choice.

**Exercise 6**
You are designing a payment service that acts as an intermediary. Your service exposes a `POST /charge` endpoint to your clients. When your service receives a request, it must then make its own API call to a third-party payment processor (e.g., Stripe, PayPal). The connection between your service and the third-party processor can be unreliable.

Design an idempotency strategy that handles two types of failures:
1.  Your client retries its request to your `/charge` endpoint.
2.  Your service's call to the third-party processor fails, and your service needs to retry it.

Explain how your idempotency key(s) would be generated and used throughout this entire workflow to prevent both duplicate charges to the end-user and duplicate records in your own system.

---

## Answer Key

**Answer 1**
The endpoint `POST /users/{userId}/followers` is not idempotent because the side effect of the operation changes with each repeated call.

*   **Reasoning:** The first successful call adds the authenticated user as a follower to `{userId}`, changing the system state as intended. A second identical call would attempt to perform the same action. If the system logic simply adds a new follower record without checking for existence, it could create a duplicate entry in the followers list, or it might return an error like "Already Following". An idempotent operation, however, must produce the *same end result* and ideally the same response. A truly idempotent version would recognize the second request as a duplicate and return the same success response as the first, without altering the state a second time.
*   **Unintended Side Effect:** The primary side effect is either corrupting the followers data with duplicate entries or returning an unexpected error to a client that is simply retrying a failed request, making the client's error handling logic more complex.

**Answer 2**
No, the operation `{"change_by": 5}` is not idempotent.

*   **Reasoning:** Idempotency requires that repeated identical requests produce the same result. If the current stock is 10, the first request `{"change_by": 5}` will set the stock to 15. If the client retries this exact same request, the server will read the new current stock (15) and add 5 again, resulting in a final stock of 20. The end state of the system is different after each call, violating the principle of idempotency. This is a classic example of a relative change versus an absolute one.
*   **Suggested Change:** To make the operation idempotent, the request body should specify the target state, not the change. The request should be structured to set an absolute value, for example: `{"set_quantity": 15}`. With this design, if the client sends the request multiple times, the server will set the stock quantity to 15 each time. The first call changes the state from 10 to 15, and subsequent calls have no further effect on the state, which remains 15.

**Answer 3**
The idempotency key ensures that the transfer operation is executed only once, even with a client retry.

*   **Initial Request:**
    1.  The mobile app generates a unique `Request-ID` (e.g., `uuid-1234`).
    2.  It sends `POST /transfers` with the header `Request-ID: uuid-1234`.
    3.  The server receives the request. It first checks its records for `uuid-1234`. It's a new key.
    4.  The server stores `uuid-1234` with a status of 'processing'.
    5.  The server initiates the $100 transfer. Let's assume this is successful.
    6.  The server updates the record for `uuid-1234` to 'completed' and stores the success response (e.g., `201 Created`).
    7.  The server attempts to send the success response back, but the network connection is broken. The client never receives it.

*   **Retry Request:**
    1.  The user's app, having timed out, sends the *exact same request again*, including the header `Request-ID: uuid-1234`.
    2.  The server receives the request. It checks its records for `uuid-1234`.
    3.  This time, it finds the key. The key's status is 'completed'.
    4.  Instead of processing a new transfer, the server immediately retrieves the stored success response associated with `uuid-1234`.
    5.  It sends this stored response back to the client. The client now receives a success message, and the user is correctly charged only once.

**Answer 4**
When a request arrives with an existing `Idempotency-Key`, the server's logic must handle two cases based on the key's stored status:

1.  **Status is 'processing':**
    *   **Reasoning:** This indicates that the original request arrived, but the server is still working on it, or it crashed mid-process. A concurrent process might be holding a lock on this key. A simple retry could lead to a race condition.
    *   **Logical Path:** The server should not start a new operation. Instead, it should immediately respond with an error code indicating a conflict or a locked resource. A `409 Conflict` or `429 Too Many Requests` status code is appropriate. This tells the client that the original request is being handled and it should wait before trying again (ideally with some backoff).

2.  **Status is 'completed':**
    *   **Reasoning:** This means the original request was fully processed, and a final response was generated and stored. The current request is a retry (likely due to a network failure where the client never received the original response).
    *   **Logical Path:** The server should not re-execute the business logic (e.g., charge a credit card again). It should immediately fetch the stored `response_code` and `response_body` associated with that key from the database and send it back to the client. This guarantees the client receives the exact same result as the original, successful request.

**Answer 5**
Idempotency checks should be implemented at **both** the API Gateway and the Transcoding Worker, but they serve different purposes and use different keys.

*   **API Gateway:**
    *   **Purpose:** To prevent the creation of duplicate *jobs* in the system.
    *   **Implementation:** The client should send an idempotency key (e.g., `X-Request-ID`) with the `POST /videos` request. The API Gateway will use this key to ensure that if the client retries the upload, a second, identical job record is not created in the database and a second message is not placed on the queue. It de-duplicates requests at the entry point of the system.

*   **Transcoding Worker:**
    *   **Purpose:** To prevent the same job from being processed multiple times. This is necessary because the message queue provides "at-least-once" delivery, meaning the same `job_id` could be delivered to a worker more than once if a previous worker failed to acknowledge it before crashing.
    *   **Implementation:** The worker should use the `job_id` (from the message body) as its idempotency key. Before starting to transcode, it should check a shared state store (like a database or Redis) to see if this `job_id` is already being processed or has been completed. If so, it can safely discard the message. This makes the processing step idempotent, protecting against failures within the asynchronous part of the system.

*   **Justification:** Handling idempotency only at the gateway would still leave the system vulnerable to duplicate processing from the message queue. Handling it only at the worker would still allow duplicate jobs and video files to be created if the client retries the initial API call. A robust distributed system requires idempotency at each stage where retries or duplicate deliveries can occur.

**Answer 6**
This requires a two-level idempotency strategy, one for the client-to-service interaction and one for the service-to-third-party interaction.

1.  **Client-to-Service Idempotency (`POST /charge`)**
    *   **Key Generation:** The client application must generate a unique idempotency key for each payment attempt (e.g., a UUIDv4) and send it in a header, like `Idempotency-Key`.
    *   **Workflow:**
        1.  When your service receives a `POST /charge` request, it first checks a local database for the provided `Idempotency-Key`.
        2.  **If the key exists and is 'completed'**: Return the stored response immediately.
        3.  **If the key is new**: Store the key with a 'processing' status. Now, proceed to the second level.

2.  **Service-to-Third-Party Idempotency**
    *   **Key Generation:** The third-party payment processor likely has its own idempotency mechanism. Your service must generate a *second*, unique key to use for *its* call to the processor. A good practice is to deterministically derive this second key from the client's original key (e.g., `sha256(client_key + secret_salt)`). This ensures that for a single client request, you always use the same key when talking to the third party, even across your own service's retries.
    *   **Workflow:**
        1.  Your service makes the API call to the third-party processor, including the derived idempotency key.
        2.  **If the call succeeds**: Your service receives a `transaction_id`. You should store this `transaction_id`, the final status (`succeeded`), and the client-facing response in your database, associating them with the client's original `Idempotency-Key`. Then, you mark the key's status as 'completed' and respond to your client.
        3.  **If the call fails (e.g., timeout)**: Your service should retry the call to the third party using the *same derived key*. Because the third-party processor is also idempotent, it will either process the charge once (if the first attempt never reached it) or return the original success response without double-charging (if the first attempt worked but your service didn't get the response).
        4.  Once your retry to the third party succeeds, you update your database and respond to the client as in step 2.

This two-key design decouples the two failure domains. The client's key (`Idempotency-Key`) prevents duplicate requests from creating two separate payment flows. The service's derived key ensures that within a single payment flow, retries to the external, unreliable dependency do not result in a double charge.