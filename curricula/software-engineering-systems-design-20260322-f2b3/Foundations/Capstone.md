## Capstone: Foundations — software engineering systems design

### The Scenario
You are a junior systems designer at "FlavorFeed," a rapidly growing recipe-sharing platform. The platform started as a simple monolithic application: a single web server connected to a single PostgreSQL database. This setup was sufficient for the first 10,000 users, but with a recent surge to over 200,000 active users, the system is showing severe signs of strain.

During peak hours (6-8 PM daily), page load times for popular recipes are exceeding three seconds, and users are reporting frequent timeout errors. Last month, a database hardware failure caused a three-hour outage, as there was no backup system ready to take over. The monolith architecture makes it difficult to deploy updates; a small change to the user profile page requires redeploying the entire application, which introduces risk and downtime.

The product team is eager to capitalize on the growth and wants to introduce two major new features in the next quarter: a "like" button for recipes and a new "Trending Recipes" feed on the homepage. The feed does not need to be real-time; an update every 5-10 minutes is acceptable. Your manager has asked you to create a high-level design proposal that addresses the current performance and reliability issues while paving the way for the new features.

### Your Tasks
1.  **Decompose the System:** Propose a decomposition of the FlavorFeed monolith into at least three distinct, logical services. For each service, provide a name, describe its primary responsibility, and explain how this new structure improves cohesion and manages coupling compared to the single monolithic application.

2.  **Design for "Likes":** An API will be needed for the new "like" feature. Due to network issues, a user's app might send the same "like" request multiple times. Describe how you would design this API endpoint to ensure that multiple identical requests do not result in an incorrect like count. Name and explain the core principle that guarantees this safe behavior.

3.  **Address the Database Bottleneck:** The single database is both a performance bottleneck and a single point of failure. Propose a strategy to improve both the scalability and fault tolerance of the recipe data storage. Justify your choice between vertical and horizontal scaling, and describe a specific technique (e.g., replication, sharding) you would use to achieve your goals.

4.  **Architect the "Trending Recipes" Feed:** The "Trending Recipes" feed does not need to be perfectly up-to-the-second accurate. Given this requirement, would you prioritize strong consistency or eventual consistency for the data powering this feed? Justify your choice by explaining the trade-offs. Propose a high-level mechanism (e.g., using a message queue, a background job, etc.) for how this feed data could be generated without adding significant load to the primary user-facing services.

### What Good Work Looks Like
*   **Justifies Choices with Principles:** A strong response will not just state a decision (e.g., "use microservices") but will justify it using specific principles from the curriculum, such as coupling, cohesion, and fault tolerance.
*   **Clearly Articulates Trade-offs:** Excellent work demonstrates an understanding that every design choice has pros and cons. It explicitly discusses the trade-offs of its proposals, such as the relationship between consistency, availability, and latency.
*   **Connects Solutions to Requirements:** The proposed solutions are directly and clearly linked back to the specific problems outlined in the scenario, such as high latency, poor availability, and the need for new features.
*   **Demonstrates Precision in Terminology:** A high-quality response uses technical terms accurately and precisely. For example, it distinguishes between availability and reliability, or clearly explains the function of a chosen component like a read replica or a message queue in the context of the problem.