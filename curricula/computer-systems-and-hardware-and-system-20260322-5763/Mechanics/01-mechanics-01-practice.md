## Exercises

**Exercise 1**
An assembly program contains the following instructions. Classify each one into its most likely instruction type: Data Movement, Arithmetic, or Control Flow.

A. `MOV R1, 100` (Move the value 100 into register R1)
B. `ADD R1, R2` (Add the value in register R2 to register R1)
C. `JMP loop_start` (Jump execution to the label `loop_start`)
D. `STORE [0x4A], R1` (Store the value from register R1 into memory address 0x4A)

**Exercise 2**
A programmer wants to execute the high-level calculation `Z = X - Y`. On their CPU, this cannot be done in a single instruction. Using the three fundamental instruction types (data movement, arithmetic, control flow), write a sequence of 3 assembly-like steps to accomplish this calculation. Assume X, Y, and Z are locations in memory. Use registers R1 and R2 for temporary storage.

**Exercise 3**
Analyze the following snippet of assembly code. In a single sentence, describe its overall purpose in plain English. What is the final value in register `R1` after these instructions execute?

```assembly
; Initial state: Memory location [200] holds the value 8
;                Register R1 holds the value 0
;                Register R2 holds the value 5

LOAD  R1, [200]   ; Load value from memory address 200 into R1
SUB   R1, R2      ; Subtract R2 from R1, store result in R1
STORE [200], R1   ; Store value from R1 into memory address 200
```

**Exercise 4**
A CPU manufacturer is designing a low-cost processor for an embedded device. Its Instruction Set Architecture (ISA) only includes instructions for `ADD` (addition) and `DEC` (decrement a register by 1), along with a `JNZ` (Jump if Not Zero) instruction for control flow. The ISA has no `SUB` (subtraction) instruction.

How could you perform the operation `R1 = R1 - R2` using only the available instructions? Describe the logic or provide a short sequence of assembly-like pseudocode.

**Exercise 5**
Two processors, CPU-A and CPU-B, have different ISAs. To calculate `X * 16`, a programmer writes the following assembly for each:

*   **CPU-A:** `MUL R1, 16` (One instruction)
*   **CPU-B:** `SHL R1, 4` (Shift bits left by 4, which is equivalent to multiplying by 2^4, or 16)

The `MUL` instruction on CPU-A takes 10 clock cycles to execute. The `SHL` instruction on CPU-B takes only 1 clock cycle. Which CPU is "better" for this specific task? Explain the trade-off this example demonstrates in ISA design.

**Exercise 6**
A junior programmer writes a simple high-level program with a function call. They are surprised to learn that calling a function is not a single, instantaneous machine instruction. Based on your understanding of ISAs, explain why a function call like `result = calculate(a, b)` requires multiple assembly instructions to execute. What kinds of data movement and control flow operations are likely involved?

---

## Answer Key

**Answer 1**
This exercise tests the ability to categorize instructions based on their function.

*   A. `MOV R1, 100` is **Data Movement**. It moves a constant value into a register.
*   B. `ADD R1, R2` is **Arithmetic**. It performs a mathematical operation on values in two registers.
*   C. `JMP loop_start` is **Control Flow**. It changes the sequence of execution, telling the CPU which instruction to run next instead of just proceeding to the next line.
*   D. `STORE [0x4A], R1` is **Data Movement**. It moves data from a register to a location in memory.

**Answer 2**
This exercise tests the ability to translate a high-level concept into a sequence of low-level operations.

The calculation `Z = X - Y` requires moving the operands from memory into CPU registers, performing the arithmetic, and then moving the result back to memory.

1.  **`LOAD R1, [X]`** (Data Movement): Load the value from memory location X into register R1.
2.  **`LOAD R2, [Y]`** (Data Movement): Load the value from memory location Y into register R2.
3.  **`SUB R1, R2`** (Arithmetic): Subtract the value in R2 from R1, storing the result in R1.
4.  **`STORE [Z], R1`** (Data Movement): Store the final result from R1 into memory location Z.

*(Note: A 3-step solution assuming one operand can be addressed from memory directly, like `SUB R1, [Y]`, is also correct. The key is showing the load/operate/store pattern.)*

**Answer 3**
This exercise requires analyzing a sequence of instructions to determine its high-level effect.

*   **Overall Purpose:** The code updates a value in memory by subtracting 5 from it.
*   **Final value in R1:** The final value in register R1 is 3.

**Reasoning:**
1.  `LOAD R1, [200]`: The value at memory address 200 (which is 8) is loaded into `R1`. `R1` is now 8.
2.  `SUB R1, R2`: The value in `R2` (which is 5) is subtracted from `R1`. `R1` becomes `8 - 5 = 3`.
3.  `STORE [200], R1`: The new value in `R1` (which is 3) is stored back into memory address 200. Although the memory is updated, the final value in the register `R1` remains 3.

**Answer 4**
This exercise tests problem-solving within the constraints of a limited ISA. The key is to recognize that subtraction can be implemented by repeated decrements (or additions of negative numbers, but decrementing is more direct here).

**Logic:** To subtract R2 from R1, you can repeatedly decrement R1 a total of R2 times. This can be implemented with a loop.

**Pseudocode:**
```assembly
loop_start:
  DEC   R1      ; Decrement R1 by 1
  DEC   R2      ; Decrement R2 by 1 (our loop counter)
  JNZ   R2, loop_start  ; If R2 is not zero, jump back to the start of the loop
```
**Explanation:** The loop continues to run, decrementing both `R1` and `R2` each time. When `R2` finally reaches zero, the loop terminates. At this point, `R1` will have been decremented the original `R2` number of times, achieving the subtraction.

**Answer 5**
This exercise requires evaluating a design trade-off between instruction complexity and performance.

*   **Which CPU is "better"?** For this specific task, CPU-B is 10 times faster.
*   **Trade-off:** This demonstrates the core trade-off between Complex Instruction Set Computing (CISC) and Reduced Instruction Set Computing (RISC) philosophies.
    *   **CPU-A (CISC-like):** It has a powerful, complex `MUL` instruction that directly corresponds to a high-level operation. This makes assembly programming easier and code more compact, but the hardware required to execute this instruction is complex and slow (10 cycles).
    *   **CPU-B (RISC-like):** It uses a very simple, fast `SHL` instruction (1 cycle). While this instruction doesn't look like "multiplication," a clever programmer or compiler can use it for very fast multiplication by powers of two. The trade-off is that the hardware is simpler and faster, but achieving a high-level goal might require more cleverness in the software.

**Answer 6**
This exercise requires connecting a high-level software abstraction (a function call) to the underlying hardware reality.

A function call is not a single instruction because it involves a complex sequence of housekeeping operations that the CPU must perform. The ISA provides the simple building blocks, but the compiler or operating system must combine them to create the "function call" abstraction.

Likely operations include:
1.  **Data Movement (Pushing Arguments):** The parameters `a` and `b` must be moved from their current location to a place the function can find them, typically a special memory area called "the stack" or into specific registers. This requires multiple `STORE` or `MOV` instructions.
2.  **Control Flow (Saving Return Address):** Before the CPU can jump to the new function, it must save the address of the instruction *after* the function call. This is so it knows where to return when the function is finished. This involves moving the current instruction pointer's value to the stack.
3.  **Control Flow (The Jump):** A `JMP` or `CALL` instruction is then executed to change the program counter to the starting address of the `calculate` function.
4.  **Post-call Cleanup (Data Movement):** After the function returns, its return value must be moved from a register or the stack into the `result` variable, and the stack must be cleaned up. This again involves more data movement instructions.