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
- **Deadline reminders** — upcoming deadlines surface on your dashboard, 
  colour-coded by urgency
- **Bursary listings** — search, filter by type (county/CDF/university/NGO/ 
  private/government) and county

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (server-side) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email confirmation) |
| AI | Anthropic API (Claude Sonnet) |
| Deployment | Vercel |

---

## Architecture
src/

app/

(auth)/           # Auth pages — login, signup, callback

api/match/        # Server-side API route — calls Anthropic API

bursaries/        # Listings page + [id] detail page

bursaries/matched # AI-ranked matched bursaries page

applications/     # Application tracker

dashboard/        # Home dashboard with stats

onboarding/       # Profile setup

components/

Navbar.tsx        # Shared navigation

lib/

supabase.ts       # Client-side Supabase client

supabase.server.ts # Server-side Supabase client

supabase/

migrations/         # Database schema SQL

---

## Database Schema

- **profiles** — student profile (education level, county, institution, 
  income bracket, notification preferences)
- **bursaries** — bursary listings (provider, type, eligibility criteria, 
  deadline, documents required)
- **applications** — junction table tracking which bursaries a student 
  has saved/applied to
- **notifications_log** — audit trail of deadline reminders sent

Row Level Security (RLS) enabled on all tables. Students can only 
read/write their own data. Bursaries are publicly readable.

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
# Add your Supabase URL, anon key, and Anthropic API key

# Run database migrations
# Copy SQL from supabase/migrations/001_initial_schema.sql
# and run in Supabase SQL Editor

# Start dev server
npm run dev
```

### Environment Variables
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

ANTHROPIC_API_KEY=


## The Problem This Solves

Kenya has hundreds of bursaries available annually — county governments, 
CDF committees, universities, NGOs, and private sector all offer funding. 
But:

- Information is scattered across broken PDFs, physical offices, 
  and WhatsApp groups
- Students find out about bursaries after deadlines have passed
- No eligibility matching — students read through dozens of irrelevant 
  listings

Elimisha fixes all three. Built by a Kenyan student, for Kenyan students.

---

## Built By

**Catherine Muindi** — Backend & AI Engineer, Nairobi Kenya  
[GitHub](https://github.com/MuindiKate) · 
[Portfolio](https://catherinemuindi.netlify.app)
