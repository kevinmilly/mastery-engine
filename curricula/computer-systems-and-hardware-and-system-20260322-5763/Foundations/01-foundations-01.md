# Binary Representation of Data

## The Hook
After this lesson, you will be able to look at a program that mysteriously fails when handling large numbers and know exactly why it's happening at the hardware level.

Think of a simple light switch. It can only be in one of two states: ON or OFF. There is no "in-between." A computer's processor and memory are, at their most fundamental level, just a vast collection of billions of microscopic switches. Every piece of information—every number, letter, image, and sound—is represented by the state of these switches: ON or OFF.

## Why It Matters
If you don't understand how data is represented in binary, you will eventually hit a wall where your software behaves in ways that seem impossible.

Imagine you're working on a popular online game. You store each player's score in what seems like a perfectly normal number field. One day, a player achieves an incredibly high score, `2,147,483,647`. They then score one more point, and their score suddenly flips to `-2,147,483,648`. The player is furious, the system is reporting a negative score, and you have no idea why adding one to a huge positive number resulted in a huge negative one. This isn't a bug in your logic; it's a fundamental limitation of how that number was stored. Understanding binary representation is what separates the programmer who is baffled by this from the one who says, "Ah, that's an integer overflow. We need a larger data type."

## The Ladder
A computer doesn't understand "A" or "123". It only understands electrical signals that are either on or off. We map these two states to the digits **1** (on) and **0** (off). Each 1 or 0 is called a **bit**, short for "binary digit." It's the smallest possible unit of data in a computer.

**From Bits to Bytes**

A single bit isn't very useful, so we group them together. The most common grouping is a sequence of eight bits, which is called a **byte**.

`0 1 0 0 1 0 0 1` (This is one byte)

Think of a byte as a single character or a small number.

**Representing Numbers with Bits (Unsigned Integers)**

How can a pattern of 1s and 0s represent a number like 75? We use the same system we do for decimal numbers: positional notation. In the decimal number 123, the '3' is in the 1s place, the '2' is in the 10s place, and the '1' is in the 100s place.

Binary works the same way, but the places are powers of 2. For an 8-bit byte, the positions are:

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|

To represent the number 75, we find the powers of 2 that add up to it: 64 + 8 + 2 + 1. So we put a '1' in those positions and '0's elsewhere:

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|
| 0 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |

So, the 8-bit binary representation for 75 is `01001011`. This is an **unsigned integer**—an integer that can only be positive. An 8-bit unsigned integer can represent any number from 0 (`00000000`) to 255 (`11111111`).

**Shorthand for Binary: Hexadecimal**

Writing out long strings of 1s and 0s is tedious and error-prone. Programmers often use **hexadecimal** (or "hex") as a more compact shorthand. Hex is base-16, using digits 0-9 and then A-F. Each hex digit corresponds to a unique pattern of 4 bits.

Example: The byte `10110101` can be split into `1011` and `0101`.
- `1011` is 11 in decimal, which is 'B' in hex.
- `0101` is 5 in decimal, which is '5' in hex.
So, `10110101` is simply `B5` in hex. You'll see hex used constantly when looking at memory, network traffic, or debugging low-level code.

**Representing Negative Numbers (Signed Integers)**

What about negative numbers? For this, we use **signed integers**. The most common method is called **two's complement**. The rule is simple: the leftmost bit becomes the **sign bit**. If the leftmost bit is 0, the number is positive. If it's 1, the number is negative.

Because we've used one bit for the sign, the range of values changes. An 8-bit signed integer can no longer go up to 255. Instead, it represents numbers from -128 to +127.

- `01111111` is 127 (the largest positive number).
- `10000000` is -128 (the smallest negative number).
- `11111111` is -1.

This system is clever because it allows the computer's circuitry for addition and subtraction to work on both positive and negative numbers without any special logic.

**Representing Text (Character Encoding)**

To represent text, we just need a standard that maps numbers to letters.
- **ASCII** was an early standard. It defined mappings for 128 characters, like `A` is 65, `B` is 66, and so on. The binary for 65 (`01000001`) means 'A'. This worked well for English, but not for any other language.
- **UTF-8** is the modern standard that conquered the world. It's a clever, variable-length system. For any character that's part of the old ASCII set (English letters, digits, punctuation), the UTF-8 representation is identical—a single byte. For any other character from any language on Earth (like 'é', 'ñ', '€', 'Ω', '漢'), it uses a sequence of two, three, or four bytes. The first few bits of the first byte tell the computer how many total bytes are in the sequence for that character.

Ultimately, whether it's a number or a letter, it all comes down to a sequence of bytes, which is just a sequence of bits.

## Worked Reality
Let's trace the inventory bug from the "Why It Matters" section.

A small e-commerce company stores its warehouse inventory counts using a 16-bit signed integer. A 16-bit signed integer can hold values from -32,768 to +32,767.

1.  **The Situation:** The company has a best-selling product. The inventory count reaches the maximum positive value the 16-bit integer can hold: `32,767`.
2.  **The Binary State:** In the computer's memory, this value is stored as the 16-bit binary pattern `0111111111111111`. The leading `0` signifies a positive number.
3.  **The Event:** A forklift driver unloads a new pallet, and the warehouse manager updates the system, adding 1 more unit to the inventory. The program executes `32767 + 1`.
4.  **The Calculation:** The computer's arithmetic logic unit (ALU) performs binary addition on `0111111111111111` + `1`. Just like in decimal when `9 + 1` carries over to make `10`, the same happens here. Every `1` flips to `0` and carries over to the left, until the very last bit is reached. The final result is:
    `1000000000000000`
5.  **The Interpretation:** The program now needs to display the new inventory count. It reads this 16-bit pattern from memory. Because the data type is a *signed integer*, the CPU looks at the leftmost bit first. It's a `1`. This means the number is negative. In the two's complement system, the pattern `1000000000000000` represents the most negative possible value: `-32,768`.
6.  **The Consequence:** The inventory management dashboard, which previously read `32,767`, now displays `-32,768`. The system might now automatically trigger an emergency order for over 65,000 units to correct the "shortfall," creating a real-world logistics problem. The bug wasn't in the addition; it was in the choice of data representation, which was too small to hold the required value.

## Friction Point
**The Misunderstanding:** "A number is just a number. The bit pattern `11111111` *is* 255. Calling it 'signed' or 'unsigned' is just a detail for the programmer."

**Why It's Tempting:** In our daily lives, numbers have an intrinsic, single meaning. The value 255 is an abstract concept that we all agree on. It's natural to assume the computer sees it the same way.

**The Correct Mental Model:** The raw bit pattern is the only thing that physically exists in memory. A byte holding `11111111` is just a set of eight tiny electronic switches, with all of them in the "on" state. This pattern has **no inherent meaning**.

The meaning is imposed by the code that reads it. The data type (`signed int`, `unsigned int`, `char`) is not a label; it's a **lens for interpretation**. It tells the CPU what rules to use when turning that pattern of switches into a value you can use.

-   If you use the "unsigned integer" lens, the CPU follows the power-of-2 rules and calculates `128+64+32+16+8+4+2+1`, giving you **255**.
-   If you use the "signed integer" lens, the CPU sees the leading `1` and uses the two's complement rules, giving you **-1**.
-   If you use a "character" lens (like Latin-1), the CPU looks up that value in a table and might give you the character **`ÿ`**.

The bits don't change. The interpretation does. The "type" of a variable is the crucial context that gives raw bits their meaning.

## Check Your Understanding
1.  What is the decimal value of the 8-bit unsigned binary number `00101001`?
2.  An 8-bit memory location stores the pattern `11000000`. If this is interpreted as a signed integer, is the number positive or negative? If it's interpreted as an unsigned integer, which decimal value is it closer to: 10, 100, or 200?
3.  Why is the ASCII/UTF-8 representation for the dollar sign '$' only one byte long, while the representation for the Euro sign '€' requires multiple bytes?

## Mastery Question
You are designing a system to track the number of seconds since a historical event that occurred in 1970 (a common practice in computing). You anticipate the system needing to run for over 100 years. You are choosing between a 32-bit signed integer and a 32-bit unsigned integer to store this value. Which one should you choose and why? What specific, predictable problem are you avoiding with your choice?