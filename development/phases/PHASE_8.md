# Phase 8 — Creator Marketplace, Enterprise, Public API

> Prerequisites: Phase 7 complete.  
> Goal: transform ForgeMinds from a product into a platform.

---

## Goals

- Open creator marketplace (publish, discover, purchase worlds)
- Enterprise training mode (org management, team analytics, custom branding)
- Public API (third-party integrations, LMS connectors, webhook system)
- Revenue infrastructure (Stripe subscriptions, creator payouts)
- White-label capability (custom domains, brand themes)

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | Marketplace browse + search (worlds by creator, topic, rating) |
| 2 | Creator monetization (free / paid world pricing) |
| 3 | Stripe Checkout integration for paid worlds |
| 4 | Creator payout dashboard (revenue share) |
| 5 | Enterprise org management (`/org` admin portal) |
| 6 | Team assignment: assign worlds to team members |
| 7 | Manager analytics: completion rates, XP, time-on-task |
| 8 | Public REST API with API key auth |
| 9 | Webhook system: progress events pushed to external systems |
| 10 | LMS connector: SCORM / xAPI export |
| 11 | White-label config: domain, logo, color scheme |

---

## Architecture Changes

### New Route Groups
```
src/app/
├── (marketplace)/         ← public marketplace
├── (org)/                 ← enterprise org portal
└── (api-docs)/            ← public API documentation
```

### Public API Design
```
GET  /v1/player/{id}/progress
GET  /v1/worlds
GET  /v1/worlds/{id}/stages
POST /v1/webhooks/register
```

Authentication: API key (Bearer token), scoped to org or creator account.

### Revenue Model
- Free tier: 3 worlds, 1 active player slot
- Player Pro: unlimited worlds, all features, $X/mo
- Creator: publish worlds, revenue share, analytics
- Enterprise: org management, SSO, custom branding, SLA

---

## Enterprise Features

### Org Model
```
Organization
  └── Teams (e.g., Engineering, Sales, Onboarding)
        └── Members
              └── Assigned Worlds + Progress
```

### SSO
- SAML 2.0 / OIDC via Better Auth enterprise plugin
- Group sync from IdP (Azure AD, Okta)

---

## Risks

| Risk | Mitigation |
|---|---|
| Payment fraud | Stripe Radar + manual review for high-value payouts |
| Content quality in marketplace | Rating system + abuse reporting + creator reputation score |
| Enterprise SLA obligations | Dedicated infrastructure tier; SLA monitoring |
| API abuse | Rate limiting per API key; usage quotas |

---

## Scalability Notes

- Marketplace is a separate service in Phase 8 — doesn't affect core game
- Public API is stateless — horizontally scalable
- White-label achieved via org config table + CSS variable injection — no code forks

---

## Final Architecture at Phase 8

```
Player App (Next.js)
Creator Portal (Next.js)
Enterprise Portal (Next.js)
Marketplace (Next.js)
  ↕
API Gateway (Hono + Node)
  ├── Auth Service (Better Auth)
  ├── Game API
  ├── AI Service
  ├── Content Service
  └── Payment Service (Stripe)
        ↕
PostgreSQL (primary) + Read Replicas
Redis (cache + pub/sub)
S3/R2 (assets)
```
