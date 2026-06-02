# Phase 7 — Social: Guilds, Leaderboards, Co-Quests

> Prerequisites: Phase 6 complete.  
> Goal: introduce social and collaborative gameplay to drive retention and virality.

---

## Goals

- Guild system (create, join, manage learning guilds)
- Global and guild leaderboards (XP, stages, streaks)
- Co-quests (two players simultaneously complete a challenge)
- Guild XP pool and collective progression
- Social presence (who's online, who's playing)
- Friend system (follow, send challenges, compare progress)

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | Guild creation + join flow |
| 2 | Guild dashboard (members, collective XP, leaderboard) |
| 3 | Global XP leaderboard (weekly reset) |
| 4 | Co-quest engine (WebSocket-based two-player sync) |
| 5 | Presence system (online indicator, "currently playing" status) |
| 6 | Friend system (follow, challenge, compare) |
| 7 | Push notifications for guild events |
| 8 | Guild achievements (collective unlock milestones) |

---

## Architecture Changes

### WebSocket Layer
- Use Socket.io or native WebSockets via a Hono WS service
- Phase 7 is the trigger to extract backend to standalone service (see migration notes)
- Real-time events: co-quest sync, presence updates, guild notifications

### Co-Quest Protocol
```
Player A joins stage → creates co-quest room
Player B joins via invite link
Both see synced challenge state
First to answer correctly wins the point
Post-session: both get XP (winner bonus)
```

### New Tables
- `guilds` — name, description, created_by, max_members
- `guild_members` — guild_id × player_id × role
- `guild_xp_events` — audit log of guild XP contributions
- `co_quest_sessions` — session_id, player_a, player_b, result
- `friendships` — player_id × friend_id × status
- `leaderboard_snapshots` — weekly snapshots (never delete for history)

---

## Risks

| Risk | Mitigation |
|---|---|
| WebSocket complexity | Use managed service (Ably, Pusher) before self-hosting |
| Co-quest sync latency | Operational transforms for challenge state |
| Toxic guild behavior | Moderation tools + report system |

---

## Scalability Notes

- Guild system is modular — can be disabled per deployment (enterprise use case)
- Leaderboards use pre-computed snapshots — not live aggregation
- WebSocket service is horizontally scalable (stateless + Redis pub/sub)

---

## Migration Notes (to Phase 8)

- Guild system becomes foundation for enterprise team training in Phase 8
- Creator marketplace requires guild-style "team" concept
