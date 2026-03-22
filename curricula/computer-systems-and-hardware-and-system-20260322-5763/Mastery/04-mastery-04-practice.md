## Exercises

**Exercise 1**
A host server has a single Linux kernel, 8 CPU cores, and 32 GB of RAM. Two applications, App A and App B, need to be deployed. Describe the state of the system's kernel and RAM allocation if deployed using:
a) Two separate Virtual Machines (VMs) running a guest Linux OS.
b) Two separate Docker containers.
Focus on the number of running kernels and how the 32 GB of RAM is partitioned or shared.

**Exercise 2**
For each of the following scenarios, recommend either a Type 1 (bare-metal) or Type 2 (hosted) hypervisor. Justify your choice based on performance overhead and security isolation.
a) A developer needs to run a sandboxed Windows environment on their macOS laptop to test a single application's compatibility.
b) An enterprise is setting up a dedicated server in a data center to host ten production web servers for different clients, each in its own isolated virtual machine.

**Exercise 3**
A cloud-native application experiences sudden, unpredictable traffic spikes that last for 10-15 minutes. The auto-scaling policy needs to launch 50 new instances of a stateless web service within 30 seconds to handle the load. Analyze the suitability of using traditional VMs versus containers for this scaling requirement. Your analysis should focus on instance startup time and resource density on the host machines.

**Exercise 4**
A critical security vulnerability (a privilege escalation exploit) is discovered in the Linux kernel's networking stack. Consider a single physical host machine that is running multiple, isolated, multi-tenant applications. Analyze the security risk and potential "blast radius" of this exploit in two different setups:
a) The host runs a Type 1 hypervisor, and each application is in a separate Linux VM.
b) The host runs a Linux OS, and each application is in a separate Docker container.

**Exercise 5**
A guest operating system running inside a VM attempts to execute a privileged instruction, such as `LGDT` (Load Global Descriptor Table), which normally requires Ring 0 access. The host machine's CPU supports hardware-assisted virtualization (e.g., Intel VT-x). Drawing on your knowledge of protection rings and the Memory Management Unit (MMU), describe the sequence of events that allows the hypervisor to intercept this instruction and emulate its behavior without compromising host system stability. Why is this interception necessary?

**Exercise 6**
You are designing the deployment for a system on a single, powerful multi-core server with high-speed NVMe storage. The system has two main components:
1.  A high-throughput, latency-sensitive database that is heavily I/O-bound.
2.  A cluster of 10 identical, stateless, CPU-bound data processing workers that can run in parallel.
Propose a virtualization strategy for deploying these two components on the same server. Justify your choice of technology (VM, container, or a mix) for each component by referencing concepts like I/O device driver overhead, CPU scheduling fairness, and memory isolation from previous lessons. For the database, what specific virtualization feature would you investigate to minimize I/O latency?

---

## Answer Key

**Answer 1**
a) **Two VMs:** The system would be running a total of **three** kernels: the host's Linux kernel (managed by the hypervisor) and one separate guest Linux kernel inside each of the two VMs. The 32 GB of RAM would be **statically partitioned**. For example, the hypervisor might reserve 2 GB for the host, and then allocate a fixed 15 GB block to each VM. The guest OS within a VM can only see and manage its own 15 GB block; it is unaware of the other VM's memory.

b) **Two Containers:** The system would be running only **one** kernel: the host's Linux kernel. Both containers share this single kernel. The 32 GB of RAM is **dynamically shared** among the host and the two containers. The Linux kernel's scheduler and cgroups mechanism manage memory allocation. While limits can be placed on each container's memory usage, they all draw from the same shared pool, making it a more flexible but less strictly isolated allocation model than with VMs.

**Answer 2**
a) **Recommendation: Type 2 (hosted) hypervisor.**
**Reasoning:** A Type 2 hypervisor runs as an application on top of the existing host OS (macOS). This is ideal for a developer's workstation because it's easy to install and manage without repartitioning the disk or replacing the primary OS. The performance overhead from the extra OS layer is acceptable for a temporary testing environment. The developer can seamlessly switch between their native macOS applications and the sandboxed Windows VM.

b) **Recommendation: Type 1 (bare-metal) hypervisor.**
**Reasoning:** A Type 1 hypervisor runs directly on the server's hardware, acting as the operating system. This is superior for a production data center environment for two key reasons. First, **performance:** it has direct access to hardware and avoids the overhead of a general-purpose host OS, providing better performance and resource allocation for the guest VMs. Second, **security:** the hypervisor has a much smaller, purpose-built attack surface than a full host OS like Windows or Linux, which enhances the security and isolation between different clients' VMs.

**Answer 3**
**Analysis:** Containers are far more suitable for this rapid auto-scaling scenario.

1.  **Startup Time:** A VM has to boot an entire operating system—from the bootloader to kernel initialization to starting system services—before it can launch the application. This process can take minutes. A container, in contrast, only needs to start the application's process within the *already running* host kernel. It leverages Linux features like namespaces and cgroups, making startup nearly instantaneous (milliseconds to seconds). Launching 50 new instances in under 30 seconds is feasible with containers but highly unlikely with VMs.

2.  **Resource Density:** Each VM requires a significant, pre-allocated block of RAM and disk space for its guest OS, even if the application inside is small. Containers share the host kernel and only package their application-specific libraries and binaries. This lightweight nature means many more container instances can be packed onto a single host machine compared to VMs, leading to much higher resource density and lower infrastructure costs. For a scenario requiring 50 instances, containers would require significantly fewer host machines than a VM-based approach.

**Answer 4**
a) **VM Setup (Type 1 Hypervisor):** The risk is significantly lower. The hypervisor is the only software running at the highest privilege level on the hardware. Each VM contains a full, independent guest kernel. If an attacker compromises one application and uses the exploit to gain root access within that VM's kernel, they are still contained within the virtual machine. The exploit does not affect the hypervisor or the other VMs, as they do not share a kernel. The blast radius is confined to the single compromised VM.

b) **Container Setup:** The risk is extremely high. All containers on the host share the same underlying Linux kernel. If an attacker compromises one container and successfully executes the privilege escalation exploit against the kernel, they gain root access to the *host operating system*. From there, they have control over the entire machine, including all other containers, the host's file system, and network interfaces. The blast radius encompasses the entire host server and all applications running on it. This is the fundamental security tradeoff of containerization's shared-kernel model.

**Answer 5**
**Sequence of Events:**
1.  **Guest OS Action:** The guest OS, which believes it is running in Ring 0, attempts to execute the privileged `LGDT` instruction.
2.  **CPU Trap (VM-Exit):** Because the system is in a special "guest" mode enabled by VT-x, the CPU itself recognizes `LGDT` as a sensitive instruction. Instead of executing it, the CPU hardware automatically triggers a "VM-Exit". This event saves the guest's current state (registers, etc.) and transfers control from the guest VM to the hypervisor, which runs in a more privileged "root" mode (conceptually, a "Ring -1").
3.  **Hypervisor Interception:** The hypervisor's code now runs. It inspects the reason for the VM-Exit and sees that the guest attempted to execute `LGDT`.
4.  **Emulation and Validation:** The hypervisor validates the guest's request. It checks the new GDT that the guest wants to load. It then emulates the instruction's effect *on behalf of the guest*, but within the virtualized context. It updates the guest's virtual CPU state to reflect what *would have happened* if the instruction had run, but does so safely without altering the host's actual GDT. The hypervisor uses its control over the MMU (specifically, shadow page tables or EPT) to ensure the guest's memory operations are confined to its own allocated physical memory.
5.  **Resume Guest (VM-Entry):** After handling the instruction, the hypervisor performs a "VM-Entry" operation, restoring the guest's state and resuming its execution at the instruction immediately following the `LGDT`.

**Necessity:** This interception is necessary because the guest OS cannot be allowed to directly modify the core state of the physical CPU. If the guest could directly load its own Global Descriptor Table onto the physical processor, it could redefine memory segments and privilege levels, effectively bypassing the hypervisor's control and breaking the isolation between VMs, potentially crashing the entire host system.

**Answer 6**
**Proposed Strategy:** A mixed-technology approach is optimal.

1.  **Database Component:** Deploy the database in a dedicated **Virtual Machine**.
    *   **Justification (I/O & Isolation):** I/O-bound databases are extremely sensitive to latency introduced by abstraction layers. A VM provides stronger performance isolation. Crucially, modern hypervisors support **I/O passthrough** (e.g., SR-IOV for networking or direct device assignment for NVMe controllers). This feature would allow the VM's guest OS to get near-bare-metal access to the physical NVMe drive, bypassing the hypervisor's virtual device driver stack and drastically reducing I/O latency. This is not possible with containers, which must go through the host kernel's I/O stack. The strong memory isolation of a VM also prevents the CPU-bound workers from causing memory-pressure issues (like swapping) that could affect the database's performance.

2.  **Data Processing Workers:** Deploy the 10 workers as **Containers** on the host OS (or within a separate, large management VM).
    *   **Justification (CPU & Efficiency):** The workers are stateless and CPU-bound. Containers are ideal because they are lightweight, have very low startup overhead, and share the host kernel. This allows the host's CPU scheduler to efficiently and fairly distribute the 10 container processes across the available CPU cores with minimal overhead. Unlike VMs which require CPU cycles for their own guest OSes, nearly 100% of the CPU allocated to the containers is used for the application's work. This leads to higher resource utilization and density.

**Specific Feature for Database:** For the database VM, I would investigate **PCIe Passthrough** (or DirectPath I/O / VT-d). This would involve assigning the physical NVMe controller directly to the database VM, allowing its guest OS to use a native NVMe driver and communicate with the hardware with the lowest possible latency.