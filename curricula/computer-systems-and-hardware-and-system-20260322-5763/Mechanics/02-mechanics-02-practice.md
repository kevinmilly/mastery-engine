## Exercises

**Exercise 1**
For the MIPS-style instruction `SUB R3, R1, R2`, which performs the operation `R3 = R1 - R2`, trace the flow of data. List, in order, the three primary functional units that the values from registers `R1` and `R2` pass through to produce the result that is ultimately stored in `R3`.

**Exercise 2**
Consider an instruction that loads a value from memory into a register, such as `LW R5, 20(R1)`. This instruction calculates an address by adding the immediate value `20` to the contents of register `R1`, reads from that memory address, and writes the data to register `R5`. Which component of the datapath requires a `MemRead` control signal to be active (set to 1) for this instruction to succeed? Explain why this signal would need to be inactive (set to 0) for a `SW` (store word) instruction.

**Exercise 3**
Imagine a simplified CPU that only has one bus connecting all functional units (registers, ALU, memory). To execute the instruction `ADD R3, R1, R2`, the control unit must break it down into micro-operations. For example:
1. Move `R1` to ALU input A.
2. Move `R2` to ALU input B.
3. Perform addition and move ALU output to `R3`.

Why can't the values from `R1` and `R2` be sent to the ALU simultaneously in this single-bus architecture? How does this differ from a more typical data path with multiple dedicated pathways?

**Exercise 4**
A key multiplexer (MUX) in a typical CPU data path is responsible for selecting the value to be written into the register file. Its inputs are typically (A) the result from the ALU, and (B) the data read from the data memory. For each instruction below, state which input (A or B) the control unit must select and provide a one-sentence justification.
1. `ADDI R1, R2, 50` (R1 = R2 + 50)
2. `LW R1, 0(R2)` (R1 = Memory[R2])

**Exercise 5**
Given your knowledge of ISAs, you know that instructions themselves are just binary data. During the "instruction fetch" stage of the fetch-decode-execute cycle, the Program Counter (PC) holds the address of the next instruction. Describe the data path journey of this address value from the PC to the component that actually provides the instruction to the control unit. Name at least two components involved.

**Exercise 6**
A processor is being tested. The programmer writes the following assembly sequence:
```assembly
ADDI $t0, $zero, 100   # Set $t0 = 100
SW   $t0, 4($s0)       # Store the value from $t0 into memory
```
When debugging, it's discovered that the value `104` is being written to memory, not `100`. The `ADDI` instruction works correctly, and the address calculation (`4 + $s0`) is also correct. The error occurs during the `SW` instruction's execution. Propose a likely fault in the data path design that would cause the calculated address to be written to memory instead of the intended register value.

---

## Answer Key

**Answer 1**
The values from registers `R1` and `R2` would pass through the following units:
1.  **Register File:** The values are first read from their respective storage locations within the register file.
2.  **ALU (Arithmetic Logic Unit):** The two values are then passed as inputs to the ALU, which is configured by the control unit to perform a subtraction operation.
3.  **Register File:** The result from the ALU is routed back to the register file's write port to be stored in the destination register, `R3`.

**Answer 2**
The **Data Memory** unit requires the `MemRead` control signal to be active.

**Reasoning:** The `MemRead` signal tells the memory unit to perform a read operation at the address provided on its address input and to place the corresponding data onto its data output bus. For a `SW` (store word) instruction, the CPU is *writing to* memory, not reading from it. Therefore, `MemRead` must be inactive, and a different signal (e.g., `MemWrite`) would be active instead.

**Answer 3**
In a single-bus architecture, only one value can be transmitted on the bus at any given time. To get two different values (from R1 and R2) to the ALU, they must be sent in separate, sequential steps, each occupying the bus for one cycle.

This differs from a typical data path which has multiple, parallel buses. For instance, a dedicated bus might run from the register file's first read port to the ALU's first input, and a second, separate bus might run from the second read port to the ALU's second input. This allows both register values to be transferred simultaneously in a single clock cycle, making the processor much more efficient.

**Answer 4**
1.  **`ADDI R1, R2, 50`:** The control unit must select input **(A) the result from the ALU**. The instruction is an arithmetic operation, so the value to be saved in the register is the result calculated by the ALU (`R2 + 50`).
2.  **`LW R1, 0(R2)`:** The control unit must select input **(B) the data read from the data memory**. The purpose of a load instruction is to fetch data from memory, so the value to be saved is the one coming from the memory unit, not the memory address calculated by the ALU.

**Answer 5**
The journey of the instruction address from the PC involves these steps:
1.  The value stored in the **Program Counter (PC)** is placed onto the address bus of the instruction memory.
2.  The **Instruction Memory** unit receives this address, reads the binary data (the machine code for the instruction) stored at that location, and outputs it.
3.  This binary data is then passed to the **Control Unit** for the "decode" stage, where it will be interpreted and used to generate the necessary control signals for execution.

**Answer 6**
A likely fault is an incorrect multiplexer routing for the `MemWrite` data input. In a correct design, the data to be written to memory during a `SW` operation comes from the second register read port (Read data 2, which would hold the value from `$t0`). The address for memory comes from the ALU output (which calculated `$s0 + 4`).

The bug description implies that the ALU output (the address `104`) is being sent to *both* the memory address input and the memory data input. This suggests a faulty connection or a misconfigured MUX that incorrectly selects the ALU result as the data source for a store operation, instead of selecting the value from the register file.