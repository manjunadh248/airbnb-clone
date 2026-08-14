# SkillLens AI — Skill Assessment & Personalized Learning Agent

<div align="center">

![SkillLens AI](https://img.shields.io/badge/SkillLens-AI-7C3AED?style=for-the-badge&logo=brain&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)

**AI-powered skill gap analysis, conversational assessment, and personalized learning roadmaps.**

</div>

---

## Features

- **Resume + JD Analyzer** — Upload PDF/DOCX resumes and paste job descriptions for AI-powered skill extraction and gap analysis
- **AI Interview Agent** — ChatGPT-style streaming chat that dynamically probes skill gaps with scenario-based questions
- **Skill Scoring Engine** — Weighted composite scoring (resume 30% + interview 50% + experience 20%) with interactive radar charts
- **Learning Roadmap** — Personalized learning paths with curated resources, time estimates, and progress tracking
- **Dashboard** — Complete overview with assessment history, performance metrics, and job fit visualization
- **User Accounts** — Secure authentication with assessment history persistence

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + ShadCN UI |
| Animations | Framer Motion |
| Charts | Recharts |
| AI | OpenAI GPT-4o-mini (Vercel AI SDK) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v5 (JWT) |
| File Parsing | pdf-parse + mammoth.js |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenAI API key (optional — runs in demo mode without it)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd skilllens_ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values (see below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/skilllens
AUTH_SECRET=your-secret-key          # Generate: npx auth secret
NEXTAUTH_URL=http://localhost:3000

# Optional (leave empty for demo mode)
OPENAI_API_KEY=sk-...
```

### Demo Mode

The app works **without an OpenAI API key** using realistic mock data. All features are functional with pre-generated demo results. Set `OPENAI_API_KEY` to enable real AI analysis.

## User Flow

1. **Register/Login** → Create an account or sign in
2. **Upload Resume** → Drag-and-drop PDF/DOCX or paste text
3. **Paste Job Description** → Enter the full JD text
4. **Click "Analyze"** → AI extracts skills and calculates match percentage
5. **Start AI Interview** → Answer dynamic questions in a chat interface
6. **View Results** → See radar chart, skill scores, and job fit percentage
7. **Generate Roadmap** → Get personalized learning path with resources
8. **Track Progress** → Save reports and monitor learning completion

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── (auth)/                   # Login & Register
│   ├── (dashboard)/              # Protected app pages
│   │   ├── dashboard/            # Overview
│   │   ├── analyze/              # Upload & analyze
│   │   ├── interview/            # AI chat assessment
│   │   ├── results/[id]/         # Scores & radar chart
│   │   ├── roadmap/[id]/         # Learning timeline
│   │   └── history/              # Past assessments
│   └── api/                      # Backend API routes
├── components/
│   ├── ui/                       # ShadCN components
│   └── shared/                   # Reusable components
├── lib/                          # Utilities & services
├── models/                       # Mongoose schemas
└── types/                        # TypeScript definitions
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in the Vercel dashboard.

### Docker

```bash
docker build -t skilllens-ai .
docker run -p 3000:3000 --env-file .env.local skilllens-ai
```

## License

MIT
