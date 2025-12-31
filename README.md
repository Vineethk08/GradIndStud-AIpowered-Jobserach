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

---

## ☁️ Deploy to Google Cloud Run (Step-by-Step Guide)

This guide will help you put your website online with a public URL using Google Cloud Run. **No prior experience needed!**

### Prerequisites
- A Google account
- Your code pushed to GitHub (we'll do this first)

---

### Step 1: Push to GitHub

1. **Go to GitHub:** https://github.com/new
2. **Create a new repository:**
   - Name: `GradIndStud-AI-JobPortal`
   - Keep it **Public** or Private
   - **Don't** add README, .gitignore, or license
   - Click **"Create repository"**

3. **Copy the commands shown** and run them in your terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/GradIndStud-AI-JobPortal.git
git branch -M main
git push -u origin main
```

---

### Step 2: Enable Google Cloud Services

1. **Go to Google Cloud Console:** https://console.cloud.google.com

2. **Create a new project** (or select existing):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: `gradindstud-app`
   - Click "Create"

3. **Enable Cloud Run API:**
   - Go to: https://console.cloud.google.com/apis/library/run.googleapis.com
   - Click **"Enable"**

4. **Enable Cloud Build API:**
   - Go to: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com
   - Click **"Enable"**

---

### Step 3: Open Cloud Run

1. **Go to Cloud Run:** https://console.cloud.google.com/run

2. Click the big blue button **"Create Service"**

---

### Step 4: Connect Your GitHub Repository

1. Select **"Continuously deploy from a repository"**

2. Click **"Set up with Cloud Build"**

3. Click **"Authenticate"** → Sign in to GitHub

4. **Select your repository:** `GradIndStud-AI-JobPortal`

5. Click **"Next"**

---

### Step 5: Configure Build Settings

1. **Build Type:** Select **"Dockerfile"**

2. **Dockerfile location:** Leave as `/Dockerfile`

3. Click **"Save"**

---

### Step 6: Add Your API Key

1. Scroll down to find **"Container, Networking, Security"**

2. Click to expand it

3. Click **"Variables & Secrets"** tab

4. Under **"Build Environment Variables"**, click **"Add Variable"**:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `your-actual-api-key-here`

5. This tells Google to use your API key when building the app!

---

### Step 7: Allow Public Access

1. Scroll down to **"Authentication"**

2. Select **"Allow unauthenticated invocations"** ✅
   - This makes your website accessible to everyone

---

### Step 8: Deploy! 🚀

1. **Service name:** `gradindstud` (or any name you like)

2. **Region:** Choose one close to you (e.g., `asia-south1` for India)

3. Click the blue **"Create"** button at the bottom

4. **Wait 3-5 minutes** while Google builds your app...

---

### Step 9: Get Your Public URL! 🎉

1. Once deployment is complete, you'll see a **green checkmark** ✅

2. At the top, you'll see your public URL like:
   ```
   https://gradindstud-xxxxx-uc.a.run.app
   ```

3. **Click it!** Your app is now live on the internet! 🌐

---

### 🔄 Automatic Updates

Every time you push new code to GitHub, Cloud Run will automatically rebuild and redeploy your app!

```bash
# Make changes, then:
git add .
git commit -m "Updated feature"
git push
```

---

### 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check that GEMINI_API_KEY is set in build variables |
| Page shows blank | Check browser console (F12) for errors |
| 502 Bad Gateway | Wait 2 minutes, deployment might still be in progress |
| Permission denied | Make sure you enabled both Cloud Run and Cloud Build APIs |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI:** Google Gemini API
- **Build:** Vite
- **Icons:** Lucide React
- **Deployment:** Docker + Nginx + Google Cloud Run

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
