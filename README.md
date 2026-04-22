# Room Booking System (Design Lab Final Artifact)

A seamless and highly secure web application for tracking room availability, user authentication, and executing reservations safely over a fully synchronized event loop. 

## Architectural Features

This minimum viable product has been heavily fortified across Phase 2 and Phase 3 development sprints to exhibit production-grade security patterns:

- **JWT Role-Based Auth**: Secure tokenized `Bearer` headers restricting routes dynamically via `USER` and `ADMIN` payloads.
- **Asymmetric Rate Limiting**: Intelligent `express-rate-limit` firewalls defending endpoints against dictionary/brute-force attacks (`HTTP 429`), configured asymmetrically so valid network IPs aren't penalized for authentic traffic. 
- **Concurrency Locking**: Utilizes native `async-mutex` mechanisms mapped locally by unique generic IDs to perfectly serialize Node.js Event Loop pipelines—eliminating synchronous double-booking race conditions natively.
- **Data Integrity**: Global enforcement of `uuidv4` mapping to replace pseudo-random metrics, backed by strict client-to-server ISO format timezone resolutions preventing local temporal drift.
- **Modern UI Edge**: Aesthetics-first approach leveraging deep dark-mode CSS glassmorphism and programmatic overlay routing to bypass OS-level browser event-loop popping artifacts.

## Tech Stack

- **Backend Context Engine**: Node.js, Express Wrapper, TypeScript
- **Security & Authorization**: `jsonwebtoken`, `bcrypt`, `express-rate-limit`, `async-mutex`
- **Frontend Presentation Layer**: HTML5, CSS3, DOM Vanilla JavaScript (Zero Framework Overhead)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm package manager natively installed

### Local Compilation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lazy-guy-1618/Room-Booking-system.git
   cd Room-Booking-system
   ```

2. **Initialize Environment & Dependencies:**
   ```bash
   npm install
   ```

3. **Compile TypeScript & Deploy Node Engine:**
   ```bash
   npm run build
   npm start
   ```

4. Alternatively, use **Development Monitoring**:
   ```bash
   npm run dev
   ```

5. **Interact:**
   Open any Chromium/Webkit browser and navigate to `http://localhost:3000`

### Admin Mocks
To test Force Cancellations and elevated user-routing, authenticate directly into the Login dashboard using the pre-seeded admin model:
- **Email:** `admin@spacesync.com`
- **Password:** `admin123`

---

## API Subsystem Reference

All mutations require valid Authentication (`Authorization: Bearer <TOKEN>`) generated via `/api/auth/login`.

- **`GET /api/availability?startTime=...&endTime=...`**: Fetches valid matrix parameters
- **`POST /api/book`**: [Auth] Validates and commits resource allocation safely via internal Mutex
- **`DELETE /api/bookings/:id`**: [Auth] Removes an active authorization
- **`GET /api/admin/users`**: [Admin Authority] Replicates global active profiles
- **`DELETE /api/admin/bookings/:id`**: [Admin Authority] Unilaterally un-binds system allocations
