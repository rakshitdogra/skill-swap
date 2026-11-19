# SkillSwap

<div align="center">

<img src="./public/logo.png" alt="SkillSwap Logo" width="120" />

### **A Reciprocal Peer-to-Peer Skill Exchange Platform**

*Trade knowledge directly with passionate peers. Teach what you love, learn what you desire — 100% free, barter-powered learning.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Reciprocal Algorithm](#-smart-reciprocal-matching-algorithm) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [Database Setup](#-supabase-database-schema) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**SkillSwap** is a modern collaborative web application designed to democratize learning through direct peer-to-peer exchanges. Instead of paying hefty course fees or subscriptions, community members teach subjects they are experienced in (e.g., UI/UX Design, React, Digital Marketing) in exchange for personalized instruction in skills they want to acquire (e.g., Python, Video Editing, Music Production).

Built using **Next.js 14**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Supabase**, SkillSwap provides a seamless authenticated platform featuring real-time reciprocal matching, comprehensive profile management, full session lifecycles with reschedule negotiation, verifiable peer ratings, and an in-app notification center.

---

## ✨ Key Features

### 🎯 Smart Reciprocal Matching
- **Automated Two-Way Compatibility**: Calculates compatibility scores (up to 99%) by analyzing overlap between your teaching roster and other members' learning wishlists.
- **Mutual Value Proposition**: Immediately highlights complementary exchange pairs (e.g., *"You teach React, they teach Figma"*).
- **Filtering & Search**: Filter members by domain categories (*Engineering, Design, Marketing, Media, Languages, Music*), keyword, rating, and availability.

### 👤 Rich Member Profiles & Skill Rosters
- **Teach Skills**: Categorized skills with proficiency levels (*Beginner, Intermediate, Advanced, Expert*), years of experience, and custom descriptions.
- **Learn Wishlist**: Skills you want to learn with urgency priorities (*High, Medium, Low*), current proficiency, and specific learning milestones.
- **Availability Schedule**: Detailed weekly time slots and preferred days.
- **Custom Privacy**: Toggle profile visibility between `public`, `members_only`, and `paused`.

### 📅 End-to-End Session Lifecycle Management
- **1:1 Session Proposals**: Book sessions directly from match cards with customized dates, time slots, formats (*Online Meet or In-Person*), and session goals.
- **Multi-State Scheduling**: Track requests through statuses: `pending`, `confirmed`, `rescheduled`, `completed`, `declined`, and `cancelled`.
- **Counter-Proposal & Reschedule Engine**: Propose alternate times with attached notes; maintains an audit trail of scheduling negotiations.

### ⭐ Trust, Verification & Mutual Reviews
- **Verified Post-Session Reviews**: Only participants of completed sessions can submit ratings (1-5 stars) and detailed testimonials.
- **Automated Reputation Score**: Profiles automatically update cumulative rating averages and swapped hour totals upon review submission.

### 🔔 Real-Time Notification Center
- Instant alerts for session requests, confirmation responses, reschedule proposals, and received reviews.
- Unread counter badges and one-click "mark as read" capability.

### 🌓 Adaptive Light & Dark Mode
- Built-in theme context supporting system preference detection and manual toggle.
- Custom aesthetic color palette with CSS variables (*Blush Pink, Electric Lime, Peach, Lavender*).

---

## 🧮 Smart Reciprocal Matching Algorithm

The matching engine dynamically scores compatibility between members:

| Match Category | Condition | Compatibility Score | Explanation |
| :--- | :--- | :---: | :--- |
| **Direct 2-Way Match** | User teaches what Peer wants to learn **AND** Peer teaches what User wants to learn | **95% – 99%** | Perfect reciprocal exchange opportunity |
| **Wishlist Match** | Peer teaches a skill on User's learning wishlist | **84%** | High single-direction match |
| **Mentor Match** | User can teach a skill Peer wants to learn | **80%** | Valuable mentoring opportunity |
| **General Affinity** | Complementary domain categories | **65%** | Cross-domain networking potential |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router with Client & Server components)
- **Frontend Library**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom CSS design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/)
  - **PostgreSQL**: Relational database with Foreign Key cascades
  - **Supabase Auth**: Secure email & password authentication and session management
  - **Row Level Security (RLS)**: Enforced data isolation and member access controls
- **Avatars**: [DiceBear API](https://www.dicebear.com/) fallback generation
- **Hosting / Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Project Architecture

```plaintext
skillSwap/
├── app/
│   ├── globals.css            # Global CSS variables & Tailwind directives
│   ├── layout.tsx             # Root Next.js layout & metadata
│   ├── page.tsx               # Next.js entry page
│   └── skillswap-app.tsx      # Application context wrappers (Theme, Auth, Notif)
├── lib/
│   └── supabase.ts            # Supabase client initialization
├── public/
│   └── logo.png               # Brand icon & logo
├── src/
│   ├── App.tsx                # Client-side router & authenticated workspace layout
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, AppHeader, AppSidebar
│   │   ├── matches/           # MatchCard, CompatibilityBadge, RequestSessionModal
│   │   ├── profile/           # SkillModal, SkillTag
│   │   ├── sessions/          # SessionCard, SessionDetailModal, ReviewModal
│   │   └── ui/                # Button, Card, Badge, Modal, Input, ThemeToggle
│   ├── context/
│   │   ├── AuthContext.tsx    # Supabase session & user lifecycle state
│   │   ├── NotificationContext.tsx # In-app notification state & counts
│   │   └── ThemeContext.tsx   # Light/dark mode controller & local storage sync
│   ├── services/
│   │   └── api.ts             # 100% native Supabase CRUD service & matching logic
│   └── views/
│       ├── DashboardPage.tsx  # User overview, quick metrics, pending actions
│       ├── FindMatchesPage.tsx# Reciprocal match directory with search & filters
│       ├── LandingPage.tsx    # Public landing page & interactive exchange simulator
│       ├── LoginPage.tsx      # Supabase authentication login
│       ├── MemberProfilePage.tsx # Public view of peer profiles & reviews
│       ├── MyProfilePage.tsx  # Skill roster, bio, availability & privacy editor
│       ├── NotificationsPage.tsx # In-app alert history
│       ├── SessionsPage.tsx   # Upcoming, pending, and past session dashboard
│       └── SignupPage.tsx     # Onboarding form with initial skill selection
├── .env.example               # Template environment variables
├── next.config.mjs            # Next.js build configuration
├── tailwind.config.js         # Theme color definitions & utility extensions
├── tsconfig.json              # TypeScript compilation rules
└── vercel.json                # Vercel deployment routes
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.17.0` or later
- **npm**, **pnpm**, or **yarn**
- A **Supabase** account (Free tier works perfectly)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/skillswap.git
cd skillswap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the sample environment file to create `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## 🗄️ Supabase Database Schema

Run the following SQL script inside your **Supabase Project → SQL Editor** to create all tables, relationships, and authentication triggers:

```sql
-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text,
  avatar text,
  headline text default 'SkillSwap Community Member',
  bio text default 'Excited to exchange knowledge and collaborate!',
  location text default 'Remote',
  interests jsonb default '[]'::jsonb,
  availability jsonb default '{"summary":"Weekday evenings","days":["Tuesday","Thursday"],"timeSlots":["7:00 PM"]}'::jsonb,
  visibility text default 'public' check (visibility in ('public', 'members_only', 'paused')),
  rating numeric(3, 2) default 5.00,
  review_count integer default 0,
  sessions_completed integer default 0,
  hours_swapped numeric(6, 1) default 0.0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. SKILLS TABLE
create table public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  kind text not null check (kind in ('teach', 'learn')),
  name text not null,
  category text default 'Engineering & Code',
  proficiency text default 'Intermediate',
  years_experience integer default 1,
  description text default '',
  priority text default 'Medium',
  current_level text default 'Beginner',
  learning_goal text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. SESSIONS TABLE
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  teach_skill_name text not null,
  learn_skill_name text not null,
  proposed_date text not null,
  proposed_time text not null,
  duration_minutes integer default 60,
  format text default 'online' check (format in ('online', 'in_person')),
  location_or_link text default 'https://meet.google.com/skillswap-room',
  note text default '',
  status text default 'pending' check (status in ('pending', 'confirmed', 'rescheduled', 'completed', 'declined', 'cancelled')),
  reschedule_history jsonb default '[]'::jsonb,
  review_id uuid,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. REVIEWS TABLE
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  feedback text not null,
  skill_exchanged text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  related_session_id uuid references public.sessions(id) on delete cascade,
  related_member_id uuid references public.profiles(id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.sessions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- Basic Public/Authenticated Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

create policy "Skills are viewable by everyone" on public.skills for select using (true);
create policy "Users can insert their own skills" on public.skills for insert with check (auth.uid() = user_id);
create policy "Users can update their own skills" on public.skills for update using (auth.uid() = user_id);
create policy "Users can delete their own skills" on public.skills for delete using (auth.uid() = user_id);

create policy "Participants can view their sessions" on public.sessions for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Authenticated users can create sessions" on public.sessions for insert with check (auth.uid() = sender_id);
create policy "Participants can update their sessions" on public.sessions for update using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Authenticated users can submit reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);

create policy "Users can view their notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can insert notifications" on public.notifications for insert with check (true);
```

---

## 🏃 Running the Application

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore SkillSwap.

### Type Check & Build

Validate TypeScript types and compile for production:

```bash
# Typecheck
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## 🚀 Deployment

The easiest way to deploy this application is using the [Vercel Platform](https://vercel.com/):

1. Push your repository to GitHub / GitLab.
2. Import your repository into Vercel.
3. Configure the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click **Deploy**.

---

## 🗺️ Product Roadmap

- [ ] **Live WebRTC In-App Video & Audio Rooms**: Built-in 1:1 video conferencing with screen share.
- [ ] **Real-Time Direct Messaging**: Chat threads between exchange partners prior to booking.
- [ ] **Skill Badges & Quizzes**: Automated skill assessments to verify instructor proficiency.
- [ ] **Calendar Integration**: Export session invites directly to Google Calendar and Outlook (`.ics`).
- [ ] **Community Group Workshops**: Multi-participant group exchange sessions.

---

## 🤝 Contributing

Contributions, feedback, and pull requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for lifelong learners everywhere.</sub>
</div>
