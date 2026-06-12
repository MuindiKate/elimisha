-- Enable UUID generation
-- Supabase needs this extension to auto-generate unique IDs for every row
create extension if not exists "uuid-ossp";

-- ENUM TYPES
-- Enums are like dropdown options at the database level
-- They enforce that a field can only contain specific values

create type education_level as enum (
  'certificate', 'diploma', 'undergraduate', 'postgraduate'
);

create type income_bracket as enum (
  'below_10k', '10k_50k', '50k_150k', 'above_150k'
);

create type bursary_type as enum (
  'county', 'cdf', 'university', 'ngo', 'private', 'government'
);

create type application_status as enum (
  'saved', 'applied', 'pending', 'awarded', 'rejected'
);

create type notification_type as enum (
  'deadline_7days', 'deadline_3days', 'deadline_1day'
);

create type notification_channel as enum (
  'email', 'sms'
);

-- TABLES
-- PROFILES TABLE
-- Extends Supabase's built-in auth.users table
-- One row per user, stores everything about the student
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  level_of_education education_level,
  institution text,
  course_of_study text,
  year_of_study integer,
  county_of_origin text,
  income_bracket income_bracket,
  phone_number text,
  notifications_email boolean default true,
  notifications_sms boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BURSARIES TABLE
-- Stores every bursary and scholarship listing on the platform
-- This is the core table everything else revolves around
create table bursaries (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  provider text not null,
  type bursary_type not null,
  amount_min integer,
  amount_max integer,
  deadline date not null,
  -- Arrays let us store multiple values in one field
  -- e.g. eligibility_counties = ['Nairobi', 'Kisumu', 'Mombasa']
  -- Empty array means open to everyone
  eligibility_counties text[] default '{}',
  eligibility_levels education_level[] default '{}',
  eligibility_income_max integer,
  eligibility_courses text[] default '{}',
  description text,
  how_to_apply text,
  documents_required text[] default '{}',
  external_link text,
  -- is_active lets us hide expired bursaries without deleting them
  is_active boolean default true,
  created_at timestamptz default now()
);

-- APPLICATIONS TABLE
-- Junction table between profiles and bursaries
-- Tracks every bursary a student has saved, applied to, or heard back from
-- One student can have many applications, one bursary can have many applicants
create table applications (
  id uuid default gen_random_uuid() primary key,
  -- references means this field must match an existing id in that table
  -- on delete cascade means if the student or bursary is deleted, 
  -- their application records are deleted too
  user_id uuid references profiles(id) on delete cascade not null,
  bursary_id uuid references bursaries(id) on delete cascade not null,
  status application_status default 'saved',
  notes text,
  applied_at timestamptz,
  created_at timestamptz default now(),
  -- unique constraint prevents a student from saving the same bursary twice
  unique(user_id, bursary_id)
);

-- NOTIFICATIONS LOG TABLE
-- Records every reminder we send to a student
-- Two purposes:
-- 1. Prevents sending the same reminder twice (e.g. two 7-day warnings)
-- 2. Gives us an audit trail of all communications sent
create table notifications_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  bursary_id uuid references bursaries(id) on delete cascade not null,
  type notification_type not null,
  channel notification_channel not null,
  sent_at timestamptz default now(),
  -- unique constraint means we can never send the same notification
  -- type to the same user for the same bursary twice
  unique(user_id, bursary_id, type, channel)
);

-- RLS POLICIES
-- These rules run on every database request automatically
-- Think of them as security guards at the database level

-- PROFILES
-- Users can only read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can only insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- BURSARIES
-- Anyone can read bursaries including logged out visitors
create policy "Bursaries are publicly readable"
  on bursaries for select
  using (true);

-- APPLICATIONS
-- Students can only see their own applications
create policy "Users can view own applications"
  on applications for select
  using (auth.uid() = user_id);

-- Students can create their own applications
create policy "Users can insert own applications"
  on applications for insert
  with check (auth.uid() = user_id);

-- Students can update their own applications
create policy "Users can update own applications"
  on applications for update
  using (auth.uid() = user_id);

-- Students can delete their own applications
create policy "Users can delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

-- NOTIFICATIONS LOG
-- Users can only see their own notification history
create policy "Users can view own notifications"
  on notifications_log for select
  using (auth.uid() = user_id);