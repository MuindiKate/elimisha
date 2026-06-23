# Elimisha 🎓

> **Find bursaries and scholarships matched to you**

Elimisha is an AI-powered bursary finder for Kenyan students. Hundreds of
bursaries exist across county governments, CDFs, universities, and NGOs —
but the information is fragmented across broken websites, WhatsApp groups,
and physical notice boards. Most students who qualify never apply because
they never find out in time.

Elimisha centralises all of this, matches students by eligibility using AI,
and sends deadline reminders before opportunities close.

🔗 **Live:** [elimisha-xi.vercel.app](https://elimisha-xi.vercel.app)

---

## Features

- **Smart matching** — set up your profile once (county, institution,
  course, income bracket) and get bursaries ranked by AI fit score
- **AI match score** — each bursary shows a 0–100 match score with an
  explanation and application tip powered by Claude (Anthropic API)
- **Progressive scoring** — matched bursaries page scores all opportunities
  in real time, results appear as they're analysed
- **Application tracker** — save bursaries, mark as applied, track status
  from saved → applied → pending → awarded
- **Deadline reminders** — email notifications sent 7, 3, and 1 day before
  deadlines close, with deduplication to prevent repeat alerts
- **Deadline urgency** — upcoming deadlines colour-coded by urgency across
  all pages (red = ≤7 days, orange = ≤30 days)
- **Bursary listings** — search, filter by type (county/CDF/university/NGO/
  private/government) and county
- **Protected routes** — all student data protected by Supabase Row Level
  Security at the database level

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (server-side) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email confirmation flow) |
| AI | Anthropic API — Claude Sonnet 4.6 |
| Email | Resend (deadline reminder notifications) |
| Deployment | Vercel (CI/CD — auto-deploys on push to main) |

---

## Architecture
src/

app/

(auth)/               # Route group — login, signup, email callback

api/

match/              # POST — calls Anthropic API, returns match score

notifications/      # POST — sends deadline reminder emails via Resend

bursaries/

page.tsx            # Listings with search + filters

[id]/page.tsx       # Individual bursary detail + AI match score

matched/page.tsx    # AI-ranked bursaries page (progressive scoring)

applications/         # Application tracker with status management

dashboard/            # Home — stats, quick actions, upcoming deadlines

onboarding/           # Student profile setup

components/

Navbar.tsx            # Shared nav — active links, logout

NotifyButton.tsx      # Client component — triggers notification API

lib/

supabase.ts           # Browser-side Supabase client

supabase.server.ts    # Server-side client + admin client (service role)

supabase/

migrations/

001_initial_schema.sql  # Full DB schema — enums, tables, RLS policies

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Student profile — education level, county, institution, income bracket, notification preferences |
| `bursaries` | Bursary listings — provider, type, eligibility criteria, deadline, documents required |
| `applications` | Junction table — tracks which bursaries a student has saved or applied to |
| `notifications_log` | Audit trail of every reminder sent — prevents duplicate alerts |

### Security
- Row Level Security (RLS) enabled on all tables
- Students can only read and write their own profile and applications
- Bursaries are publicly readable (no auth required to browse)
- Admin operations (sending notifications) use a service role client — server-side only, never exposed to the browser
- Auth trigger automatically creates a profile row on signup

### Key Design Decisions
- `eligibility_counties` and `eligibility_levels` stored as PostgreSQL arrays — enables clean containment queries (`@>`) for matching
- `notifications_log` has a unique constraint on `(user_id, bursary_id, type, channel)` — database-level guarantee against duplicate notifications
- `applications` has a unique constraint on `(user_id, bursary_id)` — upsert pattern prevents duplicate saves

---

## AI Integration

### Match Score (`/api/match`)
Accepts a student profile and a bursary. Sends both to Claude Sonnet via the Anthropic API with a structured prompt. Returns:
- `score` — 0 to 100 fit score
- `eligible` — boolean eligibility assessment
- `reason` — one sentence explaining the score
- `tip` — one practical application tip

### Matched Bursaries Page
Fetches all active bursaries, then scores each one sequentially against the student's profile. Results appear progressively as each score returns — the list re-ranks in real time as new scores arrive.

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/MuindiKate/elimisha.git
cd elimisha

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values (see Environment Variables section below)

# Run database migrations
# Copy SQL from supabase/migrations/001_initial_schema.sql
# Paste and run in your Supabase project's SQL Editor

# Start dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

```bash
# Supabase — get from Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-side only, never expose to browser

# Anthropic — get from console.anthropic.com
ANTHROPIC_API_KEY=

# Resend — get from resend.com (email notifications)
RESEND_API_KEY=
```

### Supabase Setup Notes
- After creating your project, run the full migration SQL in the SQL Editor
- Go to Authentication → URL Configuration and set:
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000/callback`
- For production, update both to your deployed URL

---

## The Problem This Solves

Kenya has hundreds of bursaries available annually — county governments,
CDF committees, universities, NGOs, and private sector all offer funding.
But:

- Information is scattered across broken PDFs, physical offices,
  and WhatsApp groups
- Students find out about bursaries after deadlines have passed
- No eligibility matching — students read through dozens of irrelevant
  listings

The result: most students who qualify for funding never access it — not
because the money doesn't exist, but because they never found out in time.

Elimisha fixes all three. Built by a Kenyan student, for Kenyan students.

---

## Roadmap

- [ ] Community bursary submissions (with admin approval flow)
- [ ] Document vault — upload once, reuse across applications
- [ ] AI essay assistant — personal statement drafting per bursary
- [ ] SMS notifications via Africa's Talking
- [ ] Admin dashboard for managing bursary listings
- [ ] Public API for third-party integrations (university portals, NGOs)
- [ ] Verified domain for production email sending

---

## Built By

**Catherine Muindi** — Backend & AI Engineer.



[GitHub](https://github.com/MuindiKate) ·
[Portfolio](https://catherinemuindi.netlify.app) ·
[Elimisha](https://elimisha-xi.vercel.app)

---

*Elimisha — Swahili for "to educate" or "to cause to learn."*
