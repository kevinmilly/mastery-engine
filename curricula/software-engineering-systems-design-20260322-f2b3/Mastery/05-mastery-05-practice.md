## Exercises

**Exercise 1**
A development team is migrating their e-commerce application from a single monolithic server to a distributed microservices architecture. The original monolith used a traditional server-side session store for user authentication. For the new architecture, they are debating whether to replicate this pattern with a centralized session store (like Redis) or switch to using stateless JSON Web Tokens (JWTs). Which approach is better suited for their new microservices architecture, and why? Explain the primary trade-off they are making with this choice.

**Exercise 2**
A new internal platform for a large corporation is being designed to manage cloud infrastructure resources. The authorization rules must be highly granular and dynamic. For example, a "DevOps Engineer" should only be able to restart a virtual machine if: (1) the VM is part of a "development" environment, (2) the restart request is made during standard business hours, AND (3) the engineer is currently on-call for that specific service. Which authorization model, Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC), is more suitable for implementing these rules? Justify your choice by explaining how the chosen model would handle this specific scenario.

**Exercise 3**
An online banking application has a `Mobile Gateway` service that communicates with a `Ledger Service` over the company's internal network. All traffic between services is already encrypted in transit using mutual TLS (mTLS), which secures the communication channel. The security team has proposed adding end-to-end payload encryption: the `Mobile Gateway` would encrypt the transaction data itself with the `Ledger Service`'s public key before sending it. What specific type of threat does this additional layer of encryption mitigate that mTLS alone does not address? What is the main system design trade-off associated with this approach?

**Exercise 4**
A video streaming platform uses stateless JWTs with a 20-minute expiry time to manage user sessions. This allows any microservice (e.g., `Recommendations`, `Billing`, `Watch History`) to validate a user's token without a central call. A user clicks the "Log out from all devices" button in their account settings. Given the stateless nature of JWTs, describe the fundamental challenge in immediately invalidating all active sessions for this user. Propose a practical solution that preserves most of the benefits of a stateless architecture while still meeting this security requirement.

**Exercise 5**
A global logistics company runs its application on a multi-region cloud setup. To ensure low latency and data residency, user and shipment data are sharded by region (e.g., EU data is stored in `eu-central-1`, North American data in `us-east-1`). However, their authentication system, which uses OAuth 2.0 to issue access tokens, is centralized in a single `Auth Service` running only in `us-east-1`. During a major network partition that isolates the `us-east-1` region, users in Europe report that while they can see the public website, they cannot log in or manage their shipments, even though the EU application servers and databases are fully operational.

First, explain how the centralized security design creates this availability dependency. Second, referencing a concept from disaster recovery planning, propose a change to the `Auth Service` architecture to mitigate this issue.

**Exercise 6**
You are the principal engineer designing a new FinTech platform for real-time stock trading. The system consists of many microservices, and regulatory requirements demand an extremely high level of security, a full audit trail of all actions (observability), and low latency for transactions. You must decide on a strategy for securing inter-service communication.

*   **Option A: Service Mesh with Zero Trust.** Implement a service mesh (like Linkerd or Istio) that enforces mutual TLS (mTLS) for all traffic. The mesh's control plane manages certificate rotation and identity. Authorization policies are defined declaratively and enforced by sidecar proxies, independent of the application code.
*   **Option B: Application-Layer Security.** Each microservice uses a shared cryptographic library to manage its own private keys and certificates. Services are responsible for validating the caller's JWT and implementing authorization logic within their own code before executing an action.

Compare these two options across three dimensions: **1) Security Audibility**, **2) Performance Impact (Latency)**, and **3) Developer Burden**. Conclude with your recommendation for this specific FinTech platform and justify your choice.

---

## Answer Key

**Answer 1**
**Recommendation:** JWTs are better suited for the microservices architecture.

**Reasoning:**
In a microservices architecture, a single user request might be handled by multiple services. With a traditional server-side session, each service would need to query the central session store to validate the session ID, creating a performance bottleneck and a single point of failure.

Stateless JWTs are self-contained. The user's identity and permissions are encoded within the token and cryptographically signed. Any service can validate the token's signature using a public key without needing to contact a central service. This removes the dependency on a session store, improving scalability and resilience.

**Primary Trade-off:** The main trade-off is **session invalidation**. A server-side session can be instantly deleted from the central store, immediately logging the user out. Because JWTs are stateless and valid until they expire, immediate invalidation is difficult. If a token is compromised, it can be used until its expiration time. This requires alternative strategies (like token blocklists) which can re-introduce some statefulness.

**Answer 2**
**Recommendation:** Attribute-Based Access Control (ABAC) is more suitable.

**Reasoning:**
RBAC (Role-Based Access Control) primarily associates permissions with roles (e.g., the "DevOps Engineer" role can perform the "restart VM" action). It struggles with rules that depend on the properties of the resource or the context of the request.

ABAC, on the other hand, is designed for this kind of dynamic, fine-grained control. It can create policies based on attributes of the user, the resource, and the environment.

In this scenario, an ABAC policy could be written as:
`Allow action 'restart' on resource 'VM' IF:`
*   `user.role == 'DevOps Engineer'` (User attribute)
*   `resource.environment == 'development'` (Resource attribute)
*   `environment.time BETWEEN '09:00' AND '17:00'` (Environment attribute)
*   `user.on_call_for == resource.service_id` (User and Resource attribute relationship)

Attempting to implement this with RBAC would lead to a "role explosion" (e.g., creating roles like `DevOpsEngineer-OnCall-BusinessHours-Dev`) which is unmanageable. ABAC allows for a more flexible and scalable policy definition.

**Answer 3**
**Threat Mitigated:** End-to-end payload encryption protects against **compromised internal services and man-in-the-middle attacks within the trusted network boundary**.

**Reasoning:**
mTLS encrypts the communication channel between two services (the "pipe"). If a malicious actor gains access to an intermediate service, like a network router or an API gateway that terminates TLS, they could potentially inspect the unencrypted traffic as it passes through.

By encrypting the payload itself, the data remains unreadable even if the transport layer (mTLS) is compromised or terminated at an intermediate point. Only the final destination, the `Ledger Service` with the corresponding private key, can decrypt and read the sensitive transaction data. This enforces the principle of least privilege at the data level.

**Main Trade-off:** The primary trade-off is **performance and resource utilization**.
*   **Latency:** The CPU overhead of performing cryptographic operations (encryption at the source, decryption at the destination) adds latency to every request.
*   **Key Management:** The system now requires a robust Public Key Infrastructure (PKI) to manage and distribute the public/private keys for every service, which adds significant operational complexity.

**Answer 4**
**Fundamental Challenge:** The core challenge is that the system has no central record of active tokens. Since JWTs are validated statelessly using a cryptographic signature, the services trust any token with a valid signature and a non-expired timestamp. There is no "kill switch" to tell the services that a specific, valid-looking token should no longer be trusted.

**Practical Solution:** A practical solution is to use a **token blocklist or revocation list**.
1.  When the user logs out, the unique identifier of their JWT (the `jti` claim) is added to a centralized, fast-access blocklist (e.g., a Redis or Memcached set) with a Time-To-Live (TTL) matching the token's remaining validity.
2.  Microservices must be modified. Before accepting a token, in addition to checking the signature and expiration, they must make a quick check against this blocklist.
3.  If the token's `jti` is on the list, the request is rejected.

This approach is a compromise. It re-introduces a stateful, centralized check, slightly increasing latency. However, it's much more lightweight than a full session store because the list only contains invalidated tokens, not all active sessions, and the check is extremely fast.

**Answer 5**
**Explanation of Dependency:** The architecture couples the system's global **availability** with the availability of a single, centralized component in one region. The `Auth Service` is a single point of failure for the entire global user base's authentication and authorization flow. Even though the application and data services in the EU are running, they cannot function for authenticated users because they are unable to obtain or validate access tokens from the failed `us-east-1` region. This violates the principles of fault isolation.

**Proposed Change:** The solution is to adopt a **multi-region active-active deployment for the `Auth Service`**, a key concept in disaster recovery and high-availability design.
*   **Architecture:** Deploy fully independent instances of the `Auth Service` in each major region (e.g., one in `eu-central-1` and one in `us-east-1`).
*   **Mechanism:** Use latency-based routing (e.g., AWS Route 53) to direct users to the geographically closest `Auth Service` instance. Data needed for authentication (like hashed passwords or OAuth client secrets) would need to be replicated across regions using a multi-master replication strategy.
*   **Benefit:** During a regional outage in `us-east-1`, European users would be seamlessly routed to the `eu-central-1` `Auth Service`. They could log in and get valid tokens, allowing them to interact with the still-operational EU application services. This decouples the availability of each region, significantly improving the system's overall resilience.

**Answer 6**
**Comparison:**

1.  **Security Audibility:**
    *   **Option A (Service Mesh):** Superior audibility. All mTLS handshakes, traffic flows, and authorization decisions (allow/deny) are centrally logged and enforced by the sidecar proxies. This creates a consistent, application-agnostic audit trail that is difficult for application developers to bypass. It's easier to prove to regulators that policies are being enforced everywhere.
    *   **Option B (App-Layer):** Weaker audibility. Auditing relies on developers correctly implementing logging within each of the dozens of microservices. This can lead to inconsistent log formats, missing audit events, and a much higher effort to aggregate and analyze security events across the system.

2.  **Performance Impact (Latency):**
    *   **Option A (Service Mesh):** Introduces a small, but measurable, amount of latency on every call due to the sidecar proxy intercepting, encrypting/decrypting, and evaluating policies for all network traffic. For a high-frequency trading platform, this "proxy tax" can be significant.
    *   **Option B (App-Layer):** Potentially lower latency. The cryptographic operations are performed in-process within the application. There is no extra network hop through a proxy. This gives developers more control to optimize critical paths, which is vital for a FinTech trading platform.

3.  **Developer Burden:**
    *   **Option A (Service Mesh):** Significantly lower developer burden regarding security. Developers can focus on business logic and write code as if the network were trusted. The security implementation is abstracted away and handled by the platform operations team.
    *   **Option B (App-Layer):** High developer burden. Every team must correctly use the shared security library, manage keys, and implement complex authorization logic. This increases the risk of human error, inconsistent implementations, and security vulnerabilities. It also couples the business logic tightly with security concerns.

**Recommendation and Justification:**

For a FinTech platform where low latency is a critical business requirement but audibility and security are non-negotiable regulatory requirements, the best choice is **Option A (Service Mesh), with careful performance tuning.**

**Justification:** While the application-layer approach (Option B) seems to offer lower latency, its downsides are too severe for this context. The risk of inconsistent security implementations and the difficulty in producing a reliable audit trail across dozens of services are unacceptable in a regulated financial environment. A single developer error in one service could lead to a major security breach and regulatory fines.

The Service Mesh (Option A) provides defense-in-depth and centralized control and observability, which are paramount for security and compliance. The performance cost of the sidecar proxy is a known engineering challenge that can be mitigated through performance-optimized service mesh implementations (e.g., those using eBPF), careful configuration, and ensuring sufficient hardware resources. The trade-off of a small, predictable latency increase is acceptable in exchange for a drastically improved and auditable security posture and reduced developer-induced risk.