# GradIndStud - AI-Powered Job Search Platform
## Complete Feature Documentation

---

## 📋 Table of Contents

1. [Platform Overview](#platform-overview)
2. [Target Audience](#target-audience)
3. [Core Features](#core-features)
4. [AI Agent - LEKI](#ai-agent---leki)
5. [Subscription Tiers](#subscription-tiers)
6. [Technical Stack](#technical-stack)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Security Features](#security-features)
9. [Future Roadmap](#future-roadmap)

---

## 🎯 Platform Overview

**GradIndStud** is an AI-native career platform designed specifically for Indian students and professionals seeking job opportunities globally. The platform combines real-time job listings, AI-powered resume optimization, and intelligent career guidance through our proprietary LEKI AI agent.

### Mission Statement
*"We don't sell hope—we sell access."*

Access to verified job data, personalized feedback, and global roles that actually hire.

### Live URL
🌐 **https://gradindstud-aipowered-jobserach-457608791836.europe-west1.run.app/**

### GitHub Repository
📂 **https://github.com/Vineethk08/GradIndStud-AIpowered-Jobserach**

---

## 👥 Target Audience

| Segment | Description |
|---------|-------------|
| Fresh Graduates | Students completing their degrees seeking first jobs |
| Indian Professionals | Working professionals looking for better opportunities |
| Career Changers | Individuals transitioning between industries |
| International Job Seekers | Indians seeking opportunities in USA & globally |

---

## 🚀 Core Features

### 1. Real Job Search 🔍

**Description:** Access to 50,000+ verified job listings from top companies.

**Capabilities:**
- Real-time job search using JSearch API
- Filter by location (USA, India, Remote)
- Quick category filters (Software Engineer, Data Scientist, Product Manager, etc.)
- 20+ job role categories
- City-specific searches (New York, San Francisco, Bangalore, etc.)

**Job Categories Available:**
- Software Engineer
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- Data Analyst
- Product Manager
- DevOps Engineer
- Cloud Engineer
- ML Engineer
- UI/UX Designer
- QA Engineer
- HR Manager
- Business Analyst
- Marketing
- Sales
- Finance
- Healthcare
- Operations
- Content Writer

---

### 2. Resume Manager 📄

**Description:** Store and manage up to 5 resume versions.

**Capabilities:**
- Multiple resume slots (5 max)
- Set primary resume for quick applications
- Track analysis status per resume
- Target job role tagging
- Cloud storage with Firebase Firestore
- Last updated timestamps

**Resume Data Stored:**
- Resume name
- Target job role
- Content text
- Analysis status
- Primary designation
- Creation & update dates

---

### 3. AI Resume Optimizer 🤖

**Description:** LEKI AI agent analyzes and optimizes resumes for ATS compatibility.

**Analysis Includes:**
- ATS Score (0-100)
- Critical issues identification
- Missing keywords detection
- Format problems
- Typo corrections
- Before/After comparisons
- Actionable improvement suggestions

**Optimization Rules:**
- No hallucinations (uses only provided data)
- No pronouns (I, me, my)
- XYZ Formula (Accomplished X by doing Y, resulting in Z)
- Strong action verbs
- Quantified achievements
- ATS-friendly formatting

---

### 4. Cover Letter Generator ✉️

**Description:** AI-powered cover letter creation tailored to specific jobs.

**Capabilities:**
- Job-specific customization
- Multiple tone options (Professional, Enthusiastic, Confident)
- Company research integration
- User background incorporation
- One-click generation
- Copy & download options

**Tone Options:**
| Tone | Best For |
|------|----------|
| Professional | Corporate, Traditional companies |
| Enthusiastic | Startups, Creative roles |
| Confident | Leadership, Senior positions |

---

### 5. Application Tracker 📊

**Description:** Kanban-style tracking for all job applications.

**Features:**
- Dashboard with statistics
- Status tracking (Applied, Interview, Offer, Rejected)
- Notes per application
- Date tracking
- Company & role details
- Visual progress indicators

**Application Statuses:**
- 📝 Applied
- 📞 Phone Screen
- 💻 Technical Interview
- 🏢 Onsite Interview
- 💼 Offer Received
- ❌ Rejected
- ⏸️ Withdrawn

---

### 6. Interview Preparation 🎤

**Description:** AI-powered mock interviews with voice support.

**Interview Types:**
| Type | Description |
|------|-------------|
| Behavioral | STAR method questions |
| Technical | Role-specific technical questions |
| HR Round | Culture fit & salary negotiation |

**Features:**
- Voice input support (Web Speech API)
- Real-time transcription
- AI scoring & feedback
- Question bank by category
- Tips for each interview type
- Sound wave visualization during recording

**Scoring Criteria:**
- Relevance to question
- Use of STAR method
- Specific examples provided
- Communication clarity
- Confidence level

---

### 7. Company Insights 🏢

**Description:** Comprehensive company research and salary data.

**Information Provided:**
- Company overview & description
- Industry & headquarters
- Employee count
- Founded year
- Official website
- Real company logos

**Salary Data:**
| Level | Range (LPA) |
|-------|-------------|
| Entry Level | ₹4-12 LPA |
| Mid Level | ₹12-25 LPA |
| Senior Level | ₹25-50+ LPA |

**Culture Ratings (1-5 stars):**
- Work-Life Balance
- Career Growth
- Compensation
- Company Culture
- Job Security

**Interview Process:**
- Stage-by-stage breakdown
- Difficulty rating (Easy/Medium/Hard)
- Acceptance rate
- Average hiring time
- Interview focus areas

**Additional Insights:**
- Company pros & cons
- Core values & principles
- Tech stack used
- Major competitors
- Recent news
- Stock ticker & revenue

---

### 8. External Jobs 🔗

**Description:** Add and track jobs found on other platforms.

**Workflow:**
1. User adds job from external website
2. Fills in: Title, Company, URL, Description
3. Job appears in External tab
4. LEKI analyzes match with user's resume
5. Generate customized resume for that job
6. Download optimized resume (PDF/Word)

**Match Analysis:**
- Skills match percentage
- Missing skills identification
- Improvement suggestions
- Keyword recommendations

---

### 9. Notification Center 🔔

**Description:** Stay updated on job matches and application status.

**Notification Types:**
- Job match alerts
- Application status updates
- Interview reminders
- Career tips
- System announcements

**Delivery Methods:**
- In-app notifications
- Browser push notifications (optional)
- Notification preferences

---

## 🧠 AI Agent - LEKI

### Overview
LEKI (Linguistic Enhancement & Knowledge Intelligence) is the proprietary AI agent powering GradIndStud's intelligent features.

### Personality
- Friendly and encouraging
- Professional yet approachable
- Uses emojis for engagement
- Provides actionable advice

### Capabilities

| Feature | Description |
|---------|-------------|
| Resume Analysis | ATS scoring, issue detection, optimization |
| Resume Generation | Job-specific resume creation |
| Cover Letter Writing | Personalized cover letters |
| Job Matching | Skills gap analysis |
| Interview Tips | Company-specific preparation |
| Career Guidance | Personalized recommendations |

### Quick Actions
1. 📝 Generate Resume for a Job
2. ✉️ Write Cover Letter
3. 🎯 Analyze Job Match
4. 💡 Interview Tips
5. 📊 Improve My Resume

### Technical Implementation
- Powered by Google Gemini AI
- Model: gemini-2.0-flash
- Structured JSON output
- Context-aware responses

---

## 💎 Subscription Tiers

### Free Tier (₹0/month)
- 5 job searches per day
- Basic resume tips
- View job listings
- Save up to 3 jobs
- Community support

### Pro Tier (₹1,500/month or ₹15,000/year)
- Unlimited job searches
- AI Resume Generator
- AI Cover Letter Generator
- 10 resume optimizations/month
- Application Tracker
- Email notifications
- Priority support

### Premium Tier (₹4,000/month or ₹40,000/year)
- Everything in Pro
- Unlimited AI Resume Generation
- Unlimited Cover Letters
- AI Interview Prep with Voice
- Company Insights & Salary Data
- Mock Interview Feedback
- Resume ATS Score Analysis
- 1-on-1 Career Coaching (1 session/month)
- Priority job recommendations
- White-glove support

---

## 🛠️ Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Vite | Build Tool |

### Backend Services
| Service | Purpose |
|---------|---------|
| Firebase Auth | Google Sign-In |
| Firestore | Database (Resumes, Applications) |
| Google Gemini AI | AI Features |
| JSearch API | Real Job Listings |

### Deployment
| Platform | Purpose |
|----------|---------|
| Google Cloud Run | Container Hosting |
| Cloud Build | CI/CD Pipeline |
| Artifact Registry | Docker Images |
| GitHub | Source Control |

---

## 🚀 Deployment & Infrastructure

### Architecture
```
User → Cloud Run → Nginx → React App
                      ↓
              Firebase (Auth + Firestore)
                      ↓
              External APIs (Gemini, JSearch)
```

### Auto-Deployment Pipeline
1. Developer pushes to GitHub (main branch)
2. Cloud Build trigger activates
3. Docker image built with Dockerfile
4. Image pushed to Artifact Registry
5. Cloud Run deploys new revision
6. Zero-downtime deployment complete

### Container Specs
- Base Image: Node 20 Alpine (build) + Nginx Alpine (serve)
- Port: 8080
- Memory: 512MB (default)
- CPU: 1 vCPU
- Scaling: 0-100 instances (auto)

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Authentication | Firebase Google OAuth 2.0 |
| Authorization | Protected routes require login |
| Data Encryption | HTTPS/TLS in transit |
| API Key Security | Environment variables |
| Domain Verification | Firebase authorized domains |
| CORS | Configured for allowed origins |

### Protected Routes
All app features require authentication:
- Job Portal
- Resume Manager
- AI Optimizer
- Cover Letter Generator
- Application Tracker
- Interview Prep
- Company Insights
- Notifications

---

## 🗺️ Future Roadmap

### Phase 1 (Completed ✅)
- [x] Real job listings integration
- [x] User authentication (Google Sign-In)
- [x] Resume storage (Firebase)
- [x] Application tracker
- [x] AI Cover Letter Generator
- [x] Interview preparation
- [x] Company insights
- [x] Notifications
- [x] Subscription system

### Phase 2 (Planned)
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] LinkedIn integration
- [ ] Resume PDF generation
- [ ] Video interview practice

### Phase 3 (Future)
- [ ] AI-powered job recommendations
- [ ] Skill assessments
- [ ] Networking features
- [ ] Mentorship matching
- [ ] Career path visualization
- [ ] Salary negotiation tools

---

## 📞 Contact & Support

**Website:** https://gradindstud-aipowered-jobserach-457608791836.europe-west1.run.app/

**GitHub:** https://github.com/Vineethk08/GradIndStud-AIpowered-Jobserach

**Developer:** Vineeth Kumar

---

## 📄 License

© 2025 GradIndStud. All rights reserved.

---

*Document Version: 1.0*
*Last Updated: January 2026*

