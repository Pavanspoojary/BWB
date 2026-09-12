export interface HackEntry {
  slug: string;
  alt_slug?: string;
  title: string;
  description: string;
  replaces_saas: string;
  saas_target: 'Auth' | 'Storage' | 'Database' | 'Logging' | 'Email';
  estimated_monthly_savings: number;
  category: 'Active Sacrilege' | 'Clean Loophole' | 'The Graveyard';
  risk_level: 'Low' | 'TOS Gray Area' | 'Nuclear';
  primitives_abused: string[];
  author_github: string;
  date_added: string;
  warning_banner?: string;
  is_deprecated?: boolean;
  ascii_diagram?: string;
  mermaid_diagram?: string;
  code_snippets?: Array<{
    title: string;
    lang: string;
    code: string;
  }>;
  reality_check?: {
    title?: string;
    warnings: string[];
  };
  content_markdown?: string;
}

export const SEED_HACKS: HackEntry[] = [
  {
    slug: 'telegram-infinite-s3-bucket',
    alt_slug: 'telegram-infinite-s3',
    title: 'Using Telegram as an Infinite S3 Bucket',
    description: 'Abusing Telegram Bot API and private channels as a zero-cost, unmetered blob storage layer bypassing AWS S3 egress fees.',
    replaces_saas: 'AWS S3 + CloudFront',
    saas_target: 'Storage',
    estimated_monthly_savings: 45,
    category: 'Active Sacrilege',
    risk_level: 'Nuclear',
    primitives_abused: [
      'Telegram Bot API',
      'Private Channel Storage',
      'Cloudflare Workers',
      'Multipart Streaming',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: 'WARNING: Storing arbitrary files in Telegram channels violates Bot API Terms of Service. Expect account suspension if detected.',
    is_deprecated: false,
    ascii_diagram: `+-------------------------------------------------------------------------+
|                        TELEGRAM S3 PROXY ARCHITECTURE                   |
+-------------------------------------------------------------------------+
                                                                           
 [CLIENT BROWSER / CURL]                                                   
           |                                                               
      1. GET /files/:file_id (Supports 'Range: bytes=0-1048576')           
           v                                                               
 +-----------------------------------------------------------------------+ 
 | CLOUDFLARE WORKER / REVERSE PROXY                                     | 
 | - Verifies API token / HMAC signature                                 | 
 | - Fetches metadata manifest (Turso SQLite / KV / Embedded Header)     | 
 | - Calculates required chunk indexes based on Range header             | 
 +-----------------------------------------------------------------------+ 
      |                                       ^                            
 2. Look up manifest                      4. Resolve File Path             
      v                                       |                            
 +-----------------------+       +---------------------------------------+ 
 | METADATA MANIFEST     |       | TELEGRAM BOT API                      | 
 | - Chunk 0: file_id_A  |       | POST /getFile?file_id=...             | 
 | - Chunk 1: file_id_B  | ----> | -> Returns path: documents/file_0.bin | 
 | - Chunk 2: file_id_C  |       +---------------------------------------+ 
 +-----------------------+                    |                            
                                         5. GET /file/bot<TOKEN>/<path>    
                                              v                            
                                 +---------------------------------------+ 
                                 | TELEGRAM PRIVATE SUPERGROUP (BUCKET)  | 
                                 | [Channel ID: -100198472910]           | 
                                 | - Unmetered unlimited blob chunks     | 
                                 +---------------------------------------+ 
                                              |                            
                                         6. Stream binary chunks           
                                              v                            
                                 [CLOUDFLARE STREAMING BODY]               
                                              |                            
                                         7. Transfer-Encoding: chunked     
                                              v                            
                                    [CLIENT RECEIVES STREAM]               `,
    mermaid_diagram: `sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant Proxy as Cloudflare Worker (Proxy)
    participant Manifest as KV / Turso Manifest
    participant TgAPI as Telegram Bot API
    participant TgStorage as Telegram Channel Storage

    Note over Client,Proxy: 1. UPLOAD PIPELINE
    Client->>Proxy: POST /upload (Binary Payload)
    Proxy->>Proxy: Slice payload into 19MB Chunks
    loop For Each Chunk
        Proxy->>TgAPI: POST /sendDocument (chat_id=@cdn_vault)
        TgAPI->>TgStorage: Persist blob in private channel
        TgStorage-->>TgAPI: Returns file_id & message_id
        TgAPI-->>Proxy: Return JSON { file_id: "BAADBAAD..." }
    end
    Proxy->>Manifest: Store file manifest [chunk_0: id0, chunk_1: id1, ...]
    Proxy-->>Client: 201 Created { url: "https://proxy.dev/file/abc123" }

    Note over Client,Proxy: 2. STREAMING DOWNLOAD PIPELINE
    Client->>Proxy: GET /file/abc123 (Range: bytes=0-1000000)
    Proxy->>Manifest: Fetch chunk map for file "abc123"
    Manifest-->>Proxy: Return [file_id_0, file_id_1]
    Proxy->>TgAPI: POST /getFile?file_id=file_id_0
    TgAPI-->>Proxy: { file_path: "documents/chunk_0.bin" }
    Proxy->>TgStorage: Stream GET /file/bot{token}/documents/chunk_0.bin
    TgStorage-->>Proxy: 200 OK (Binary stream)
    Proxy-->>Client: 206 Partial Content / 200 OK (Streamed response)`,
    code_snippets: [
      {
        title: 'uploader.ts',
        lang: 'typescript',
        code: `import { createReadStream, statSync } from 'node:fs';
import { open } from 'node:fs/promises';

interface ChunkManifest {
  filename: string;
  totalSize: number;
  chunkSize: number;
  mimeType: string;
  chunks: string[]; // Telegram file_id references
  createdAt: string;
}

const CHUNK_SIZE = 19 * 1024 * 1024; // 19MB (Safely below 20MB limit)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_STORAGE_CHANNEL_ID!; // e.g. -1001234567890

export async function uploadToTelegramS3(filePath: string, filename: string, mimeType: string): Promise<ChunkManifest> {
  const stats = statSync(filePath);
  const totalChunks = Math.ceil(stats.size / CHUNK_SIZE);
  const fileHandle = await open(filePath, 'r');
  const chunkFileIds: string[] = [];

  console.log(\`[SACRILEGE] Uploading \${filename} (\${(stats.size / 1024 / 1024).toFixed(2)} MB) across \${totalChunks} chunks...\`);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, stats.size);
    const length = end - start;
    const buffer = Buffer.alloc(length);

    await fileHandle.read(buffer, 0, length, start);

    const formData = new FormData();
    formData.append('chat_id', CHANNEL_ID);
    formData.append('caption', \`chunk_\${i}_of_\${totalChunks}:\${filename}\`);
    formData.append('document', new Blob([buffer], { type: 'application/octet-stream' }), \`part_\${i}.bin\`);

    const res = await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendDocument\`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(\`Telegram upload failed on chunk \${i}: \${JSON.stringify(data)}\`);
    }

    const fileId = data.result.document.file_id;
    chunkFileIds.push(fileId);
    console.log(\` -> Chunk \${i + 1}/\${totalChunks} uploaded. file_id: \${fileId.slice(0, 16)}...\`);
  }

  await fileHandle.close();

  const manifest: ChunkManifest = {
    filename,
    totalSize: stats.size,
    chunkSize: CHUNK_SIZE,
    mimeType,
    chunks: chunkFileIds,
    createdAt: new Date().toISOString(),
  };

  return manifest;
}`,
      },
      {
        title: 'worker.ts',
        lang: 'typescript',
        code: `export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  MANIFEST_STORE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const fileId = url.pathname.replace('/file/', '');

    if (!fileId) {
      return new Response('400 Missing File ID', { status: 400 });
    }

    const rawManifest = await env.MANIFEST_STORE.get(fileId);
    if (!rawManifest) {
      return new Response('404 File Manifest Not Found', { status: 404 });
    }

    const manifest = JSON.parse(rawManifest);
    const { chunks, mimeType, totalSize } = manifest;

    const resolvedUrls: string[] = [];
    for (const tgFileId of chunks) {
      const getFileRes = await fetch(
        \`https://api.telegram.org/bot\${env.TELEGRAM_BOT_TOKEN}/getFile?file_id=\${tgFileId}\`
      );
      const fileData = await getFileRes.json();
      if (!fileData.ok) {
        return new Response('502 Bad Gateway: Failed resolving Telegram chunk', { status: 502 });
      }
      resolvedUrls.push(\`https://api.telegram.org/file/bot\${env.TELEGRAM_BOT_TOKEN}/\${fileData.result.file_path}\`);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      try {
        for (const chunkUrl of resolvedUrls) {
          const chunkRes = await fetch(chunkUrl);
          if (!chunkRes.body) continue;
          const reader = chunkRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Length': totalSize.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};`,
      },
    ],
    reality_check: {
      title: 'WHY YOU WILL EVENTUALLY REGRET THIS',
      warnings: [
        'FLOOD_WAIT_X & RATE LIMITS: Telegram Bot API strictly throttles bots to ~30 messages/second globally and ~1 message/second inside a specific chat. If 5 users upload a 100MB file simultaneously, your bot receives HTTP 429 FLOOD_WAIT_3600.',
        "TERMS OF SERVICE BANHAMMER: Section 1.3 of Telegram Terms of Service explicitly prohibits utilizing bot infrastructure as automated bulk storage networks. Abuse heuristics will permanently ban the bot token and channel.",
        'HIGH TTFB LATENCY: Unlike CloudFront 15ms edge caching, Telegram routing requires Client -> Cloudflare Worker -> Telegram API -> Telegram CDN. Expect TTFB of 350ms to 900ms.',
        'CHUNK INTEGRITY FAILURE RISK: If chunk #4 out of 10 fails to upload or is dropped, the entire 200MB file is corrupted unless you build transactional chunk repair queues.',
      ],
    },
  },
  {
    slug: 'true-zero-dollar-production-stack',
    alt_slug: 'zero-dollar-production-stack',
    title: 'The True $0 Production Stack',
    description: 'A 100% TOS-compliant zero-dollar stack combining Cloudflare Workers, Turso libSQL, Better Auth, and Resend.',
    replaces_saas: 'Vercel Pro + PlanetScale + Clerk + SendGrid',
    saas_target: 'Database',
    estimated_monthly_savings: 120,
    category: 'Clean Loophole',
    risk_level: 'Low',
    primitives_abused: [
      'Cloudflare Workers Free Tier',
      'Turso libSQL Database',
      'Resend Transactional Email',
      'Better Auth Self-Hosted SQLite',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: undefined,
    is_deprecated: false,
    ascii_diagram: `+-------------------------------------------------------------------------+
|                  THE TRUE $0 PRODUCTION STACK TOPOLOGY                  |
+-------------------------------------------------------------------------+

 [GLOBAL USER] (Browser / Mobile / cURL)
       |
       | Sub-10ms Anycast DNS routing
       v
 +-----------------------------------------------------------------------+
 | CLOUDFLARE EDGE WORKER (100,000 Requests/Day Free)                    |
 | - 0ms Cold Start                                                      |
 | - Edge Routing & Static Asset Streaming                               |
 | - Better Auth Middleware (Direct SQLite session validation)           |
 +-----------------------------------------------------------------------+
       |                                              |
       | HTTP/libSQL WebSockets                       | REST API (HTTPS)
       v                                              v
 +-----------------------------------+     +-----------------------------+
 | TURSO EDGE DATABASE (libSQL)      |     | RESEND TRANSACTIONAL ENGINE |
 | - 9 GB Free Storage               |     | - 3,000 Emails / Month Free |
 | - 1 Billion Row Reads / Month     |     | - 100 Emails / Day          |
 | - Sub-10ms Embedded Latency       |     | - Instant Magic Link Auth   |
 | - Zero Idle Connection Penalties  |     +-----------------------------+
 +-----------------------------------+`,
    mermaid_diagram: `sequenceDiagram
    autonumber
    actor User as User Browser
    participant Worker as Cloudflare Worker (Edge)
    participant Auth as Better Auth Middleware
    participant Turso as Turso libSQL (Edge Replica)
    participant Resend as Resend Email API

    User->>Worker: POST /api/auth/sign-up (email, password)
    Worker->>Auth: Process signup credentials
    Auth->>Turso: Execute parameterized INSERT INTO users & sessions
    Turso-->>Auth: Query execution < 4ms (Read/Write OK)
    Auth->>Resend: POST /emails (Send 6-digit verification code)
    Resend-->>Auth: 200 OK (Email dispatched via Amazon SES backbone)
    Auth-->>Worker: Signed Session Cookie (HttpOnly, Secure)
    Worker-->>User: 200 OK Set-Cookie: b_session=...
    Note over User,Turso: Subsequent Authenticated Request
    User->>Worker: GET /api/dashboard (Cookie: b_session=...)
    Worker->>Auth: Validate session token
    Auth->>Turso: SELECT * FROM sessions WHERE token = ? LIMIT 1
    Turso-->>Auth: Session valid (2ms)
    Worker-->>User: 200 OK (Payload served with 8ms total TTFB)`,
    code_snippets: [
      {
        title: 'worker.ts',
        lang: 'typescript',
        code: `import { createClient } from '@libsql/client/web';
import { Resend } from 'resend';

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  RESEND_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Initialize Turso Edge SQLite Client
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    // Initialize Resend
    const resend = new Resend(env.RESEND_API_KEY);

    // Health / Benchmarking route
    if (url.pathname === '/api/ping') {
      const startTime = performance.now();
      const result = await db.execute('SELECT sqlite_version() as version, datetime("now") as now');
      const latency = (performance.now() - startTime).toFixed(2);

      return new Response(
        JSON.stringify({
          status: 'ONLINE',
          stack: 'Cloudflare Workers + Turso + Resend',
          dbLatency: \`\${latency}ms\`,
          data: result.rows[0],
          cost: '$0.00/mo',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Magic Link / Signup Dispatch
    if (url.pathname === '/api/auth/magic-link' && request.method === 'POST') {
      const { email } = await request.json() as { email: string };
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await db.execute({
        sql: \`INSERT INTO auth_tokens (email, token, expires_at) 
              VALUES (?, ?, datetime('now', '+15 minutes'))
              ON CONFLICT(email) DO UPDATE SET token=excluded.token, expires_at=excluded.expires_at\`,
        args: [email, otp],
      });

      const emailResult = await resend.emails.send({
        from: 'auth@builtwhilebroke.tech',
        to: email,
        subject: \`Your Login Code: \${otp}\`,
        text: \`Your login code is: \${otp}. Valid for 15 minutes.\`,
      });

      return new Response(JSON.stringify({ success: true, emailId: emailResult.data?.id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Built While Broke Zero-Dollar Edge Kernel', { status: 200 });
  },
};`,
      },
    ],
    reality_check: {
      title: 'CLEAN LOOPHOLES STILL HAVE CEILINGS',
      warnings: [
        'THE 10MS CPU EXECUTION WALL: Cloudflare Workers Free Tier gives you 10ms of CPU execution time per request. Heavy crypto like Bcrypt will abort with Error 1101. Use WebCrypto API with native argon2/scrypt instead.',
        'RESEND 100 EMAIL/DAY CAP: 3,000 free emails/month is generous, but Resend strictly caps daily send rate at 100 emails/day on the free tier. One launch spike on Hacker News will exhaust your daily allotment.',
        'SINGLE PRIMARY WRITE LOCATION FOR TURSO: Turso distributes read replicas across the globe, but all writes must travel to the primary database location (e.g. AWS us-east-1). Intercontinental write latency will be ~180ms.',
      ],
    },
  },
  {
    slug: 'discord-cdn-autopsy',
    alt_slug: 'discord-cdn-autopsy',
    title: 'The Discord CDN Autopsy',
    description: 'Postmortem analysis of how developers abused Discord attachment URLs as a free CDN and how the 2024 HMAC patch broke thousands of websites.',
    replaces_saas: 'Imgur API / AWS S3 / Cloudinary',
    saas_target: 'Storage',
    estimated_monthly_savings: 30,
    category: 'The Graveyard',
    risk_level: 'Nuclear',
    primitives_abused: [
      'Discord Attachments API',
      'Discord Webhooks',
      'cdn.discordapp.com Unauthenticated Edge Cache',
    ],
    author_github: 'builtwhilebroke',
    date_added: '2026-09-12',
    warning_banner: 'PATCHED: Discord attachment links expire after 24 hours via mandatory cryptographic HMAC signatures.',
    is_deprecated: true,
    ascii_diagram: `+-------------------------------------------------------------------------+
|                  THE DISCORD CDN AUTOPSY: BEFORE VS AFTER               |
+-------------------------------------------------------------------------+

 [THE GOLDEN AGE (2018 - 2023)]
 Webhook Upload ---> Discord Channel ---> cdn.discordapp.com/attachments/1/2/pic.png
                                                 |
                                          (No Expiration)
                                                 |
                                   [Cached Globally Forever on Cloudflare]
                                                 |
                                   Free bandwidth for millions of sites!

 -------------------------------------------------------------------------

 [THE ENFORCED KILLSHOT (2024+)]
 URL: cdn.discordapp.com/attachments/1/2/pic.png?ex=65e123&is=65d000&hmac=7f4a...
                                                 |
                                        After 24 Hours:
                                                 v
                                   [HTTP 403 FORBIDDEN]
                           "Signature has expired or is invalid"
                                                 v
                         MASS CASCADING BREAKAGE OF INDIE WEB IMAGES`,
    mermaid_diagram: `sequenceDiagram
    autonumber
    actor WebApp as Third-Party Website
    participant Proxy as Desperate Dev's Refresh Proxy
    participant DiscordAPI as Discord Refresh API (/api/v9)
    participant CDN as Discord CDN (cdn.discordapp.com)

    WebApp->>CDN: GET image.png?ex=EXPIRED&hmac=INVALID
    CDN-->>WebApp: HTTP 403 Forbidden (Link Expired!)
    
    Note over WebApp,DiscordAPI: Developers attempted to build Refresh Proxies
    WebApp->>Proxy: Request fresh URL for expired attachment
    Proxy->>DiscordAPI: POST /api/v9/attachments/refresh-urls { attachment_urls: [...] }
    
    alt Bot Token Exceeds Rate Limit
        DiscordAPI-->>Proxy: HTTP 429 Too Many Requests (Retry-After: 3600s)
        Proxy-->>WebApp: HTTP 500 Image Dead
    else Discord Detects Scraper Behavior
        DiscordAPI-->>Proxy: HTTP 401 Unauthorized / Token Revocation
        Note over Proxy: Account / Bot Terminated for Platform Abuse
    end`,
    code_snippets: [
      {
        title: 'postmortem.ts',
        lang: 'typescript',
        code: `/**
 * THE DISCORD CDN POSTMORTEM DEMO
 * Demonstrates why relying on unauthenticated hotlinks leads to catastrophe.
 */
async function checkDiscordUrlHealth(url: string) {
  console.log(\`[AUTOPSY] Probing Discord Attachment: \${url}\`);
  
  const parsed = new URL(url);
  const exHex = parsed.searchParams.get('ex');
  const hmac = parsed.searchParams.get('hmac');

  if (!exHex || !hmac) {
    console.warn(\`[!] CRITICAL: URL has no HMAC/ex expiration parameters.\`);
    console.warn(\`    Discord will block this request immediately outside the official app.\`);
  } else {
    const expireTimestamp = parseInt(exHex, 16) * 1000;
    const now = Date.now();
    const hoursLeft = ((expireTimestamp - now) / 1000 / 3600).toFixed(1);
    
    if (now > expireTimestamp) {
      console.error(\`[X] EXPIRED: This URL expired on \${new Date(expireTimestamp).toISOString()}!\`);
    } else {
      console.log(\`[!] TICKING CLOCK: URL valid for only \${hoursLeft} more hours.\`);
    }
  }

  const res = await fetch(url, { method: 'HEAD' });
  console.log(\`HTTP Status: \${res.status} \${res.statusText}\`);
  if (res.status === 403) {
    console.error(\`[DEAD] The CDN returned 403 Forbidden. Asset is gone.\`);
  }
}`,
      },
    ],
    reality_check: {
      title: 'WHAT THE GRAVEYARD TEACHES US',
      warnings: [
        'THE LAW OF SPONSORED EGRESS: If a company provides free storage, they are paying bandwidth bills. When finance notices millions of dollars in Cloudflare egress attributed to third-party web scrapers, security engineers are dispatched to kill the exploit with extreme prejudice.',
        'AVOID SECONDARY PROXY FIXES: Trying to bypass HMAC expiration by calling Discord /attachments/refresh-urls creates an unstable Rube Goldberg machine with severe rate-limit failure modes.',
        'THE MODERN LEGITIMATE FIX: Use Cloudflare R2 (10GB free storage, $0.00 egress fees forever, S3-compatible API) or Backblaze B2 (10GB free storage + free Cloudflare bandwidth alliance).',
      ],
    },
  },
];
