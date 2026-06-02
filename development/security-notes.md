# Security Notes

> Security considerations, threat model, and mitigations.

---

## Threat Model

| Threat | Vector | Impact |
|---|---|---|
| Session hijacking | Cookie theft | Account takeover |
| XSS | User-generated content | Session theft, data exfiltration |
| SQL injection | Unvalidated API inputs | Data breach |
| AI prompt injection | Malicious user input in AI context | Inappropriate AI output |
| API abuse | Unauthenticated or overuse | Cost overrun, DoS |
| Insecure content | Malicious world JSON | XSS via rendered content |

---

## Authentication Security

- Sessions: HTTP-only, Secure, SameSite=Strict cookies (Better Auth defaults)
- CSRF: Better Auth uses SameSite cookies + CSRF token for mutations
- Password hashing: bcrypt (Better Auth default, cost factor ≥ 12)
- Email verification: required before game access
- OAuth: state parameter validated, no implicit flow

---

## API Security

- All mutations require valid session — `requireAuth()` called at top of every handler
- All inputs validated with Zod before processing — no raw `req.body` usage
- Parameterized queries via Drizzle — no raw SQL string concatenation
- Rate limiting on AI endpoint (per player, per day)
- AI endpoint: auth required — never publicly accessible

---

## AI Prompt Injection

User inputs that appear in AI prompts must be sanitized:

```typescript
function sanitizeForPrompt(input: string): string {
  // Remove prompt injection patterns
  return input
    .replace(/ignore previous instructions/gi, '[removed]')
    .replace(/you are now/gi, '[removed]')
    .slice(0, 500)  // hard length cap
}
```

Player-generated text (quest answers, free text) is always in a clearly delimited section of the prompt, wrapped in XML-like tags:

```
<player_input>
{sanitized_input}
</player_input>
```

---

## Content Security

- World JSON and Knowledge JSON are only loaded from the bundled `src/content/` directory (Phase 1)
- Phase 4+: creator-submitted content goes through a review queue before publish
- Rendered `storyIntro.text` and `concept.chunks` use a safe markdown renderer (no raw HTML)
- `codeExample` content is rendered in a syntax highlighter (no `eval`, no `innerHTML`)

---

## Environment Variables

- No secrets in client-side code (`NEXT_PUBLIC_` prefix only for non-sensitive values)
- `ANTHROPIC_API_KEY` used only on server — never exposed to browser
- Rotate secrets on any team member departure
- All secrets in Vercel Environment Variables (not in code or `.env` committed to git)

---

## Headers (Next.js)

```typescript
// next.config.ts
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
  }
]
```

---

## OWASP Top 10 Checklist

| # | Risk | Status |
|---|---|---|
| A01 | Broken Access Control | Mitigated: auth on all mutations, no IDOR (UUID PKs) |
| A02 | Cryptographic Failures | Mitigated: bcrypt, HTTPS only, no sensitive data in logs |
| A03 | Injection | Mitigated: Drizzle parameterized queries, Zod validation |
| A04 | Insecure Design | Mitigated: threat model defined, auth architecture reviewed |
| A05 | Security Misconfiguration | Mitigated: security headers, environment separation |
| A06 | Vulnerable Components | Mitigated: `npm audit` in CI, Dependabot |
| A07 | Auth & Session | Mitigated: Better Auth, HTTP-only cookies |
| A08 | Software Integrity | Mitigated: lockfile committed, CI builds from lockfile |
| A09 | Logging & Monitoring | Partial: Phase 1 has error logs; full observability in Phase 6 |
| A10 | SSRF | Low risk: no user-supplied URLs fetched by server |
