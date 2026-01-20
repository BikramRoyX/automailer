# AutoMailer 2.0 🚀

A powerful, robust, and randomized email automation agent for job applications.

## Features ✨

### 1. Robust Reliability 🛡️
- **Strict Email Validation:** Automatically rejects invalid or malformed email addresses before sending.
- **Variable Safeguards:** Never sends "Dear ," (empty names) again. Auto-falls back to "there" or "your company".
- **Safety Locks:** Prevents accidental double-clicks or parallel campaign launches.

### 2. Smart Randomization 🎲
- **Fair Queuing:** Distributes sending batches randomly from your fresh contacts list to prevent "stuck" queues.
- **Community DB Shuffling:** Randomly selects 50 unique, verified HR contacts every time you sync, ensuring diversity in outreach.

### 3. Secure Authentication 🔐
- **Strict Scope Checking:** Dashboard strictly validates that you have `gmail.send` permissions before allowing a launch.
- **Synced Status:** "Mission Control" and "Settings" are always in sync regarding your connection health.

## Getting Started

1.  **Connect Gmail:** Go to Settings and authorize the app.
2.  **Upload Resume:** Parse your resume for keyword matching.
3.  **Select Community DB:** Get 50 verified contacts instanty.
4.  **Launch:** Let the agent handle the outreach.

## Tech Stack
- **Framework:** Next.js 14
- **Database:** Prisma (PostgreSQL)
- **Auth:** NextAuth (Google OAuth 2.0)
- **Styling:** Tailwind CSS + Framer Motion

