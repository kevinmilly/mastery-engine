## Exercises

**Exercise 1**
Your computer needs to store the decimal value 170 in a single byte (8 bits). What is the binary representation? What is the hexadecimal representation?

**Exercise 2**
A memory location contains the 8-bit binary pattern `10101110`. What decimal value does this represent if it is interpreted as an unsigned integer? What decimal value does it represent if it is interpreted as a signed integer using two's complement?

**Exercise 3**
A programmer is designing a system for a video game and decides to store a player's score in an 8-bit signed integer. What is the valid range of scores (minimum and maximum) this system can handle? If a player is expected to potentially earn a score of 200, explain the specific problem that will occur.

**Exercise 4**
You are inspecting a snippet of memory and find the following sequence of three bytes, shown in hexadecimal: `0x43 0x41 0x54`. If you know this memory is storing a piece of text encoded in ASCII, what is the string?

**Exercise 5**
A programmer writes a simple program that reads a single byte from a network connection. The byte received is `11110000` (or `0xF0` in hex). The program then checks if this value is greater than 100. The check surprisingly returns `false`. Assuming the programming language treats single bytes as signed 8-bit integers by default, explain this result.

**Exercise 6**
You are designing a communication protocol for a weather sensor. Each message must contain two pieces of information:
1.  Temperature, in whole degrees Celsius, ranging from -40°C to +60°C.
2.  Humidity, as a percentage, ranging from 0% to 100%.

To save network bandwidth, you must use the smallest number of whole bytes possible for each value. How many bytes would you allocate for the temperature reading, and how many for the humidity reading? Justify your choices based on the data representation concepts you've learned.

---

## Answer Key

**Answer 1**
To represent the decimal value 170 in binary and hexadecimal:

1.  **Decimal to Binary Conversion:** We find the largest power of 2 less than or equal to 170, which is 128 (2⁷). We subtract it and repeat the process with the remainder.
    - 170 - 128 (2⁷) = 42. Bit 7 is 1.
    - 42 is less than 64 (2⁶). Bit 6 is 0.
    - 42 - 32 (2⁵) = 10. Bit 5 is 1.
    - 10 is less than 16 (2⁴). Bit 4 is 0.
    - 10 - 8 (2³) = 2. Bit 3 is 1.
    - 2 is less than 4 (2²). Bit 2 is 0.
    - 2 - 2 (2¹) = 0. Bit 1 is 1.
    - 0 is less than 1 (2⁰). Bit 0 is 0.
    The resulting 8-bit binary representation is **`10101010`**.

2.  **Binary to Hexadecimal Conversion:** We group the binary digits into sets of 4, from right to left, and convert each group to its hex equivalent.
    - `1010` `1010`
    - `1010` in binary is 10 in decimal, which is `A` in hexadecimal.
    - The second `1010` is also `A`.
    The resulting hexadecimal representation is **`0xAA`**.

**Answer 2**
The interpretation of the binary pattern `10101110` depends on the data type.

1.  **Unsigned Integer:** Every bit represents a power of 2.
    - `1*128 + 0*64 + 1*32 + 0*16 + 1*8 + 1*4 + 1*2 + 0*1`
    - `128 + 32 + 8 + 4 + 2 = 174`
    As an unsigned integer, it represents the decimal value **174**.

2.  **Signed Integer (Two's Complement):** The most significant bit (MSB) has a negative weight.
    - Since the MSB is 1, the number is negative.
    - To find its value, we can use the negative weight method:
      - `-1*128 + 0*64 + 1*32 + 0*16 + 1*8 + 1*4 + 1*2 + 0*1`
      - `-128 + 32 + 8 + 4 + 2 = -82`
    - Alternatively, we can invert the bits (`01010001`) and add 1 (`01010010`). This binary value is `64 + 16 + 2 = 82`. Since the original number was negative, the value is **-82**.

**Answer 3**
1.  **Range of an 8-bit signed integer:** An 8-bit signed integer uses one bit for the sign. The range is from -2⁷ to (2⁷ - 1).
    - Minimum value: -128
    - Maximum value: 127
    The valid range of scores is **-128 to 127**.

2.  **Problem with a score of 200:** The value 200 is outside the representable range of an 8-bit signed integer. When the score attempts to go past 127, it will experience an **integer overflow**. The binary representation for 127 is `01111111`. Adding 1 results in `10000000`, which in two's complement is interpreted as -128. The player's score would suddenly become a large negative number, which is a critical bug.

**Answer 4**
To decode the ASCII string, we convert each hexadecimal byte into its corresponding character.
-   `0x43`: The hexadecimal value 43 is `4 * 16 + 3 = 67` in decimal. The ASCII character for decimal 67 is 'C'.
-   `0x41`: The hexadecimal value 41 is `4 * 16 + 1 = 65` in decimal. The ASCII character for decimal 65 is 'A'.
-   `0x54`: The hexadecimal value 54 is `5 * 16 + 4 = 84` in decimal. The ASCII character for decimal 84 is 'T'.

The resulting string is **"CAT"**.

**Answer 5**
The core of the issue is how signed integers are represented.
1.  The byte `11110000` starts with a `1`, so when interpreted as a signed 8-bit integer (two's complement), it represents a negative number.
2.  To find its decimal value, we can see that it's `-128 + 64 + 32 + 16 = -16`.
3.  The program is therefore performing the comparison: `is -16 > 100?`
4.  This comparison is `false`. The programmer likely intended to treat the byte as an *unsigned* value, where `11110000` would be `128 + 64 + 32 + 16 = 240`, and the check `is 240 > 100?` would be `true`. The language's default signed interpretation caused the unexpected behavior.

**Answer 6**
This exercise requires choosing the most efficient data type (in terms of bytes) that can hold the required range of values.

1.  **Temperature (-40°C to +60°C):**
    - This range includes negative values, so we must use a signed integer type.
    - A single signed byte (8 bits) can represent values from -128 to +127.
    - Since the required range of -40 to +60 fits comfortably within -128 to +127, we can use **1 byte** for temperature.

2.  **Humidity (0% to 100%):**
    - This range is non-negative, so we can use an unsigned integer type for maximum efficiency.
    - A single unsigned byte (8 bits) can represent values from 0 to 255.
    - The required range of 0 to 100 fits easily within 0 to 255. Therefore, we can use **1 byte** for humidity.

**Conclusion:** We can represent the temperature with one signed byte and the humidity with one unsigned byte, for a total message size of just 2 bytes.