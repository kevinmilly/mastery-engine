## Exercises

**Exercise 1**
A developer is building a new photo-editing application. For performance reasons, one of their colleagues suggests that the process that handles image file parsing should run with administrative (`root` or `Administrator`) privileges to guarantee fast access to the filesystem. Using the principle of privilege separation, explain the security risk of this design choice. What specific attack vector does this open up if a vulnerability (e.g., a buffer overflow) is found in the image parsing library?

**Exercise 2**
A system is configured with Secure Boot enabled. An attacker gains physical access to the machine and replaces the primary operating system's bootloader on the disk with a malicious one designed to act as a rootkit. The attacker does not have access to the original vendor's cryptographic signing keys. Describe the step-by-step process of what will happen when the machine is next powered on and why the attack will fail.

**Exercise 3**
An operating system uses a hardware-enforced security feature called Data Execution Prevention (DEP), which is managed by the Memory Management Unit (MMU). DEP marks the memory pages containing the stack and heap as non-executable. An attacker has successfully exploited a stack buffer overflow in a running application, overwriting the return address on the stack. The attacker's payload, placed on the stack just after the overwritten return address, consists of malicious machine code (shellcode). Explain precisely why the attack will fail at the moment the vulnerable function attempts to return. What alternative exploitation strategy would an attacker need to employ to bypass DEP?

**Exercise 4**
The developers of a popular web browser sandbox each tab in a separate, low-privilege process. This sandbox policy, enforced by the OS kernel, blocks the sandboxed processes from making network system calls (e.g., `socket()`, `connect()`). However, the browser must obviously connect to web servers. Propose a secure inter-process communication (IPC) architecture that allows a sandboxed tab process to request and display a web page without violating the principle of the sandbox. Identify the key components of your proposed architecture and the trusted component responsible for enforcing security policy.

**Exercise 5**
You are performing a security audit of an operating system's kernel. You discover a device driver for a graphics card that uses a shared buffer with a user-space application for high-performance rendering. To update the buffer, the user application makes an `ioctl` system call, passing a pointer to a user-space data structure containing a `size` field and a `data` field. The kernel driver code is as follows:

```c
// In kernel driver
void handle_ioctl(...) {
    ioctl_params_t params_from_user;
    copy_from_user(&params_from_user, user_ptr, sizeof(ioctl_params_t));

    // Vulnerability is here: size is trusted without validation
    memcpy(kernel_shared_buffer, params_from_user.data, params_from_user.size);
    ...
}
```
The `kernel_shared_buffer` is a fixed-size 4KB buffer. By itself, this is a standard buffer overflow. Now, consider that this `ioctl` can be called concurrently by multiple threads. Explain how a race condition introduced by another developer—one that allows a malicious program to modify the `params_from_user.size` value in memory *after* the `copy_from_user` check but *before* the `memcpy`—could make this vulnerability significantly more powerful and harder to detect with static analysis. Integrate concepts from memory protection rings and concurrency in your answer.

**Exercise 6**
A company is designing a secure embedded IoT device that will receive over-the-air (OTA) firmware updates. The device has limited processing power. Two security architectures are proposed:

1.  **Monolithic Kernel with Secure Boot:** A single, monolithic kernel runs all device functions. Secure Boot is used to verify the kernel's digital signature before loading. The update mechanism replaces the entire OS image.
2.  **Microkernel with Sandboxed Services:** A microkernel runs with minimal functionality (scheduling, IPC). All other functions (drivers, network stack, application logic) run as isolated user-space server processes. The update mechanism can replace individual server processes without rebooting.

Analyze these two designs from an OS security perspective. Which design provides better resilience against a single vulnerability in a component like the network stack? Justify your answer using the principles of privilege separation and attack surface reduction. What is the primary security trade-off or risk associated with the microkernel approach?

---

## Answer Key

**Answer 1**
Running the image parser with administrative privileges fundamentally violates the principle of privilege separation (or least privilege). This principle dictates that a process should only have the permissions necessary to perform its function. Image parsing does not require system-wide administrative rights.

The security risk is that a vulnerability in the parser becomes a system-wide compromise. If an attacker crafts a malicious image file that triggers a buffer overflow in the parsing library, the resulting arbitrary code execution would occur in the context of the `root` user (Ring 0 privileges).

This directly enables the most severe class of attack: **privilege escalation**. Instead of being contained within a limited user account, the attacker immediately gains full control over the operating system. They could install a rootkit, disable security software, access all user data, and pivot to attack other systems on the network. A non-privileged process would have limited the damage to the scope of that user's account.

**Answer 2**
The attack will fail because Secure Boot establishes a cryptographic chain of trust, starting from an immutable root of trust in the hardware/firmware.

1.  **Power On:** The system powers on and the CPU begins executing the UEFI/BIOS firmware from its read-only memory. This firmware is the implicit root of trust.
2.  **Firmware Verification:** The UEFI firmware contains a database of public keys or certificates from trusted vendors (e.g., Microsoft, the hardware manufacturer).
3.  **Bootloader Loading:** The firmware attempts to load the first-stage bootloader from the disk's EFI System Partition.
4.  **Signature Check:** Before executing the bootloader, the firmware uses the public keys in its trusted database to verify the bootloader's digital signature. The attacker's malicious bootloader is not signed with a private key corresponding to any of the trusted public keys.
5.  **Verification Failure:** The signature verification will fail.
6.  **Execution Halted:** Because the bootloader's authenticity and integrity cannot be verified, the UEFI firmware will refuse to execute it. The boot process is halted, often displaying a security error message to the user.

This process prevents rootkits and bootkits that attempt to compromise the OS before the kernel and its security features are even loaded. The chain of trust continues from the bootloader to the OS kernel, ensuring each component is validated before it runs.

**Answer 3**
The attack will fail because the CPU, under the direction of the MMU and the OS, will prevent the execution of code residing on the stack.

1.  **Vulnerability Exploited:** The attacker's buffer overflow successfully overwrites the saved return address on the stack with a pointer to the location of their shellcode, which is also on the stack.
2.  **Function Return:** The `ret` instruction is executed. This instruction pops the address from the top of the stack and attempts to jump to it, setting the instruction pointer (IP) to the shellcode's address.
3.  **MMU Intervention:** The moment the CPU tries to fetch the first instruction from this new IP address, the MMU checks the permissions of the memory page containing that address. The OS has marked all stack pages as non-executable (NX bit or XD bit).
4.  **Hardware Exception:** The MMU detects an attempt to execute from a non-executable page and raises a hardware exception (a page fault with a protection violation error).
5.  **OS Response:** The kernel's exception handler catches this fault. It recognizes it as a fatal security error for the process and terminates it, typically with a "Segmentation Fault" or "Access Violation" error.

To bypass DEP, an attacker must use an alternative strategy that executes only existing code in memory, such as **Return-Oriented Programming (ROP)**. In a ROP attack, the attacker overwrites the stack not with shellcode, but with a chain of addresses pointing to small snippets of existing, executable code (called "gadgets") within the application and its loaded libraries, ending each snippet with a `ret` instruction. This allows them to chain together legitimate code to perform malicious actions without ever writing new executable code to memory.

**Answer 4**
A secure architecture would use a privileged **broker process** to mediate access to restricted resources on behalf of the sandboxed processes.

**Architecture Components:**

1.  **Sandboxed Tab Process (Low Privilege):** This process runs the web page's renderer and JavaScript engine. It has no direct access to network or file I/O system calls.
2.  **Broker Process (Higher Privilege):** A single, trusted process that runs with the necessary privileges to access the network and filesystem. It is designed to be small, simple, and heavily scrutinized for security flaws.
3.  **Secure IPC Channel:** The OS provides a secure Inter-Process Communication mechanism (e.g., pipes, sockets, or a custom kernel-mediated channel) connecting each sandboxed process to the broker.

**Process Flow for a Network Request:**

1.  The sandboxed tab process needs to fetch an image. It constructs a request message (e.g., "GET https://example.com/image.png").
2.  It sends this message to the broker process over the secure IPC channel.
3.  The **broker process**, as the trusted component, receives the request. It validates the request against a security policy (e.g., is this a valid URL? Does it conform to the same-origin policy?).
4.  If the request is valid, the broker performs the network operations on behalf of the sandboxed process.
5.  The broker receives the image data from the network.
6.  It sends the data back to the sandboxed tab process over the IPC channel.
7.  The sandboxed process receives the data and renders the image, all without ever directly making a network system call.

This design concentrates the trust in one small, verifiable component (the broker), adhering to the principle of least privilege for the complex, more vulnerable tab processes.

**Answer 5**
This vulnerability escalates from a simple buffer overflow to a more powerful **Time-of-Check to Time-of-Use (TOCTOU)** race condition vulnerability. It allows an attacker to bypass kernel validation checks and achieve a kernel-level write-what-where condition.

**Integration of Concepts:**

1.  **User-space (Ring 3) vs. Kernel-space (Ring 0):** The `ioctl` system call is the boundary crossing from user-space to kernel-space. The `copy_from_user` function is critical for safely bringing data across this boundary. The kernel must inherently distrust any data coming from user-space.
2.  **Concurrency:** A malicious program would set up two threads.
    *   **Thread A (The "ioctl" Thread):** This thread calls the `ioctl` with a pointer to a valid-looking `ioctl_params_t` structure in shared memory, where `size` is a safe value (e.g., 1KB).
    *   **Thread B (The "Race" Thread):** This thread runs in a tight loop, attempting to modify the `size` field in that same shared memory structure to a very large, malicious value (e.g., 65535).
3.  **Exploitation Scenario:**
    *   Thread A enters the kernel via the `ioctl` system call. The kernel driver executes `copy_from_user`. At this point, the `params_from_user.size` field in the kernel's stack memory is the safe, small value. The check is passed.
    *   The OS scheduler deschedules the kernel context of Thread A and schedules Thread B.
    *   Thread B's loop successfully overwrites the `size` field *in the user-space memory location* that was just copied from.
    *   The scheduler resumes Thread A inside the kernel driver. The driver now proceeds to the `memcpy` instruction.
    *   **Crucially, the `memcpy` uses the original `params_from_user.data` pointer, which still points to user-space memory**. The kernel attempts to copy from this user-space address, but it uses the *kernel-space, already-checked copy* of the `size` field. This is the flaw in the logic.
    *   *If the code was instead vulnerable to the race*, where `params_from_user.size` was re-read from user-space after the check, Thread B's change would be used. The `memcpy` would then copy a massive amount of attacker-controlled data from user-space into the kernel, overflowing the `kernel_shared_buffer` and corrupting adjacent kernel memory structures (like function pointers or privilege structures) to achieve arbitrary code execution in Ring 0.

This TOCTOU attack defeats static analysis that might only check if the `size` value is validated, because the validation *does* happen. The vulnerability is in the time window between the check and the use of the data, which is only exploitable through a concurrent attack.

**Answer 6**
The **Microkernel with Sandboxed Services** design provides better resilience against a single vulnerability.

**Justification (using principles):**

1.  **Privilege Separation:** In the microkernel design, the network stack runs as a distinct, unprivileged user-space process. If a vulnerability (e.g., a buffer overflow from a malformed packet) is exploited in the network stack, the attacker only gains control of that single process. They are still trapped in user-space (Ring 3) and are confined by the microkernel's mandatory access control. They cannot directly access the kernel, other drivers, or other services. In the monolithic design, the network stack runs in kernel-space (Ring 0). A similar vulnerability would immediately grant the attacker full kernel-level privileges, compromising the entire device.

2.  **Attack Surface Reduction:** The microkernel itself has a minimal attack surface. Its sole jobs are scheduling, IPC, and basic memory management. It is small, easier to formally verify, and contains far less code than a monolithic kernel. The monolithic kernel, which includes all drivers, filesystems, and the network stack, presents a massive, complex attack surface where any single bug can be fatal to the system's security.

**Primary Trade-off/Risk of the Microkernel Approach:**

The primary security trade-off is the **complexity and correctness of the Inter-Process Communication (IPC) mechanism**. Since all services must communicate with each other and the kernel via IPC messages, the IPC system itself becomes a critical part of the security model. A flaw in the IPC implementation (e.g., allowing message spoofing, improper validation, or denial of service) could allow a compromised service to attack another service or the microkernel itself. The security of the entire system relies heavily on the robustness of this message-passing foundation. Performance can also be a trade-off, as IPC calls often have higher overhead than direct function calls within a monolithic kernel, though this is less of a security concern.