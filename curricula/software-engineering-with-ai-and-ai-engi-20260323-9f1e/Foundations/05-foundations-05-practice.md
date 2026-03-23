## Exercises

**Exercise 1**
A simple robot vacuum cleaner's goal is to clean a dusty room. It has sensors to detect walls and dirt. Its possible moves are "move forward," "turn left," and "turn right." It receives a positive signal when it vacuums up a patch of dirt and a negative signal if it bumps into a wall. In this scenario, identify the following components:
- The **Agent**
- The **Environment**
- One possible **State**
- One possible **Action**
- One possible **Reward**

**Exercise 2**
You are using reinforcement learning to train a video game character to navigate a level and reach a treasure chest. Consider two different reward schemes:

1.  **Scheme A:** The agent receives a reward of +100 only when it reaches the treasure chest. All other actions result in a reward of 0.
2.  **Scheme B:** The agent receives a reward of +100 for reaching the treasure chest, a penalty of -1 for every step it takes, and a penalty of -10 for hitting an obstacle.

Which reward scheme is likely to result in a more efficient and effective agent? Explain your reasoning.

**Exercise 3**
A large e-commerce platform wants to use RL to personalize the layout of its homepage for each user. The system can choose to show a "featured products" banner, a "new arrivals" grid, or a "special promotions" carousel at the top of the page each time a user visits. The company's primary goal is to maximize user engagement.

Frame this as an RL problem by identifying the agent, environment, and actions. What is the main challenge in defining a good **reward** signal that accurately reflects "user engagement"?

**Exercise 4**
A software development team is considering AI for two different problems:

1.  **Problem A:** Analyzing 10,000 existing bug reports to automatically categorize each new incoming report as "critical," "high," "medium," or "low" priority.
2.  **Problem B:** Creating a system that automatically adjusts the resource allocation (CPU, RAM) for a cloud application every 5 minutes to minimize cost while keeping response time below a 200ms target.

Which of these problems is a better fit for Reinforcement Learning? Justify your choice by explaining why RL is suitable for one and less suitable for the other, based on the core principles of the learning paradigm.

**Exercise 5**
You are building an AI agent to play the game *Pac-Man*. You have a dataset containing thousands of hours of gameplay from the world's best *Pac-Man* players. Your colleague suggests two different training strategies:

1.  **Strategy 1 (Pure RL):** Let the agent start with no prior knowledge and learn entirely through its own trial and error, getting points as rewards just like a human player would.
2.  **Strategy 2 (Hybrid):** First, use the expert gameplay dataset to train a supervised learning model that predicts the expert's next move given the current game screen. Then, use this trained model as the agent's starting "brain" (policy) before letting it continue to learn through its own trial and error (RL).

Which strategy is likely to produce a high-performing agent more quickly? Explain your reasoning by integrating concepts from both Supervised Learning and Reinforcement Learning.

**Exercise 6**
A food delivery company is implementing an RL agent to manage its delivery driver dispatch system. The **agent** is the central system, and its **actions** are to assign a specific order to a specific driver. The company's stated goal is to minimize food delivery time for customers. To achieve this, they define the **reward** as a large positive value if the food is delivered in under 30 minutes and a large negative value if it takes longer.

Describe a potential, unintended negative consequence of this reward system on the drivers. Propose a modification to the reward function or the state representation to create a more balanced and fair system.

---

## Answer Key

**Answer 1**
- **Agent:** The robot vacuum cleaner. It is the entity making decisions.
- **Environment:** The room, including the location of walls, furniture, and dirt. It is the world the agent operates within.
- **State:** A possible state could be the robot's current location (e.g., coordinates x, y), its orientation (e.g., facing north), and the sensor readings indicating if dirt or a wall is nearby.
- **Action:** One possible action is "move forward."
- **Reward:** One possible reward is the positive signal received when cleaning a patch of dirt.

**Answer 2**
Scheme B is likely to produce a more efficient and effective agent.

**Reasoning:**
- **Scheme A** provides a very "sparse" reward. The agent only gets feedback at the very end of its task. In a large level, the agent might wander for a very long time without ever accidentally finding the treasure, so it would never learn what actions are good.
- **Scheme B** provides more frequent feedback. The -1 penalty for each step encourages the agent to find the *shortest* path, promoting efficiency. The -10 penalty for hitting obstacles teaches it to avoid bad moves explicitly. This "reward shaping" guides the agent toward a good solution much faster than a single, all-or-nothing reward.

**Answer 3**
- **Agent:** The e-commerce personalization system.
- **Environment:** The user, the e-commerce platform, and the user's current session.
- **Actions:** "Show featured products," "show new arrivals," or "show special promotions."

**Main Challenge in Defining the Reward:** The challenge is that "user engagement" is ambiguous and has delayed consequences.
- **Immediate vs. Long-term:** A user might click on a "special promotions" banner (immediate positive signal), but get annoyed by constant sales and stop visiting the site next week (long-term negative outcome).
- **Proxy Metrics:** The system would have to use proxy metrics for engagement. Is a click a good signal? Or is a better signal adding an item to the cart? Or a completed purchase? Each choice has trade-offs. A reward based only on clicks might lead to "clickbait" layouts that don't actually lead to sales. The reward function must balance immediate actions with the long-term goal of user satisfaction and revenue.

**Answer 4**
Problem B is a better fit for Reinforcement Learning.

**Reasoning:**
- **Problem B (Resource Allocation)** is a sequential decision-making problem. The system (agent) must repeatedly take actions (adjust resources) within an environment (the cloud application) to optimize a long-term goal (balance of cost and performance). The outcome of an action (e.g., decreasing RAM) is not immediately known and affects future states. This fits the RL paradigm perfectly.
- **Problem A (Bug Triage)** is a classic supervised classification problem. There is a clear set of inputs (bug report text, metadata) and a discrete, correct output (a priority label). The goal is to learn a mapping from input to output based on labeled historical data. There is no sequence of actions or interaction with an environment; each report is classified independently.

**Answer 5**
Strategy 2 (Hybrid) is likely to be much more effective and faster.

**Reasoning:**
- **Supervised Learning's Role:** The first step in Strategy 2 uses supervised learning. The expert gameplay data provides labeled examples where the input is a game state and the "correct" label is the expert's move. Training on this data first (a technique called "imitation learning") gives the agent a strong initial policy. It learns to mimic what good players do in various situations.
- **Reinforcement Learning's Role:** A purely RL agent (Strategy 1) starts from scratch. In a complex game like *Pac-Man*, the number of possible sequences of moves is enormous. The agent would spend a huge amount of time making random, terrible moves before it ever accidentally stumbled upon a successful strategy. The hybrid approach bypasses this inefficient initial exploration phase. The agent starts with a solid baseline of "common sense" from the experts and then uses RL to refine its strategy, discover new tactics, and potentially surpass the experts it learned from.

**Answer 6**
**Potential Negative Consequence:** The agent might learn to assign orders exclusively to drivers who are very close to the restaurant, even if other drivers have been waiting longer for an order. This would maximize the chance of a sub-30-minute delivery but would create an unfair system where some drivers get a constant stream of orders while others, perhaps just a few blocks further away, get none. This maximizes the metric at the expense of driver equity and satisfaction.

**Proposed Modification:**
- **Modify the Reward Function:** The reward could be a composite value. For example: `Reward = (Positive value for fast delivery) - (Penalty based on the driver's idle time)`. This incentivizes the system to not only deliver food quickly but also to minimize how long any given driver has been waiting, promoting fairer distribution of orders.
- **Modify the State Representation:** The state provided to the agent should not just include order locations and driver locations. It should also include information like "time since last order" for each driver. By making this information part of the state, the agent can learn a policy that takes driver fairness into account when making an assignment decision.