---
title: "The True $0 Production Stack"
description: "Building a globally distributed, sub-10ms web app without spending a dime using Turso, Cloudflare Workers, Resend, and Better Auth."
replaces_saas: "Vercel Pro + PlanetScale + Auth0 + SendGrid"
saas_target: "Database"
estimated_monthly_savings: 120
category: "Clean Loophole"
risk_level: "Low"
primitives_abused:
  - "Turso SQLite Free Tier"
  - "Cloudflare Workers"
  - "Resend Free Tier"
  - "Better Auth SQLite Adapter"
author_github: "Pavanspoojary"
date_added: "2026-09-12"
is_deprecated: false
---

## The $20/Seat SaaS Bloat Tax

There is an unspoken hazing ritual in modern software development: the moment an indie developer writes `npm init`, venture-backed developer-tool startups descend like digital vultures to extract a monthly recurring tax before the project generates its first dollar of revenue.

Here is the standard "modern web stack" invoice that developers sleepwalk into:
- **Vercel Pro:** $20/seat/month (because you invited one collaborator or needed preview comments).
- **PlanetScale / Supabase Pro:** $29–$39/month (because the hobby tier pauses your database after seven days of inactivity).
- **Clerk / Auth0:** $25+/month (free up to a trickle of Monthly Active Users, after which you are billed per human soul who signs up).
- **SendGrid / Postmark:** $19.95/month (for transactional emails because hobby SMTP ports are blocked).

Total monthly burn: **$120 to $180 every single month**, or over **$1,500 a year** for an application that might only have 300 active users.

The dirty secret of the cloud industry is that Tier-1 developer platforms offer staggering amounts of unmetered compute and storage on their permanent free tiers. If you structure your primitives correctly, you can operate a globally distributed, sub-10ms web application with high availability, zero cold starts, and production-grade auth without spending a single dime—all while remaining **100% compliant with every provider's Terms of Service**.

No stolen bot tokens, no gray-area exploits. Just pure, unadulterated architectural efficiency: **The True $0 Production Stack**.

---

## Architectural Blueprint & Edge Data Flow

The architecture unifies four hyper-generous developer tiers into an integrated edge kernel:
1. **Compute & Edge Routing:** **Cloudflare Workers** (100,000 requests/day free, 0ms cold starts across 300+ edge PoPs).
2. **Database:** **Turso libSQL** (SQLite at the edge: 500 databases, 9GB storage, and 1 billion row reads/month free).
3. **Authentication:** **Better Auth** (Self-hosted TypeScript auth engine backed directly by SQLite tables, eliminating Clerk's per-user tax).
4. **Transactional Email:** **Resend** (3,000 free emails/month with 100 emails/day, verified DKIM/SPF over Amazon SES backbone).

### ASCII Architecture Diagram

```
+-------------------------------------------------------------------------+
|                  THE TRUE $0 PRODUCTION STACK TOPOLOGY                  |
+-------------------------------------------------------------------------+

 [GLOBAL USER] (Browser / Mobile / cURL)
       |
       | Sub-10ms Anycast DNS routing
       v
 +-----------------------------------------------------------------------+
 | CLOUDFLARE EDGE WORKER (100,000 Requests/Day Free)                    |
 | - 0ms Cold Start V8 Isolates                                          |
 | - Edge Routing & Dynamic Request Dispatch                             |
 | - Better Auth Middleware (Direct SQLite session validation)           |
 +-----------------------------------------------------------------------+
       |                                              |
       | libSQL over WebSockets / HTTP                | HTTPS REST API
       v                                              v
 +-----------------------------------+     +-----------------------------+
 | TURSO EDGE DATABASE (libSQL)      |     | RESEND TRANSACTIONAL ENGINE |
 | - 9 GB Free Storage               |     | - 3,000 Emails / Month Free |
 | - 1 Billion Row Reads / Month     |     | - 100 Emails / Day Ceiling  |
 | - Sub-5ms Read Latency            |     | - Magic Links & OTP Auth    |
 | - Zero Idle Sleep / Connection Pool |     +-----------------------------+
 +-----------------------------------+
```

### Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Worker as Cloudflare Worker (Edge)
    participant Auth as Better Auth Middleware
    participant Turso as Turso libSQL (Edge Replica)
    participant Resend as Resend Email API

    Note over User,Resend: 1. PASSWORDLESS SIGNUP / LOGIN FLOW
    User->>Worker: POST /api/auth/magic-link { email: "user@domain.com" }
    Worker->>Auth: Process magic link request
    Auth->>Turso: INSERT / UPSERT into auth_tokens (OTP code, expires_at)
    Turso-->>Auth: Query executed in 3ms (Write OK)
    Auth->>Resend: POST /emails { to: email, subject: "Login Code: 839201" }
    Resend-->>Auth: 200 OK { id: "msg_abc123" }
    Auth-->>Worker: Dispatch complete
    Worker-->>User: 200 OK { success: true, message: "Code dispatched" }

    Note over User,Resend: 2. AUTHENTICATED REQUEST FLOW
    User->>Worker: GET /api/dashboard (Cookie: b_session=...)
    Worker->>Auth: Validate session token from Cookie
    Auth->>Turso: SELECT * FROM sessions WHERE token = ? LIMIT 1
    Turso-->>Auth: Read query resolved in 2ms (Edge Cache Hit)
    Worker-->>User: 200 OK { user: "Pavan", role: "admin" } (Total TTFB: 8ms)
```

---

## Primitive 1: Turso libSQL with Global Edge Replicas

Traditional cloud databases (PostgreSQL, MySQL) are designed around long-lived TCP connections. Putting them behind serverless functions forces you to pay for expensive connection poolers like AWS RDS Proxy or Supabase Compute add-ons. If a database goes idle, free tiers shut it down, hitting your users with painful 5-second cold starts.

**Turso** changes the paradigm by compiling SQLite into an edge-native distributed database engine called **libSQL**:
- **500 Databases:** Free tier includes up to 500 individual SQLite databases. You can provision a dedicated database per tenant or customer if you desire.
- **9 GB Total Storage:** Far beyond the needs of early-stage SaaS metadata.
- **1 Billion Row Reads / Month:** Enough headroom to handle millions of pageviews.
- **Zero Cold Start:** Queries execute in 2ms–5ms because SQLite reads from memory-mapped files without spinning up heavy JVM or Postgres processes.

---

## Primitive 2: Cloudflare Workers Edge Router

Instead of paying Vercel $20/month for Node.js container hosting, Cloudflare Workers executes your TypeScript code inside **V8 isolates**:
- **0ms Cold Starts:** Isolates start in under 5 milliseconds, eliminating the dreaded serverless startup pause.
- **100,000 Requests/Day Free:** Scales to ~3 million requests a month before requiring a $5/mo upgrade.
- **Anycast Distribution:** Requests terminate at the closest Cloudflare data center (across 300+ cities globally), dropping Time to First Byte (TTFB) to sub-15ms for 95% of the world.

---

## Primitive 3: Resend Transactional Email Engine

Every SaaS needs to dispatch transactional emails: verification codes, magic links, invoice receipts, and password resets. 

Traditional email vendors either charge upfront or bury free tiers under painful IP reputation penalties. **Resend** provides:
- **3,000 Emails / Month Free:** Perfect for bootstrapped MVPs.
- **DKIM, SPF & DMARC Automation:** Simple DNS verification that ensures your emails land in the primary inbox, not spam.
- **Backed by AWS SES:** Elite deliverability and speed without configuring complex AWS IAM roles.

---

## Primitive 4: Self-Hosted Better Auth on SQLite

Auth0 charges $25/month for basic B2B features; Clerk charges $0.02 to $0.05 per Monthly Active User once you cross 10,000 users. 

**Better Auth** is a comprehensive, open-source TypeScript authentication framework designed from the ground up for edge runtimes. By pairing Better Auth with the Turso SQLite adapter:
- You own 100% of your user data in your own SQLite database.
- Zero per-user tax forever.
- Direct cookie and session verification in <2ms at the edge without external API round-trips.

---

## Complete Copy-Ready Implementation

### 1. Database Schema (`schema.sql`)

Run this SQL migration against your Turso database using the Turso CLI (`turso db shell <db-name>`):

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Active user sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Magic links and OTP verification tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
  email TEXT NOT NULL PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for sub-millisecond lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 2. The Unified Edge Worker (`src/worker.ts`)

Here is the complete, self-contained Cloudflare Worker entrypoint connecting Turso, Better Auth logic, and Resend:

```typescript
import { createClient } from "@libsql/client/web";
import { Resend } from "resend";

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  RESEND_API_KEY: string;
  APP_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Initialize Turso libSQL Client over WebSockets/HTTP
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    // Initialize Resend Email Client
    const resend = new Resend(env.RESEND_API_KEY);

    // Route: GET /api/ping (Database latency & version benchmark)
    if (url.pathname === "/api/ping" && request.method === "GET") {
      const startTime = performance.now();
      const result = await db.execute("SELECT sqlite_version() as version, datetime(\"now\") as now");
      const dbLatency = (performance.now() - startTime).toFixed(2);

      return new Response(
        JSON.stringify({
          status: "ONLINE",
          stack: "Cloudflare Workers + Turso libSQL + Resend + Better Auth",
          dbLatency: `${dbLatency}ms`,
          sqliteVersion: result.rows[0]?.version,
          serverTime: result.rows[0]?.now,
          monthlySaaSCost: "$0.00",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Route: POST /api/auth/magic-link (Passwordless signup / login dispatch)
    if (url.pathname === "/api/auth/magic-link" && request.method === "POST") {
      try {
        const body = (await request.json()) as { email?: string };
        const email = body?.email?.toLowerCase().trim();

        if (!email || !email.includes("@")) {
          return new Response(JSON.stringify({ error: "Invalid email address" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Generate 6-digit cryptographic OTP
        const otpArray = new Uint32Array(1);
        crypto.getRandomValues(otpArray);
        const otp = (100000 + (otpArray[0] % 900000)).toString();

        // 1. Upsert token into Turso SQLite
        await db.execute({
          sql: `INSERT INTO auth_tokens (email, token, expires_at)
                VALUES (?, ?, datetime("now", "+15 minutes"))
                ON CONFLICT(email) DO UPDATE SET token=excluded.token, expires_at=excluded.expires_at`,
          args: [email, otp],
        });

        // 2. Dispatch transactional email via Resend
        const emailResult = await resend.emails.send({
          from: "auth@builtwhilebroke.tech",
          to: email,
          subject: `Your Login Code: ${otp}`,
          text: `Welcome to BuiltWhileBroke.\n\nYour 6-digit login verification code is: ${otp}\nThis code will expire in 15 minutes.\n\nIf you did not request this, you can safely ignore this email.`,
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Authentication code dispatched",
            emailId: emailResult.data?.id,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Route: POST /api/auth/verify-otp (Verify OTP & issue session cookie)
    if (url.pathname === "/api/auth/verify-otp" && request.method === "POST") {
      try {
        const body = (await request.json()) as { email?: string; otp?: string };
        const email = body?.email?.toLowerCase().trim();
        const otp = body?.otp?.trim();

        if (!email || !otp) {
          return new Response(JSON.stringify({ error: "Email and OTP required" }), { status: 400 });
        }

        // Validate token against Turso
        const tokenQuery = await db.execute({
          sql: `SELECT email FROM auth_tokens WHERE email = ? AND token = ? AND expires_at > datetime("now") LIMIT 1`,
          args: [email, otp],
        });

        if (tokenQuery.rows.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid or expired verification code" }), { status: 401 });
        }

        // Clean up used token
        await db.execute({ sql: `DELETE FROM auth_tokens WHERE email = ?`, args: [email] });

        // Ensure user exists
        const userId = `usr_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
        await db.execute({
          sql: `INSERT INTO users (id, email, email_verified) VALUES (?, ?, 1) ON CONFLICT(email) DO UPDATE SET updated_at=datetime("now")`,
          args: [userId, email],
        });

        // Issue signed session
        const sessionToken = `ses_${crypto.randomUUID().replace(/-/g, "")}`;
        await db.execute({
          sql: `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime("now", "+30 days"))`,
          args: [`sid_${crypto.randomUUID().substring(0, 12)}`, userId, sessionToken],
        });

        return new Response(JSON.stringify({ success: true, user: { email } }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `b_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Default Fallback
    return new Response(
      JSON.stringify({ name: "BuiltWhileBroke Zero-Dollar Production Stack", status: "ONLINE" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  },
};
```

---

## Brutal Reality Check

Even clean, TOS-compliant loopholes have operational ceilings. If you build your SaaS on this zero-dollar foundation, respect these boundaries:

### 1. The 10ms CPU Execution Limit
Cloudflare Workers on the free tier provides **10ms of actual CPU time per request** (wall-clock I/O time spent waiting on network responses from Turso or Resend does not count toward this limit).
- If you attempt to compute heavy password hashes with `bcrypt` (e.g., 12 rounds), your worker will instantly exceed the 10ms CPU ceiling and Cloudflare will abort the request with **Error 1101: Worker Threw Exception**.
- **The Solution:** Use WebCrypto API native primitives (`crypto.subtle.deriveBits` using PBKDF2 or SHA-256) or stick to passwordless OTP/magic link flows as shown above.

### 2. Resend 100 Emails / Day Ceiling
While Resend grants 3,000 free emails per month, they enforce a hard daily send limit of **100 emails per day** on the free tier.
- If your startup launches on Hacker News or Product Hunt and 300 users attempt to sign up within two hours, email #101 will fail with `HTTP 429: Daily rate limit exceeded`.
- **The Solution:** Protect your `/api/auth/magic-link` endpoint with **Cloudflare Turnstile** (free bot protection) to eliminate bot signups, and keep a backup AWS SES API key ready for the day you get featured on TechCrunch.

### 3. SQLite Write Contention & Primary Write Location
Turso replicates reads across global edge locations with sub-5ms response times. However, **writes must always serialize through the single primary database instance** (e.g., in AWS `us-east-1`).
- A user writing from Sydney will experience ~180ms write latency to Virginia.
- SQLite is fundamentally a single-writer database. While libSQL handles concurrent read transactions flawlessly, heavy burst write traffic (e.g., 500 simultaneous write transactions/second) will encounter lock timeouts (`SQLITE_BUSY`).
- For standard SaaS products (95% read / 5% write ratio), this is never an issue. If you are building a real-time multiplayer telemetry recorder, you need ClickHouse, not SQLite.

### 4. Vertical Scaling Ceilings
The moment you require complex multi-statement analytical queries with window functions across 50 million rows, 30-second long background jobs, or gigabytes of memory cache, the free tier will run out of headroom. But by the time your application hits those metrics, you will have thousands of active users and revenue to comfortably pay for dedicated infrastructure. Until then, stay broke and build for zero dollars.
