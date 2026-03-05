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
- **Upload & Versioning**: Drag and drop PDF resumes into the local vault.
- **Active Selection**: Toggle which resume the AI models should use as the "Base Source of Truth" when crafting cover letters.

### 2. Job Board Scrubber
- **Multi-Source Aggregation**: Search across multiple platforms (LinkedIn, Greenhouse, Lever, etc.) from a single unified dashboard.
- **Batch Selection**: Select multiple curated jobs and send them to the AI pipeline in a single click.

### 3. AI Cover Letter Agent
- **Automated Drafting**: Cycles through your batched jobs and generates highly-tailored cover letters by cross-referencing the Active Resume with the scraped job descriptions.
- **Approval Flow**: An integrated queue viewer allowing you to review, regenerate, or approve and submit the generated applications seamlessly.

### 4. Post-Application Networking Agent
- **Target Discovery**: Automatically surfaces high-value individuals (Recruiters, Hiring Managers, Senior Engineers) at the companies you've just applied to.
- **Actionable Outreach**: Directly launch Email, Phone calls, LinkedIn DMs, or generate an AI-drafted introduction message based on matching criteria.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4 (Custom stark dark-mode theme)
- **Icons**: Lucide React
- **Language**: TypeScript

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
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application mockups.

---

*Note: The current repository state reflects the core frontend mockups and React architectures. Backend database configurations and live LLM endpoints are slated for the next phase of development.*
