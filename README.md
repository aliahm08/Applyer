<div align="center">
  <img src="public/window.svg" alt="Applyer Logo" width="80" height="80" />
  <h1 align="center">applyer</h1>
  <p align="center">
    <strong>AI-powered job board scrubbing, batch applications, and automated networking.</strong>
  </p>
</div>

<hr />

## Overview

**applyer** is a Next.js (App Router) web application built to completely automate and streamline the modern job application process. Moving beyond simplistic scrapers, it acts as a comprehensive pipeline—taking in base resumes, scrubbing various job platforms for roles, batch-scheduling applications using LLM-generated custom cover letters, and finally discovering key networking contacts at the companies applied to.

## Core Features

### 1. Resume Management
- **Upload & Versioning**: Drag and drop PDF resumes into private Supabase storage.
- **Active Selection**: Toggle which resume the AI models should use as the "Base Source of Truth" when crafting cover letters.

### 2. Job Board Scrubber
- **Live Feed Search**: Search the latest public remote jobs feed from Himalayas inside the app.
- **Batch Selection**: Select multiple jobs and sync them to your Supabase application queue.

### 3. AI Cover Letter Agent
- **Automated Drafting**: Cycles through your synced jobs and generates highly-tailored cover letters by cross-referencing the Active Resume with the scraped job descriptions.
- **Approval Flow**: An integrated queue viewer allowing you to review, regenerate, or approve and submit the generated applications seamlessly.

### 4. Post-Application Networking Agent
- **Target Discovery**: Automatically surfaces high-value individuals (Recruiters, Hiring Managers, Senior Engineers) at the companies you've just applied to.
- **Actionable Outreach**: Directly launch Email, Phone calls, LinkedIn DMs, or generate an AI-drafted introduction message based on matching criteria.

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4 (Custom stark dark-mode theme)
- **Auth**: Supabase Auth with Google sign-in
- **Data**: Supabase (Postgres + Storage)
- **Jobs Feed**: Himalayas public jobs API
- **Language**: TypeScript

## Supabase Setup

1. **Use your Supabase project** at `https://kdfomnzerofiokofzylt.supabase.co`.
2. In Supabase, run SQL from [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. In Supabase Auth, enable the **Google** provider.
4. In the Google provider settings, add your Google OAuth client ID and secret.
5. In Supabase Auth URL configuration, add your local and deployed callback URLs:
   `http://localhost:3000/auth/callback`
6. The app auto-creates a private `resumes` storage bucket on first resume upload using your Supabase secret key.

### Required environment variables

Create `.env.local` from [`.env.example`](.env.example):

```bash
# Supabase project
NEXT_PUBLIC_SUPABASE_URL="https://kdfomnzerofiokofzylt.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-or-anon-key"
SUPABASE_URL="https://kdfomnzerofiokofzylt.supabase.co"
SUPABASE_SECRET_KEY="your-supabase-secret-key"

# Optional cover letter model settings
OLLAMA_BASE_URL="https://your-ollama-endpoint"
OLLAMA_API_KEY="optional"
OLLAMA_MODEL="llama3"
```

## Security model

- The browser signs in with Supabase Auth using the Google provider.
- Supabase manages the auth session and the app refreshes it through the Next.js proxy flow.
- Server routes verify the current Supabase user before reading or writing private data.
- Non-GET mutations validate `Origin` to reduce CSRF risk.
- Supabase secrets stay server-side; the browser never receives the secret key.
- Resume uploads go through the app server into a private Supabase Storage bucket.
- User scoping is enforced in server queries, and matching RLS policies are included in the SQL for future direct-database use.

## What is live now

- The resume upload screen stores PDFs in Supabase Storage and resume metadata in Postgres.
- The scrubber loads live jobs from the Himalayas API and can queue selected jobs into Supabase.
- The batch apply queue reads and updates application state from Supabase with authenticated server routes.
- Google sign-in is handled by Supabase Auth and reflected across the app shell.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aliahm08/Applyer.git
   cd Applyer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

## Deployment notes

- Rotate any secrets already present in a local `.env.local` if they were ever shared outside your machine.
- Use `SUPABASE_SECRET_KEY` in your hosting provider's server environment only.
- The Supabase publishable key is safe to expose client-side; the secret key is not.
