export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
}

export interface ExamCategory {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  accent: string;
  icon: string;
  marksPerQuestion: number;
  negativeMarkFraction: number;
  questions: Question[];
}

const placeholder = (topic: string): Question[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    q: `[${topic}] Sample question ${i + 1} - replace with real question.`,
    options: ["Option A", "Option B", "Option C", "Option D", "None of the above"],
    answer: 0,
  }));

const NOTA = "None of the above.";
const Q = (id: number, q: string, options: string[], answer: number): Question => ({ id, q, options, answer });

const aptitudeQuestions: Question[] = [
  Q(1, "In an exhaustive macroeconomic analysis of post-industrial agrarian supply chains, researchers observed a profound operational paradox: while the systemic implementation of high-frequency automated harvesting sub-routines universally escalated the absolute raw material yield across all tested demographics, the aggregate profitability metrics of the adopting cooperatives paradoxically demonstrated a statistically significant negative correlation over a fiscal quadriennium. Further forensic market auditing revealed that the artificially accelerated yield vectors induced a hyper-localized market saturation, thereby completely destabilizing the equilibrium of the localized price-elasticity curve. Based strictly on the empirical data and causal relationships explicitly articulated in this synopsis, which of the following extrapolations represents the most logically rigorous deduction?",
    ["The deployment of automated harvesting sub-routines is inherently detrimental to the long-term ecological sustainability of agrarian sectors.", "The aggregate financial deficit incurred by the cooperatives is directly and exclusively attributable to the exorbitant mechanical maintenance costs of the automated systems.", "A quantifiable escalation in raw material output does not unconditionally guarantee a corresponding proportional increase in the aggregate profitability of the producing entity.", "Hyper-localized market saturation is an inevitable, unavoidable consequence of all technological modernization efforts within the agricultural industry.", NOTA], 2),
  Q(2, "Algorithm Alpha, operating in isolation, requires 24 continuous hours to process one petabyte of data. Algorithm Beta requires 36 hours for the same volume. If both algorithms are executed concurrently for exactly 8 hours, what fraction of the one-petabyte dataset will remain unprocessed?",
    ["5/9", "4/9", "7/18", "11/18", NOTA], 1),
  Q(3, "A regulatory compliance officer is auditing a designated consumption zone governed by a strict statutory mandate: 'Any biological entity engaging in the ingestion of ethanol-based beverages must possess a verified chronological age strictly exceeding 18 solar years.' The officer observes four entities: Entity Alpha is actively consuming an ethanol-based beverage; Entity Beta is consuming a non-alcoholic botanical extract; Entity Gamma's official identification verifies a chronological age of precisely 16 solar years; and Entity Delta possesses documentation proving an age of 22 solar years. To rigorously prove that no statutory violations are occurring, the officer must execute a state-verification procedure on which precise combination of entities?",
    ["Only Entity Alpha and Entity Gamma", "Only Entity Alpha", "Entity Alpha, Beta, Gamma, and Delta", "Only Entity Alpha, Gamma, and Delta", NOTA], 0),
  Q(4, "Consider a continuous scalar variable x in the reals satisfying x^2 + x - 1 = 0. Deduce the exact numerical evaluation of the higher-order expression x^4 + 1/x^4.",
    ["1", "5", "7", "9", NOTA], 2),
  Q(5, "During a high-altitude expedition, five researchers P, Q, R, S, T must arrange their sleeping bags in a strictly linear adjacent sequence. P, Q, and T strictly mandate non-adjacent placement relative to R. Furthermore, P and S expressly prohibit any proximity to Q's immediate left or right coordinates. Identify the exact left-to-right positional sequence.",
    ["R, S, P, T, Q", "Q, S, P, T, R", "R, P, S, T, Q", "P, S, R, T, Q", NOTA], 0),
  Q(6, "A primary containment vessel holds exactly 40 cubic meters of brine at a 15% volumetric salinity concentration. Due to a prolonged thermal exposure cycle, exactly 16 cubic meters of the H2O solvent is evaporated, leaving the entire precipitate mass suspended. Determine the updated percentage salinity of the concentrated solution.",
    ["20%", "22.5%", "25%", "31.5%", NOTA], 2),
  Q(7, "An algorithmic quantitative trading protocol liquidated a digital asset, realizing an 18% financial deficit relative to its initial fiat acquisition cost. Had the asset been liquidated at a price point exactly 680 INR higher, the transaction would have yielded a 16% fiscal surplus instead of a deficit. Determine the absolute initial fiat acquisition cost.",
    ["1,800 INR", "2,000 INR", "2,500 INR", "3,400 INR", NOTA], 1),
  Q(8, "u + v = 7 and u*v = 10. Determine u^3 + v^3.", ["125", "133", "217", "343", NOTA], 1),
  Q(9, "A cube painted on the exterior is partitioned into 27 isometric sub-cubes. How many have paint on exactly two faces?", ["4", "8", "12", "24", NOTA], 2),
  Q(10, "Despite the investigator's assertion that the new framework would establish a transparent, universally applicable, and ________ paradigm for predicting anomalous particle trajectories, the publication was so densely layered with contradictory axioms and recursive logic loops that it only served to ________ the very phenomena it was engineered to clarify.",
    ["unambiguous ... obfuscate", "convoluted ... elucidate", "irrefutable ... synthesize", "esoteric ... propagate", NOTA], 0),
  Q(11, "5 modules (M1..M5, must stay consecutive in order) + 7 distinguishable chassis placed linearly. Total unique configurations?", ["5,040", "40,320", "3,628,800", "39,916,800", NOTA], 1),
  Q(12, "x + y = 32, |x - y| = 18. Compute xy.", ["175", "225", "400", "576", NOTA], 0),
  Q(13, "5^(2y - 1) = 3125. Evaluate 4^(y + 2).", ["256", "1024", "4096", "16384", NOTA], 1),
  Q(14, "Current population is 1,102,500 after 2 years of compounding at 5%/yr. Baseline 24 months prior?", ["1,000,000", "1,025,000", "1,050,000", "995,000", NOTA], 0),
  Q(15, "Two locomotives leave the same origin at 07:00; one North at 80 km/h, one South at 100 km/h. When is the separation exactly 540 km?", ["09:00", "10:00", "11:00", "11:30", NOTA], 1),
  Q(16, "Cohort of 250: 130 react to X, 110 react to Y, 40 react to both. How many are asymptomatic?", ["30", "50", "70", "90", NOTA], 1),
  Q(17, "Alpha has active:solvent = 1:3; Beta 1:4. Blended 2:3 by volume. Alpha alone gives 20% profit at its per-liter price. Mixture is priced equal to Alpha (solvent free). Profit/loss % on mixture?",
    ["25.55% profit", "36.36% profit", "18.18% deficit", "42.00% profit", NOTA], 1),
  Q(18, "A UAV goes 24 km North, yaws 90° starboard (East) and goes 7 km. Displacement magnitude and heading?",
    ["25 km, NE", "31 km, NE", "25 km, NW", "31 km, NW", NOTA], 0),
  Q(19, "12,000 INR invested at 5% p.a. compounded annually for 3 years. Total accumulated interest?",
    ["1,800.00", "1,891.50", "1,925.25", "2,050.00", NOTA], 1),
  Q(20, "20 microprocessors (8 defective, 12 functional). Draw 3 without replacement. P(all 3 functional)?",
    ["11/57", "33/95", "27/125", "12/57", NOTA], 0),
  Q(21, "A 200 m maglev at 144 km/h traverses a 600 m tunnel. Seconds from nose entering to tail exiting?",
    ["15", "20", "22.5", "25", NOTA], 1),
  Q(22, "A circular wafer's radius increases by 15%. % increase in area?",
    ["15.00%", "30.00%", "32.25%", "35.50%", NOTA], 2),
  Q(23, "Data fluctuations defy all known frameworks — impossible to rationalize, interpret, or articulate. Best single word?",
    ["Incomprehensible", "Indelible", "Inextricable", "Infallible", NOTA], 0),
  Q(24, "Despite a media campaign of baseless allegations, the magistrate's reputation proved completely ________.",
    ["undiminished", "resolved", "illegal", "uncertain", NOTA], 0),
  Q(25, "Acute angle between hour and minute hands at 08:30?", ["60°", "75°", "85°", "90°", NOTA], 1),
  Q(26, "x + y = 5 and x*y = 6. Find x^3 + y^3.", ["35", "91", "125", "215", NOTA], 0),
  Q(27, "Statement: 'Ban diesel vehicles older than 10 years to improve air quality.' I: Older diesel vehicles pollute significantly. II: Banning is the only way to improve air quality. Implicit?",
    ["Only I", "Only II", "Both I and II", "Neither", NOTA], 0),
  Q(28, "Bag with 5 red, 7 blue balls. Draw 2 without replacement. P(both red)?", ["5/33", "5/12", "25/144", "10/33", NOTA], 0),
  Q(29, "Paper folded in half horizontally then vertically. One circular hole punched through all layers. How many holes when fully unfolded?",
    ["1", "2", "4", "8", NOTA], 2),
  Q(30, "Radius of a circle increased by 20%. % increase in area?", ["20%", "40%", "44%", "400%", NOTA], 2),
];

// 20 Pro-Level System Design & Architecture MCQs (verbatim).
const systemQuestions: Question[] = [
  Q(1, "Network Protocols: TCP Head-of-Line Blocking. In an HTTP/2 architecture, multiple client requests are multiplexed over a single TCP connection to an Express API Gateway. If a single packet containing a partial payload for Request A is lost in transit, what happens to Request B, which is fully received and queued behind it?",
    [
      "Request B is processed immediately because HTTP/2 streams are independent at the application layer.",
      "Request B is blocked and cannot be processed until the missing packet for Request A is retransmitted and acknowledged, due to TCP's strict ordered delivery.",
      "The TCP connection automatically falls back to HTTP/1.1 to process Request B.",
      "The API Gateway drops both requests and forces the client to initiate a new TLS handshake.",
      NOTA,
    ], 1),
  Q(2, "Database Storage Engines: Write Amplification. You are designing a high-throughput time-series database. You choose a Log-Structured Merge (LSM) Tree over a traditional B-Tree. Which of the following is a primary trade-off of using an LSM-Tree?",
    [
      "LSM-Trees suffer from extreme Write Amplification, burning out SSDs much faster than B-Trees.",
      "LSM-Trees provide faster read performance but slower write performance compared to B-Trees.",
      "LSM-Trees require continuous background \"compaction\" processes that can cause periodic latency spikes during read operations.",
      "LSM-Trees cannot support range queries or sequential scans.",
      NOTA,
    ], 2),
  Q(3, "Load Balancing: Layer 4 vs Layer 7. A high-frequency trading platform requires absolute minimum latency. The load balancer does not need to inspect HTTP headers, cookie data, or URL paths; it only needs to distribute traffic based on IP and Port. Which load balancing strategy should be implemented?",
    [
      "Layer 7 HTTP Reverse Proxy",
      "Layer 4 Transport Level Load Balancing",
      "Application-Level Anycast",
      "DNS Round Robin with low TTL",
      NOTA,
    ], 1),
  Q(4, "Distributed Data: The PACELC Theorem. The CAP theorem states you must choose between Consistency and Availability during a Partition (P). The PACELC theorem extends this. According to PACELC, what trade-off must a distributed database (like Cassandra or DynamoDB) make during normal operation when there is Else (E) no network partition?",
    [
      "Latency (L) versus Consistency (C)",
      "Availability (A) versus Durability (D)",
      "Partition Tolerance (P) versus Latency (L)",
      "Consistency (C) versus Partition Tolerance (P)",
      NOTA,
    ], 0),
  Q(5, "Microservices Architecture: CQRS. You implement the Command Query Responsibility Segregation (CQRS) pattern in a microservices architecture. The \"Command\" database is a heavily normalized PostgreSQL instance, and the \"Query\" database is a denormalized ElasticSearch index. What is the most significant architectural challenge introduced by this pattern?",
    [
      "The system can no longer handle concurrent writes.",
      "You must handle Eventual Consistency between the Command and Query databases, meaning users might read stale data immediately after a write.",
      "ElasticSearch cannot be horizontally scaled if it is used exclusively for queries.",
      "The API Gateway must execute Two-Phase Commits (2PC) across both databases for every read request.",
      NOTA,
    ], 1),
  Q(6, "Message Brokers: Kafka Consumer Groups. Your Express application consumes events from an Apache Kafka topic with 10 partitions. You scale your Node.js consumer microservice to 12 instances within the same Consumer Group. What happens to the event processing?",
    [
      "All 12 instances will process messages concurrently, increasing throughput by 20%.",
      "10 instances will process messages (one partition each), and 2 instances will sit completely idle.",
      "The Kafka broker will dynamically split two partitions to ensure all 12 instances receive data.",
      "A Split-Brain scenario occurs, causing duplicate message processing across all instances.",
      NOTA,
    ], 1),
  Q(7, "API Design: gRPC vs REST. You are replacing internal JSON-over-HTTP REST APIs with gRPC between backend microservices. Which of the following is a fundamental difference that provides gRPC its massive performance boost?",
    [
      "gRPC uses UDP instead of TCP, eliminating handshake latency.",
      "gRPC relies on Protocol Buffers (Protobuf), which transmits data as highly compressed, strongly-typed binary rather than human-readable text.",
      "gRPC automatically implements the Circuit Breaker pattern at the network layer.",
      "gRPC maintains stateful connections, eliminating the need for a database.",
      NOTA,
    ], 1),
  Q(8, "Distributed Transactions: Two-Phase Commit (2PC) Blocking. In a distributed SQL database, a Two-Phase Commit (2PC) is used to guarantee atomicity across multiple nodes. The Coordinator node sends a \"Prepare\" message to all Participant nodes, and they all reply \"Yes.\" Before the Coordinator can send the \"Commit\" message, the Coordinator node crashes and goes offline. What state are the Participant nodes in?",
    [
      "They automatically abort and rollback the transaction after a 5-second timeout.",
      "They are blocked and must hold their database locks indefinitely until the Coordinator recovers or an administrator intervenes.",
      "They elect a new Coordinator from among themselves and immediately commit.",
      "They silently drop the transaction and accept new writes.",
      NOTA,
    ], 1),
  Q(9, "Caching Patterns: Cache Stampede (Thundering Herd). A highly complex, cached API response expires. Suddenly, 10,000 concurrent client requests hit the cache, find it empty (Cache Miss), and all 10,000 requests simultaneously query the backend database, crashing it. Which mitigation strategy actively prevents this without serving stale data indefinitely?",
    [
      "Increasing the cache TTL to 30 days.",
      "Probabilistic Early Expiration (Cache-Busting) or Mutex Locks (Request Coalescing).",
      "Implementing a Least Recently Used (LRU) eviction policy.",
      "Switching from Memcached to Redis.",
      NOTA,
    ], 1),
  Q(10, "Client-Server Networking: Server-Sent Events (SSE) vs WebSockets. A sports application features a live scoreboard. The server pushes updates to the client every 500ms. The client never sends any data back to the server other than the initial connection request. Why might Server-Sent Events (SSE) be architecturally superior to WebSockets in this specific scenario?",
    [
      "SSE is bidirectional, whereas WebSockets are strictly unidirectional.",
      "SSE runs over standard HTTP/1.1 or HTTP/2, natively supporting multiplexing, standard firewalls, and built-in automatic reconnections without custom transport layers.",
      "WebSockets cannot transmit binary data, making them unsuitable for live scores.",
      "SSE utilizes UDP, making it immune to Head-of-Line blocking.",
      NOTA,
    ], 1),
  Q(11, "Migration Strategies: Strangler Fig Pattern. You are migrating a massive legacy monolithic application to a modern microservices architecture. Instead of a \"Big Bang\" rewrite, you implement the Strangler Fig pattern. How does this pattern operate at the system level?",
    [
      "A proxy (API Gateway) is placed in front of the monolith. As new microservices are built, the proxy gradually routes specific URL paths away from the monolith to the new services until the monolith can be safely decommissioned.",
      "The legacy database is replicated to a cloud provider, and the monolith is forced to read from the replica.",
      "The monolith's codebase is automatically transpiled from older languages (like Java) into Node.js using an LLM.",
      "Traffic is artificially restricted (throttled) to the monolith to force users onto the new system.",
      NOTA,
    ], 0),
  Q(12, "Database Isolation: Phantom Reads. A system uses a relational database with a Repeatable Read isolation level. Transaction A queries SELECT * FROM Orders WHERE status = 'PENDING' and gets 5 results. Transaction B simultaneously inserts a new order with a 'PENDING' status and commits. Transaction A runs the exact same query again. Under standard Repeatable Read (without Next-Key locking), what anomaly occurs?",
    [
      "Dirty Read: Transaction A sees uncommitted data.",
      "Non-Repeatable Read: An existing row Transaction A was viewing changes its values.",
      "Phantom Read: Transaction A suddenly sees 6 results instead of 5, as a new row matches the range condition.",
      "Write Skew: Transaction A overwrites Transaction B's data.",
      NOTA,
    ], 2),
  Q(13, "High Availability: Split-Brain & Quorum. A MongoDB cluster consists of 2 nodes across 2 data centers (DC1 and DC2) to ensure geographic redundancy. The network link between the data centers goes down. Both nodes assume the other is dead and promote themselves to Primary, accepting writes. When the network is restored, data is hopelessly corrupted. How is this \"Split-Brain\" prevented in modern distributed systems?",
    [
      "By implementing a strict Last-Write-Wins (LWW) conflict resolution algorithm.",
      "By ensuring the cluster always has an odd number of voting nodes (e.g., 3) and requiring a strict majority (Quorum) to elect a Primary or accept writes.",
      "By configuring both nodes to automatically shut down if ping times exceed 500ms.",
      "By manually pausing the database during network outages.",
      NOTA,
    ], 1),
  Q(14, "Storage Architecture: Object vs Block Storage. You are designing an architecture for a video streaming platform like Netflix. You need to store petabytes of immutable, massive video files that will be served directly to Edge CDNs. Which storage architecture is appropriate?",
    [
      "Block Storage (e.g., AWS EBS) because it allows byte-level modification of the video files.",
      "Object Storage (e.g., AWS S3) because it scales infinitely, stores data as immutable objects with rich metadata, and provides native HTTP access.",
      "Relational Database BLOBs because it ensures strict ACID compliance for video playback.",
      "File Storage (e.g., AWS EFS) because it allows thousands of servers to mount the same OS directory natively.",
      NOTA,
    ], 1),
  Q(15, "Message Reliability: Dead Letter Queues (DLQ). An asynchronous worker process consumes messages from a RabbitMQ queue to send confirmation emails. Due to a bug in the email formatting code, a specific message repeatedly crashes the worker. The broker continuously requeues the message, crashing the worker in an infinite loop (a \"Poison Pill\"). How is this resolved at the system level?",
    [
      "Configure the worker to silently acknowledge (ACK) and delete all failed messages.",
      "Configure the broker's retry policy to route the message to a Dead Letter Queue (DLQ) after a threshold of failed attempts, allowing the worker to process the rest of the queue.",
      "Increase the worker's RAM allocation.",
      "Switch from RabbitMQ to a purely synchronous HTTP REST architecture.",
      NOTA,
    ], 1),
  Q(16, "Security & State: Stateful vs Stateless JWT Revocation. You use stateless JSON Web Tokens (JWT) for API authentication. A user's account is compromised, and you need to instantly invalidate their active 60-minute JWT. Because JWTs are stateless and validated via cryptography on the API server, how do you revoke it before expiration without creating a database bottleneck?",
    [
      "Change the server's master signing secret, which instantly invalidates all JWTs for all users globally.",
      "Maintain a high-speed, centralized \"Deny List\" of revoked Token IDs (jti) in an in-memory datastore like Redis, checked by the Gateway on every request.",
      "Send an HTTP DELETE request to the client's browser to wipe their local storage.",
      "You cannot revoke a stateless JWT; you must wait the full 60 minutes for it to expire.",
      NOTA,
    ], 1),
  Q(17, "Scaling Databases: Consistent Hashing. You have 4 Redis cache servers. You route keys based on hash(key) % 4. Server #4 crashes. The algorithm changes to hash(key) % 3. Suddenly, 75% of your cached keys route to the wrong servers, causing a massive cache miss. Which concept solves this by mapping nodes and keys to a virtual ring, ensuring only a small fraction of keys are remapped when a node dies?",
    [
      "Linear Probing",
      "Round-Robin Hashing",
      "Consistent Hashing",
      "Cryptographic Hashing (SHA-256)",
      NOTA,
    ], 2),
  Q(18, "System Resiliency: Circuit Breaker States. An API Gateway utilizes a Circuit Breaker pattern to protect a failing downstream microservice. The microservice recovers and comes back online. The Circuit Breaker transitions from the \"Open\" (failing fast) state to a testing state where it allows a limited number of requests through to verify recovery. What is this state called?",
    [
      "Closed",
      "Half-Open",
      "Throttled",
      "Dead-Letter",
      NOTA,
    ], 1),
  Q(19, "Rate Limiting: Token Bucket Burst Capacity. An API rate limiter uses the Token Bucket algorithm. The bucket holds a maximum of 10 tokens and is refilled at a rate of 1 token per second. A user has not made a request in 5 minutes. The user suddenly sends 15 concurrent requests. What happens?",
    [
      "10 requests are processed immediately (the burst), and 5 requests are rejected (HTTP 429).",
      "All 15 requests are processed immediately because the user has built up 300 seconds of unused capacity.",
      "The requests are processed strictly at 1 request per second for 15 seconds.",
      "All 15 requests are rejected because they exceed the 1-per-second refill rate.",
      NOTA,
    ], 0),
  Q(20, "Database Locks: Optimistic vs Pessimistic Concurrency. In a high-contention ticketing system (like buying concert tickets), thousands of users are trying to buy the same seat simultaneously. If you use Optimistic Concurrency Control (OCC) using version numbers, what is the primary system drawback compared to Pessimistic Locking?",
    [
      "OCC places exclusive locks on the database rows, completely freezing the database for other readers.",
      "OCC requires all users to maintain an active WebSocket connection.",
      "Under massive contention, OCC results in a high volume of aborted/failed transactions (HTTP 409 Conflicts), forcing the application layer to handle heavy retry logic.",
      "OCC strictly violates ACID isolation guarantees.",
      NOTA,
    ], 2),
];

// 15 Pro-Level Fundamental Coding & Integration MCQs (verbatim).
const technicalQuestions: Question[] = [
  Q(1, "Debugging: Express.js Asynchronous Error Handling. In a legacy Express v4.x application, you write the following route: app.get('/data', async (req, res, next) => { const data = await fetchFromDB(); res.json(data); }). If fetchFromDB() throws an error or rejects the promise, what happens to the Express server?",
    [
      "The error is automatically caught by Express and passed to the global (err, req, res, next) error-handling middleware.",
      "The client receives a generic 500 Internal Server Error response automatically.",
      "The request hangs indefinitely until it times out, and an UnhandledPromiseRejection warning is logged, potentially crashing the Node process.",
      "Express intercepts the rejected promise and returns a 404 Not Found.",
      NOTA,
    ], 2),
  Q(2, "API Design: Cursor vs. Offset Pagination. You are building an API endpoint to fetch a list of transactions (GET /transactions). The database has 50 million records. A user requests page 50,000 using ?limit=100&offset=4999900. The query takes 8 seconds to execute. What is the standard API design solution to resolve this performance degradation?",
    [
      "Switch to Cursor-based pagination (e.g., ?limit=100&after=cursor_id), which allows the database to use an index to jump directly to the starting record instead of scanning and skipping millions of rows.",
      "Cache the entire 50 million record dataset in Redis to speed up the offset calculation.",
      "Increase the limit to 10,000 so the client has to make fewer total pagination requests.",
      "Change the database query to use a SELECT COUNT(*) to pre-calculate all pages before fetching the offset.",
      NOTA,
    ], 0),
  Q(3, "Integration: Webhook Security & Replay Attacks. Your Node.js API receives webhooks from Stripe whenever a customer makes a payment. An attacker intercepts a valid webhook payload and resends it to your endpoint 500 times, attempting to credit an account multiple times (a Replay Attack). How do you fundamentally secure the webhook integration?",
    [
      "By validating the JSON payload structure against a TypeScript interface before processing.",
      "By verifying the cryptographic signature in the Stripe-Signature header, which contains a timestamp, and rejecting any payloads older than a few minutes.",
      "By configuring your firewall to only accept webhooks from IP addresses located in the United States.",
      "By checking if the HTTP method is strictly POST and rejecting PUT requests.",
      NOTA,
    ], 1),
  Q(4, "Debugging: Node.js Memory Leaks (Closures). Your Node.js server crashes with an Out-Of-Memory (OOM) error every few days. After analyzing a heap snapshot, you notice millions of instances of a massive array are trapped in memory. Which of the following JavaScript patterns is the most likely culprit?",
    [
      "Using JSON.parse() on a very large API response payload.",
      "An event listener attached to a long-lived object (like the global process or a server instance) referencing variables from its outer scope, preventing the garbage collector from freeing them.",
      "Utilizing recursive functions without a strict base case, causing a Call Stack Exceeded error.",
      "Forgetting to use the new keyword when instantiating an ES6 class.",
      NOTA,
    ], 1),
  Q(5, "API Design: Optimistic Concurrency Control (ETags). Two users are updating the same Wiki article via your PUT /articles/123 API endpoint. To prevent Lost Updates (where User B blindly overwrites User A's changes), you implement Optimistic Concurrency Control. Which HTTP headers should your API utilize to achieve this?",
    [
      "The server sends an ETag header. The client sends a Cache-Control: no-cache header on the next request.",
      "The server sends an ETag (a hash of the resource). The client includes this hash in the If-Match header during the PUT. The server rejects the request with a 412 Precondition Failed if the hashes differ.",
      "The server sends an Authorization header, and the client responds with X-Forwarded-For.",
      "The server implements a Strict-Transport-Security header to encrypt the payload.",
      NOTA,
    ], 1),
  Q(6, "Integration: Resiliency and Exponential Backoff. Your API integrates with an external, third-party logistics API that frequently rate-limits you with 429 Too Many Requests or drops connections with 503 Service Unavailable. What is the industry-standard coding pattern to integrate robustly with this flaky service?",
    [
      "Implement a while(true) loop that aggressively retries the request every 10 milliseconds until it succeeds.",
      "Wrap the API call in an asynchronous setTimeout of exactly 60 seconds before retrying once.",
      "Implement retries using \"Exponential Backoff with Jitter,\" progressively increasing the wait time between retries and adding randomness to prevent synchronized Thundering Herd attacks on the third-party service.",
      "Immediately return a 200 OK to your client and drop the logistics request entirely to ensure your API remains fast.",
      NOTA,
    ], 2),
  Q(7, "Debugging: CORS Preflight Failures. A frontend React app running on http://localhost:3000 attempts to make a POST request with a custom X-Tenant-ID header to an API on http://api.example.com. The browser blocks the request, stating the CORS preflight failed. What exactly is failing at the network level?",
    [
      "The browser sends an OPTIONS request first, but the server's response is missing the Access-Control-Allow-Headers: X-Tenant-ID header, causing the browser to block the actual POST.",
      "The Express server is missing the body-parser middleware, so it cannot read the JSON payload in the preflight request.",
      "The React application failed to include credentials: 'include' in the Axios configuration.",
      "The server rejected the request because the frontend is not using HTTPS.",
      NOTA,
    ], 0),
  Q(8, "Integration: Large File Proxying & Streams. Your API acts as a middleman. Clients request a 5GB video file from your Express server, and your server fetches it from an internal AWS S3 bucket. If you use const file = await s3.getObject(); res.send(file.body);, the Node server crashes. How must you rewrite this integration?",
    [
      "Increase the Node heap limit to 8GB using --max-old-space-size=8192.",
      "Download the 5GB file to the Node server's local hard drive first, then use fs.readFileSync to send it.",
      "Compress the file into a ZIP archive using the zlib module before sending it to the client.",
      "Pipe the S3 readable stream directly into the Express response writable stream using s3Stream.pipe(res), ensuring data chunks are forwarded without buffering the whole file in RAM.",
      NOTA,
    ], 3),
  Q(9, "Debugging: Event Loop Blocking. Your API has an endpoint that processes a large array of complex mathematical calculations synchronously. When a user hits this endpoint, all other connected clients experience massive latency, and health-check pings fail. Why does this happen?",
    [
      "Synchronous JavaScript blocks the single-threaded Node.js Event Loop, preventing the server from accepting or processing any other incoming HTTP connections or asynchronous callbacks until the math finishes.",
      "The Node.js garbage collector pauses the application to clean up the mathematical variables.",
      "The router is using HTTP/1.1 instead of HTTP/2, causing head-of-line blocking.",
      "The database connection pool is exhausted by the heavy calculations.",
      NOTA,
    ], 0),
  Q(10, "API Design: REST Security (Mass Assignment). You have an endpoint PATCH /users/:id that updates a user's profile. The code is written as: User.findByIdAndUpdate(req.params.id, req.body). An attacker realizes they can pass {\"isAdmin\": true} in the JSON payload and successfully gain admin privileges. What is this vulnerability, and how is it fixed?",
    [
      "SQL Injection; fix it by escaping the input payload.",
      "Mass Assignment (Over-posting); fix it by explicitly destructuring and permitting only safe fields (e.g., const { name, email } = req.body) before updating the database.",
      "Cross-Site Scripting (XSS); fix it by sanitizing the HTML tags in the payload.",
      "Broken Authentication; fix it by rotating the JWT secret key.",
      NOTA,
    ], 1),
  Q(11, "Integration: Solving N+1 in GraphQL/APIs. Your GraphQL integration queries a list of 50 users. For each user, a resolver fires a database query to fetch their associated Company data. This results in 1 query for the users, and 50 separate queries for the companies (The N+1 Problem). What is the standard coding solution to fix this integration?",
    [
      "Use Facebook's DataLoader utility to batch and cache the 50 individual company requests into a single SELECT * FROM Companies WHERE id IN (...) query.",
      "Change the database from PostgreSQL to MongoDB, which automatically prevents N+1 queries.",
      "Force the client to make separate REST API calls instead of using GraphQL.",
      "Add a composite index to the Company table.",
      NOTA,
    ], 0),
  Q(12, "Debugging: WebSocket Connection Drops. Your clients establish WebSocket connections to your API for real-time chat. Exactly 60 seconds after a user goes idle (stops typing), their WebSocket connection drops automatically, even though no errors are thrown in the browser or Node.js. What is the most likely cause?",
    [
      "The Node.js ws library has a hardcoded maximum connection time of 1 minute.",
      "The client's browser Garbage Collector deleted the WebSocket variable.",
      "An intermediate reverse proxy (like Nginx or an AWS Load Balancer) closed the connection due to an idle timeout because no Ping/Pong heartbeat frames were sent to keep the TCP connection alive.",
      "The React component unmounted and re-mounted in the background.",
      NOTA,
    ], 2),
  Q(13, "API Design: Idempotency in POST Requests. An API endpoint POST /refunds processes financial refunds. If a client experiences a network timeout, they might retry the POST request, potentially refunding the customer twice. How should the API be designed to handle this safely?",
    [
      "Change the HTTP method to GET, as GET requests are naturally idempotent.",
      "Require the client to send a unique Idempotency-Key in the HTTP header. The API checks if a transaction with this key was already successfully processed; if so, it returns the cached successful response without re-processing.",
      "Configure the API to immediately disable the user's account if a duplicate payload is detected.",
      "Rely on the database's Primary Key auto-increment to naturally reject duplicate requests.",
      NOTA,
    ], 1),
  Q(14, "Debugging: The \"Ghost\" Unreleased Database Connection. A Node.js worker pulls jobs from a queue and updates a PostgreSQL database using a connection pool. After processing exactly 10 jobs, the worker freezes and stops processing completely. No CPU spikes occur. What coding error causes this?",
    [
      "The worker forgot to run pool.release() or client.end() inside a finally block after executing the query, resulting in connection pool exhaustion.",
      "The PostgreSQL server ran out of hard drive space.",
      "The worker was compiled with an older version of the V8 JavaScript engine.",
      "The JSON payloads in the queue exceeded the 16MB limit.",
      NOTA,
    ], 0),
  Q(15, "Integration: Handling Partial Failures in Batch APIs. You design a bulk API endpoint: POST /users/batch that accepts an array of 1,000 user objects to insert into the database. 999 users are valid, but 1 has an invalid email format. What is the most appropriate RESTful response and behavior for this integration?",
    [
      "Rollback the entire transaction and return a 400 Bad Request so the client knows exactly what failed.",
      "Insert the 999 valid users, ignore the 1 invalid user silently, and return a 200 OK.",
      "Insert the 999 valid users and return a 207 Multi-Status response containing an array detailing the 201 Created successes and the specific 400 Bad Request error for the failed item.",
      "Halt the process, return a 500 Internal Server Error, and trigger a PagerDuty alert to the backend team.",
      NOTA,
    ], 2),
];

export const EXAMS: ExamCategory[] = [
  {
    id: "aptitude",
    title: "Aptitude Test",
    description: "Quantitative, logical reasoning & verbal ability.",
    durationMin: 40,
    accent: "from-sky-500 to-emerald-400",
    icon: "🧮",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: aptitudeQuestions,
  },
  {
    id: "dsa",
    title: "DSA Test",
    description: "Data Structures & Algorithms MCQs.",
    durationMin: 20,
    accent: "from-indigo-500 to-cyan-400",
    icon: "🧩",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("DSA"),
  },
  {
    id: "coding",
    title: "Coding Round",
    description: "Code reasoning, dry-run & output prediction.",
    durationMin: 30,
    accent: "from-blue-600 to-teal-400",
    icon: "💻",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("Coding"),
  },
  {
    id: "system",
    title: "System Understanding",
    description: "Pro-level system design, architecture, networking & DB internals.",
    durationMin: 25,
    accent: "from-violet-500 to-sky-400",
    icon: "🖥️",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: systemQuestions,
  },
  {
    id: "technical",
    title: "Technical Assessment",
    description: "Fundamental coding, debugging & integration tasks (API, Node.js, REST).",
    durationMin: 25,
    accent: "from-emerald-500 to-lime-400",
    icon: "⚙️",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: technicalQuestions,
  },
];

export const getExam = (id: string) => EXAMS.find((e) => e.id === id);

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function prepareExam(exam: ExamCategory): Question[] {
  return shuffle(exam.questions).map((q) => {
    const idxs = shuffle(q.options.map((_, i) => i));
    const remap = idxs.map((i) => q.options[i]);
    return { ...q, options: remap, answer: idxs.indexOf(q.answer) };
  });
}
