## Exercises

**Exercise 1**
A homeowner hangs a new pendant light fixture. They connect the wires, install a brand-new light bulb, and turn on the wall switch. The light does not turn on. Assuming the bulb is good and the circuit breaker is on, what is the most likely reason for this failure based on the fundamental principle of how a circuit works?

**Exercise 2**
A portable electric baseboard heater is plugged into a standard 120-volt wall outlet. Using a clamp meter, you measure that the heater is drawing 12.5 amps of current to operate. What is the electrical resistance (in ohms) of the heater's heating element?

**Exercise 3**
While vacuuming an old workshop, the cord gets snagged and a small section of the outer insulation is scraped off, exposing one of the inner wires. A moment later, the circuit goes dead. The user checks the main electrical panel and finds that the standard circuit breaker for the workshop has *not* tripped. However, the first outlet in the circuit, where the vacuum is plugged in, has a small blinking light and its "Reset" button has popped out. What specific type of safety device likely triggered, and what kind of fault did it detect?

**Exercise 4**
A homeowner is preparing for a party and is using several appliances in the kitchen, all on the same 20-amp circuit. They are running:
- A slow cooker (drawing 1.5 amps)
- A food warmer (drawing 10 amps)
- A coffee machine (drawing 8 amps)
A guest arrives and plugs a phone charger (drawing 1 amp) into a free outlet on the same circuit. What is the immediate consequence, and why does it happen?

**Exercise 5**
During a thaw, a homeowner's basement sump pump is running frequently to handle melting snow. They notice that every time the pump kicks on, the lights in their upstairs bathroom flicker. The pump is on a dedicated 20-amp circuit, and the bathroom lights are on a separate 15-amp circuit. Recalling that water can create unintended electrical pathways, propose a plausible and potentially hazardous explanation that connects the operation of the sump pump to the flickering lights on a different circuit.

**Exercise 6**
A woodworker is upgrading the electrical system in their garage workshop. They plan to run a table saw (15 amps), a powerful dust collection system (10 amps), and overhead LED lighting (2 amps) all at the same time. The garage currently has a single 20-amp circuit. To ensure safety and functionality, identify the two primary electrical issues with their plan and recommend a complete, safe solution. Your recommendation must address both the power requirements and the specific fire hazards present in a dusty workshop environment.

---

## Answer Key

**Answer 1**
The most likely reason is an incomplete circuit. For electricity to flow and power the light, there must be an uninterrupted path from the power source, through the switch and the light bulb, and back to the source. Even with a new bulb, a loose wire connection at the switch, in the fixture's wiring box, or a faulty switch itself would create a break in this path, preventing the circuit from being complete.

**Answer 2**
To find the resistance, you use Ohm's Law, which states Voltage (V) = Current (I) × Resistance (R). We can rearrange this to solve for resistance: R = V / I.

- Voltage (V) = 120 V
- Current (I) = 12.5 A

**Calculation:**
R = 120 V / 12.5 A
R = 9.6 Ω (ohms)

The resistance of the heating element is 9.6 ohms.

**Answer 3**
The device that triggered is a Ground-Fault Circuit Interrupter (GFCI).

**Reasoning:**
A standard circuit breaker trips due to overcurrent (too many amps being drawn). This situation doesn't describe an overcurrent event. A GFCI, often built into outlets in areas like workshops, bathrooms, and kitchens, is designed to detect a ground fault. This occurs when current leaks from its intended path and flows to the ground, which can happen through a person (causing electrocution) or a damaged cord. The exposed wire in the vacuum cord likely made contact with a grounded object (like a concrete floor or metal shelving), creating a ground fault that the GFCI detected and instantly cut power to prevent a shock hazard.

**Answer 4**
The immediate consequence will be the 20-amp circuit breaker tripping, cutting power to all the appliances.

**Reasoning:**
Circuit breakers protect wiring from overheating by limiting the total current. To find the total load, we sum the current drawn by all devices:
- Slow cooker: 1.5 A
- Food warmer: 10 A
- Coffee machine: 8 A
- Phone charger: 1 A

**Total Current Draw:**
1.5 + 10 + 8 + 1 = 20.5 amps

This total of 20.5 amps exceeds the 20-amp rating of the circuit breaker. The breaker will correctly identify this overcurrent condition and trip to prevent the circuit wiring from overheating and causing a fire.

**Answer 5**
A plausible explanation is that the sump pump has a developing ground fault, and the home's grounding system is inadequate.

**Reasoning:**
1.  **Ground Fault in Pump:** Water and electricity are a dangerous mix. Moisture may have gotten inside the pump's housing, causing a small amount of current to "leak" from the hot wire to the pump's metal casing (the ground path). This is a ground fault.
2.  **Shared Grounding System:** Both circuits are connected to the same main electrical panel and share a common grounding system.
3.  **Voltage Drop:** When the pump (a large motor) starts, it briefly draws a very large current. If this current is also flowing through a faulty, high-resistance ground path, it can cause a temporary voltage drop across the entire grounding system for the house.
4.  **Flickering Lights:** The bathroom lights on the separate circuit see this temporary voltage sag relative to their neutral wire, causing them to flicker. This indicates that an electrical fault on one circuit is impacting the stability of another, often pointing to a serious grounding or neutral wiring problem that needs immediate attention from an electrician.

**Answer 6**
**Issue 1: Overcurrent Hazard**
The plan to run the saw and dust collector simultaneously creates a significant overload. The combined current draw would be 15 A + 10 A + 2 A = 27 amps. This far exceeds the capacity of the existing 20-amp circuit and would cause the breaker to trip constantly, making work impossible and creating a fire risk if the breaker were to fail.

**Issue 2: Elevated Arc-Fault Fire Hazard**
A woodworking shop produces fine, flammable sawdust. Furthermore, power tool cords are often damaged, stressed, or pinched during use. These conditions create a high risk for an arc fault—a dangerous electrical spark that can leap between damaged wires and easily ignite the surrounding sawdust, causing a fire. A standard circuit breaker will not detect these small, dangerous arcs.

**Recommended Solution:**
1.  **Dedicated Circuits for Loads:** Instead of one circuit, at least two new, dedicated 20-amp circuits should be installed. One 20-amp circuit should be for the table saw, and a second 20-amp circuit for the dust collector. The lighting can be on one of these or a separate 15-amp circuit. This ensures no single circuit is overloaded.
2.  **Install AFCI Protection:** All new circuits in the workshop should be protected by Arc-Fault Circuit Interrupter (AFCI) breakers in the main panel. An AFCI is specifically designed to detect the unique electrical signatures of dangerous arcs and will cut the power before a fire can start, directly addressing the elevated fire risk from sawdust and damaged cords. For outlets near any water source, a dual-function AFCI/GFCI breaker or GFCI outlet on an AFCI circuit would provide comprehensive protection.