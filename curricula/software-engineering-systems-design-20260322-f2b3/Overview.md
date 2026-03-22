# Curriculum Overview: software engineering systems design

## What This Curriculum Covers
This curriculum provides a structured understanding of designing distributed software systems. Upon completion, you will be able to identify the fundamental characteristics and challenges inherent in distributed environments, understand common system components and their interactions, and apply practical design patterns to build scalable, resilient, and performant systems. You will develop the ability to reason about critical architectural trade-offs, diagnose performance issues, and formulate strategies for system evolution and operational excellence.

Explicitly out of scope for this curriculum are deep dives into specific vendor products or cloud provider-specific implementations, detailed coding exercises for system components, front-end development, or low-level network protocol specifics beyond their architectural implications.

## How It Is Structured
This curriculum is organized into three tiers: Foundations, Mechanics, and Mastery, designed to build your understanding incrementally and logically.

*   **Foundations:** This tier establishes the essential theoretical concepts and vocabulary required to understand and discuss distributed systems. It introduces the core problems that arise when systems are composed of multiple independent components, such as concurrency, network latency, and partial failures. Grasping these foundational principles—like availability vs. reliability, various consistency models, and the nature of fault tolerance—is critical because they define the environment and challenges that all subsequent design patterns aim to address. Without this groundwork, discussions of specific solutions lack the necessary context and depth.

*   **Mechanics:** Building upon the theoretical base, this tier delves into the practical design patterns, architectural components, and common strategies used to construct distributed systems. Here, you will learn *how* the abstract goals defined in the Foundations tier (e.g., scalability, fault tolerance) are implemented through concrete mechanisms like load balancing, database replication, message queues, and API gateways. This tier bridges the gap between conceptual understanding and actionable design choices, showing how to assemble resilient and efficient systems from established building blocks.

*   **Mastery:** This final tier requires the synthesis of knowledge from both Foundations and Mechanics to address complex, real-world architectural challenges. It moves beyond individual components to focus on holistic system design, strategic decision-making, and operational considerations that impact the entire lifecycle of a large-scale system. Topics here include understanding the practical implications of the CAP Theorem, managing data sharding complexities, designing for observability, and planning for global scale and disaster recovery. This tier prepares you to evaluate trade-offs, anticipate future challenges, and evolve robust systems in dynamic environments.

## What Makes This Hard (and Worth It)
This curriculum addresses complex technical challenges. Expect certain topics to demand focused effort. Identifying these areas upfront can reframe initial frustration into a recognized stage of progress.

### Foundations
*   **Availability vs. Reliability (Topic 5):**
    *   **Why it trips people up:** In everyday language, these terms are often used interchangeably, but in systems design, they have distinct technical meanings. It's difficult to separate the idea of a system simply being "up" (availability) from its ability to consistently produce correct results (reliability) over time. This distinction requires precise thinking about system behavior under various conditions.
    *   **What becomes clear once it clicks:** You gain the ability to articulate exact system goals and differentiate between performance metrics, enabling more targeted and effective design decisions. You understand that a system can be highly available but unreliable (e.g., always running but frequently returning incorrect data) or reliably perform specific tasks while experiencing periods of unavailability.

*   **Consistency Models (Eventual vs. Strong) (Topic 8):**
    *   **Why it trips people up:** The intuitive expectation for data is immediate, global consistency across all replicas. Embracing eventual consistency requires a significant shift in mindset, demanding acceptance of temporary inconsistencies and the understanding that this compromise often unlocks higher availability and partition tolerance in distributed environments.
    *   **What becomes clear once it clicks:** You recognize the fundamental trade-offs inherent in distributed data management. This enables you to select appropriate consistency models based on actual application requirements, rather than defaulting to an often-unattainable "perfect" consistency, thereby unlocking design patterns for highly scalable systems.

### Mechanics
*   **Message Queues and Asynchronous Communication (Topic 4):**
    *   **Why it trips people up:** The transition from synchronous, direct function calls to decoupled, asynchronous message passing introduces complexity in understanding the flow of control, debugging, and managing errors across distributed components. It challenges the mental model of immediate execution and direct interaction.
    *   **What becomes clear once it clicks:** You understand how to build systems that are inherently more resilient, scalable, and loosely coupled. The concept of decoupling services becomes concrete, enabling graceful degradation during failures and facilitating independent development and deployment.

*   **Distributed Transactions and Sagas (Topic 9):**
    *   **Why it trips people up:** For those accustomed to the ACID guarantees of traditional relational databases, the absence of global transactions across independent services in a distributed environment is counterintuitive. Understanding how to maintain data integrity without a global lock, especially through compensation logic, represents a significant intellectual hurdle.
    *   **What becomes clear once it clicks:** You acquire practical strategies for managing complex business processes that span multiple services, accepting eventual consistency while ensuring overall correctness through patterns like Sagas. This knowledge is crucial for designing reliable microservices architectures that perform critical, multi-step operations.

### Mastery
*   **CAP Theorem in Practice (Topic 1):**
    *   **Why it trips people up:** The CAP theorem is frequently oversimplified as a choice of *two* out of three, leading to misconceptions about its implications. The real difficulty lies in understanding how practical systems *always* face network partitions and how "Availability" in CAP refers to the ability to *respond* to requests, even if those responses are failures or stale data, rather than always being "up" or correct. Internalizing the nuance that Partition tolerance is nearly always a factor in distributed systems is challenging.
    *   **What becomes clear once it clicks:** You understand that the CAP theorem isn't a simple binary choice but highlights fundamental engineering trade-offs when designing for network partitions. This insight informs pragmatic decisions in distributed database and service design, enabling you to prioritize the most critical aspects (Consistency or Availability) given a specific application context and the inevitability of partitions.

*   **Tradeoffs in Data Sharding Strategies (Topic 2):**
    *   **Why it trips people up:** Data sharding appears straightforward initially—just splitting data across multiple machines. However, the complexities of choosing an effective sharding key, managing data hotspots, handling rebalancing operations, and ensuring efficient querying across shards are often underestimated. A poor sharding strategy can introduce immense operational burden and limit future scalability.
    *   **What becomes clear once it clicks:** You gain a deep appreciation for the non-trivial nature of distributing data effectively and the long-term implications of initial sharding choices. This knowledge allows you to design data layers that scale efficiently, avoid common pitfalls, and proactively anticipate future operational and rebalancing challenges.

## How to Use These Materials
1.  Read the lesson doc for each topic before attempting anything else.
2.  Attempt every exercise in the practice set before reading the answer key.
3.  Complete the tier capstone before moving to the next tier.
4.  Use the master glossary when a term is unclear.

## Curriculum Map

### Foundations
1.  Defining a Distributed System
2.  System Components and Interactions
3.  Client-Server Model Fundamentals
4.  Latency, Throughput, and Bandwidth
5.  Availability vs. Reliability
6.  Scalability Concepts
7.  Fault Tolerance Principles
8.  Consistency Models (Eventual vs. Strong)
9.  Coupling and Cohesion
10. Idempotency

### Mechanics
1.  Load Balancing Techniques
2.  Database Replication Strategies
3.  Distributed Caching Strategies
4.  Message Queues and Asynchronous Communication
5.  API Gateway Design
6.  Service Discovery Mechanisms
7.  Circuit Breaker Pattern
8.  Rate Limiting Algorithms
9.  Distributed Transactions and Sagas
10. Idempotent API Design

### Mastery
1.  CAP Theorem in Practice
2.  Tradeoffs in Data Sharding Strategies
3.  Designing for Observability
4.  Disaster Recovery Planning
5.  Security Considerations in Distributed Systems
6.  Event-Driven Architectures
7.  System Evolution and Refactoring
8.  Performance Tuning and Bottleneck Identification
9.  Cost Optimization in Cloud Systems
10. Designing for Global Scale and Geo-Distribution