## Exercises

**Exercise 1**
A high-frequency trading platform processes thousands of time-sensitive financial transactions per second. Separately, an internal employee directory service for a 500-person company is updated only when employees join, leave, or change roles—perhaps a few times per day.

For each system, propose a reasonable Recovery Time Objective (RTO) and Recovery Point Objective (RPO). Justify why the values are so different and what kind of backup/replication strategy each might imply.

**Exercise 2**
A database system has a full backup taken every night at 2:00 AM and transaction log backups taken every 15 minutes. A catastrophic failure occurs at 11:10 AM, destroying the primary data center. Assume the backups are stored offsite, it takes 90 minutes to provision new hardware, and 45 minutes to restore the last full backup and apply all subsequent log backups.

What are the best-case RTO and RPO for this system? Show your calculation and reasoning.

**Exercise 3**
An e-commerce platform is planning to expand from a single-region to a multi-region deployment to improve its disaster recovery posture. The engineering team is debating between an active-passive and an active-active strategy.

Analyze the tradeoffs between these two choices across three dimensions: cost, RTO, and implementation complexity. Which strategy would you recommend if the primary business driver is minimizing customer-facing downtime, even at a significantly higher operational cost?

**Exercise 4**
A company has an active-passive setup with a stated RTO of 2 hours. During a planned DR drill, they initiate a failover. The technical team reports that while the database replication was up-to-date (achieving a very low RPO), it took 6 hours to update public DNS records to point to the passive region and another 2 hours for application services to start correctly because of misconfigured secrets and network dependencies. The total recovery time was 8 hours.

Based on this outcome, what specific weaknesses in their DR *planning and testing* process are revealed, beyond the immediate technical glitches?

**Exercise 5**
Your system uses a geographically-sharded database to reduce latency for users. The user data is sharded by `country_code`, with North American user data residing in the `us-east-1` region and European user data in `eu-west-1`. You need to design a DR strategy that can handle the complete failure of the `us-east-1` region.

Describe a recovery plan. How does this sharding strategy complicate the concepts of RPO and failover compared to a non-sharded database? Consider the impact on both NA and EU users during the outage.

**Exercise 6**
You are the on-call engineer for an active-active financial transaction system deployed in two regions, A and B. A major network partition occurs, isolating the regions from each other. Your monitoring system shows that both regions are independently healthy and processing local traffic, but they cannot replicate data to each other. Your DR runbook says to manually failover all traffic to a single region to prevent data divergence (a "split-brain" scenario).

Using the principles of the CAP theorem, explain the fundamental tradeoff you are being forced to make. What specific observability metrics would be critical in helping you decide whether to failover to region A, failover to region B, or (in violation of the runbook) take the risk of keeping both active?

---

## Answer Key

**Answer 1**
**High-Frequency Trading Platform:**
*   **RPO (Recovery Point Objective):** Near-zero, ideally measured in milliseconds or less. Any lost transaction data represents a significant financial loss and potential regulatory non-compliance.
*   **RTO (Recovery Time Objective):** Very low, measured in seconds or single-digit minutes. Every minute of downtime prevents trades and causes massive financial losses.
*   **Justification:** The business is defined by its ability to process transactions in real-time. Data loss is unacceptable (low RPO), and downtime is extremely expensive (low RTO).
*   **Implied Strategy:** This requires a hot-standby system, likely an active-active or active-passive multi-region deployment with synchronous or near-synchronous data replication. Simple periodic backups are entirely inadequate.

**Internal Employee Directory:**
*   **RPO:** Could be up to 24 hours. If the system is restored from last night's backup, the only data lost would be the changes from that day, which are few and can likely be re-entered manually.
*   **RTO:** Could be 4-8 hours. The business can function without it for a day, although it would be inconvenient. It is not a customer-facing or revenue-generating system.
*   **Justification:** The impact of data loss and downtime is low. The cost of a near-zero RTO/RPO system would be unjustified.
*   **Implied Strategy:** A simple daily backup stored in cloud storage would be sufficient. Recovery would involve provisioning a new server and restoring from the backup.

**Answer 2**
**RPO Calculation:**
The RPO is the maximum amount of data you can afford to lose. The last successful backup was the transaction log backup at 11:00 AM. The failure occurred at 11:10 AM. Therefore, the data at risk is the 10 minutes of transactions between 11:00 AM and 11:10 AM. In the worst case, a disaster at 11:14:59 would lose almost 15 minutes of data.
*   **RPO:** 15 minutes (the interval of the transaction log backups).

**RTO Calculation:**
The RTO is the target time to recover the system. This is the sum of the time required for all recovery steps.
*   Provision new hardware: 90 minutes
*   Restore full backup + apply logs: 45 minutes
*   **Total Time to Recovery (RTO):** 90 + 45 = 135 minutes, or 2 hours and 15 minutes.

**Reasoning:** The RPO is determined by the backup frequency, as it sets the maximum window of data that hasn't been secured. The RTO is determined by the procedural and technical time it takes to execute the recovery plan, from detection to restoration of service.

**Answer 3**
**Tradeoff Analysis:**
*   **Cost:**
    *   **Active-Passive:** Lower cost. The passive region can run on minimal, scaled-down infrastructure (e.g., smaller instances, fewer nodes) that is only scaled up during a DR event. You are paying for idle or underutilized resources.
    *   **Active-Active:** Higher cost. Both regions run full-scale production infrastructure and actively serve traffic. This roughly doubles the infrastructure and operational costs.
*   **RTO (Recovery Time Objective):**
    *   **Active-Passive:** Higher RTO. Recovery requires a failover event: promoting the passive database, scaling up application servers, and redirecting traffic (e.g., DNS updates). This can take minutes to hours.
    *   **Active-Active:** Near-zero RTO. Since both regions are already active, traffic can be routed away from the failed region almost instantaneously by a load balancer or DNS service. The system is designed for failure.
*   **Implementation Complexity:**
    *   **Active-Passive:** Simpler. Data replication is typically one-way (active to passive). The logic for failover is complex but isolated to a DR event.
    *   **Active-Active:** Much more complex. Requires sophisticated traffic routing, two-way data replication, and logic to handle data consistency and conflicts between regions. The entire application must be designed to operate in this mode.

**Recommendation:**
If the primary driver is minimizing downtime, the **active-active** strategy is the clear recommendation. Its near-zero RTO directly addresses the business requirement, and the company is willing to accept the higher cost and complexity to achieve that level of resilience.

**Answer 4**
The outcome reveals critical failures in the **DR planning and testing process**:

1.  **Incomplete Scope in Planning:** The plan focused heavily on data replication (achieving a low RPO) but neglected critical application and networking dependencies. A DR plan must be holistic, covering DNS, configuration (secrets), network ACLs/firewalls, and service discovery, not just the database.
2.  **Lack of Automation:** An 8-hour manual recovery indicates a lack of automation. DNS changes and service start-up should be scripted and automated as part of an "Infrastructure as Code" approach to failover. Relying on manual steps in a crisis is slow and error-prone.
3.  **Insufficiently Realistic Testing:** The "DR drill" was likely a partial or theoretical test. A true end-to-end test would have surfaced these dependencies. For example, testing should involve a full failover of a production-like staging environment. The test failed to simulate real-world conditions accurately.
4.  **Discrepancy Between Stated and Tested RTO:** The team had a *stated* RTO of 2 hours but a *tested* RTO of 8 hours. This indicates the stated RTO was a business goal, not a technically validated capability. DR planning must close this gap by either improving the technology to meet the RTO or adjusting the business's expectations.

**Answer 5**
**Recovery Plan:**
1.  **Detection & Declaration:** Detect the failure of `us-east-1` via monitoring. Declare a disaster and initiate the DR plan.
2.  **Failover `us-east-1` Shard:** Promote the read replica or backup of the North American user data shard. This replica must be located in a different region, for instance, `us-west-2` or even `eu-west-1` if necessary.
3.  **Redirect Traffic:** Update the application's routing logic or DNS. All traffic for North American users, which previously went to `us-east-1`, must now be routed to the region hosting the promoted shard.
4.  **Operate in Degraded Mode:** For the duration of the outage, all North American users will experience higher latency as their requests are now traveling to a more distant region. European users should be unaffected as their shard in `eu-west-1` is still operational.
5.  **Failback:** Once `us-east-1` is restored, a plan must be executed to replicate data back, re-establish the original architecture, and switch traffic back to minimize latency. This process must be handled carefully to avoid data loss.

**Complications from Sharding:**
*   **Granular Recovery:** Unlike a monolithic database, you don't fail over the *entire* system. You fail over a specific shard. This adds complexity to the failover logic, which must be shard-aware.
*   **Partial Outage:** The disaster is a partial outage affecting only a subset of users (North Americans). The system must be able to operate in this "degraded" state where different user groups have different performance characteristics.
*   **Data Locality vs. Availability:** The primary reason for sharding (low latency via data locality) is compromised during a DR event. The plan must accept this temporary performance degradation as a tradeoff for availability.
*   **RPO per Shard:** RPO must now be considered on a per-shard basis. The replication lag for the `us-east-1` shard to its backup location determines the RPO for North American users. The RPO for European users is independent of this event.

**Answer 6**
**Fundamental Tradeoff (CAP Theorem):**
During a network Partition (the 'P' in CAP), you are forced to choose between Consistency ('C') and Availability ('A').
*   **Choosing Consistency (The Runbook's Advice):** By failing over all traffic to a single region (e.g., Region A), you ensure there is only one "master" copy of the data. This prevents a split-brain scenario where both regions accept conflicting writes, which would lead to data inconsistency. You are sacrificing the availability of the system to users who are routed to Region B.
*   **Choosing Availability:** By keeping both regions active (violating the runbook), you keep the service available to all users. However, because the regions cannot communicate, their data will diverge. You are sacrificing data consistency for uptime. Reconciling the divergent data after the partition heals is a notoriously difficult problem, especially for financial transactions.

**Critical Observability Metrics:**
To make an informed decision, you need metrics that go beyond simple "up/down" health checks:
1.  **Business Transaction Metrics per Region:** Are both regions actually processing successful transactions? Is one region processing significantly more volume? If Region B's traffic has dropped to zero (perhaps the partition is closer to its upstream network), failing over to A is a much safer choice.
2.  **Replication Lag:** The monitoring for replication lag would show an infinitely growing queue. The *rate* of growth indicates the volume of writes being accepted in each region, which helps quantify the "damage" of inconsistency if you were to keep both active.
3.  **Nature of the Partition:** Can you get any external network visibility? Is it a full partition, or is there intermittent connectivity? Is it a DNS resolution problem? Understanding the *why* can inform the recovery. For example, if it's a known fiber cut that will take 12 hours to fix, the risk of data divergence by staying available might be too high.
4.  **Customer Impact Metrics:** Monitor error rates and latency as experienced by users hitting each region. If users in Region B are seeing 100% errors because downstream dependencies are also unreachable, the decision to failover to A becomes easy—Region B is effectively down for users anyway. The system is not truly "available" in that region.