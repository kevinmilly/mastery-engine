## Exercises

**Exercise 1**
A homeowner is trying to map their breaker panel because the labels are faded and inaccurate. They flip a 15-amp breaker labeled "Office" and observe that the power goes out to the desk outlets in the office, the overhead light in the hallway, and an outlet in the master bedroom closet. What is the most practical, immediate next step to accurately trace and confirm all loads on this specific circuit without repeatedly flipping the breaker?

**Exercise 2**
A homeowner wants to set up a small pottery studio in their basement, powered by a single, existing 20-amp, 120-volt circuit. They plan to run a pottery wheel (750W), a small electric kiln that requires 1,500W during firing, and two 100W overhead lights simultaneously. Calculate the total amperage draw when all these devices are running. Based on your calculation, what is the primary safety concern with this plan?

**Exercise 3**
A family reports that the lights in their living room flicker noticeably whenever the microwave in the kitchen is running. You have confirmed that the living room lights and the microwave are on two completely separate circuits. What is a likely, non-obvious electrical fault that could cause this interaction between two separate circuits, and where in the electrical system would be the first place to investigate this fault?

**Exercise 4**
You are inspecting a 120/240V residential subpanel in a workshop. You perform a load test and find the following loads on the two separate 120V bus bars (phases):
- Phase A (left side): Powers a 1HP dust collector (1440W), a large air compressor (1800W), and lighting (200W). Total = 3440W.
- Phase B (right side): Powers only a set of outlets for battery chargers and small hand tools, with a typical simultaneous load of 480W.
Even though neither phase exceeds the panel's capacity, explain the specific problem this significant load imbalance creates for the electrical system, particularly concerning the neutral wire.

**Exercise 5**
A client is remodeling their kitchen and has purchased all new appliances. The existing kitchen wiring consists of two 20-amp, 120V small appliance circuits. The new appliances include a 1200W high-speed microwave, a 1500W professional-grade coffee maker, an 1100W toaster oven, and an 800W blender. Drawing on the principles of load balancing and your knowledge of building codes, propose a wiring plan that would prevent nuisance breaker trips while complying with modern safety standards for kitchens.

**Exercise 6**
A homeowner is experiencing an intermittent "open circuit" issue. Every few days, a set of outlets along one wall in their den stops working for several hours before mysteriously starting to work again. Wiggling plugs in the outlets has no effect. The circuit breaker is not tripped. This problem started about a month after they had a minor roof leak repaired above that same wall. Based on a systematic diagnostic approach that integrates knowledge of potential water intrusion, outline the steps you would take to diagnose this "ghost" problem, and explain why the most likely fault is not the breaker or the outlets themselves.

---

## Answer Key

**Answer 1**
The immediate next step is to use a circuit tracer (also known as a tone generator).

**Reasoning:**
The observation confirms that the breaker panel is poorly labeled and that this single circuit serves multiple rooms, which is common in older homes. Instead of tedious trial-and-error (flipping the breaker and checking every outlet/light), a circuit tracer is the correct tool. The process would be:
1.  Leave the breaker on.
2.  Plug the transmitter/toner into one of the known dead outlets.
3.  Use the wand/receiver to scan the breaker panel. The receiver will beep when it is near the correct breaker, confirming the circuit's source.
4.  With the breaker identified, you can then move the transmitter to every other outlet, light fixture, and appliance in the house to definitively map everything that is on that single circuit.

**Answer 2**
The total amperage draw is 20.42 amps. The primary safety concern is a sustained overload of the circuit, posing a fire risk.

**Reasoning:**
1.  **Calculate Total Power (Watts):** 750W (wheel) + 1,500W (kiln) + 2 * 100W (lights) = 2,450W.
2.  **Calculate Total Current (Amps):** Using the formula Power (P) = Voltage (V) * Current (I), or I = P / V.
    I = 2,450W / 120V = 20.42A.
3.  **Analyze the Concern:** A standard 20-amp breaker is designed to handle only 80% of its rating for continuous loads (more than 3 hours), which is 16 amps. The calculated load of 20.42A exceeds the breaker's maximum rating (20A) and is well above the safe continuous load limit. Running this equipment simultaneously will cause the breaker to trip and, if the breaker fails, could cause the circuit wiring to overheat, creating a significant fire hazard.

**Answer 3**
The most likely fault is a loose or failing main neutral connection in the breaker panel.

**Reasoning:**
While the hot wires for the circuits are separate (fed from different breakers), all 120V circuits in a panel share the same neutral bus bar, which returns current to the utility service. A high-draw appliance like a microwave pulls a significant amount of current. If the main neutral conductor (the large wire connecting the neutral bus bar back to the service) is loose, the large current draw from the microwave will cause a voltage drop across this poor connection. This voltage fluctuation affects the entire panel, causing the voltage supplied to all other circuits—including the living room lights—to sag or flicker. The first place to investigate would be the main lugs in the breaker panel where the service entrance conductors (including the neutral) terminate. This is a dangerous issue that should be addressed by a professional.

**Answer 4**
The problem is a severely unbalanced load, which causes the shared neutral wire to carry a dangerously high amount of current.

**Reasoning:**
In a properly balanced 120/240V system, the currents on the two phases (A and B) are roughly equal. The current flowing on the shared neutral wire is the *difference* between the currents on the two phases.
- Current on Phase A: 3440W / 120V = 28.7A
- Current on Phase B: 480W / 120V = 4.0A
In a balanced system, these would be nearly equal, and the neutral current would be close to zero. In this unbalanced system, the neutral must carry the difference: 28.7A - 4.0A = 24.7A.
This is a fire hazard because the neutral wire is typically the same gauge as the hot wires and is not protected by a breaker. A sustained 24.7A could easily overheat the neutral conductor, melting its insulation and creating a risk of fire or shock, even though no single breaker has tripped.

**Answer 5**
The plan should be to add at least one new circuit and strategically distribute the appliance loads.

**Reasoning:**
1.  **Code & Load Analysis:** Modern building codes (like the NEC) require at least two 20-amp small appliance branch circuits for kitchen countertops. The goal is to prevent any single circuit from being overloaded. The combined load of just the coffee maker (1500W) and toaster oven (1100W) is 2600W, or 21.7A, which would overload a single 20A circuit on its own.
2.  **Proposed Plan:**
    *   **Circuit 1 (Existing):** Dedicate one of the 20A circuits to the high-speed microwave (1200W / 10A). This leaves ample capacity for other occasional use items like the blender (800W / 6.7A).
    *   **Circuit 2 (Existing):** Use the second 20A circuit for the professional coffee maker (1500W / 12.5A), which is a high-draw appliance.
    *   **Circuit 3 (New Installation):** Run a *new* dedicated 20A circuit for the toaster oven (1100W / 9.2A). This appliance often has a long duty cycle and is best on its own circuit.
    *   **Load Balancing:** When installing the new breaker, it should be placed on the opposite phase (bus bar) from the other high-draw appliance circuits in the panel to help balance the overall load on the home's service. This plan ensures no single circuit is overloaded, complies with code principles, and provides a better user experience by preventing nuisance trips.

**Answer 6**
The most likely fault is a damaged wire or a failing wire connection inside a junction box within the wall, likely caused by water intrusion from the previous roof leak.

**Reasoning and Diagnostic Plan:**
The symptoms point away from the endpoints (breaker and outlets). An untripped breaker means there's no overcurrent. An intermittent open circuit that resolves on its own suggests a thermal expansion/contraction issue or a corrosion problem at a connection point, not a faulty outlet receptacle. The connection to the recent water leak is the critical clue.

**Systematic Diagnostic Plan:**
1.  **Safety First:** Turn off the circuit breaker for the den outlets. Verify the power is off with a non-contact voltage tester at every outlet.
2.  **Visual Inspection (External):** Carefully inspect the wall and ceiling area below the repaired roof leak. Look for any signs of residual moisture, water staining, or drywall damage that might indicate where water traveled.
3.  **Junction Box Hunt:** The fault is most likely where wires are joined. Outlets are often wired in a "daisy-chain" fashion. You must identify the "first" outlet in the chain from the panel. Open this outlet box and any other junction boxes on the affected wall.
4.  **Internal Inspection:** Inside each box, look for evidence of corrosion (rust, green or white powder) on wire nuts, screw terminals, or the wires themselves. Water intrusion can cause corrosion that creates a poor, intermittent connection. The heat from current flow can cause the connection to expand and break contact (open circuit), and as it cools, it may make contact again.
5.  **Test and Remediate:** If corrosion is found, the wires should be cut back to clean copper, and the connection should be remade with a new wire nut or receptacle. Any damaged wiring or devices must be replaced.

The most likely fault is this hidden, corroded connection because it perfectly explains the intermittent, "self-healing" nature of the problem, which is often linked to temperature changes affecting a physically compromised wire joint, a classic symptom of past water damage in an electrical system.