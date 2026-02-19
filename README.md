# Mindset Stack Mobile App Product Design

## 1) App structure (navigation + screens)

### Navigation model
- **Bottom navigation (5 tabs)**
  1. **Home** (Daily Dashboard)
  2. **Areas** (Study, Work, Sport, Relationships, Nutrition)
  3. **Progress** (stats, levels, achievements)
  4. **Social** (friends, groups, leaderboard, challenges)
  5. **Settings** (profile, integrations, notifications)

- **Global quick actions**
  - Floating **"+ Complete"** action on Home and Area screens.
  - Global notifications inbox (challenge invites, streak reminders).

### Primary screens
1. **Onboarding**
2. **Home Dashboard**
3. **Area Detail** (5 area-specific templates)
4. **Task Completion Flow**
5. **Progress & Stats**
6. **Friends + Leaderboard**
7. **Integrations Setup**
8. **Settings**

---

## 2) Key features per screen

## Onboarding (under 2 minutes)
**Goal:** get user into first “win” fast.

- Welcome + value proposition in 2 slides max.
- Create account (Apple/Google/email).
- Select 1–3 **focus areas** initially (can enable all later).
- Set motivation profile:
  - “Build consistency”
  - “Improve performance”
  - “Compete with friends”
- Choose daily intensity:
  - Light (5–10 min)
  - Standard (15–30 min)
  - Ambitious (30+ min)
- Optional integrations prompt (skip allowed).
- Finish by generating today’s first action list.

## Home Dashboard
**Goal:** user can complete most actions in 1–2 taps.

- **Today’s recommended actions** card list grouped by area.
- **Universal Daily Point (UDP)** progress bar (resets daily).
- Streak chips:
  - Global streak
  - Per-area streaks (Study/Work/Sport/Relationships/Nutrition)
- Daily score + weekly score snapshot.
- “Complete” button on each action (tap once, confirm once).
- Optional “proof available” icon for connected integrations.
- Smart reorder: unfinished actions shown first, easiest wins surfaced.

## Area Detail Screens (5 sections)
Each area shares common layout + area-specific modules.

- Header: area level, streak, this week score.
- Today / This week tasks tabs.
- Skills progression tree (micro-levels).
- Area goals (weekly + monthly).
- History timeline.
- Area-specific modules:
  - **Study:** quizzes, reading minutes, concept mastery
  - **Work:** deep work blocks, milestone checklist, project progress
  - **Sport:** sessions, PR tracking, fitness test import
  - **Relationships:** outreach goals, call logs, reflection prompts
  - **Nutrition:** meal consistency, hydration, balanced plate tracking

## Task Completion Flow
- 1-tap complete for manual tasks.
- Optional evidence step:
  - quick note/photo
  - imported integration event (auto-validated)
- Confirmation micro-animation + points awarded breakdown:
  - base points
  - streak bonus
  - challenge bonus
- Undo window (e.g., 30 seconds) to prevent mistakes.

## Progress + Stats
- Daily/weekly/monthly charts for score and completion rate.
- XP, current level, next level requirements.
- Badges with locked/unlocked states.
- Consistency heatmap (calendar view).
- Area balance meter (prevents single-area tunnel vision).

## Friends + Leaderboard
- Add friends via username/QR/invite link.
- Create private groups (friends, team, class).
- Leaderboards:
  - daily / weekly / monthly tabs
  - friends-only and group-specific views
- Challenges:
  - personal 7-day/30-day challenges
  - friend challenges (1v1 or group)
- Social feed events (lightweight): “Alex reached 7-day Sport streak”.

## Integrations Setup
- Connection hub with clear statuses:
  - Connected
  - Needs permission
  - Last synced X min ago
- Data sync settings per integration (read-only toggles).
- Source priority settings (manual vs integration conflict handling).

## Settings
- Profile and timezone/day reset settings.
- Notification preferences (streak reminders, challenge alerts).
- Privacy controls:
  - hide certain areas from friends
  - proof visibility settings
- Data export/delete account.

---

## 3) Data model overview

## Core entities

### User
- `user_id`
- profile info (name, avatar, locale=English)
- onboarding preferences (focus areas, intensity)
- privacy settings
- level/xp totals

### Area
- `area_id` (Study/Work/Sport/Relationships/Nutrition)
- metadata (icon, color, weighting defaults)

### TaskTemplate
- `template_id`
- area, type (daily/weekly)
- recommended effort/time
- base point value
- validation mode (manual/integration/hybrid)

### UserTaskInstance
- `task_id`
- user_id, area_id, date
- status (pending/completed/skipped)
- completion timestamp
- evidence pointer (optional)
- points awarded breakdown

### Streak
- `streak_id`
- user_id
- scope (global or area-specific)
- current count
- best count
- last completion date

### PointLedger
- `entry_id`
- user_id
- date
- source (task/streak/challenge/achievement)
- points (UDP contribution + XP)
- reversible flag

### DailyScoreSnapshot
- user_id, date
- UDP total
- completion percent
- areas covered count

### XPLevel
- user_id
- total_xp
- current_level
- rank tier (Bronze/Silver/Gold/etc.)

### Challenge
- `challenge_id`
- type (personal/friend/group)
- duration (7/30/custom)
- target metric (points, completions, streak)
- participants
- status

### Friendship / Group
- friendship edges, group membership, roles, invite states.

### LeaderboardEntry
- period (daily/weekly/monthly)
- scope (friends/group/global optional)
- rank, score, tie-break metadata

### IntegrationConnection
- provider (Apple Health, Google Fit, Club API, Sport Tester API)
- auth tokens (secure storage)
- sync cursor + last sync status

### IntegrationEvent
- normalized external activity event
- mapped user task link
- confidence/verification status

---

## 4) Gamification system rules (scoring + streaks)

## Universal Daily Point (UDP)
- Single daily metric to simplify motivation.
- Calculated from all completed actions across all areas.
- Resets at local midnight (user timezone).
- Displayed as:
  - numeric score (e.g., 68/100)
  - completion ring/bar
- Daily cap prevents grinding one area only.

### Suggested UDP formula (MVP)
- `UDP = sum(base_task_points + bonuses)` with soft cap = 100/day.
- Area balance bonus: +5 if user completes at least 3 areas/day.
- Full-spectrum bonus: +10 for all 5 areas in a day.

## XP and levels
- XP is long-term and **does not reset**.
- Every UDP point contributes to XP at fixed ratio (e.g., 1 UDP = 1 XP).
- Milestones unlock rank tiers and cosmetic rewards.

## Streak rules
- **Global streak**: continues if user reaches minimum UDP threshold/day (e.g., 30).
- **Area streak**: continues if at least 1 action completed in that area/day.
- Grace mechanic (optional): 1 freeze token/month to protect from accidental miss.

## Challenge scoring
- 7-day and 30-day challenge templates.
- Win conditions:
  - highest cumulative UDP
  - longest streak
  - specific area target
- Anti-cheat:
  - manual completion allowed
  - “verified” label if backed by integration data
  - suspicious spikes flagged for soft review

## Achievements / badges
- Milestone-based and readable:
  - “7-day global streak”
  - “First 1000 XP”
  - “Sport consistency: 20 sessions”
- Badge rarity tiers encourage long-term retention.

## Motivation guardrails
- Keep cognitive load low with max 5–8 daily actions by default.
- Celebrate partial completion, not all-or-nothing.
- Gentle reminders, no punitive language.

---

## 5) Integration plan (what data we read/write)

## A) Sport tester / fitness testing integration
**Examples:** VO2 max tests, sprint times, strength benchmarks.

- **Read:** test results, timestamps, test type, score/value.
- **Write:** optional export of app challenge context (if API supports).
- **Use in app:**
  - auto-update Sport metrics
  - unlock verified performance achievements
  - adjust recommended sport tasks based on latest baseline

## B) Clubs / classes / circles integration
**Examples:** attendance systems, training class check-ins.

- **Read:** attendance records, session duration, class type.
- **Write:** optional RSVP or attendance confirmation (if supported).
- **Use in app:**
  - auto-complete session tasks
  - challenge validation for consistency
  - group leaderboards for club cohorts

## C) Health/Fitness integration (Apple Health / Google Fit)
- **Read:** steps, active energy, workouts, heart rate zones, sleep (optional), hydration (if available).
- **Write (minimal):** workout/session markers if user enables write access.
- **Use in app:**
  - passive progress credit (e.g., steps contribute to Sport/Nutrition goals)
  - evidence for anti-cheat “verified” completions
  - smarter recommendations (recover/rest prompts)

## Integration architecture principles
- OAuth-based secure auth.
- Read-only by default; explicit opt-in for writes.
- Normalized event schema across providers.
- Background sync + manual refresh fallback.
- Clear data provenance on every verified task.

---

## 6) MVP scope (ship fast)

## MVP (Phase 1)
1. English-only iOS/Android app with polished core UI.
2. Onboarding + focus area selection.
3. Home dashboard with daily recommended actions.
4. Manual task completion flow with 1–2 taps.
5. UDP, daily/weekly score, XP levels, global + area streaks.
6. Basic personal challenges (7-day, 30-day).
7. Friends add + simple leaderboard (weekly).
8. One health integration path (Apple Health on iOS / Google Fit on Android).
9. Settings + notifications + privacy basics.

## Non-goals for MVP
- Advanced AI coaching.
- Complex marketplace or monetization layers.
- Deep enterprise analytics.

---

## 7) Phase 2 improvements

1. Full multi-provider integrations (sport testers, clubs/classes APIs).
2. Group challenges, seasonal leagues, and rotating themed events.
3. Smart adaptive recommendations (based on behavior and recovery).
4. Rich social features (comments/reactions, accountability partners).
5. Advanced anti-cheat confidence scoring.
6. Deeper stats:
   - predictive streak risk
   - area imbalance alerts
   - month-over-month growth insights
7. Web companion dashboard.
8. Coach/admin mode for clubs and circles.

---

## 8) UX style system guidance
- Minimal, modern, premium visual language.
- Generous spacing, high contrast, touch targets 44px+.
- Clear iconography per life area.
- Motion used sparingly for rewards and transitions.
- English-only copy with short, action-driven wording.
- Accessibility baseline:
  - dynamic text sizing
  - screen reader labels
  - color-safe status indicators
