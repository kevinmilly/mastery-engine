# The Hook
After this lesson, you will be able to design a system of communicating services that can securely verify each other's identity, enforce permissions, and protect their conversations from eavesdroppers.

Imagine a large, modern office building that houses several different, independent companies. To get into the building at all, you need a keycard that proves you work there. This is **authentication**. Once inside, your keycard only unlocks the doors to your company's specific floor and offices; it won't let you into a competitor's conference room. This is **authorization**. Finally, if you send a sensitive document to a colleague in another department via the building's internal mail tube, you put it in a locked pouch. This is **encryption**. A secure distributed system needs all three—a way to prove identity, a way to enforce permissions, and a way to protect messages.

## Why It Matters
In previous lessons, we saw how systems are broken apart into distributed services to improve scalability (sharding) and resilience (disaster recovery). But this creates a new, massive security challenge. A single, monolithic application has one front door to defend. A system with a hundred microservices has a hundred front doors, and they all talk to each other over a network.

The moment a practitioner fails to grasp this, they build a system that is functionally correct but dangerously insecure. They might have services communicating in plain text over the network, or one service might trust any request from another without verification. An attacker who compromises one minor, seemingly insignificant service—like an image thumbnail generator—could then potentially move through the internal network, impersonate other services, and access the most sensitive parts of your system, like the customer database or payment processor. Without robust authentication, authorization, and encryption between services, your distributed architecture isn't a set of cooperating components; it's a house of cards with no internal walls.

## The Ladder
In a distributed system, trust is not assumed; it must be explicitly established and verified for every interaction. Let's break down the three pillars of securing these interactions.

### 1. Authentication: Who are you?
The first question any service must ask when it receives a request is, "Can I trust that this request is really from who it says it's from?" An attacker could easily send a fake request pretending to be a legitimate service.

*   **The Mechanism:** A common modern solution for this is the **JSON Web Token (JWT)**. A JWT is like a secure, tamper-proof digital passport. When a service or a user first proves its identity (e.g., with a username/password or a secret key), an Authentication Service issues it a JWT. This token is a string of text containing a few key pieces of information, like who the user/service is and when the token expires. Critically, the token is digitally signed by the Authentication Service using a secret key.
*   **The Implication:** Now, when Service A wants to make a request to Service B, it includes its JWT. Service B, which knows the Authentication Service's public key, can verify the token's signature. If the signature is valid, Service B knows two things:
    1.  The token was definitely issued by the trusted Authentication Service.
    2.  The information inside the token has not been altered since it was issued.

Service B can now be confident it is talking to the real Service A, not an imposter. Authentication is solved.

### 2. Authorization: What are you allowed to do?
Just because Service B knows it's talking to Service A doesn't mean Service A should be allowed to do anything it wants. The next question is, "Now that I know who you are, what permissions do you have?"

*   **The Mechanism:** This is handled by authorization policies. The most common model is **Role-Based Access Control (RBAC)**. In RBAC, permissions aren't granted to individual services directly. Instead, you define roles (e.g., `billing-admin`, `read-only-user`, `inventory-manager`), and each role has a specific set of permissions (e.g., `can_read_billing_data`, `can_write_inventory_levels`). Services are then assigned one or more roles.
*   **The Implication:** When Service A's authenticated request arrives at Service B, Service B looks inside the JWT. The JWT often contains the roles assigned to Service A (these are called "claims"). Service B checks if any of Service A's roles have the permission required for the requested action. For example, a `Reporting Service` might have the `read-only-user` role. If it tries to delete data, Service B will see that its role doesn't grant that permission and will deny the request with a "Forbidden" error, even though it was properly authenticated. This is the principle of least privilege: a service should only have the bare minimum permissions required to do its job.

### 3. Encryption: Can our conversation be overheard?
Service A and Service B are now communicating. A is authenticated, and B is enforcing A's authorized permissions. But what if an attacker is monitoring the network traffic between them? They could steal sensitive data as it flies by.

*   **The Mechanism:** Encryption scrambles data so it's unreadable to anyone without the correct key. In distributed systems, we care about two states:
    *   **Encryption in Transit:** This protects data as it moves across the network. The standard for this is **TLS (Transport Layer Security)**, the same technology that secures your web browser connection to your bank (the "S" in HTTPS). It creates a secure, encrypted tunnel between two services, ensuring that any intercepted traffic is just gibberish to an eavesdropper.
    *   **Encryption at Rest:** This protects data when it is stored on a disk, in a database, or in a file backup. This means that even if an attacker were to steal a hard drive from your data center, the sensitive data (like user passwords or credit card information) would be encrypted and useless to them.
*   **The Implication:** By combining these two, you ensure data is protected throughout its entire lifecycle. TLS protects it as it moves between services, and storage-level encryption protects it when it sits still in your database. This comprehensive approach closes the last major security loophole in service-to-service communication.

## Worked Reality
Let's trace a single request in a secure e-commerce platform to see how these pieces fit together. The platform has a `Web App`, an `Order Service`, and a `Payment Service`.

1.  **Authentication:** A user, Alice, logs into the `Web App` with her email and password. The app sends these credentials to an `Auth Service`. The `Auth Service` verifies them and sends back a JWT. This JWT contains Alice's user ID and her role, which is `customer`. The `Web App` will now include this JWT in the header of every subsequent request it makes on Alice's behalf.

2.  **Request to View Orders:** Alice clicks on "My Orders." The `Web App` sends a request to the `Order Service` like `GET /api/orders`. The request includes Alice's JWT.

3.  **Authorization:** The `Order Service` receives the request.
    *   First, it performs **authentication**. It checks the JWT's digital signature to confirm it's a valid token issued by the trusted `Auth Service`. The signature is valid.
    *   Next, it performs **authorization**. It looks at the claims inside the token and sees the `user_id` is "alice123" and the `role` is `customer`. The service's logic is "a user with the `customer` role is only authorized to see orders matching their own `user_id`." Since the request is for Alice's own orders, the check passes. If an attacker had tried to request orders for "bob456" using Alice's token, this step would fail.

4.  **Secure Internal Communication:** The `Order Service` needs to display the payment method for each order. It needs to ask the `Payment Service` for this data.
    *   **Encryption in Transit:** The `Order Service` opens a connection to the `Payment Service`. This connection is secured with TLS, creating an encrypted channel. No one on the network can snoop on their conversation.
    *   The `Order Service` makes an internal request for payment details related to Alice's orders. It may use its own service-to-service JWT to authenticate itself to the `Payment Service`, proving it's a legitimate internal component.

5.  **Protecting Stored Data:** The `Payment Service` receives the request.
    *   **Encryption at Rest:** It queries its database for the relevant payment records. Alice's stored credit card number is not in plain text; it's encrypted in the database. The `Payment Service` has the key to decrypt it (or, more likely, just retrieve the non-sensitive last four digits).

The `Payment Service` sends the necessary data back to the `Order Service` over the secure TLS channel. The `Order Service` assembles the final order history and sends it back to Alice's `Web App`, which displays it on her screen. Every step was verified and protected.

## Friction Point
The most common point of confusion is treating **authentication** and **authorization** as the same thing.

**The wrong mental model is:** "Once a service is authenticated, it is trusted and can access what it needs."

This is tempting because in our daily lives, the two are often bundled. When you unlock your phone with your face (authentication), you are implicitly granted permission to use all your apps (authorization). This simple model breaks down completely in complex systems.

**The correct mental model is:** Authentication is about *identity* (who you are), while authorization is about *permissions* (what you are allowed to do). They are distinct, sequential steps. You cannot authorize someone until you have authenticated them.

Think of it like air travel. Showing your passport and ticket at the check-in counter is **authentication**; they confirm you are the person whose name is on the ticket. But that doesn't mean you can sit anywhere on the plane. The boarding pass itself specifies your seat number (e.g., 24B), and you are only **authorized** to sit in that specific seat. A valid passport doesn't authorize you to enter the cockpit.

## Check Your Understanding
1.  A hacker manages to steal a complete backup of your application's database server. Which specific security measure—encryption at rest or encryption in transit—is the final line of defense against them reading the sensitive customer emails stored in that backup?
2.  A `Notification Service` is properly authenticated by the `User Service` but its request to update a user's password is rejected. Is this a failure of authentication or a function of authorization? Explain your reasoning.
3.  What specific risk is created if developers decide to save time by not implementing TLS for communication between the `Order Service` and the `Payment Service`, even if they are running in the same data center?

## Mastery Question
You are designing a new `Analytics Service` for an e-commerce platform. Its job is to generate daily sales reports. To do this, it needs to read order data from the `Order Service` and product information from the `Product Service`. It should have absolutely no ability to modify any data or access user information like names or addresses.

Describe how you would configure this service's **authorization** based on the principle of "least privilege." What specific role and permissions would you create for it, and why is this approach more secure than simply giving it a generic "internal-service" role that has broader access?