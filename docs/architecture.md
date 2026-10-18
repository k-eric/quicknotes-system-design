```markdown
# QuickNotes System Architecture

## Requirements

### Functional Requirements
- Users can authenticate and manage sessions securely.
- Users can create, read, update, and delete notes.
- Users can filter and organize notes using tags.

### Non-Functional Requirements
- **High Availability:** 99.9% uptime.
- **Low Latency:** P95 read latency under 150ms globally.
- **Scalability:** Capable of supporting 1 million active users smoothly.

---

## Load Estimates (1 Million Active Users)
- **Active Users:** 1,000,000 DAU.
- **Writes per Second (POST/PUT/DELETE):** Assuming each active user performs 5 write operations per day:
  - 5,000,000 writes / 86,400 seconds ≈ **57.87 writes/sec** (Peak at 5x = ~289 writes/sec).
- **Reads per Second (GET):** Assuming each active user views 40 notes/feeds per day:
  - 40,000,000 reads / 86,400 seconds ≈ **462.96 reads/sec** (Peak at 5x = ~2,315 reads/sec).
- **Storage per Year:** Assuming average note size is 2 KB:
  - 5,000,000 writes/day × 365 days = 1,825,000,000 notes/year.
  - 1,825,000,000 × 2 KB ≈ **3.65 TB/year** of text storage.

---

## Architecture Diagram

```text
[Client / Browser]
       │
       ▼
    [ DNS ]
       │
       ▼
    [ CDN ] (Static Assets & Client App)
       │
       ▼
[ Load Balancer ] (Nginx / ALB)
       │
       ├─────────────────────────┐
       ▼                         ▼
[ App Server 1 ]         [ App Server 2 ]
       │                         │
       ├──────────┬──────────────┤
       ▼          ▼              ▼
    [ Cache ]  [ Queue ] ──► [ Worker ]
    (Redis)    (RabbitMQ)
       │
       ▼
[ Primary Database ] ──(Async Replication)──► [ Read Replica ]
     (Writes)                                   (Reads)