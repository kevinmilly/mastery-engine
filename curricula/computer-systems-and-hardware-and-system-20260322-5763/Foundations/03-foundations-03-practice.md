## Exercises

**Exercise 1**
Your program needs to compare two numbers, `A` and `B`, to check if `A` is greater than `B`. Which core component of the CPU is responsible for performing this comparison?

**Exercise 2**
An instruction `STORE R3, 250` is being executed. This instruction tells the CPU to take the value currently held in Register 3 (R3) and write it to memory location 250. Describe the distinct roles the Control Unit and the registers play in this specific operation.

**Exercise 3**
A technician is diagnosing a faulty CPU. They observe that the processor can successfully fetch instructions from memory and load data into its registers. However, when it tries to execute any instruction, it either crashes or does nothing. The data in the registers remains unchanged. Which CPU component is the most likely source of the failure? Justify your answer.

**Exercise 4**
A game developer is trying to optimize a critical piece of code that runs thousands of times per second. They rewrite the code to keep frequently used variables in the CPU's registers instead of constantly reading them from the computer's main memory (RAM). Why would this change likely result in a significant performance improvement?

**Exercise 5**
A programmer writes a line of code to check if a variable `flags` has a specific bit set: `if (flags & 0b1000)`. This is a bitwise AND operation. Connect this high-level programming instruction to the fundamental hardware components of the CPU. Which component executes this, and what prior concept from digital logic is this component built upon?

**Exercise 6**
A CPU needs to execute the instruction `ADD R1, R2`. This instruction means "add the value in register R2 to the value in register R1, and store the final result back into R1."

Suppose R1 contains the 4-bit binary value `0110` (6 in decimal) and R2 contains `0101` (5 in decimal). Trace the execution of this instruction, describing the part played by the Control Unit, the ALU, and the registers. What will be the final binary value in R1?

---

## Answer Key

**Answer 1**
The Arithmetic Logic Unit (ALU) is responsible for this comparison. While we often think of the ALU for addition and subtraction ("Arithmetic"), it also performs all logical operations, which include comparisons like greater than, less than, and equal to.

**Answer 2**
- **Control Unit (CU):** The CU's role is to orchestrate the operation. It first fetches the `STORE R3, 250` instruction from memory, then decodes it to understand what needs to be done. It then sends control signals to the appropriate hardware, instructing Register 3 to output its value and the memory system to prepare to write data at location 250.
- **Registers:** The register's role is to provide the data. In this case, Register R3 acts as the source, holding the value that needs to be stored. It responds to the CU's signal by placing its stored value onto the appropriate data bus so it can be sent to memory.

**Answer 3**
The Control Unit (CU) is the most likely point of failure. The problem states that the CPU can fetch instructions and load data, which means the pathways to memory and registers are working. However, the inability to *execute* any instruction suggests that the component responsible for decoding instructions and sending command signals to the other parts (like the ALU) is broken. The CU is the "director" of the CPU, and if it fails, no other component knows what to do.

**Answer 4**
This change would improve performance because registers are extremely fast, but small, storage locations located directly on the CPU chip. Main memory (RAM) is much larger but is physically separate from the CPU, and accessing it is significantly slower. By keeping frequently used data in registers, the CPU avoids the time-consuming process of repeatedly fetching that data from the much slower RAM, allowing it to complete its calculations much more quickly.

**Answer 5**
This operation is executed by the Arithmetic Logic Unit (ALU). The bitwise AND is a logical operation, which falls under the "Logic" part of the ALU's name. This directly connects to the prior concept of **Logic Gates**. The ALU is constructed from a vast number of logic gates (like AND, OR, XOR) which are combined into circuits that can perform these bitwise operations and other arithmetic tasks. The `&` symbol in the code is a direct abstraction of the AND gate's function at the hardware level.

**Answer 6**
1.  **Control Unit:** The Control Unit fetches the `ADD R1, R2` instruction from memory and decodes it. It recognizes that it needs to perform an addition using the ALU and registers R1 and R2.
2.  **Registers and ALU (Input):** The CU sends signals instructing R1 and R2 to send their values (`0110` and `0101`, respectively) to the ALU's inputs.
3.  **ALU (Execution):** The CU then signals the ALU to perform an addition operation on its inputs. The ALU calculates:
    ```
      0110  (6)
    + 0101  (5)
    -------
      1011  (11)
    ```
4.  **Registers (Output):** The ALU outputs the result `1011`. The CU, knowing the destination from the decoded instruction, directs this result to be written back into Register R1, overwriting its original value.

The final binary value in R1 will be **`1011`**.