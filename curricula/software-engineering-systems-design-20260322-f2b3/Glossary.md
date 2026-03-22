# Glossary: software engineering systems design

**API (Application Programming Interface)**
A set of rules and tools that lets different software components talk to each other. In distributed systems, APIs define how services request capabilities from one another, specifying the requests and responses for interaction.

**API Gateway**
A single entry point for clients to interact with a set of backend services. It routes client requests to the appropriate service, handles common concerns like authentication and rate limiting, and can transform requests or responses.

**Asynchronous Communication**
A way for parts of a system to talk where the sender doesn't wait for an immediate reply from the receiver. The sender can continue its work while the receiver processes the message independently, improving responsiveness and decoupling services.

**At-Least-Once Delivery**
A guarantee in message-based systems that a message will be delivered to its recipient at least once. This means a message might be delivered multiple times, so consumers must be designed to handle duplicate messages without unintended side effects (i.e., be idempotent).

**Authentication**
The process of verifying the identity of a user, service, or system. In distributed systems, this ensures that only legitimate entities can access resources or communicate with services, often involving credentials or tokens.

**Authorization**
The process of determining what an authenticated entity (user or service) is allowed to do. After authentication confirms who you are, authorization determines what specific actions or resources you have permission to access.

**Availability**
The measure of how often a system or service is accessible and operational when needed. It's often expressed as a percentage (e.g., "four nines" for 99.99%) and is a critical metric for user satisfaction and business continuity.

**Bandwidth**
The maximum rate at which data can be transferred over a network connection in a given amount of time. In systems design, understanding available bandwidth is crucial for designing efficient data transfer mechanisms and preventing network bottlenecks.

**Bottleneck**
A point in a system where the flow of data or execution is constrained, causing delays or reducing overall performance. Identifying bottlenecks, whether in CPU, I/O, or network, is essential for optimizing system efficiency and responsiveness.

**Cache-Aside**
A common caching pattern where the application code first checks the cache for data; if not found (a cache miss), it retrieves the data from the primary data store, stores it in the cache, and then returns it. This pattern gives the application control over cache population and invalidation.

**CAP Theorem**
A fundamental theorem in distributed systems stating that it's impossible for a distributed data store to simultaneously provide more than two out of three guarantees: Consistency, Availability, and Partition Tolerance. Architects must choose which two to prioritize based on application requirements.

**Choreography**
An approach in event-driven architectures where services interact by autonomously reacting to events, without a central coordinator. Each service publishes events and subscribes to events from other services, making decisions independently based on the events it receives.

**Circuit Breaker Pattern**
A design pattern used to prevent a system from repeatedly trying to access a failing remote service, which could lead to cascading failures. When a service fails repeatedly, the circuit breaker "opens" to stop further calls, allowing the failing service time to recover.

**Client-Server Model**
A fundamental network architecture where client programs request services from server programs, which provide those services. Clients initiate communication, and servers listen for requests, forming the basis for most internet-based distributed interactions.

**Cohesion**
An architectural principle describing how closely related and focused the responsibilities of a single module or component are. High cohesion indicates that a module's elements work together to achieve a single, well-defined purpose, making the system easier to understand and maintain.

**Concurrency**
The ability of different parts of a program or system to execute independently or seemingly at the same time. In distributed systems, multiple processes or threads can operate concurrently across different machines, making coordination and shared resource management complex.

**Consistency Model**
The guarantee a distributed system provides about the state of data after updates. It defines the rules for how and when changes made on one node become visible to other nodes, ranging from immediate, strong guarantees to eventual propagation.

**Coupling**
An architectural principle describing the degree of interdependence between software modules or components. High coupling means components are tightly linked, making changes in one part more likely to impact others, which increases complexity and reduces flexibility.

**Dead-Letter Queue (DLQ)**
A special message queue used to store messages that could not be processed successfully after a certain number of retries or due to specific errors. DLQs are crucial for debugging, monitoring, and handling failed message processing without blocking the main queue.

**Disaster Recovery**
A comprehensive plan and set of procedures for restoring a system or service to an operational state after a major outage or catastrophic event. It focuses on minimizing downtime and data loss, often involving backup strategies and geographic redundancy.

**Distributed Caching**
The practice of storing frequently accessed data across multiple network nodes to reduce latency and load on primary databases. It improves system performance and scalability by serving data from fast memory stores closer to where it's needed.

**Distributed System**
A collection of independent computers that appears to its users as a single coherent system. These systems feature concurrent execution, independent failures of components, and the absence of a global clock, requiring specific design considerations for coordination and resilience.

**Distributed Transaction**
A transaction that involves multiple independent resources or services, often across different machines, and requires all operations to either succeed or fail together atomically. Managing these is complex due to the challenges of ensuring consistency across disparate systems.

**Encryption**
The process of converting information or data into a code to prevent unauthorized access. In distributed systems, encryption is vital for securing data both when it's stored (at rest) and when it's being transmitted across networks (in transit) between services.

**Event-Driven Architecture (EDA)**
An architectural style where system components communicate by producing, detecting, consuming, and reacting to events. EDA promotes loose coupling and asynchronous communication, making systems more scalable, resilient, and responsive to changes.

**Eventual Consistency**
A consistency model where, if no new updates are made to a given data item, all reads of that item will eventually return the last updated value. Data is not immediately consistent across all replicas, but it converges over time, suitable for systems prioritizing availability and partition tolerance.

**Failover**
A mechanism that automatically switches to a redundant or standby system component when the primary component fails. This ensures continuous operation and minimizes downtime by transparently redirecting traffic or tasks to an operational backup.

**Fault Tolerance**
The ability of a system to continue operating without interruption even when one or more of its components fail. Designing for fault tolerance involves strategies like redundancy and graceful degradation to maintain service availability during adverse events.

**Feature Flag**
A software development technique that allows you to turn features on or off without deploying new code. This enables continuous delivery, A/B testing, and controlled rollouts, separating deployment from release.

**Geo-Distribution**
The deployment of system components and data across multiple geographical locations to serve users globally or enhance resilience. This strategy aims to reduce latency for users, comply with data locality regulations, and provide disaster recovery capabilities.

**Graceful Degradation**
A design principle where a system, upon experiencing a partial failure or increased load, continues to operate but with reduced functionality or performance, rather than failing completely. It ensures essential services remain available during adverse conditions.

**Horizontal Scaling**
Increasing the capacity of a system by adding more machines or nodes to a distributed cluster. This approach distributes the workload across multiple resources, offering higher scalability and fault tolerance compared to vertical scaling.

**Idempotency**
A property of an operation where applying it multiple times produces the same result as applying it once. In distributed systems, idempotent operations are crucial for safely handling retries of requests (e.g., due to network issues) without causing unintended side effects.

**Latency**
The time delay between a request being sent and its response being received. In distributed systems, high latency can significantly impact user experience and inter-service communication performance, making optimization crucial.

**Load Balancer**
A device or software that distributes incoming network traffic across multiple backend servers to ensure no single server becomes a bottleneck. It improves system responsiveness, maximizes throughput, and enhances reliability by directing traffic away from unhealthy servers.

**Message Queue**
A component that facilitates asynchronous communication between distributed services by storing messages until they are processed by consumers. It decouples services, buffers workloads, and ensures reliable message delivery.

**Observability**
The ability to understand the internal state of a system by examining the data it produces. It's built upon three pillars: metrics (numerical data), logging (structured event records), and tracing (end-to-end request flows), enabling effective debugging and performance analysis in production.

**Orchestration**
An approach in event-driven architectures where a central service (the orchestrator) coordinates and manages the execution of a multi-step business process involving several other services. The orchestrator explicitly tells each service what to do and in what order.

**Partition Tolerance**
The ability of a distributed system to continue operating even if there are network failures that prevent some nodes from communicating with others. This is a fundamental requirement for any truly distributed system operating over unreliable networks.

**Producer-Consumer Pattern**
A concurrency design pattern where one set of entities (producers) generates data or tasks and another set of entities (consumers) processes them. A buffer, often a message queue, sits between them to manage the flow and decouple their operations.

**Rate Limiting**
A technique used to control the number of requests a client can make to a server or service within a given time period. It protects resources from being overwhelmed, prevents abuse, and ensures fair usage for all clients.

**Recovery Point Objective (RPO)**
The maximum acceptable amount of data loss, measured in time, that a system can sustain during an outage. It defines how much data (e.g., the last hour of transactions) might be lost if a system needs to be restored from backup.

**Recovery Time Objective (RTO)**
The maximum acceptable downtime period that a system or service can tolerate after an outage. It defines how quickly a system must be restored to an operational state to meet business needs.

**Redundancy**
The practice of duplicating system components, data, or functionality to ensure continuous operation even if one part fails. It's a key principle of fault tolerance, providing backup resources that can take over in case of an outage.

**Reliability**
The ability of a system to perform its intended functions correctly and consistently over a specified period, under specified conditions. Unlike availability, which measures uptime, reliability focuses on the correctness and predictability of operations.

**Replication**
The process of creating and maintaining multiple copies of data or services across different machines or locations. It enhances availability by providing redundant resources and improves read scalability by distributing data access.

**Saga Pattern**
A design pattern for managing long-running distributed transactions that span multiple services, ensuring data consistency without a central two-phase commit. It achieves consistency through a sequence of local transactions, each updating its own service, with compensating transactions to undo prior steps if a failure occurs.

**Scalability**
The ability of a system to handle an increasing amount of work or users by adding resources. A scalable system can maintain performance and responsiveness as demand grows, typically through horizontal or vertical scaling.

**Service**
An independently deployable, loosely coupled component with a well-defined interface that provides specific functionality within a distributed system. Services communicate over networks, forming the building blocks of modern distributed architectures.

**Service Discovery**
A mechanism that allows services to find and communicate with each other in a dynamic distributed environment. It involves a registry where services register their network locations and clients can query to find available instances of a service.

**Sharding**
A technique for horizontally partitioning a large database into smaller, more manageable pieces called shards. Each shard is an independent database, distributing the data load and improving scalability and performance for large datasets.

**Statelessness**
A characteristic of a service where it does not retain any client-specific information (state) between requests. Each request from a client contains all the necessary information for the server to process it, simplifying scaling and fault tolerance as any server can handle any request.

**Sticky Sessions**
A load balancing technique that ensures a client's requests are always routed to the same server that handled its initial request. This is often used for applications that require session state to be maintained on the server, though it can reduce the effectiveness of load balancing.

**Strong Consistency**
A consistency model where all nodes in a distributed system see the same data at the same time. Any read operation returns the most recently written value, ensuring that data is always up-to-date across all replicas, typically at the cost of availability or partition tolerance.

**Strangler Fig Pattern**
An architectural refactoring pattern used to gradually migrate a monolithic application into a microservices architecture. New services are developed around the legacy system, "strangling" the old application functionality over time until it can eventually be retired.

**Synchronous Communication**
A mode of communication where the sender waits for an immediate response from the receiver before continuing its own processing. This establishes a direct dependency between the sender and receiver, often used for immediate request-response interactions.

**Throughput**
The number of operations, requests, or transactions a system can process per unit of time. It's a key performance metric indicating the capacity and efficiency of a system, often measured in requests per second or messages per minute.

**Two-Phase Commit (2PC)**
A distributed algorithm that ensures all participants in a distributed transaction either commit or abort the transaction together. It involves a "prepare" phase where participants vote and a "commit/abort" phase, but it can suffer from blocking issues and lacks partition tolerance.

**Vertical Scaling**
Increasing the capacity of a system by adding more resources (e.g., CPU, RAM) to an existing single machine. This approach improves performance but has physical limits and does not enhance fault tolerance, making it less suitable for very large-scale distributed systems.