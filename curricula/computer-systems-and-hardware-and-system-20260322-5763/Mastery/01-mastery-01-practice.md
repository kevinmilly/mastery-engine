## Exercises

**Exercise 1**
A high-performance web server uses a pool of 10 pre-initialized worker processes to handle incoming requests. To avoid the overhead of forking a new process for each request, a parent process accepts connections and needs to dispatch the work to an available worker. Multiple requests can arrive concurrently. Which concurrency primitive (a mutex or a counting semaphore) is more appropriate for the parent process to manage the pool of available workers? Justify your choice by explaining how the primitive would be initialized and used in the dispatch logic.

**Exercise 2**
Analyze the following C-like pseudocode for a consumer thread in a producer-consumer scenario. It uses a mutex and a condition variable to wait for items to appear in a shared queue. Identify the critical flaw in its use of `cond_wait` and explain the problematic behavior it could cause, specifically in the context of "spurious wakeups." How should the code be corrected?

```c
// Pseudocode for consumer thread
mutex_lock(&queue_mutex);

if (is_queue_empty(&shared_queue)) {
    // Wait until the producer signals that an item is available
    cond_wait(&cond_has_item, &queue_mutex);
}

// Dequeue and process the item
item = queue_dequeue(&shared_queue);
mutex_unlock(&queue_mutex);
process(item);
```

**Exercise 3**
Two threads, T1 and T2, are operating on two shared data structures, A and B, each protected by its own mutex, `mutex_A` and `mutex_B`. The threads execute the following sequences:

-   **T1:** `lock(mutex_A); lock(mutex_B); ...; unlock(mutex_B); unlock(mutex_A);`
-   **T2:** `lock(mutex_B); lock(mutex_A); ...; unlock(mutex_A); unlock(mutex_B);`

If the operating system scheduler interleaves their execution, a deadlock can occur. Identify which of the four necessary conditions for deadlock (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) are met in the deadlock state and briefly justify why each one applies to this specific scenario.

**Exercise 4**
Consider two "polite" threads, T1 and T2, trying to acquire two locks, L1 and L2. Each thread has a policy: if it holds one lock and fails to acquire the second, it immediately releases the lock it holds and retries the entire process after a short delay.

-   T1 acquires L1.
-   T2 acquires L2.
-   T1 tries to acquire L2, fails (as T2 holds it), so T1 releases L1 and waits.
-   T2 tries to acquire L1, fails (as T1 may have held it, or is about to re-acquire it), so T2 releases L2 and waits.

This cycle repeats indefinitely. Are the threads in a state of deadlock or livelock? Justify your answer by comparing the state of the threads (e.g., blocked vs. running) and the consumption of system resources in this scenario versus a classic deadlock.

**Exercise 5**
You are developing a multi-threaded graphics rendering engine. To render a frame, a thread needs to acquire exclusive access to two resources: the `VertexBuffer` and the `TextureAtlas`. Different rendering tasks may require these resources in a different order. For example, `TaskA` might need to update the vertex buffer first, while `TaskB` needs to load a texture first.

A naive locking strategy would be for each task to lock the resources in the order it needs them.

1.  Describe how this naive strategy could lead to a deadlock between two threads running `TaskA` and `TaskB`.
2.  Propose a robust deadlock-prevention strategy that allows both tasks to run concurrently without risking deadlock. Your solution must not use a single global lock for both resources. Provide pseudocode for a function `acquire_rendering_locks(VertexBuffer* vb, TextureAtlas* ta)` that implements your strategy.

**Exercise 6**
You are tasked with implementing a "reader-writer lock," a synchronization mechanism that allows multiple concurrent "readers" but only one exclusive "writer." Specifically:
-   Any number of reader threads can hold the lock simultaneously.
-   A writer thread can only acquire the lock if no other thread (reader or writer) holds it.

Design the data structures and the logic for the `read_lock()`, `read_unlock()`, `write_lock()`, and `write_unlock()` functions using only mutexes and condition variables. Explain your design choices, focusing on how you manage the state (e.g., counts of readers and writers) and how you use condition variables to signal state changes correctly to waiting threads.

---

## Answer Key

**Answer 1**
A **counting semaphore** is the more appropriate primitive.

**Reasoning:**
A mutex is a binary lock, suitable for protecting a single resource or critical section. It cannot manage a pool of multiple interchangeable resources. A counting semaphore, however, is designed for this exact purpose.

*   **Initialization:** The semaphore would be initialized to the number of available workers, which is 10. `semaphore_init(&worker_pool_sem, 10);`
*   **Usage:**
    *   When the parent process needs to dispatch a request, it calls `semaphore_wait(&worker_pool_sem)`. This operation will succeed and decrement the semaphore's count as long as the count is greater than zero (i.e., at least one worker is free). If the count is zero, the parent process will block until a worker is freed.
    *   When a worker process finishes its task, it signals its availability back to the pool by calling `semaphore_post(&worker_pool_sem)`, which increments the semaphore's count and potentially unblocks the parent process if it was waiting.

This correctly models the "N available resources" problem, whereas a mutex could only protect the queue or data structure that tracks the workers, not the workers themselves.

**Answer 2**
The critical flaw is using an `if` statement to check the condition before waiting, instead of a `while` loop.

**Problematic Behavior:**
The `cond_wait` function can experience "spurious wakeups," where a thread wakes up from its wait state even though it was not explicitly signaled by another thread. If the consumer thread wakes up spuriously, the `if` condition will not be re-checked. The thread will incorrectly assume an item is available, proceed to call `queue_dequeue()` on what is still an empty queue, and cause a runtime error (e.g., segmentation fault, assertion failure) or undefined behavior.

**Correction:**
The `if` statement must be replaced with a `while` loop.

```c
// Corrected pseudocode
mutex_lock(&queue_mutex);

while (is_queue_empty(&shared_queue)) { // Use while instead of if
    cond_wait(&cond_has_item, &queue_mutex);
}

item = queue_dequeue(&shared_queue);
mutex_unlock(&queue_mutex);
process(item);
```

This ensures that even if the thread wakes up spuriously, it re-evaluates the condition (`is_queue_empty`). If the queue is still empty, it will go back to waiting, thus handling the spurious wakeup correctly.

**Answer 3**
All four necessary conditions for deadlock are met in this scenario.

**Justification:**

1.  **Mutual Exclusion:** This condition is met because mutexes are, by definition, mutually exclusive. Only one thread can hold `mutex_A` at a time, and only one thread can hold `mutex_B` at a time.
2.  **Hold and Wait:** This is the core of the problem. For example, after T1 successfully locks `mutex_A` and T2 locks `mutex_B`, T1 holds `mutex_A` while it waits to acquire `mutex_B`. Symmetrically, T2 holds `mutex_B` while it waits for `mutex_A`.
3.  **No Preemption:** The operating system cannot forcibly take a mutex away from a thread that holds it. The mutex can only be released voluntarily by the thread that acquired it (by calling `unlock`). T1 cannot be forced to release `mutex_A` while it waits for `mutex_B`.
4.  **Circular Wait:** A circular chain of dependencies exists. T1 is waiting for a resource (`mutex_B`) held by T2, and T2 is waiting for a resource (`mutex_A`) held by T1. This creates the (T1 -> T2 -> T1) dependency cycle.

**Answer 4**
This scenario describes a **livelock**.

**Justification:**
*   **State of Threads:** In a deadlock, the involved threads are in a `BLOCKED` or `WAITING` state, consuming no CPU cycles because they are waiting on a kernel object. In this livelock scenario, the threads are continuously active. They are running, attempting to acquire a lock, failing, releasing their other lock, and retrying. This consumes CPU cycles without achieving any forward progress.
*   **Resource Consumption:** Deadlocked threads are idle. Livelocked threads are busy-waiting or repeatedly trying and failing, actively consuming CPU time and contributing to system load, but accomplishing no useful work. The system is active, but the application's state is not advancing.

In summary, the key difference is that the threads in a livelock are actively changing state and executing instructions, whereas deadlocked threads are statically blocked.

**Answer 5**
1.  **Deadlock Scenario:**
    A deadlock occurs if the scheduler interleaves the execution of two threads as follows:
    *   Thread 1 (running `TaskA`) locks the `VertexBuffer`.
    *   Thread 2 (running `TaskB`) locks the `TextureAtlas`.
    *   Thread 1 now attempts to lock the `TextureAtlas` but blocks because Thread 2 holds it.
    *   Thread 2 now attempts to lock the `VertexBuffer` but blocks because Thread 1 holds it.
    This creates a circular wait, and both threads are deadlocked.

2.  **Deadlock-Prevention Strategy (Resource Ordering):**
    The most common and effective strategy is to enforce a global order in which locks are acquired. We can use the memory addresses of the resource objects to establish a canonical order. A thread must always lock the object with the lower memory address first.

    **Pseudocode:**
    ```c
    void acquire_rendering_locks(VertexBuffer* vb, TextureAtlas* ta) {
        // Use memory addresses to establish a consistent locking order.
        // C-style casting to uintptr_t to compare addresses as integers.
        void* ptr_vb = (void*)vb;
        void* ptr_ta = (void*)ta;

        if (ptr_vb < ptr_ta) {
            // Lock VertexBuffer first, then TextureAtlas
            lock(vb->mutex);
            lock(ta->mutex);
        } else if (ptr_ta < ptr_vb) {
            // Lock TextureAtlas first, then VertexBuffer
            lock(ta->mutex);
            lock(vb->mutex);
        } else {
            // Both pointers are the same; this shouldn't happen for two distinct
            // resources, but if it did, we only need to lock once.
            lock(vb->mutex);
        }
    }
    ```
    This strategy prevents a circular wait because all threads will attempt to acquire the locks in the same hierarchical order, regardless of the task's logical needs.

**Answer 6**
This design requires a mutex for controlling access to state variables and at least one condition variable to manage waiting threads.

**Data Structures:**
```c
struct ReaderWriterLock {
    mutex lock_mutex;
    condition_variable readers_can_enter; // To signal readers
    condition_variable writer_can_enter;  // To signal a writer
    int active_readers; // Number of threads currently reading
    int waiting_writers; // Number of writers waiting for the lock
    bool writer_is_active; // True if a writer holds the lock
};
```

**Logic and Design Choices:**

*   **`read_lock()`:**
    1.  Lock the mutex to protect the state variables.
    2.  Wait until there are no active writers and no waiting writers. Using a `while` loop: `while (writer_is_active || waiting_writers > 0)`. The `waiting_writers` check prevents new readers from "starving" a waiting writer.
    3.  Once the condition is met, increment `active_readers`.
    4.  Unlock the mutex.

*   **`read_unlock()`:**
    1.  Lock the mutex.
    2.  Decrement `active_readers`.
    3.  If `active_readers` is now zero, it's possible a writer was waiting. Signal the writer's condition variable: `cond_signal(&writer_can_enter)`.
    4.  Unlock the mutex.

*   **`write_lock()`:**
    1.  Lock the mutex.
    2.  Increment `waiting_writers` to signal intent to write, preventing new readers from acquiring the lock.
    3.  Wait until there are no active readers and no active writer. Using a `while` loop: `while (active_readers > 0 || writer_is_active)`.
    4.  Once the condition is met, decrement `waiting_writers`, set `writer_is_active` to `true`.
    5.  Unlock the mutex.

*   **`write_unlock()`:**
    1.  Lock the mutex.
    2.  Set `writer_is_active` to `false`.
    3.  Decide who to wake up. To avoid writer starvation, prioritize signaling a waiting writer: `if (waiting_writers > 0) { cond_signal(&writer_can_enter); }`. Otherwise, if there are no writers, release all waiting readers: `else { cond_broadcast(&readers_can_enter); }`. Using broadcast is important so all waiting readers can acquire the lock simultaneously.
    4.  Unlock the mutex.

This design uses a mutex for atomicity of state changes and condition variables to allow threads to sleep efficiently instead of busy-waiting, waking them only when the state they depend on has changed. The separation into two condition variables can help clarify logic and avoid accidentally waking the wrong type of thread. The `waiting_writers` count is a key part of the logic to give writers priority and prevent starvation.