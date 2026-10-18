
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
- Active Users: 1,000,000 DAU.
- Writes per Second (POST/PUT/DELETE): Assuming each active user performs 5 write operations per day:
  - 5,000,000 writes / 86,400 seconds ≈ 57.87 writes/sec (Peak at 5x = ~289 writes/sec).
- Reads per Second (GET): Assuming each active user views 40 notes/feeds per day:
  - 40,000,000 reads / 86,400 seconds ≈ 462.96 reads/sec (Peak at 5x = ~2,315 reads/sec).
- Storage per Year: Assuming average note size is 2 KB:
  - 5,000,000 writes/day × 365 days = 1,825,000,000 notes/year.
  - 1,825,000,000 × 2 KB ≈ 3.65 TB/year of text storage.

---

## Architecture Diagram

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

Component Breakdown
DNS: Resolves client domain requests to the infrastructure edge routing layer.

CDN: Caches and delivers static frontend assets globally to minimize network latency.

Load Balancer: Distributes incoming HTTP requests across multiple application servers to balance traffic load.

App Servers: Stateless servers running Node.js/Express or Python FastAPI to process business logic and API requests.

Cache: In-memory Redis cache storing session tokens and hot user data to accelerate response times.

Primary Database: Handles all transactional write operations (INSERT, UPDATE, DELETE).

Read Replica: Replicates data asynchronously from the primary database to absorb heavy read queries.

Queue & Worker: Asynchronously offloads non-blocking background tasks like email notifications or analytics processing.

Request Flows
1. Flow: GET /api/v1/notes (Read)
Client sends a request hitting the Load Balancer.

Load Balancer forwards the request to an App Server.

App Server checks the Redis Cache; on a cache miss, it queries the Database Read Replica.

Data is returned to the App Server, cached in Redis, and sent back to the client as JSON (200 OK).

2. Flow: POST /api/v1/notes (Write)
Client submits a new note to the Load Balancer.

App Server validates the request payload and authentication token.

App Server executes an INSERT statement on the Primary Database.

Primary Database commits the transaction and asynchronously updates Read Replicas.

App Server responds with the created note object and status 201 Created.

Trade-offs & SPOF Mitigation
Trade-off (Consistency vs. Availability): Utilizing asynchronous database read replicas speeds up read performance for 1 million users, but introduces brief eventual consistency lag where a newly created note might take milliseconds to appear in a subsequent read query.

SPOF Mitigation: Single points of failure are avoided by deploying redundant load balancers, running multiple horizontally autoscaled application servers behind the balancer, and configuring database failover clusters with hot standby replicas.