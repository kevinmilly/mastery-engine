## Exercises

**Exercise 1**
An online learning platform provides an API for managing course enrollments. A client application makes the following API calls. For each call, determine if the operation is naturally idempotent or non-idempotent.

1.  `POST /users/123/enrollments` with a body `{ "course_id": "CS101" }` to enroll user 123 in a new course.
2.  `PUT /users/123/profile` with a body `{ "display_name": "Alex" }` to update the user's display name.
3.  `DELETE /users/123/enrollments/CS101` to un-enroll the user from a specific course.

**Exercise 2**
A user clicks a "Like" button on a social media post. The client app sends a `POST /posts/456/like` request to the server. Due to a temporary network issue, the client doesn't receive a confirmation from the server and the "Like" button remains un-highlighted. The client is designed to automatically retry failed requests. If this `like` operation is *not* idempotent, what is the likely unintended consequence on the system's data?

**Exercise 3**
You are building an email dispatch service. A client calls your API endpoint `POST /send-email` with a JSON body containing the recipient and message content. To handle network failures, the client will retry the API call if it doesn't receive a success response within 5 seconds. Users are reporting that they sometimes receive the same email twice.

What is the fundamental design flaw causing this issue? Propose one specific piece of information the client could add to its request to help your server fix this problem.

**Exercise 4**
A gaming application needs to update a player's inventory. The server can receive two different types of requests to give the player 10 health potions:

- **Request A:** An instruction to *add* 10 health potions to the player's current total.
- **Request B:** An instruction to *set* the player's health potion count to a specific number (e.g., 50, which the client calculated from a previous state of 40).

Which of these two request types represents an idempotent operation? Explain your reasoning and describe how a network-induced retry of the non-idempotent request could lead to an incorrect inventory count.

**Exercise 5**
A distributed video processing system has a "worker" service that transcribes audio from video files. A "manager" service sends jobs to the workers. To achieve fault tolerance, if the manager sends a job and doesn't get a "complete" signal back within 30 minutes, it assumes the worker has crashed and re-sends the same job request to a different worker.

The transcription job involves two steps: (1) generating the text, and (2) appending the text to a `transcripts.log` file. If the original worker was just slow, not crashed, this retry logic could result in two workers processing the same video.

How does this fault tolerance strategy compromise data consistency? Explain how redesigning the "append to log" step to be idempotent would solve this problem while maintaining fault tolerance.

**Exercise 6**
You are designing the API for a new ride-sharing service. The most critical endpoint is `POST /book-ride`, which finds a nearby driver and creates a trip for a user. A user's app might retry this request due to poor mobile connectivity, but the user should never be charged for two rides if they only intended to book one.

Describe a high-level mechanism to make the `POST /book-ride` operation idempotent. Specify:
1.  What key piece of data the client application must generate and include in every `POST /book-ride` request.
2.  What state the server must maintain, and for how long, to correctly handle retries of the same booking request.

---

## Answer Key

**Answer 1**
1.  **Non-idempotent:** Executing `POST /users/123/enrollments` multiple times would likely create multiple separate enrollment records for the user in the same course, which is an incorrect state. Each call changes the system state in a new way.
2.  **Idempotent:** Executing `PUT /users/123/profile` with the same body multiple times will have the same result as executing it once. The first call sets the display name to "Alex", and subsequent calls will set the name to "Alex" again, which doesn't change the state further.
3.  **Idempotent:** The first time `DELETE /users/123/enrollments/CS101` is called, the enrollment is removed. If it's called again, the enrollment is already gone, so the system state does not change any further. The end result is the same.

**Answer 2**
The unintended consequence is that the post's like counter could be incremented multiple times for a single user action. If the server receives the first `like` request and successfully increases the like count but the response is lost, the client will retry. The server, not knowing this is a duplicate request, will process it again and incorrectly increment the like count a second time. This corrupts the data integrity of the like count.

**Answer 3**
The fundamental design flaw is that the server cannot distinguish an original request from a retry. It treats every `POST /send-email` call as a unique instruction to send a new email.

To fix this, the client could add a unique **idempotency key** (e.g., a UUID like `"request_id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8"`) to the request body. The server can then track received `request_id`s. If a request comes in with an ID it has already successfully processed, it can skip the email-sending logic and simply return the saved success response from the original request.

**Answer 4**
**Request B** (setting the count to a specific number) is the idempotent operation.

**Reasoning:**
- **Request B (Idempotent):** If the client sends a request to `set potion_count = 50`, the first call will set the count to 50. Any retried calls will also attempt to set the count to 50, which doesn't change the state after the first successful execution. The final state is always 50.
- **Request A (Non-idempotent):** If the client sends a request to `add 10 potions`, the operation is relative. If the starting count is 40, the first successful call makes it 50. If this request is retried due to a network error, a second execution would add another 10, resulting in an incorrect count of 60.

**Scenario for incorrect result:** A player with 40 potions buys 10 more. The client sends Request A. The server updates the count to 50 but the success response is lost. The client retries, sending Request A again. The server receives the duplicate request and adds another 10, leaving the player with 60 potions instead of the correct 50.

**Answer 5**
The fault tolerance strategy compromises data consistency because the core operation—appending text to a file—is not idempotent. If two workers successfully process the same video, they will both append the full transcription text to the `transcripts.log` file, resulting in duplicated content. This makes the log file inconsistent with the actual events that occurred.

Redesigning the step to be idempotent would solve this. For example, instead of a simple append, the worker could:
1.  Generate a unique ID for the transcription job (e.g., based on the video file name or a job ID from the manager).
2.  Before writing, check if a transcription with that unique ID already exists in the log.
3.  Only write the transcription text if that ID is not found.

This way, if the first worker completes the job and the second worker attempts it later, the second worker will see that the work has already been done and will not write the duplicate text. This maintains fault tolerance (the job is guaranteed to be done by at least one worker) and ensures data consistency (the job is only recorded once).

**Answer 6**
1.  **Client Data:** The client application must generate a unique **idempotency key** for each distinct booking attempt. This should be a universally unique identifier (UUID) or a similar random, high-entropy string. The client creates this key *once* when the user first hits the "book ride" button and includes it in the header (e.g., `Idempotency-Key: a1b2c3d4-e5f6...`) or body of every retry of that specific request.

2.  **Server State:** The server must maintain a record of the idempotency keys it has recently processed. This record would store:
    - The `idempotency_key` itself.
    - The status of the request associated with that key (e.g., `in_progress`, `completed`, `failed`).
    - The response that was generated for the original request.

When a `POST /book-ride` request arrives, the server first checks if the provided `Idempotency-Key` is in its records.
- If the key is new, the server processes the booking and stores the result before sending the response.
- If the key exists, the server immediately returns the stored response from the original request without re-processing the booking.

The server needs to store this state for a reasonable window of time, such as 24 hours, to cover potential client retries without storing keys indefinitely.