/**
 * BuiltWhileBroke - Rule-Based Moderation Engine
 *
 * Validates user-submitted sticky note fields:
 * 1. Product Name
 * 2. Tagline (Pitch)
 * 3. Website Link (URL)
 * 4. Maker Handle
 *
 * Enforces rules against:
 * - Profanity, slurs, harassment, hate speech, and leetspeak obfuscations
 * - Spam patterns, crypto scams, get-rich schemes, casino, and pharma spam
 * - Gibberish, repetitive text, and shouting
 * - Malicious URLs (javascript:, data:, raw IPs, localhost, HTML injection)
 * - System/Staff impersonation in handles (@admin, @system, @builtwhilebroke, etc.)
 * - Structural and substance requirements (length, meaningful text)
 */

export interface ModerationInput {
  name: string;
  tagline: string;
  url?: string;
  maker?: string;
}

export interface ModerationViolation {
  field: "name" | "tagline" | "url" | "maker";
  rule: string;
  message: string;
}

export interface ModerationResult {
  valid: boolean;
  violations: ModerationViolation[];
}

// ---------------------------------------------------------------------------
// 1. Dictionaries & Pattern Definitions
// ---------------------------------------------------------------------------

/**
 * Severe hate speech, slurs, and violent threats.
 * Zero tolerance: checked everywhere including substrings and de-obfuscated forms.
 */
const SEVERE_PROHIBITED_PATTERNS: RegExp[] = [
  /n[i1l!|]gg[e3a4]r/i,
  /n[i1l!|]gg[a4]/i,
  /f[a4]gg[o0i1!]t/i,
  /k[i1l!]k[e3]/i,
  /c[h1!]nk/i,
  /sp[i1l!]c\b/i,
  /tr[a4]nn[y1]/i,
  /k[y1]s\b/i,
  /k[i1l!]ll\s*y[o0]urs[e3]lf/i,
  /d[i1l!]e\s*[i1l!]n\s*[a4]\s*f[i1l!]r[e3]/i,
  /c[o0]mm[i1l!]t\s*su[i1l!]c[i1l!]d[e3]/i,
  /sh[o0][o0]t\s*[u0]p/i,
  /b[o0]mb\s*thr[e3][a4]t/i,
  /r[a4]p[e3]\s*y[o0]u/i,
  /g[a4]s\s*th[e3]\s*j[e3]ws/i,
];

/**
 * Standard profanity, vulgarity, and abusive terms.
 * Checked with word boundaries \b to prevent Scunthorpe false positives (classic, pass, assistant, etc.).
 */
const PROFANITY_WORD_LIST = [
  "fuck", "fucker", "fucking", "fucked", "fuckup", "motherfucker",
  "shit", "shitty", "bullshit", "dipshit",
  "bitch", "bitches", "bitching",
  "cunt", "cunts",
  "asshole", "assholes", "dumbass", "jackass", "fatass",
  "bastard", "bastards",
  "dickhead", "dickweed",
  "whore", "whores", "slut", "sluts",
  "pussy", "pussies",
  "cock", "cocksucker",
  "blowjob", "handjob",
  "wanker", "twat",
  "retard", "retarded",
  "nazi", "hitler", "swastika",
];

/**
 * High-confidence spam, scam, phishing, and deceptive phrases.
 */
const SPAM_PHRASES: RegExp[] = [
  // Crypto & Airdrop scams
  /free\s*crypto/i,
  /claim\s*(free\s*)?airdrop/i,
  /connect\s*wallet\s*to\s*claim/i,
  /send\s*(eth|btc|sol|usdt)\s*to/i,
  /double\s*your\s*(btc|crypto|money)/i,
  /100x\s*gem\s*guaranteed/i,
  /pump\s*and\s*dump/i,
  /seed\s*phrase/i,
  /private\s*key\s*giveaway/i,

  // Financial & Phishing schemes
  /make\s*\$?[0-9]{3,}\s*(a|per)\s*(day|hour|week)/i,
  /get\s*rich\s*quick/i,
  /passive\s*income\s*guaranteed/i,
  /work\s*from\s*home\s*guaranteed\s*\$/i,
  /free\s*gift\s*card/i,
  /free\s*(nitro|robux|v-bucks)/i,
  /wire\s*transfer\s*(via|to)/i,
  /western\s*union\s*transfer/i,

  // Adult, Pharma & Casino spam
  /online\s*casino/i,
  /free\s*spins\s*bonus/i,
  /casino\s*bonus/i,
  /buy\s*viagra/i,
  /cheap\s*cialis/i,
  /onlyfans\s*leaks/i,
  /cam\s*girls/i,
  /sugar\s*daddy\s*needed/i,
  /escort\s*service/i,

  // Messaging solicitation spam
  /whatsapp\s*(me\s*)?(\+|at|\:)/i,
  /contact\s*on\s*whatsapp/i,
  /join\s*my\s*telegram\s*(group|channel)/i,
  /t\.me\/(joinchat|[a-z0-9_]{5,})/i,
];

/**
 * Reserved system / official handles that ordinary users cannot claim.
 */
const RESERVED_HANDLES = new Set([
  "admin", "administrator", "builtwhilebroke", "bwb", "root",
  "system", "official", "moderator", "mod", "support",
  "staff", "security", "team", "help", "verified",
  "trustmrr", "founder", "owner", "service",
]);

// ---------------------------------------------------------------------------
// 2. Normalization & De-obfuscation Helpers
// ---------------------------------------------------------------------------

/**
 * Replaces common leetspeak substitutions with standard characters.
 */
export function normalizeLeetspeak(input: string): string {
  if (!input) return "";
  let s = input.toLowerCase();

  // Character mapping
  s = s
    .replace(/@/g, "a")
    .replace(/4/g, "a")
    .replace(/8/g, "b")
    .replace(/3/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[\$5]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/vv/g, "w");

  return s;
}

/**
 * Strips punctuation/spaces placed deliberately between letters to evade filters.
 * e.g. "f.u.c.k" -> "fuck", "s h i t" -> "shit", "b*i*t*c*h" -> "bitch"
 */
export function collapseDelimiters(input: string): string {
  if (!input) return "";
  return input.replace(/([a-z0-9])[\s\.\-_\*\~]+(?=[a-z0-9])/gi, "$1");
}

/**
 * Collapses consecutive duplicate characters to single characters.
 * e.g. "fuuuuck" -> "fuck", "shiiiit" -> "shit"
 */
export function collapseDuplicateChars(input: string): string {
  if (!input) return "";
  return input.replace(/(.)\1+/g, "$1");
}

/**
 * Splits camelCase and PascalCase identifiers into separate words.
 * e.g. "FuckApp" -> "Fuck App", "shitBot" -> "shit Bot"
 */
export function splitCamelCase(input: string): string {
  if (!input) return "";
  return input.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

// ---------------------------------------------------------------------------
// 3. Specialized Field Validators
// ---------------------------------------------------------------------------

/**
 * Zero-tolerance substrings that never legitimately appear in standard vocabulary.
 */
const ZERO_TOLERANCE_SUBSTRINGS = [
  "fuck", "fucker", "fucking", "fucked", "motherfuck",
  "bitch", "cunt", "asshole", "dickhead", "pussy",
  "cocksuck", "blowjob", "whore", "slut"
];

/**
 * Checks text against severe slurs, standard profanity, and abusive language.
 */
export function checkProfanityAndAbuse(text: string): { flagged: boolean; reason?: string } {
  if (!text) return { flagged: false };

  // Expand camelCase (e.g. "FuckApp" -> "Fuck App")
  const expanded = splitCamelCase(text).replace(/[_.-]+/g, " ");
  const raw = expanded.toLowerCase();
  const leet = normalizeLeetspeak(raw);
  const collapsedLeet = collapseDuplicateChars(collapseDelimiters(leet));
  const rawCollapsed = collapseDuplicateChars(raw);

  // 1. Severe Prohibited Patterns (checked on raw, leet, and collapsed)
  for (const regex of SEVERE_PROHIBITED_PATTERNS) {
    if (
      regex.test(raw) ||
      regex.test(leet) ||
      regex.test(collapsedLeet) ||
      regex.test(rawCollapsed)
    ) {
      return { flagged: true, reason: "Hate speech, slurs, or harassment detected" };
    }
  }

  // 2. Zero-tolerance substrings (e.g. "fuckapp", "f.u.c.k", "fuuuuck")
  for (const sub of ZERO_TOLERANCE_SUBSTRINGS) {
    if (
      rawCollapsed.includes(sub) ||
      collapsedLeet.includes(sub)
    ) {
      // Whitelist Scunthorpe if needed
      if (sub === "cunt" && rawCollapsed.includes("scunthorpe")) {
        continue;
      }
      return { flagged: true, reason: "Inappropriate or abusive language detected" };
    }
  }

  // 3. Standard Profanity (word boundary checks on raw and collapsed forms)
  for (const word of PROFANITY_WORD_LIST) {
    const boundaryRegex = new RegExp(`\\b${word}\\b`, "i");
    if (
      boundaryRegex.test(raw) ||
      boundaryRegex.test(leet) ||
      boundaryRegex.test(collapsedLeet) ||
      boundaryRegex.test(rawCollapsed)
    ) {
      return { flagged: true, reason: "Inappropriate or abusive language detected" };
    }
  }

  return { flagged: false };
}

/**
 * Checks text for spam patterns, phishing phrases, excessive shouting, and gibberish.
 */
export function checkSpamPatterns(text: string): { flagged: boolean; reason?: string } {
  if (!text) return { flagged: false };

  // 1. Spam Phrases
  for (const regex of SPAM_PHRASES) {
    if (regex.test(text)) {
      return { flagged: true, reason: "Prohibited commercial solicitation or scam pattern detected" };
    }
  }

  // 2. Repetitive Gibberish: 7+ identical consecutive characters
  if (/(.)\1{6,}/i.test(text)) {
    return { flagged: true, reason: "Excessive repetitive characters or gibberish detected" };
  }

  // 3. Repetitive Words: 3+ identical consecutive words
  if (/\b([a-z0-9]{2,})\s+\1\s+\1\b/i.test(text)) {
    return { flagged: true, reason: "Repetitive word spam detected" };
  }

  // 4. Excessive Shouting: >= 12 chars with > 75% uppercase
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 12) {
    const upper = text.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.75) {
      return { flagged: true, reason: "Excessive ALL-CAPS text (shouting)" };
    }
  }

  // 5. Excessive Punctuation: 4+ repeated symbols
  if (/([!$?*#]{4,})/.test(text)) {
    return { flagged: true, reason: "Excessive punctuation detected" };
  }

  return { flagged: false };
}

/**
 * Validates website link against malicious schemes, raw IPs, localhost, and invalid formats.
 */
export function validateUrl(rawUrl: string): { valid: boolean; reason?: string } {
  const url = rawUrl.trim();
  if (!url) return { valid: true }; // Optional field

  if (url.length > 120) {
    return { valid: false, reason: "URL exceeds maximum length of 120 characters" };
  }

  // Malicious protocols & script injection
  const lower = url.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("blob:") ||
    lower.includes("<script") ||
    lower.includes("onload=") ||
    lower.includes("onerror=")
  ) {
    return { valid: false, reason: "Prohibited or unsafe URL scheme" };
  }

  // Ensure valid URL structure
  const testTarget = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let parsed: URL;
  try {
    parsed = new URL(testTarget);
  } catch {
    return { valid: false, reason: "Invalid website URL format" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Localhost & Loopback
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    return { valid: false, reason: "Localhost or private loopback URLs are not allowed" };
  }

  // Private / Raw IPv4 Addresses
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return { valid: false, reason: "Raw IP addresses are not permitted as product links" };
  }

  // Must have a valid top-level domain with at least two levels (e.g. domain.com)
  const parts = hostname.split(".");
  if (parts.length < 2 || parts[parts.length - 1].length < 2 || !/^[a-z0-9-]+$/i.test(parts[parts.length - 1])) {
    return { valid: false, reason: "URL must contain a valid domain name" };
  }

  return { valid: true };
}

/**
 * Validates maker handle against syntax, length, profanity, and system impersonation.
 */
export function validateHandle(rawHandle: string): { valid: boolean; reason?: string } {
  const trimmed = rawHandle.trim();
  if (!trimmed) return { valid: true }; // Fallbacks to @anon if empty

  // Normalize leading '@'
  const clean = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

  if (clean.length < 2) {
    return { valid: false, reason: "Handle must be at least 2 characters" };
  }
  if (clean.length > 30) {
    return { valid: false, reason: "Handle cannot exceed 30 characters" };
  }

  // Character set: alphanumeric, underscores, dots, dashes
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return { valid: false, reason: "Handle can only contain letters, numbers, underscores, dashes, and dots" };
  }

  // Reserved system impersonation
  if (RESERVED_HANDLES.has(clean.toLowerCase())) {
    return { valid: false, reason: `The handle '@${clean}' is reserved by the platform` };
  }

  // Profanity check on handle
  const profanityCheck = checkProfanityAndAbuse(clean);
  if (profanityCheck.flagged) {
    return { valid: false, reason: "Handle contains inappropriate language" };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// 4. Primary Orchestration API
// ---------------------------------------------------------------------------

/**
 * Runs full rule-based moderation engine across all sticky note input fields.
 */
export function moderateStickyNote(input: ModerationInput): ModerationResult {
  const violations: ModerationViolation[] = [];

  const name = (input.name || "").trim();
  const tagline = (input.tagline || "").trim();
  const url = (input.url || "").trim();
  const maker = (input.maker || "").trim();

  // 1. PRODUCT NAME RULES
  if (!name) {
    violations.push({
      field: "name",
      rule: "NAME_REQUIRED",
      message: "Product name is required",
    });
  } else if (name.length < 2) {
    violations.push({
      field: "name",
      rule: "NAME_TOO_SHORT",
      message: "Product name must be at least 2 characters",
    });
  } else if (name.length > 40) {
    violations.push({
      field: "name",
      rule: "NAME_TOO_LONG",
      message: "Product name cannot exceed 40 characters",
    });
  } else if (!/[a-zA-Z0-9]/.test(name)) {
    violations.push({
      field: "name",
      rule: "NAME_NO_ALPHANUMERIC",
      message: "Product name must contain alphanumeric characters",
    });
  } else {
    // Profanity & Abuse
    const profCheck = checkProfanityAndAbuse(name);
    if (profCheck.flagged) {
      violations.push({
        field: "name",
        rule: "NAME_PROFANITY",
        message: `Product name: ${profCheck.reason}`,
      });
    }

    // Spam Patterns
    const spamCheck = checkSpamPatterns(name);
    if (spamCheck.flagged) {
      violations.push({
        field: "name",
        rule: "NAME_SPAM",
        message: `Product name: ${spamCheck.reason}`,
      });
    }
  }

  // 2. ONE-LINE PITCH (TAGLINE) RULES
  if (!tagline) {
    violations.push({
      field: "tagline",
      rule: "TAGLINE_REQUIRED",
      message: "One-line pitch is required",
    });
  } else if (tagline.length < 5) {
    violations.push({
      field: "tagline",
      rule: "TAGLINE_TOO_SHORT",
      message: "Pitch must be at least 5 characters",
    });
  } else if (tagline.length > 80) {
    violations.push({
      field: "tagline",
      rule: "TAGLINE_TOO_LONG",
      message: "Pitch cannot exceed 80 characters",
    });
  } else {
    // Profanity & Abuse
    const profCheck = checkProfanityAndAbuse(tagline);
    if (profCheck.flagged) {
      violations.push({
        field: "tagline",
        rule: "TAGLINE_PROFANITY",
        message: `Pitch: ${profCheck.reason}`,
      });
    }

    // Spam Patterns
    const spamCheck = checkSpamPatterns(tagline);
    if (spamCheck.flagged) {
      violations.push({
        field: "tagline",
        rule: "TAGLINE_SPAM",
        message: `Pitch: ${spamCheck.reason}`,
      });
    }
  }

  // 3. WEBSITE LINK (URL) RULES
  if (url) {
    const urlCheck = validateUrl(url);
    if (!urlCheck.valid) {
      violations.push({
        field: "url",
        rule: "URL_INVALID",
        message: `Website link: ${urlCheck.reason}`,
      });
    }
  }

  // 4. MAKER HANDLE RULES
  if (maker) {
    const handleCheck = validateHandle(maker);
    if (!handleCheck.valid) {
      violations.push({
        field: "maker",
        rule: "MAKER_INVALID",
        message: `Maker handle: ${handleCheck.reason}`,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
