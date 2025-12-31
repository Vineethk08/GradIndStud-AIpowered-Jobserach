# GradIndStud - AI-Powered Job Search for Indian Students 🇮🇳

AI-Native Job Access Platform that helps Indian students and professionals land their dream jobs with intelligent resume optimization and job matching.

## ✨ Features

- **🤖 LEKI AI Agent** - Your personal career copilot
- **📄 Resume Analyzer** - Get ATS score, typo detection, and format fixes
- **💼 Job Portal** - Curated job listings with match scores
- **📋 External Jobs** - Add and track jobs from any website
- **🎯 Smart Matching** - AI-powered skill gap analysis
- **📝 Resume Builder** - Generate tailored resumes for each job
- **📁 Resume Manager** - Store up to 5 resume versions

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your Gemini API Key

Get your free API key from: https://aistudio.google.com/app/apikey

Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the app
```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or 3001 if 3000 is busy)

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI:** Google Gemini API
- **Build:** Vite
- **Icons:** Lucide React

## 📱 Pages

| Page | Description |
|------|-------------|
| Home | Landing page with features |
| Job Matches | Browse and filter jobs |
| My Resumes | Manage 5 resume slots |
| AI Optimizer | LEKI resume analysis |
| External Jobs | Add jobs from other sites |

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

---

Built with ❤️ for Indian Students
