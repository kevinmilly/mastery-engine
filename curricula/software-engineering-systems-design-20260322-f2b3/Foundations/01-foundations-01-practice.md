## Exercises

**Exercise 1**
A user loads a social media feed on their phone. The phone's app (the client) requests data from the social media company's servers. The server retrieves the user's profile information from one database and the latest posts from another database, then sends the combined data back to the app. Identify one example of concurrency in this process.

**Exercise 2**
You are playing a multiplayer online game. Your character is in a group with three other players, each in a different city. Suddenly, one player's character freezes in place and then disappears from your screen. However, you and the other two players can continue playing the game normally. Which core characteristic of a distributed system does this event demonstrate? Explain your reasoning.

**Exercise 3**
Two colleagues, Alice and Bob, are simultaneously editing the same sentence in a shared online document (like Google Docs). Alice is in London, and Bob is in Tokyo. Alice deletes a word at the exact same moment Bob adds a different word to the end of the sentence. Why is it fundamentally impossible for the system's servers to know with absolute certainty which edit *truly* happened first?

**Exercise 4**
A developer is writing a video processing application that will run on her laptop. To speed things up, she designs the program to use multiple threads: one thread reads the video file from the hard drive, a second thread applies a visual filter, and a third thread writes the processed video back to the drive. All three threads run at the same time on the same machine. Does this multi-threaded application, by itself, constitute a distributed system? Justify your answer by evaluating it against the core characteristics.

**Exercise 5**
An airline booking system is composed of two separate services: a `BookingService` that lets users select seats and a `PaymentService` that processes credit card payments. When a user confirms a booking, the `BookingService` tells the `PaymentService` to charge the card. The `PaymentService` successfully charges the card but then crashes due to a hardware failure before it can send a "success" message back to the `BookingService`. How does the characteristic of *independent failure* create a state-of-the-world ambiguity for the `BookingService` that would not exist if both functions ran on a single machine?

**Exercise 6**
You are tasked with designing a system to control the traffic lights at two adjacent intersections, A and B. The goal is to coordinate the lights to optimize traffic flow.

*   **Design 1:** A single, central computer is connected by wires to all the lights at both intersections. This computer runs all the logic and sends simple "on/off" commands to each light.
*   **Design 2:** Each intersection has its own independent computer (Controller A and Controller B). The controllers communicate with each other over a wireless network to coordinate their timing.

Which design is a distributed system? And for that design, what is the primary challenge introduced by the *absence of a global clock* that the other design does not face?

---

## Answer Key

**Answer 1**
An example of concurrency is the server retrieving profile information and latest posts from two different databases simultaneously. These two data retrieval operations can happen in parallel, at the same time, to speed up the response to the user's phone. The client's request and the server's processing also happen concurrently.

**Answer 2**
This demonstrates **independent failure**. The system consists of multiple independent components (each player's computer/console and the game server). The failure of one component (the disconnected player's internet connection or client) does not cause the entire system to crash. The remaining components (the server and the other players' clients) can continue to function correctly.

**Answer 3**
This is a direct consequence of the **absence of a global clock**. Because of network latency, the signal of Alice's edit from London and the signal of Bob's edit from Tokyo will arrive at the server at slightly different times. The server only knows the order in which it *received* the signals, not the precise order in which they were initiated. There is no single, perfectly synchronized clock shared between Alice, Bob, and the server to definitively timestamp and order the events.

**Answer 4**
No, this is not a distributed system. While it exhibits **concurrency** (multiple threads running at the same time), it lacks the other key characteristics. Most importantly, it does not have **independent failures**. If the developer's laptop crashes (e.g., power failure, operating system crash), all three threads will fail together. A distributed system requires components that can fail independently of one another.

**Answer 5**
The characteristic of independent failure creates an ambiguous state for the `BookingService`. Because the `PaymentService` can fail on its own, the `BookingService` doesn't know the true state of the payment. From its perspective, the world could be in one of two states:
1.  The payment failed, and the seat should be released.
2.  The payment succeeded, and the seat is confirmed, but the confirmation message was lost.

This ambiguity would not exist on a single machine. In a single-machine application, the entire process would run within a single transaction; if the machine crashed after the payment logic but before the booking logic, the entire transaction would be rolled back upon restart, resulting in a clean, unambiguous state (the payment never happened).

**Answer 6**
**Design 2** is the distributed system. It is composed of two independent computers (nodes) that communicate over a network.

The primary challenge introduced by the **absence of a global clock** in Design 2 is ensuring the two controllers are perfectly synchronized. To coordinate effectively, Controller A and Controller B need a shared, consistent understanding of time. Because network messages can be delayed, it's difficult for them to perfectly align their cycles (e.g., to turn A's light green exactly 1.5 seconds after B's light turns red). They must use complex algorithms to approximate a shared sense of time, whereas Design 1 has no such problem. In Design 1, the single central computer *is* the global clock and the single source of truth for all timing and logic.