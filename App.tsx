
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Star,
  Plus,
  CheckCircle2,
  ScanSearch,
  Target,
  Rocket,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  ChevronLeft,
  Loader2,
  Lock,
  Mail,
  Github,
  Search,
  Filter,
  Briefcase,
  MapPin,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  User,
  MessageSquare,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ChevronRight,
  HelpCircle,
  MoreHorizontal,
  Send,
  PlusCircle,
  Share2,
  ChevronDown,
  LogOut,
  Key,
  Globe,
  Clock,
  Calendar,
  Shield,
  IndianRupee,
  Mic,
  MicOff,
  Volume2,
  Bell,
  BellRing,
  Trash2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  signInWithGoogle, 
  logOut, 
  onAuthChange, 
  User as FirebaseUser,
  saveResume,
  getUserResumes,
  updateResume,
  deleteResume,
  setPrimaryResume,
  StoredResume,
  saveJobApplication,
  getUserApplications,
  updateJobApplication,
  deleteJobApplication,
  JobApplication,
  ApplicationStatus
} from './firebase';
import { searchJobs, RealJob, JOB_CATEGORIES, hasJobApiKey, setJobApiKey } from './jobSearch';

// --- AI Service Initialization ---
let ai: InstanceType<typeof GoogleGenAI> | null = null;
try {
  const apiKey = process.env.API_KEY || '';
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn('AI service initialization failed:', e);
}

// --- LEKI Agent System Prompt ---
const LEKI_SYSTEM_PROMPT = `### ROLE & OBJECTIVE
You are **LEKI**, a Senior Technical Recruiter and ATS (Applicant Tracking System) Logic Specialist at GRADINDSTUD. 
Your mission is to help Indian students and professionals transform their resumes into high-impact, 100% ATS-compliant documents that get past automated filters and impress recruiters.

### STRICT OPERATIONAL RULES (DO NOT VIOLATE)
1.  **NO HALLUCINATIONS:** Never invent job titles, companies, dates, degrees, or metrics. If data is missing, use placeholders like "[insert metric]" and flag for user.
2.  **NO PRONOUNS:** Remove all "I," "Me," "My," "Our," "We." Use implied first-person (e.g., "Managed team..." not "I managed...").
3.  **XYZ FORMULA:** Rewrite bullet points as: "Accomplished [X] as measured by [Y], by doing [Z]."
4.  **ATS COMPLIANCE:** No tables, columns, graphics, headers/footers, special characters, or emojis. Use standard fonts and clean formatting.

### COMPREHENSIVE ANALYSIS WORKFLOW

**STEP 1: ATS SCORE CALCULATION (0-100)**
Score based on:
- Contact info completeness (10 pts)
- Professional summary presence (10 pts)
- Work experience with metrics (25 pts)
- Skills section with keywords (20 pts)
- Education section (10 pts)
- No formatting issues (15 pts)
- No typos/grammar errors (10 pts)

**STEP 2: TYPO & GRAMMAR DETECTION**
Find ALL spelling mistakes, grammatical errors, tense inconsistencies (past jobs = past tense, current = present).

**STEP 3: FORMAT ISSUES**
Detect: inconsistent bullet styles, missing sections, poor hierarchy, ATS-unfriendly elements (tables, images, columns).

**STEP 4: CONTENT OPTIMIZATION**
- Weak verbs → Strong action verbs
- Vague statements → Specific achievements
- Missing metrics → Placeholder prompts

**STEP 5: MISSING SECTIONS CHECK**
Identify if missing: Contact Info, Summary, Experience, Skills, Education, Certifications.

**STEP 6: GENERATE FIXED RESUME**
Create the complete optimized resume text that user can copy/download.

### OUTPUT SCHEMA (JSON FORMAT ONLY - CRITICAL)
You MUST output valid JSON in this exact structure:

{
  "summary_analysis": {
    "ats_score": 75,
    "overall_grade": "B",
    "critical_issues": ["Missing professional summary", "No metrics in achievements"],
    "missing_keywords": ["Python", "AWS", "Agile"]
  },
  "issues": {
    "typos": [
      {"original": "managment", "corrected": "management", "context": "...project managment..."}
    ],
    "formatting": [
      {"issue": "Inconsistent bullet points", "suggestion": "Use consistent bullet style throughout"}
    ],
    "content": [
      {"section": "Experience", "problem": "Weak action verb 'helped'", "fix": "Replace with 'Collaborated' or 'Facilitated'"}
    ],
    "missing_sections": ["Professional Summary", "Skills Section"]
  },
  "optimized_content": {
    "professional_summary": "Results-driven Software Engineer with 2+ years...",
    "contact_info_status": "Complete" or "Missing: [list items]",
    "work_experience": [
      {
        "id": "exp_1",
        "original_text": "Helped with website development",
        "optimized_text": "Developed and deployed responsive web application using React.js, improving page load time by [X]%",
        "change_reason": "Added specific technology and metric placeholder for impact",
        "user_action_required": "Add the actual percentage improvement"
      }
    ],
    "skills_section": "Technical Skills: Python, JavaScript, React.js...",
    "education_section": "B.Tech in Computer Science, [University], 2023"
  },
  "full_optimized_resume": "FULL TEXT OF THE OPTIMIZED RESUME HERE - ready to copy"
}`;

const LEKI_CHAT_PROMPT = `You are LEKI, a Personal AI Career Agent at GRADINDSTUD. You're warm, strategic, and incredibly helpful. You specialize in:

## YOUR CAPABILITIES:
1. **Personalized Resume Generation**: Create tailored resumes for specific job postings
2. **Cover Letter Writing**: Write compelling, job-specific cover letters
3. **Job Match Analysis**: Analyze how well a candidate matches a job description
4. **Interview Coaching**: Provide role-specific interview questions and answers
5. **Career Advice**: Offer strategic career guidance for Indian professionals

## WHEN GENERATING RESUMES:
- Ask for: Job description, candidate's background/experience, key skills
- Use the XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]"
- Make it ATS-compliant with relevant keywords from the job description
- Format clearly with sections: Summary, Experience, Skills, Education
- Quantify achievements with numbers whenever possible

## WHEN WRITING COVER LETTERS:
- Ask for: Job title, company name, key qualifications to highlight
- Structure: Opening hook → Why this role/company → What you offer → Call to action
- Keep it to 3-4 paragraphs, professional but personable
- Reference specific company values or recent news if known

## WHEN ANALYZING JOB MATCH:
- Compare skills, experience, and qualifications
- Give a match percentage (0-100%)
- List matching skills and missing skills
- Provide specific suggestions to improve candidacy

## ALWAYS:
- Be encouraging and supportive
- Give specific, actionable advice
- Use clear formatting (bullets, sections)
- Focus on Indian job market context when relevant
- Never hallucinate experience - only use what the user provides  
- Job search strategy for tech roles
- Career growth strategies for Indian professionals
- Skill gap analysis

Keep responses concise and actionable. Use a professional but friendly tone.`;

// --- Types ---
type View = 'landing' | 'login' | 'resume-builder' | 'resume-manager' | 'job-portal' | 'cover-letter' | 'applications' | 'interview-prep' | 'company-insights' | 'notifications';

// Notification types
interface AppNotification {
  id: string;
  type: 'job_match' | 'application_update' | 'interview_reminder' | 'tip' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface SavedResume {
  id: string;
  name: string;
  targetJob: string;
  content: string;
  isPrimary: boolean;
  analysisComplete: boolean;
  atsScore: number | null;
  lastModified: Date;
  createdAt: Date;
}

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  matchScore: number;
  matchLevel: string;
  verified: boolean;
  postedAt: string;
  applicants: number;
  tags: string[];
}

interface ExternalJob {
  id: string;
  title: string;
  company: string;
  url: string;
  description: string;
  location?: string;
  salary?: string;
  type?: string;
  createdAt: Date;
  matchScore?: number;
  skillMatch?: number;
  expMatch?: number;
  industryMatch?: number;
  missingSkills?: string[];
  matchedSkills?: string[];
  customResume?: string;
  analyzed: boolean;
}

// External Jobs Storage
const useExternalJobsStorage = () => {
  const getJobs = (): ExternalJob[] => {
    try {
      const stored = localStorage.getItem('gradindstud_external_jobs');
      if (stored) {
        return JSON.parse(stored).map((j: any) => ({
          ...j,
          createdAt: new Date(j.createdAt)
        }));
      }
    } catch (e) {
      console.warn('Failed to load external jobs:', e);
    }
    return [];
  };

  const saveJobs = (jobs: ExternalJob[]) => {
    localStorage.setItem('gradindstud_external_jobs', JSON.stringify(jobs));
  };

  const addJob = (job: Omit<ExternalJob, 'id' | 'createdAt' | 'analyzed'>): ExternalJob => {
    const jobs = getJobs();
    const newJob: ExternalJob = {
      ...job,
      id: `ext_${Date.now()}`,
      createdAt: new Date(),
      analyzed: false
    };
    saveJobs([newJob, ...jobs]);
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<ExternalJob>) => {
    const jobs = getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      saveJobs(jobs);
    }
  };

  const deleteJob = (id: string) => {
    const jobs = getJobs().filter(j => j.id !== id);
    saveJobs(jobs);
  };

  return { getJobs, addJob, updateJob, deleteJob };
};

interface JobFilters {
  jobFunctions: string[];
  jobTypes: string[];
  workModels: string[];
  locations: string[];
  experienceLevels: string[];
  salaryMin: number;
  industries: string[];
  skills: string[];
  roleType: 'all' | 'ic' | 'manager';
  companyStages: string[];
  excludeStaffingAgency: boolean;
  datePosted: string;
}

// Job Filter Data
const JOB_FUNCTION_CATEGORIES = {
  'Software/Internet/AI': {
    'Backend Engineering': ['Backend Engineer', 'Full Stack Engineer', 'Python Engineer', 'Java Engineer', 'Golang Engineer', 'Node.js Engineer'],
    'Data & Analytics': ['Data Analyst', 'Data Scientist', 'Data Engineer', 'Business/BI Analyst', 'ETL Developer'],
    'Machine Learning & AI': ['Machine Learning Engineer', 'AI Engineer', 'ML Researcher', 'LLM Engineer', 'Computer Vision Engineer'],
    'Frontend/Mobile': ['Frontend Engineer', 'React Developer', 'UI/UX Developer', 'Android Developer', 'iOS Developer', 'Flutter Developer'],
    'DevOps & Cloud': ['DevOps Engineer', 'Cloud Engineer', 'SRE', 'Platform Engineer', 'AWS Engineer', 'Azure Engineer'],
    'Security': ['Cyber Security Analyst', 'Security Engineer', 'Cloud Security Engineer', 'SOC Analyst'],
    'QA & Testing': ['QA Engineer', 'Automation Test Engineer', 'QA Manager', 'SDET']
  },
  'Consulting': ['Management Consultant', 'Strategy Consultant', 'IT Consultant', 'Business Analyst'],
  'Marketing': ['Digital Marketing', 'Growth Marketing', 'Content Marketing', 'SEO Specialist', 'Product Marketing'],
  'Finance': ['Financial Analyst', 'Investment Banking', 'Risk Analyst', 'Accountant', 'FP&A'],
  'Product': ['Product Manager', 'Associate PM', 'Technical PM', 'Product Designer'],
  'Healthcare': ['Clinical Research', 'Healthcare Analyst', 'Medical Writer', 'Biotech Research'],
  'Sales': ['Sales Development Rep', 'Account Executive', 'Sales Engineer', 'Customer Success']
};

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODELS = ['Onsite', 'Hybrid', 'Remote'];
const EXPERIENCE_LEVELS = ['Intern/New Grad', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead/Staff', 'Director+'];
const COMPANY_STAGES = ['Early Stage', 'Growth Stage', 'Late Stage', 'Public Company'];
const DATE_POSTED_OPTIONS = ['Past 24 hours', 'Past 3 days', 'Past week', 'Past month'];
const INDUSTRIES = ['Information Technology', 'Artificial Intelligence', 'Financial Services', 'Consulting', 'Healthcare', 'E-commerce', 'SaaS', 'Fintech'];

// --- Sub-components ---

const TypingText = ({ lines, speed = 40 }: { lines: string[], speed?: number }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;
    const timer = setTimeout(() => {
      const currentLine = lines[currentLineIndex];
      if (currentCharIndex < currentLine.length) {
        const updatedLines = [...visibleLines];
        updatedLines[currentLineIndex] = (updatedLines[currentLineIndex] || "") + currentLine[currentCharIndex];
        setVisibleLines(updatedLines);
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, lines, speed, visibleLines]);

  return (
    <div className="font-mono space-y-1 text-left">
      {visibleLines.map((line, i) => (
        <div key={i} className={i === 0 ? "text-emerald-400" : "text-slate-300"}>
          {i > 0 ? "> " : ""}{line}
        </div>
      ))}
      {currentLineIndex < lines.length && (
        <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1" />
      )}
    </div>
  );
};

// Add External Job Modal
const AddExternalJobModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (job: Omit<ExternalJob, 'id' | 'createdAt' | 'analyzed'>) => void;
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Please enter the job title';
    if (!url.trim()) newErrors.url = 'Please enter the URL for original posting';
    if (!company.trim()) newErrors.company = 'Please enter Company Name';
    if (!description.trim()) newErrors.description = 'Please enter the job description';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onAdd({ title, url, company, description });
      setTitle('');
      setUrl('');
      setCompany('');
      setDescription('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center gap-4 px-8 py-6 border-b border-[#E9E1D1]">
          <button onClick={onClose} className="p-2 hover:bg-[#E9E1D1] rounded-xl">
            <X size={20} />
          </button>
          <h2 className="text-xl font-black uppercase tracking-tight">Add a New Job</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
              <span className="text-red-500">*</span> Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Job Title"
              className={`w-full px-5 py-4 bg-[#E9E1D1]/20 border rounded-xl outline-none transition-all font-medium ${
                errors.title ? 'border-red-400' : 'border-[#CBD0D2] focus:border-black'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
              <span className="text-red-500">*</span> URL for Original Posting
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              className={`w-full px-5 py-4 bg-[#E9E1D1]/20 border rounded-xl outline-none transition-all font-medium ${
                errors.url ? 'border-red-400' : 'border-[#CBD0D2] focus:border-black'
              }`}
            />
            {errors.url && <p className="text-xs text-red-500 font-medium">{errors.url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
              <span className="text-red-500">*</span> Company Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#E9E1D1] rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-[#3B4235]/40" />
              </div>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter the company name"
                className={`w-full pl-16 pr-5 py-4 bg-[#E9E1D1]/20 border rounded-xl outline-none transition-all font-medium ${
                  errors.company ? 'border-red-400' : 'border-[#CBD0D2] focus:border-black'
                }`}
              />
            </div>
            {errors.company && <p className="text-xs text-red-500 font-medium">{errors.company}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
              <span className="text-red-500">*</span> Job Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please paste the complete job description..."
              rows={8}
              className={`w-full px-5 py-4 bg-[#E9E1D1]/20 border rounded-xl outline-none transition-all font-medium resize-none ${
                errors.description ? 'border-red-400' : 'border-[#CBD0D2] focus:border-black'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
          </div>
        </div>

        <div className="px-8 py-6 border-t border-[#E9E1D1]">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            Save Job
          </button>
        </div>
      </div>
    </div>
  );
};

// External Job Detail View
const ExternalJobDetail = ({ 
  job, 
  onClose,
  onAnalyze,
  isAnalyzing
}: { 
  job: ExternalJob; 
  onClose: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'company'>('overview');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const downloadResume = (format: 'pdf' | 'docx') => {
    if (!job.customResume) return;
    
    const blob = new Blob([job.customResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.title.replace(/\s+/g, '_')}_Resume.${format === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadOptions(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E9E1D1]">
      <div className="h-full flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#E9E1D1] px-8 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-[#E9E1D1] rounded-xl">
                <X size={20} />
              </button>
              <span className="px-3 py-1 bg-[#E9E1D1] text-[#3B4235] rounded-full text-xs font-black uppercase">External</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3B4235] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {job.company[0]?.toUpperCase()}
                </div>
                <span className="font-bold text-sm truncate max-w-[300px]">{job.title}</span>
              </div>
            </div>
            <a 
              href={job.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              Apply Now <ExternalLink size={14} />
            </a>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-8">
            {/* Tabs */}
            <div className="flex items-center gap-8 mb-8 border-b border-[#CBD0D2]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'overview' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-[#3B4235]/40 hover:text-[#3B4235]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'company' 
                    ? 'text-black border-b-2 border-black' 
                    : 'text-[#3B4235]/40 hover:text-[#3B4235]'
                }`}
              >
                Company
              </button>
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto pb-4 text-sm font-bold text-[#3B4235]/60 hover:text-black flex items-center gap-2"
              >
                <FileText size={16} /> Original Job Post
              </a>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Job Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#3B4235] rounded-2xl flex items-center justify-center text-white font-black text-xl">
                        {job.company[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-[#3B4235]/60 font-medium">{job.company} · {timeAgo(job.createdAt)}</p>
                        <h1 className="text-2xl font-black">{job.title}</h1>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#3B4235]/60">
                      {job.location && (
                        <span className="flex items-center gap-2"><MapPin size={16} /> {job.location}</span>
                      )}
                      {job.type && (
                        <span className="flex items-center gap-2"><Briefcase size={16} /> {job.type}</span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-2"><TrendingUp size={16} /> {job.salary}</span>
                      )}
                    </div>
                  </div>

                  {/* Match Score */}
                  {job.analyzed && job.matchScore && (
                    <div className="text-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#E9E1D1" strokeWidth="8" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="#10B981" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251} strokeDashoffset={251 - (251 * job.matchScore) / 100} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">{job.matchScore}%</span>
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mt-2">Strong Match</p>
                    </div>
                  )}
                </div>

                {/* Match Breakdown */}
                {job.analyzed && (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Exp. Level', value: job.expMatch || 0 },
                      { label: 'Skill', value: job.skillMatch || 0 },
                      { label: 'Industry Exp.', value: job.industryMatch || 0 }
                    ].map((item) => (
                      <div key={item.label} className="bg-white rounded-2xl p-4 text-center border border-[#CBD0D2]">
                        <div className="text-2xl font-black text-emerald-600">{item.value}%</div>
                        <div className="text-[10px] font-bold text-[#3B4235]/60 uppercase tracking-widest">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Resume CTA */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-black text-emerald-800">Maximize your interview chances</p>
                      <p className="text-sm text-emerald-600">Let LEKI analyze and optimize your resume for this role</p>
                    </div>
                  </div>
                  {job.customResume ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                        className="px-6 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        <FileText size={16} /> Download Resume
                      </button>
                      {showDownloadOptions && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-[#CBD0D2] rounded-xl shadow-xl py-2 min-w-[160px] z-10">
                          <button onClick={() => downloadResume('pdf')} className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-[#E9E1D1] flex items-center gap-2">
                            📄 Download as PDF
                          </button>
                          <button onClick={() => downloadResume('docx')} className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-[#E9E1D1] flex items-center gap-2">
                            📝 Download as Word
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={onAnalyze}
                      disabled={isAnalyzing}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {isAnalyzing ? 'Analyzing...' : 'Generate Custom Resume'}
                    </button>
                  )}
                </div>

                {/* Skills Match */}
                {job.analyzed && (job.matchedSkills?.length || job.missingSkills?.length) && (
                  <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Target size={20} className="text-[#3B4235]" />
                      <h3 className="font-black uppercase tracking-tight">Skills Analysis</h3>
                    </div>
                    <p className="text-sm text-[#3B4235]/60">Click on skills to see alignment with job requirements</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.matchedSkills?.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                          <ThumbsUp size={12} /> {skill}
                        </span>
                      ))}
                      {job.missingSkills?.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-[#E9E1D1] text-[#3B4235]/60 rounded-lg text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[#3B4235]" />
                    <h3 className="font-black uppercase tracking-tight">Job Description</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-[#3B4235]/80 whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} className="text-[#3B4235]" />
                  <h3 className="font-black uppercase tracking-tight">Company</h3>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-[#3B4235] rounded-2xl flex items-center justify-center text-white font-black text-3xl">
                    {job.company[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{job.company}</h2>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      View Original Posting <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E9E1D1]">
                  <p className="text-[#3B4235]/60 text-sm">
                    Company details are sourced from the original job posting. Visit the company's website for more information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEKI Copilot Panel */}
        <div className="w-96 bg-white border-l border-[#CBD0D2] flex flex-col">
          <div className="p-6 border-b border-[#E9E1D1] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#3B4235] rounded-2xl flex items-center justify-center">
                <Rocket size={24} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">LEKI</h4>
                <p className="text-[10px] font-bold text-[#3B4235]/40 uppercase tracking-widest">Your AI Copilot</p>
              </div>
            </div>
            <button className="px-3 py-1.5 border border-[#CBD0D2] text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-[#E9E1D1]">
              Quick Guide
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-[#E9E1D1]/30 p-4 rounded-2xl text-sm">
              <p>I see that you're looking at the <strong>{job.title}</strong> role at <strong>{job.company}</strong>. What would you like to know?</p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              {[
                { text: 'Tell me why this job is a good fit for me.', icon: <Target size={14} /> },
                { text: 'Give me resume tips if I want to apply.', icon: <FileText size={14} /> },
                { text: 'Generate custom resume tailored to this job.', icon: <Sparkles size={14} /> },
                { text: 'Write a cover letter for this job.', icon: <Mail size={14} /> }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={i === 2 ? onAnalyze : undefined}
                  className="w-full p-4 bg-white border border-[#CBD0D2] rounded-xl text-left text-sm font-medium hover:bg-[#E9E1D1]/30 transition-all flex items-center justify-between group"
                >
                  <span>{action.text}</span>
                  <span className="text-[#CBD0D2] group-hover:text-[#3B4235]">{action.icon}</span>
                </button>
              ))}
            </div>

            {/* Analysis Results */}
            {job.customResume && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                  <span className="font-bold text-sm">Resume Optimized!</span>
                </div>
                <p className="text-xs text-emerald-600">Your custom resume has been generated and is ready to download.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#E9E1D1]">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-12 py-4 bg-[#E9E1D1]/30 border border-[#CBD0D2] rounded-full text-sm outline-none focus:border-black"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Filters Panel Component
const JobFiltersPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  filters: JobFilters;
  setFilters: (f: JobFilters) => void;
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Software/Internet/AI');

  const toggleArrayFilter = (key: keyof JobFilters, value: string) => {
    const arr = filters[key] as string[];
    if (arr.includes(value)) {
      setFilters({ ...filters, [key]: arr.filter(v => v !== value) });
    } else {
      setFilters({ ...filters, [key]: [...arr, value] });
    }
  };

  const totalFilters = filters.jobFunctions.length + filters.jobTypes.length + filters.workModels.length + 
    filters.experienceLevels.length + filters.industries.length + filters.skills.length + 
    filters.companyStages.length + (filters.excludeStaffingAgency ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#E9E1D1]">
          <button onClick={onClose} className="p-2 hover:bg-[#E9E1D1] rounded-xl transition-colors">
            <ChevronRight size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-[#3B4235]" />
            <span className="text-xl font-black uppercase tracking-tight">Filters</span>
            {totalFilters > 0 && (
              <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-black">{totalFilters}</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            Update
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Sections */}
          <div className="w-56 border-r border-[#E9E1D1] bg-[#E9E1D1]/20 py-4">
            {[
              { id: 'basic', label: 'Basic Job Criteria', desc: 'Job Function / Type / Model' },
              { id: 'compensation', label: 'Compensation', desc: 'Salary / Preferences' },
              { id: 'interests', label: 'Areas of Interest', desc: 'Industry / Skill / Role' },
              { id: 'company', label: 'Company Insights', desc: 'Company / Stage / Source' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full px-6 py-4 text-left transition-all ${
                  activeSection === section.id 
                    ? 'bg-white border-l-4 border-emerald-500' 
                    : 'hover:bg-white/50 border-l-4 border-transparent'
                }`}
              >
                <p className={`font-bold text-sm ${activeSection === section.id ? 'text-black' : 'text-[#3B4235]'}`}>
                  {section.label}
                </p>
                <p className="text-[10px] text-[#3B4235]/50 mt-0.5">{section.desc}</p>
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Basic Job Criteria */}
            {activeSection === 'basic' && (
              <div className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-[#3B4235]">Basic Job Criteria</h3>

                {/* Job Function */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                      <span className="text-red-500">*</span> Job Function
                    </label>
                    <span className="text-[10px] text-[#3B4235]/50">(select from drop-down)</span>
                  </div>
                  
                  {/* Selected Functions */}
                  {filters.jobFunctions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {filters.jobFunctions.map((func) => (
                        <span 
                          key={func}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold"
                        >
                          {func}
                          <button onClick={() => toggleArrayFilter('jobFunctions', func)} className="hover:text-emerald-900">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  <div className="border border-[#CBD0D2] rounded-2xl overflow-hidden">
                    {Object.entries(JOB_FUNCTION_CATEGORIES).map(([category, subcategories]) => (
                      <div key={category} className="border-b border-[#E9E1D1] last:border-b-0">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          className={`w-full px-5 py-4 flex items-center justify-between text-left transition-all ${
                            expandedCategory === category ? 'bg-emerald-50' : 'hover:bg-[#E9E1D1]/30'
                          }`}
                        >
                          <span className="font-bold text-sm">{category}</span>
                          <ChevronRight size={18} className={`transition-transform ${expandedCategory === category ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {expandedCategory === category && (
                          <div className="px-5 py-4 bg-[#E9E1D1]/10">
                            {typeof subcategories === 'object' && !Array.isArray(subcategories) ? (
                              Object.entries(subcategories).map(([subcat, roles]) => (
                                <div key={subcat} className="mb-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">{subcat}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {roles.map((role) => (
                                      <button
                                        key={role}
                                        onClick={() => toggleArrayFilter('jobFunctions', role)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                          filters.jobFunctions.includes(role)
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white border border-[#CBD0D2] text-[#3B4235] hover:border-emerald-500'
                                        }`}
                                      >
                                        {role}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {(subcategories as string[]).map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => toggleArrayFilter('jobFunctions', role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      filters.jobFunctions.includes(role)
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white border border-[#CBD0D2] text-[#3B4235] hover:border-emerald-500'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
                    <span className="text-red-500">*</span> Job Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {JOB_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          filters.jobTypes.includes(type) 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-[#CBD0D2] group-hover:border-emerald-400'
                        }`}>
                          {filters.jobTypes.includes(type) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#3B4235]">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Model */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
                    <span className="text-red-500">*</span> Work Model
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {WORK_MODELS.map((model) => (
                      <label key={model} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          filters.workModels.includes(model) 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-[#CBD0D2] group-hover:border-emerald-400'
                        }`}>
                          {filters.workModels.includes(model) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#3B4235]">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-1">
                    <span className="text-red-500">*</span> Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          filters.experienceLevels.includes(level) 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-[#CBD0D2] group-hover:border-emerald-400'
                        }`}>
                          {filters.experienceLevels.includes(level) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#3B4235]">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Posted */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235]">Date Posted</label>
                  <div className="grid grid-cols-2 gap-3">
                    {DATE_POSTED_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => setFilters({ ...filters, datePosted: filters.datePosted === option ? '' : option })}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          filters.datePosted === option
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#E9E1D1]/30 text-[#3B4235] hover:bg-[#E9E1D1]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Compensation */}
            {activeSection === 'compensation' && (
              <div className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-[#3B4235]">Compensation</h3>

                {/* Salary Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-[#3B4235]">Minimum Annual Salary (LPA)</label>
                    <span className="text-sm font-black text-emerald-600">₹{filters.salaryMin} LPA</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="2"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({ ...filters, salaryMin: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#E9E1D1] rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[#3B4235]/40">
                    <span>₹0 LPA</span>
                    <span>₹50+ LPA</span>
                  </div>
                </div>

                {/* Fresher Friendly */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-2">
                    Job Preferences
                    <HelpCircle size={14} className="text-[#CBD0D2]" />
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-4 bg-[#E9E1D1]/20 rounded-2xl cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        filters.excludeStaffingAgency 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'border-[#CBD0D2] group-hover:border-emerald-400'
                      }`}>
                        {filters.excludeStaffingAgency && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#3B4235]">Direct Hiring Only</span>
                        <p className="text-[10px] text-[#3B4235]/50 mt-0.5">Exclude staffing agencies and consultancies</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tip for Indian Students */}
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-emerald-500 mt-0.5">💡</div>
                    <div>
                      <p className="font-bold text-sm text-emerald-800">Pro Tip for Freshers</p>
                      <p className="text-xs text-emerald-600 mt-1">Focus on startups and growth-stage companies - they're more likely to hire fresh graduates and offer better learning opportunities.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Areas of Interest */}
            {activeSection === 'interests' && (
              <div className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-[#3B4235]">Areas of Interest</h3>

                {/* Industry */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-[#3B4235]">Industry</label>
                    {filters.industries.length > 0 && (
                      <button 
                        onClick={() => setFilters({ ...filters, industries: [] })}
                        className="text-[10px] font-bold text-[#3B4235]/50 hover:text-red-500 flex items-center gap-1"
                      >
                        <X size={12} /> Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {INDUSTRIES.map((industry) => (
                      <label key={industry} className="flex items-center justify-between p-3 bg-[#E9E1D1]/20 rounded-xl cursor-pointer hover:bg-[#E9E1D1]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            filters.industries.includes(industry) 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'border-[#CBD0D2]'
                          }`}>
                            {filters.industries.includes(industry) && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-[#3B4235]">{industry}</span>
                        </div>
                        <button className="text-[#CBD0D2] hover:text-red-500">
                          <X size={14} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills Input */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235]">Skills</label>
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter..."
                    className="w-full px-5 py-4 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-xl outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        toggleArrayFilter('skills', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                          {skill}
                          <button onClick={() => toggleArrayFilter('skills', skill)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Role Type */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235]">Role Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'ic', label: 'Individual Contributor' },
                      { id: 'manager', label: 'Manager' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFilters({ ...filters, roleType: filters.roleType === type.id ? 'all' : type.id as any })}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          filters.roleType === type.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#E9E1D1]/30 text-[#3B4235] hover:bg-[#E9E1D1]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Company Insights */}
            {activeSection === 'company' && (
              <div className="space-y-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-[#3B4235]">Company Insights</h3>

                {/* Company Stage */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-2">
                      Company Stage
                      <HelpCircle size={14} className="text-[#CBD0D2]" />
                    </label>
                    {filters.companyStages.length > 0 && (
                      <button 
                        onClick={() => setFilters({ ...filters, companyStages: [] })}
                        className="text-[10px] font-bold text-[#3B4235]/50 hover:text-red-500 flex items-center gap-1"
                      >
                        <X size={12} /> Clear All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {COMPANY_STAGES.map((stage) => (
                      <label key={stage} className="flex items-center gap-3 p-4 bg-[#E9E1D1]/20 rounded-xl cursor-pointer group hover:bg-[#E9E1D1]/40 transition-colors">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          filters.companyStages.includes(stage) 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-[#CBD0D2] group-hover:border-emerald-400'
                        }`}>
                          {filters.companyStages.includes(stage) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-xs font-bold text-[#3B4235]">{stage}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Job Source */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#3B4235] flex items-center gap-2">
                    Job Source
                    <HelpCircle size={14} className="text-[#CBD0D2]" />
                  </label>
                  <label className="flex items-center gap-4 p-4 bg-[#E9E1D1]/20 rounded-2xl cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      filters.excludeStaffingAgency 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-[#CBD0D2] group-hover:border-emerald-400'
                    }`}>
                      {filters.excludeStaffingAgency && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#3B4235]">Exclude Staffing Agencies</span>
                      <p className="text-[10px] text-[#3B4235]/50 mt-0.5">Only show direct employer postings</p>
                    </div>
                  </label>
                </div>

                {/* Tip */}
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-500 mt-0.5">💡</div>
                    <div>
                      <p className="font-bold text-sm text-amber-800">Applying for specific companies?</p>
                      <p className="text-xs text-amber-600 mt-1">Use the Company Search to find your target companies directly.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#E9E1D1] flex items-center justify-between bg-[#E9E1D1]/20">
          <button 
            onClick={() => setFilters({
              jobFunctions: [],
              jobTypes: [],
              workModels: [],
              locations: [],
              experienceLevels: [],
              salaryMin: 0,
              industries: [],
              skills: [],
              roleType: 'all',
              companyStages: [],
              excludeStaffingAgency: false,
              datePosted: ''
            })}
            className="text-sm font-bold text-[#3B4235]/60 hover:text-red-500 transition-colors"
          >
            Clear All Filters
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3B4235] transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Filter Tags Component
const FilterTags = ({ filters, setFilters, onEditClick }: { 
  filters: JobFilters; 
  setFilters: (f: JobFilters) => void;
  onEditClick: () => void;
}) => {
  const allTags = [
    ...filters.jobFunctions,
    ...filters.jobTypes,
    ...filters.workModels,
    ...filters.experienceLevels.slice(0, 2)
  ];
  
  const visibleTags = allTags.slice(0, 6);
  const remainingCount = allTags.length - visibleTags.length;

  const removeTag = (tag: string) => {
    setFilters({
      ...filters,
      jobFunctions: filters.jobFunctions.filter(t => t !== tag),
      jobTypes: filters.jobTypes.filter(t => t !== tag),
      workModels: filters.workModels.filter(t => t !== tag),
      experienceLevels: filters.experienceLevels.filter(t => t !== tag)
    });
  };

  if (allTags.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap py-4">
      {visibleTags.map((tag) => (
        <button
          key={tag}
          onClick={() => removeTag(tag)}
          className="group inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#CBD0D2] rounded-xl text-xs font-bold text-[#3B4235] hover:border-red-300 hover:bg-red-50 transition-all"
        >
          {tag}
          <X size={12} className="text-[#CBD0D2] group-hover:text-red-500" />
        </button>
      ))}
      
      {remainingCount > 0 && (
        <span className="px-3 py-2 bg-[#E9E1D1] rounded-xl text-xs font-black text-[#3B4235]">
          +{remainingCount}
        </span>
      )}

      <button
        onClick={onEditClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all"
      >
        <Filter size={14} />
        Edit Filters
      </button>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false, badge = null, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${active ? 'bg-white text-black shadow-sm font-bold' : 'text-[#3B4235]/60 hover:bg-white/50'}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-black' : 'text-[#3B4235]/40'} />
      <span className="text-sm tracking-tight">{label}</span>
    </div>
    {badge && (
      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${badge === '✓' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
        {badge}
      </span>
    )}
  </button>
);

const Navbar = ({ setView, currentView, user, onLogout }: { setView: (v: View) => void, currentView: View, user?: FirebaseUser | null, onLogout?: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (currentView === 'job-portal') return null;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || currentView !== 'landing' ? 'bg-white shadow-sm py-4' : 'bg-transparent py-8'}`}>
      <div className="site-container flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-xl">
            <Rocket size={20} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase text-black italic">GradIndStud</span>
        </div>

        <div className="hidden lg:flex items-center gap-10 font-bold text-xs uppercase tracking-widest text-[#3B4235]">
          <button onClick={() => setView('landing')} className="hover:text-black">Home</button>
          <button onClick={() => setView('job-portal')} className="hover:text-black">Job Matches</button>
          <button onClick={() => setView('resume-manager')} className="hover:text-black">My Resumes</button>
          <button onClick={() => setView('resume-builder')} className="hover:text-black">AI Optimizer</button>
          <button onClick={() => setView('cover-letter')} className="hover:text-black">Cover Letter</button>
          <button onClick={() => setView('applications')} className="hover:text-black">Tracker</button>
          <button onClick={() => setView('interview-prep')} className="hover:text-black">Interview</button>
          <button onClick={() => setView('company-insights')} className="hover:text-black">Companies</button>
          <button onClick={() => setView('notifications')} className="hover:text-black relative">
            <Bell size={18} />
          </button>
          <div className="w-[1px] h-4 bg-[#CBD0D2]" />
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border-2 border-emerald-500" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-[10px] normal-case">{user.displayName?.split(' ')[0] || 'User'}</span>
                <ChevronDown size={14} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-sm normal-case">{user.displayName}</p>
                    <p className="text-xs text-gray-500 normal-case">{user.email}</p>
                  </div>
                  <button onClick={() => { setView('job-portal'); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 normal-case text-sm">
                    <Briefcase size={16} /> Dashboard
                  </button>
                  <button onClick={() => { setView('resume-manager'); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 normal-case text-sm">
                    <FileText size={16} /> My Resumes
                  </button>
                  <button onClick={() => { setView('resume-builder'); setShowUserMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 normal-case text-sm">
                    <Sparkles size={16} /> AI Optimizer
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={() => { onLogout?.(); setShowUserMenu(false); }} 
                      className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 normal-case text-sm"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
          <button onClick={() => setView('login')} className="hover:text-black">Login</button>
              <button onClick={() => setView('login')} className="bg-black text-white px-8 py-3 hover:bg-[#3B4235] transition-all rounded-xl">
                Get Started
          </button>
            </>
          )}
        </div>

        <button className="lg:hidden text-black" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenu && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#CBD0D2] p-8 flex flex-col gap-6 font-bold uppercase tracking-widest text-sm shadow-xl">
          {user && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="font-bold normal-case">{user.displayName}</p>
                <p className="text-xs text-gray-500 normal-case font-normal">{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={() => { setView('landing'); setMobileMenu(false); }} className="text-left">Home</button>
          <button onClick={() => { setView('job-portal'); setMobileMenu(false); }} className="text-left">Job Matches</button>
          <button onClick={() => { setView('resume-manager'); setMobileMenu(false); }} className="text-left">My Resumes</button>
          <button onClick={() => { setView('resume-builder'); setMobileMenu(false); }} className="text-left">AI Optimizer</button>
          <button onClick={() => { setView('cover-letter'); setMobileMenu(false); }} className="text-left">Cover Letter</button>
          <button onClick={() => { setView('applications'); setMobileMenu(false); }} className="text-left">Tracker</button>
          <button onClick={() => { setView('interview-prep'); setMobileMenu(false); }} className="text-left">Interview</button>
          <button onClick={() => { setView('company-insights'); setMobileMenu(false); }} className="text-left">Companies</button>
          <button onClick={() => { setView('notifications'); setMobileMenu(false); }} className="text-left flex items-center gap-2">
            <Bell size={16} /> Notifications
          </button>
          {user ? (
            <button onClick={() => { onLogout?.(); setMobileMenu(false); }} className="w-full bg-red-500 text-white py-4 rounded-xl">Sign Out</button>
          ) : (
            <button onClick={() => { setView('login'); setMobileMenu(false); }} className="w-full bg-black text-white py-4 rounded-xl">Login</button>
          )}
        </div>
      )}
    </nav>
  );
};

const JobPortal = ({ setView, user }: { setView: (v: View) => void; user?: FirebaseUser | null }) => {
  const [activeTab, setActiveTab] = useState('Real Jobs');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [selectedExternalJob, setSelectedExternalJob] = useState<ExternalJob | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
  const { getJobs: getExternalJobs, addJob: addExternalJob, updateJob: updateExternalJob } = useExternalJobsStorage();
  
  // Real Jobs State
  const [realJobs, setRealJobs] = useState<RealJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('software engineer');
  const [jobSearchLocation, setJobSearchLocation] = useState('India');
  const [selectedRealJob, setSelectedRealJob] = useState<RealJob | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  const fetchRealJobs = async (query?: string, location?: string) => {
    if (!hasJobApiKey()) {
      setShowApiKeyModal(true);
      return;
    }
    setIsLoadingJobs(true);
    try {
      const jobs = await searchJobs(query || jobSearchQuery, location || jobSearchLocation);
      setRealJobs(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setJobApiKey(apiKeyInput.trim());
      setShowApiKeyModal(false);
      fetchRealJobs();
    }
  };
  
  useEffect(() => {
    setExternalJobs(getExternalJobs());
    // Load real jobs on mount if API key exists
    if (hasJobApiKey()) {
      fetchRealJobs();
    }
  }, []);

  const [filters, setFilters] = useState<JobFilters>({
    jobFunctions: ['DevOps Engineer', 'Cloud Engineer', 'Backend Engineer'],
    jobTypes: ['Full-time'],
    workModels: ['Onsite', 'Hybrid'],
    locations: [],
    experienceLevels: ['Entry Level'],
    salaryMin: 0,
    industries: [],
    skills: [],
    roleType: 'all',
    companyStages: ['Early Stage', 'Growth Stage'],
    excludeStaffingAgency: true,
    datePosted: 'Past week'
  });
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('Welcome back! I\'m LEKI, your AI career copilot. Let\'s find your perfect role today.');

  const handleAddExternalJob = (job: Omit<ExternalJob, 'id' | 'createdAt' | 'analyzed'>) => {
    const newJob = addExternalJob(job);
    setExternalJobs([newJob, ...externalJobs]);
    setActiveTab('External');
  };

  const analyzeExternalJob = async (job: ExternalJob) => {
    if (!ai) {
      alert('AI service not configured. Please add your GEMINI_API_KEY to .env file and restart the server.');
      return;
    }

    setIsAnalyzingJob(true);
    try {
      const systemPrompt = `You are LEKI, an expert career advisor and resume optimization specialist. 
Analyze job descriptions and help candidates understand their fit for roles. 
Provide practical, actionable insights. Always respond in the exact JSON format requested.`;

      const prompt = `Analyze this job description and generate a tailored resume analysis.

Job Title: ${job.title}
Company: ${job.company || 'Unknown Company'}
Job Description:
${job.description}

Analyze this role and provide insights for a job seeker. Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, just the JSON):
{
  "matchScore": 75,
  "expMatch": 80,
  "skillMatch": 70,
  "industryMatch": 65,
  "matchedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "customResume": "A professional resume tailored for this role..."
}

For matchedSkills: Extract 5-8 key skills mentioned in the job description.
For missingSkills: List 3-5 skills that entry-level candidates often lack for this role.
For customResume: Generate a well-formatted professional resume template optimized for this specific role.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt
        }
      });

      const text = response.text || "";
      console.log('LEKI Analysis Response:', text);
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updates = {
          matchScore: parsed.matchScore || 75,
          expMatch: parsed.expMatch || 80,
          skillMatch: parsed.skillMatch || 70,
          industryMatch: parsed.industryMatch || 60,
          matchedSkills: parsed.matchedSkills || ['JavaScript', 'Python', 'Problem Solving'],
          missingSkills: parsed.missingSkills || ['Leadership', 'Advanced Concepts'],
          customResume: parsed.customResume || "Resume analysis complete. Upload your resume for personalized optimization.",
          analyzed: true
        };
        
        updateExternalJob(job.id, updates);
        setExternalJobs(getExternalJobs());
        setSelectedExternalJob({ ...job, ...updates });
      } else {
        // If no JSON found, provide default analysis
        const updates = {
          matchScore: 70,
          expMatch: 75,
          skillMatch: 65,
          industryMatch: 60,
          matchedSkills: ['Communication', 'Problem Solving', 'Team Work', 'Technical Skills'],
          missingSkills: ['Industry Experience', 'Leadership'],
          customResume: "Analysis complete. Upload your resume in the Resume Builder for detailed optimization.",
          analyzed: true
        };
        
        updateExternalJob(job.id, updates);
        setExternalJobs(getExternalJobs());
        setSelectedExternalJob({ ...job, ...updates });
      }
    } catch (e: any) {
      console.error('Analysis failed:', e);
      const errorMessage = e?.message || 'Unknown error';
      if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('403')) {
        alert('API key error. Please check your GEMINI_API_KEY in .env file and restart the server.');
      } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        alert('API quota exceeded. Please try again later.');
      } else {
        alert(`Analysis failed: ${errorMessage}. Please try again.`);
      }
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Sample jobs removed - use Real Jobs tab for actual listings
  const mockJobs: Job[] = [];

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      // Filter by job type
      if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.type)) {
        return false;
      }
      return true;
    });
  }, [filters, mockJobs]);

  const handleAiChat = async (directPrompt?: string) => {
    const prompt = directPrompt || chatInput;
    if (!prompt) return;
    if (!ai) {
      setAiResponse("AI service not configured. Please add your GEMINI_API_KEY to .env file.");
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: LEKI_CHAT_PROMPT
        }
      });
      setAiResponse(response.text || "I'm sorry, I couldn't process that.");
      setChatInput('');
    } catch (e) {
      setAiResponse("Connectivity issues. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
    {/* Filters Panel */}
    <JobFiltersPanel 
      isOpen={showFilters} 
      onClose={() => setShowFilters(false)} 
      filters={filters} 
      setFilters={setFilters} 
    />

    {/* Add External Job Modal */}
    <AddExternalJobModal
      isOpen={showAddExternal}
      onClose={() => setShowAddExternal(false)}
      onAdd={handleAddExternalJob}
    />

    {/* External Job Detail View */}
    {selectedExternalJob && (
      <ExternalJobDetail
        job={selectedExternalJob}
        onClose={() => setSelectedExternalJob(null)}
        onAnalyze={() => analyzeExternalJob(selectedExternalJob)}
        isAnalyzing={isAnalyzingJob}
      />
    )}

    {/* API Key Modal */}
    {showApiKeyModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Key size={20} /> Add Job Search API Key</h2>
            <button onClick={() => setShowApiKeyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            To search real jobs, you need a free API key from RapidAPI.
          </p>
          <ol className="text-sm text-gray-600 mb-4 space-y-2">
            <li>1. Go to <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch" target="_blank" className="text-blue-600 underline">RapidAPI JSearch</a></li>
            <li>2. Click "Subscribe to Test" (Free - 100 requests/month)</li>
            <li>3. Copy your X-RapidAPI-Key</li>
          </ol>
          <input
            type="text"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Paste your RapidAPI key here"
            className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none mb-4"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowApiKeyModal(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancel</button>
            <button onClick={handleSaveApiKey} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Save Key</button>
          </div>
        </div>
      </div>
    )}

    {/* Real Job Detail Modal */}
    {selectedRealJob && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {selectedRealJob.companyLogo ? (
                  <img src={selectedRealJob.companyLogo} alt={selectedRealJob.company} className="w-16 h-16 rounded-xl object-contain bg-gray-100 p-2" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">
                    {selectedRealJob.company.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedRealJob.title}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Briefcase size={16} /> {selectedRealJob.company}
                    <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Shield size={10} /> Verified
                    </span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRealJob(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Job Details */}
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm">
                <MapPin size={16} /> {selectedRealJob.location}
              </span>
              {selectedRealJob.isRemote && (
                <span className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold">
                  <Globe size={16} /> Remote
                </span>
              )}
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm">
                <Clock size={16} /> {selectedRealJob.type}
              </span>
              {selectedRealJob.salary && (
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold">
                  <IndianRupee size={16} /> {selectedRealJob.salary}
                </span>
              )}
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm">
                <Calendar size={16} /> {selectedRealJob.postedAt}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Job Description</h3>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {selectedRealJob.description}
              </div>
            </div>

            {/* Source */}
            <div className="text-sm text-gray-400 mb-6">
              Source: {selectedRealJob.source}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <a
                href={selectedRealJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-black text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-[#3B4235]"
              >
                <ExternalLink size={18} /> Apply on {selectedRealJob.source}
              </a>
              <button
                onClick={() => {
                  // Add to tracker
                  if (user) {
                    saveJobApplication(user.uid, {
                      jobTitle: selectedRealJob.title,
                      company: selectedRealJob.company,
                      location: selectedRealJob.location,
                      salary: selectedRealJob.salary || '',
                      jobUrl: selectedRealJob.applyUrl,
                      status: 'saved',
                      notes: `Found via ${selectedRealJob.source}`
                    });
                    alert('Job saved to tracker!');
                  } else {
                    setView('login');
                  }
                }}
                className="px-6 py-4 border-2 border-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50"
              >
                <Heart size={18} /> Save to Tracker
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    <div className="flex h-screen bg-[#E9E1D1] overflow-hidden">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-[#CBD0D2] flex flex-col p-6 space-y-8 bg-[#E9E1D1]/50">
        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-xl">
             <Rocket size={20} />
          </div>
          <span className="text-xl font-black uppercase tracking-tight italic">GradIndStud</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={Briefcase} label="Jobs" active />
          <SidebarItem icon={FileText} label="Resume" onClick={() => setView('resume-manager')} />
          <SidebarItem icon={Target} label="Tracker" onClick={() => setView('applications')} />
          <SidebarItem icon={MessageSquare} label="Interview" onClick={() => setView('interview-prep')} />
          <SidebarItem icon={Briefcase} label="Companies" onClick={() => setView('company-insights')} />
        </nav>

        <div className="mt-auto space-y-6">
          <div className="space-y-1">
            <SidebarItem icon={Bell} label="Notifications" onClick={() => setView('notifications')} />
            <SidebarItem icon={FileText} label="Cover Letter" onClick={() => setView('cover-letter')} />
            <SidebarItem icon={Settings} label="AI Optimizer" onClick={() => setView('resume-builder')} />
          </div>
        </div>
      </aside>

      {/* CENTRAL JOB FEED */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="px-10 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <h2 className="text-3xl font-black uppercase tracking-tight">Jobs</h2>
                 <ChevronRight size={24} className="text-[#CBD0D2]" />
              </div>
              <div className="flex bg-white/40 p-1.5 rounded-2xl border border-[#CBD0D2]">
                {[
                  { id: 'Real Jobs', count: realJobs.length },
                  { id: 'Recommended', count: null },
                  { id: 'External', count: externalJobs.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? tab.id === 'External' 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'bg-black text-white shadow-lg' 
                        : 'text-[#3B4235]/40 hover:text-[#3B4235]'
                    }`}
                  >
                    {tab.id}
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-black text-white'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative w-80">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CBD0D2]" />
              <input type="text" placeholder="Search by title or company" className="w-full pl-14 pr-6 py-3.5 bg-white border border-[#CBD0D2] rounded-full text-xs font-bold outline-none focus:border-black transition-all" />
            </div>
          </div>

          {/* Filter Tags */}
          <FilterTags 
            filters={filters} 
            setFilters={setFilters} 
            onEditClick={() => setShowFilters(true)} 
          />

          {/* Sorting */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-[#CBD0D2]" />
              <span className="text-xs font-bold text-[#3B4235]/60">
                {filteredJobs.length} jobs match your criteria
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3B4235]/40">Sort by:</span>
              <select className="appearance-none px-4 py-2 bg-white border border-[#CBD0D2] rounded-xl text-xs font-black text-[#3B4235] outline-none cursor-pointer">
                <option>Recommended</option>
                <option>Most Recent</option>
                <option>Highest Match</option>
                <option>Salary (High to Low)</option>
              </select>
            </div>
          </div>
        </header>

        <section className="px-10 py-4 space-y-6 max-w-5xl">
          {/* Real Jobs Tab Content */}
          {activeTab === 'Real Jobs' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Job Title / Keywords</label>
                    <input
                      type="text"
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      placeholder="e.g., Software Engineer, Data Scientist"
                      className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Location</label>
                    <input
                      type="text"
                      value={jobSearchLocation}
                      onChange={(e) => setJobSearchLocation(e.target.value)}
                      placeholder="e.g., India, Bangalore, Remote"
                      className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                    />
                  </div>
                  <button
                    onClick={() => fetchRealJobs()}
                    disabled={isLoadingJobs}
                    className="px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#3B4235] disabled:opacity-50"
                  >
                    {isLoadingJobs ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    Search Jobs
                  </button>
                </div>

                {/* Quick Categories */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-gray-500 mb-2">Quick Search:</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_CATEGORIES.slice(0, 8).map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setJobSearchQuery(cat.query);
                          fetchRealJobs(cat.query);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all"
                      >
                        {cat.name}
              </button>
            ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              {isLoadingJobs ? (
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-12 text-center">
                  <Loader2 size={40} className="animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="font-bold text-gray-500">Searching real jobs...</p>
                  <p className="text-sm text-gray-400">Fetching from LinkedIn, Indeed, and more</p>
                </div>
              ) : realJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-12 text-center">
                  <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-bold text-gray-500 mb-2">No jobs found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {hasJobApiKey() 
                      ? 'Try a different search query or location' 
                      : 'Add your RapidAPI key to search real jobs'}
                  </p>
                  {!hasJobApiKey() && (
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="px-6 py-3 bg-black text-white rounded-xl font-bold"
                    >
                      Add API Key
            </button>
                  )}
          </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-500">{realJobs.length} real jobs found</p>
                  {realJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedRealJob(job)}
                      className="bg-white rounded-2xl border border-[#CBD0D2] p-6 hover:border-black hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-14 h-14 rounded-xl object-contain bg-gray-100 p-2" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">
                            {job.company.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg hover:text-blue-600">{job.title}</h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Briefcase size={14} /> {job.company}
                                <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Shield size={10} /> Verified
                                </span>
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">{job.postedAt}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                            {job.isRemote && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Remote</span>}
                            <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                            {job.salary && <span className="flex items-center gap-1 text-emerald-600 font-bold"><IndianRupee size={14} /> {job.salary}</span>}
                          </div>
                          <p className="text-sm text-gray-400 mt-3 line-clamp-2">{job.description.slice(0, 200)}...</p>
                          <div className="flex items-center gap-2 mt-4">
                            <span className="text-xs text-gray-400">Source: {job.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* External Jobs Tab Content */}
          {activeTab === 'External' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#3B4235]/60">{externalJobs.length} External jobs added</p>
                <button
                  onClick={() => setShowAddExternal(true)}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <PlusCircle size={16} /> Add Job
                </button>
              </div>

              {externalJobs.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-[#CBD0D2]">
                  <div className="w-16 h-16 bg-[#E9E1D1] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ExternalLink size={32} className="text-[#CBD0D2]" />
                  </div>
                  <p className="font-bold text-[#3B4235]/60 mb-2">No external jobs yet</p>
                  <p className="text-sm text-[#3B4235]/40 mb-6">Add jobs you find on other websites to track and analyze them</p>
                  <button
                    onClick={() => setShowAddExternal(true)}
                    className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3B4235] transition-all"
                  >
                    Add Your First Job
              </button>
                </div>
              ) : (
                externalJobs.map((job) => (
                  <div 
                    key={job.id}
                    onClick={() => setSelectedExternalJob(job)}
                    className="bg-white rounded-2xl border border-[#CBD0D2] p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-[#3B4235] rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                        {job.company[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#E9E1D1] text-[#3B4235] rounded-full text-[10px] font-black uppercase">External</span>
                        </div>
                        <h3 className="text-xl font-black mb-1 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-[#3B4235]/60 mb-4">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-[#3B4235]/40 font-medium">
                          {job.location && <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>}
                          {job.type && <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>}
                          <span className="flex items-center gap-1"><FileText size={14} /> Added {timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {job.analyzed ? (
                          <div className="text-center">
                            <div className="text-2xl font-black text-emerald-600">{job.matchScore}%</div>
                            <div className="text-[9px] font-bold text-emerald-600 uppercase">Match</div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); analyzeExternalJob(job); }}
                            className="px-4 py-2 bg-[#E9E1D1] text-[#3B4235] rounded-xl text-xs font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                          >
                            <Sparkles size={14} /> Analyze
            </button>
                        )}
                        <button className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase hover:bg-[#3B4235] transition-all">
                          Custom Resume
                        </button>
                        <a 
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all"
                        >
                          Apply
                        </a>
          </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recommended Tab - Direct to Real Jobs */}
          {activeTab === 'Recommended' && filteredJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#CBD0D2] p-12 text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold mb-2">Use Real Jobs Tab</h3>
              <p className="text-gray-500 mb-6">
                Click on "Real Jobs" tab to search for actual job listings from LinkedIn, Indeed, and more!
              </p>
              <button
                onClick={() => setActiveTab('Real Jobs')}
                className="px-8 py-4 bg-black text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-[#3B4235]"
              >
                <Search size={18} /> Search Real Jobs
              </button>
            </div>
          )}

          {/* Recommended/Liked/Applied Jobs */}
          {activeTab !== 'External' && activeTab !== 'Real Jobs' && filteredJobs.length > 0 ? filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-[2.5rem] border border-[#CBD0D2] overflow-hidden flex shadow-sm hover:shadow-xl transition-all">
              <div className="flex-1 p-10">
                <div className="flex items-start gap-8 mb-10">
                  <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                    {job.company[0]}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-[#E9E1D1] text-[#3B4235] px-3 py-1 rounded-full uppercase tracking-widest border border-[#CBD0D2]">{job.postedAt}</span>
                      <span className="text-[10px] font-black bg-white text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">{job.type}</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">{job.role}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#3B4235]/40">
                      <span className="text-black">{job.company}</span>
                      <span>/</span>
                      <span>{job.tags.join(' • ')}</span>
                    </div>
                  </div>
                  <button className="ml-auto text-[#CBD0D2] hover:text-black">
                    <MoreHorizontal size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-6 text-[12px] font-bold text-[#3B4235]/60 mb-10">
                  <div className="flex items-center gap-3"><MapPin size={18} className="text-[#CBD0D2]" /> {job.location}</div>
                  <div className="flex items-center gap-3"><Briefcase size={18} className="text-[#CBD0D2]" /> {job.type}</div>
                  <div className="flex items-center gap-3"><Zap size={18} className="text-[#CBD0D2]" /> Onsite</div>
                  <div className="flex items-center gap-3"><Target size={18} className="text-[#CBD0D2]" /> {job.experience}</div>
                  <div className="flex items-center gap-3 font-black text-black text-sm">{job.salary}</div>
                </div>

                <div className="pt-8 border-t border-[#E9E1D1] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#CBD0D2] uppercase tracking-widest">{job.applicants}+ applicants</span>
                  <div className="flex gap-4">
                    <button className="p-3 bg-[#E9E1D1]/30 rounded-2xl hover:bg-[#E9E1D1]/60 text-[#CBD0D2] transition-colors"><ThumbsDown size={20} /></button>
                    <button className="p-3 bg-[#E9E1D1]/30 rounded-2xl hover:bg-red-50 hover:text-red-500 text-[#CBD0D2] transition-colors"><Heart size={20} /></button>
                    <button className="px-8 py-3.5 bg-white border border-[#CBD0D2] text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#3B4235] hover:text-white transition-all">
                      <Sparkles size={16} /> Ask Leki
                    </button>
                    <button className="px-10 py-3.5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#3B4235] transition-all shadow-xl">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-64 bg-[#3B4235] text-white p-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
                    <circle cx="56" cy="56" r="50" stroke="#10B981" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * job.matchScore) / 100} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-4xl font-black italic">{job.matchScore}<span className="text-sm ml-0.5">%</span></span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-400 leading-none">{job.matchLevel}</h4>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.1em]">✓ Verified Employer</p>
                </div>
              </div>
            </div>
          )) : activeTab !== 'External' && (
            <div className="py-20 text-center">
              <div className="mb-4 text-[#CBD0D2] flex justify-center"><Search size={48} /></div>
              <p className="text-[#3B4235]/60 font-black uppercase tracking-widest text-sm">No roles found matching your filters</p>
              <button 
                onClick={() => setFilters({
                  ...filters,
                  jobFunctions: [],
                  jobTypes: [],
                  workModels: [],
                  experienceLevels: []
                })} 
                className="mt-4 text-emerald-600 font-bold underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* RIGHT LEKI AI COPILOT PANEL */}
      <aside className="w-96 bg-white border-l border-[#CBD0D2] flex flex-col z-10 shadow-2xl">
        <header className="p-6 border-b border-[#CBD0D2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3B4235] rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Rocket size={24} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight">Leki</h4>
              <p className="text-[10px] font-black text-[#CBD0D2] uppercase tracking-widest">Personal AI Agent</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E9E1D1]/10">
          {/* LEKI Response */}
          <div className="bg-white p-4 rounded-2xl text-sm font-medium leading-relaxed text-[#3B4235] shadow-sm border border-[#CBD0D2]">
             {aiResponse}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-[#CBD0D2] uppercase tracking-widest px-2">Quick Actions</p>
            {[
              { 
                text: '📝 Generate Resume for a Job',
                prompt: 'I want to generate a personalized resume. Please ask me about the job I am applying for and my background, then create an ATS-optimized resume tailored to that role.',
                color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              },
              { 
                text: '✉️ Write Cover Letter',
                prompt: 'Help me write a professional cover letter. Ask me about the job title, company, and my key qualifications, then generate a compelling cover letter.',
                color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
              },
              { 
                text: '🎯 Analyze Job Match',
                prompt: 'Analyze how well I match a job. Please ask me to paste the job description and tell you about my experience, then give me a match score and tips.',
                color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              },
              { 
                text: '💡 Interview Tips',
                prompt: 'Give me interview preparation tips. Ask me what role I am interviewing for and provide specific behavioral and technical questions with sample answers.',
                color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
              },
              { 
                text: '📊 Improve My Resume',
                prompt: 'I want to improve my resume. Please ask me to paste my current resume, then analyze it and suggest specific improvements for ATS optimization.',
                color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
              }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => handleAiChat(action.prompt)}
                disabled={isAiLoading}
                className={`w-full p-3 border rounded-xl text-left text-sm font-medium transition-all ${action.color}`}
              >
                {action.text}
              </button>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-[#3B4235] to-[#2a3027] p-4 rounded-2xl text-white space-y-2">
            <p className="text-xs font-bold opacity-60">💡 PRO TIP</p>
            <p className="text-sm leading-relaxed">
              Paste a job description below and I'll create a personalized resume and cover letter tailored specifically for that role!
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[#CBD0D2]">
          <div className="relative">
            <textarea 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAiChat();
                }
              }}
              placeholder="Paste job description or ask anything..."
              className="w-full pl-4 pr-14 py-4 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-2xl text-sm font-medium resize-none outline-none focus:border-black transition-all min-h-[80px]"
            />
            <button 
              onClick={handleAiChat}
              disabled={isAiLoading || !chatInput.trim()}
              className="absolute right-3 bottom-3 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-[#3B4235] transition-all disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </aside>
    </div>
    </>
  );
};

// Notification Center Component
const NotificationCenter = ({ setView, user }: { setView: (v: View) => void; user?: FirebaseUser | null }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    jobMatches: true,
    applicationUpdates: true,
    interviewReminders: true,
    tips: true
  });

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    } else {
      // Add some sample notifications for demo
      const sampleNotifications: AppNotification[] = [
        {
          id: '1',
          type: 'job_match',
          title: '🎯 New Job Match!',
          message: 'Software Engineer at Google matches your profile. Apply now!',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'tip',
          title: '💡 Career Tip',
          message: 'Complete your resume analysis to improve your ATS score by 40%',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        },
        {
          id: '3',
          type: 'interview_reminder',
          title: '📅 Interview Preparation',
          message: 'Practice behavioral questions for your upcoming interviews',
          timestamp: new Date(Date.now() - 86400000),
          read: true
        }
      ];
      setNotifications(sampleNotifications);
    }

    // Check push notification status
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in your browser');
      return;
    }

    const permission = await Notification.requestPermission();
    setPushEnabled(permission === 'granted');

    if (permission === 'granted') {
      // Show a test notification
      new Notification('🎉 Notifications Enabled!', {
        body: 'You will now receive job alerts and updates',
        icon: '/favicon.ico'
      });
      
      // Add a notification to the in-app center
      addNotification({
        type: 'system',
        title: '🔔 Notifications Enabled',
        message: 'You will now receive push notifications for job matches and updates'
      });
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Clear all notifications?')) {
      setNotifications([]);
      localStorage.removeItem('app_notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'job_match': return '🎯';
      case 'application_update': return '📋';
      case 'interview_reminder': return '📅';
      case 'tip': return '💡';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const getNotificationColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'job_match': return 'bg-blue-50 border-blue-200';
      case 'application_update': return 'bg-purple-50 border-purple-200';
      case 'interview_reminder': return 'bg-orange-50 border-orange-200';
      case 'tip': return 'bg-emerald-50 border-emerald-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12">
      <div className="site-container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('job-portal')} className="p-2 hover:bg-white rounded-lg transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-heading flex items-center gap-3">
                <span className="text-4xl">🔔</span> Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-[#3B4235]/60 text-sm">Stay updated on jobs and applications</p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white border rounded-xl text-sm font-bold hover:bg-gray-50"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-white border rounded-xl text-sm font-bold hover:bg-gray-50 text-red-500"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Push Notification Banner */}
        {!pushEnabled && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BellRing size={32} />
              <div>
                <h3 className="font-bold text-lg">Enable Push Notifications</h3>
                <p className="text-white/80 text-sm">Get instant alerts for job matches and application updates</p>
              </div>
            </div>
            <button
              onClick={requestPushPermission}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Settings size={20} /> Notification Preferences
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'jobMatches', label: '🎯 Job Matches', desc: 'New jobs matching your profile' },
              { key: 'applicationUpdates', label: '📋 Application Updates', desc: 'Status changes on your applications' },
              { key: 'interviewReminders', label: '📅 Interview Reminders', desc: 'Upcoming interview alerts' },
              { key: 'tips', label: '💡 Career Tips', desc: 'Resume tips and career advice' }
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-sm">{pref.label}</p>
                  <p className="text-xs text-gray-500">{pref.desc}</p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full transition-all ${
                    preferences[pref.key as keyof typeof preferences] ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${
                    preferences[pref.key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl border border-[#CBD0D2] overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold">Recent Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-gray-500 mb-2">No notifications yet</p>
              <p className="text-sm text-gray-400">You'll see job matches and updates here</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition-all ${!notif.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getNotificationColor(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-bold ${!notif.read ? 'text-black' : 'text-gray-600'}`}>
                            {notif.title}
                            {!notif.read && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                        </div>
                        <span className="text-xs text-gray-400">{formatTime(notif.timestamp)}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Push Notification Status */}
        {pushEnabled && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <p className="text-sm text-emerald-700">
              <span className="font-bold">Push notifications are enabled.</span> You'll receive alerts even when not on the site.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Company Insights Component
const CompanyInsights = ({ setView }: { setView: (v: View) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Popular companies for quick access
  const popularCompanies = [
    { name: 'Google', logo: '🔵', industry: 'Technology' },
    { name: 'Microsoft', logo: '🟦', industry: 'Technology' },
    { name: 'Amazon', logo: '🟠', industry: 'E-commerce' },
    { name: 'Apple', logo: '🍎', industry: 'Technology' },
    { name: 'Meta', logo: '🔷', industry: 'Social Media' },
    { name: 'Netflix', logo: '🔴', industry: 'Entertainment' },
    { name: 'Infosys', logo: '🟢', industry: 'IT Services' },
    { name: 'TCS', logo: '🔵', industry: 'IT Services' },
    { name: 'Wipro', logo: '🟣', industry: 'IT Services' },
    { name: 'Flipkart', logo: '🟡', industry: 'E-commerce' },
    { name: 'Razorpay', logo: '🔵', industry: 'Fintech' },
    { name: 'Swiggy', logo: '🟠', industry: 'Food Tech' }
  ];

  const searchCompany = async (companyName: string) => {
    if (!companyName.trim() || !ai) return;

    setIsLoading(true);
    setSelectedCompany(companyName);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [companyName, ...prev.filter(c => c !== companyName)].slice(0, 5);
      return updated;
    });

    try {
      const prompt = `You are a career research expert. Provide detailed insights about "${companyName}" as a potential employer. 

Return a JSON object with this exact structure:
{
  "name": "${companyName}",
  "overview": "2-3 sentence company description",
  "industry": "Primary industry",
  "founded": "Year founded",
  "headquarters": "HQ location",
  "employees": "Employee count range",
  "rating": <number 1-5>,
  "salaryRange": {
    "entry": "Entry level salary range in INR LPA",
    "mid": "Mid level salary range in INR LPA", 
    "senior": "Senior level salary range in INR LPA"
  },
  "culture": {
    "workLifeBalance": <1-5>,
    "growth": <1-5>,
    "compensation": <1-5>,
    "management": <1-5>,
    "diversity": <1-5>
  },
  "pros": ["pro1", "pro2", "pro3", "pro4"],
  "cons": ["con1", "con2", "con3"],
  "interviewProcess": ["step1", "step2", "step3", "step4"],
  "interviewTips": ["tip1", "tip2", "tip3"],
  "techStack": ["tech1", "tech2", "tech3", "tech4"],
  "famousFor": "What the company is known for",
  "competitors": ["competitor1", "competitor2", "competitor3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setCompanyData(data);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setCompanyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star 
            key={i} 
            size={16} 
            className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (label: string, value: number) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-32">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-bold w-8">{value}/5</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12">
      <div className="site-container max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('job-portal')} className="p-2 hover:bg-white rounded-lg transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-heading flex items-center gap-3">
              <span className="text-4xl">🏢</span> Company Insights
            </h1>
            <p className="text-[#3B4235]/60 text-sm">Research companies before you apply</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCompany(searchQuery)}
                placeholder="Search any company (e.g., Google, Infosys, Flipkart)"
                className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:border-black outline-none text-lg"
              />
            </div>
            <button
              onClick={() => searchCompany(searchQuery)}
              disabled={!searchQuery.trim() || isLoading}
              className="px-8 py-4 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#3B4235] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              Research
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !selectedCompany && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-bold text-gray-500 mb-2">Recent Searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(company => (
                  <button
                    key={company}
                    onClick={() => searchCompany(company)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-[#CBD0D2] p-12 text-center">
            <Loader2 size={48} className="animate-spin mx-auto mb-4 text-gray-400" />
            <p className="font-bold text-gray-500">Researching {selectedCompany}...</p>
            <p className="text-sm text-gray-400">Gathering salary data, reviews, and insights</p>
          </div>
        )}

        {/* Company Details */}
        {companyData && !isLoading && (
          <div className="space-y-6">
            {/* Company Header */}
            <div className="bg-white rounded-2xl border border-[#CBD0D2] p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                    {companyData.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{companyData.name}</h2>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <Briefcase size={16} /> {companyData.industry} • {companyData.headquarters}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        {renderStars(companyData.rating || 4)}
                        <span className="font-bold ml-1">{companyData.rating || 4.0}</span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <span className="text-sm text-gray-500">{companyData.employees} employees</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-sm text-gray-500">Founded {companyData.founded}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed">{companyData.overview}</p>
              {companyData.famousFor && (
                <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm"><span className="font-bold">🌟 Known for:</span> {companyData.famousFor}</p>
                </div>
              )}
            </div>

            {/* Salary & Culture Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Salary Ranges */}
              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <IndianRupee size={20} /> Salary Ranges (LPA)
                </h3>
                <div className="space-y-4">
                  {[
                    { level: 'Entry Level', range: companyData.salaryRange?.entry, color: 'bg-blue-100 text-blue-700' },
                    { level: 'Mid Level', range: companyData.salaryRange?.mid, color: 'bg-purple-100 text-purple-700' },
                    { level: 'Senior Level', range: companyData.salaryRange?.senior, color: 'bg-emerald-100 text-emerald-700' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium">{item.level}</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${item.color}`}>
                        ₹ {item.range || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Culture Ratings */}
              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Star size={20} /> Culture Ratings
                </h3>
                <div className="space-y-3">
                  {renderRatingBar('Work-Life Balance', companyData.culture?.workLifeBalance || 4)}
                  {renderRatingBar('Career Growth', companyData.culture?.growth || 4)}
                  {renderRatingBar('Compensation', companyData.culture?.compensation || 4)}
                  {renderRatingBar('Management', companyData.culture?.management || 3)}
                  {renderRatingBar('Diversity', companyData.culture?.diversity || 4)}
                </div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-600">
                  <ThumbsUp size={20} /> Pros
                </h3>
                <ul className="space-y-3">
                  {companyData.pros?.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
                  <ThumbsDown size={20} /> Cons
                </h3>
                <ul className="space-y-3">
                  {companyData.cons?.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Process */}
            <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MessageSquare size={20} /> Interview Process
              </h3>
              <div className="flex flex-wrap gap-3">
                {companyData.interviewProcess?.map((step: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">{step}</span>
                    {i < (companyData.interviewProcess?.length || 0) - 1 && (
                      <ArrowRight size={16} className="text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              {companyData.interviewTips && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-sm mb-2 text-blue-700">💡 Interview Tips:</h4>
                  <ul className="space-y-1">
                    {companyData.interviewTips?.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-blue-600">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tech Stack & Competitors */}
            <div className="grid md:grid-cols-2 gap-6">
              {companyData.techStack && (
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    💻 Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companyData.techStack?.map((tech: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {companyData.competitors && (
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    🏆 Competitors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companyData.competitors?.map((comp: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => searchCompany(comp)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all"
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popular Companies (shown when no company selected) */}
        {!selectedCompany && !isLoading && (
          <div className="bg-white rounded-2xl border border-[#CBD0D2] p-6">
            <h3 className="font-bold text-lg mb-4">🔥 Popular Companies</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCompanies.map((company) => (
                <button
                  key={company.name}
                  onClick={() => searchCompany(company.name)}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all group"
                >
                  <div className="text-3xl mb-2">{company.logo}</div>
                  <p className="font-bold group-hover:text-blue-600 transition-all">{company.name}</p>
                  <p className="text-xs text-gray-500">{company.industry}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Interview Prep Component
const InterviewPrep = ({ setView }: { setView: (v: View) => void }) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'questions' | 'tips'>('practice');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'hr'>('behavioral');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<{question: string; answer: string; feedback: string; score: number}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setUserAnswer(prev => prev + finalTranscript);
          }
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
        
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setUserAnswer(''); // Clear previous answer
      recognition.start();
      setIsRecording(true);
    }
  };

  const roles = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Business Analyst',
    'UX Designer', 'Machine Learning Engineer', 'Cloud Architect', 'QA Engineer'
  ];

  const questionBank: Record<string, Record<string, string[]>> = {
    behavioral: {
      'Software Engineer': [
        "Tell me about a time you had to debug a complex issue under pressure.",
        "Describe a situation where you disagreed with a team member's technical approach.",
        "How do you prioritize tasks when working on multiple projects?",
        "Tell me about a project you're most proud of and why.",
        "Describe a time when you had to learn a new technology quickly."
      ],
      'Product Manager': [
        "Tell me about a product decision you made that didn't go as planned.",
        "How do you prioritize features when you have limited resources?",
        "Describe a time you had to say no to a stakeholder.",
        "How do you measure the success of a product feature?",
        "Tell me about a time you turned user feedback into a product improvement."
      ],
      'Data Scientist': [
        "Tell me about a data project that had significant business impact.",
        "Describe a time when your analysis was challenged by stakeholders.",
        "How do you explain complex technical findings to non-technical audiences?",
        "Tell me about a time you had to work with messy or incomplete data.",
        "Describe a situation where you had to balance accuracy with speed."
      ]
    },
    technical: {
      'Software Engineer': [
        "Explain the difference between REST and GraphQL APIs.",
        "What is the time complexity of common sorting algorithms?",
        "How would you design a URL shortening service?",
        "Explain the concept of database indexing and when to use it.",
        "What are microservices and when would you use them?"
      ],
      'Frontend Developer': [
        "Explain the virtual DOM and how React uses it.",
        "What are the differences between CSS Grid and Flexbox?",
        "How do you optimize web application performance?",
        "Explain the concept of state management in React.",
        "What are Web Vitals and why are they important?"
      ],
      'Data Scientist': [
        "Explain the bias-variance tradeoff.",
        "What is cross-validation and why is it important?",
        "How do you handle imbalanced datasets?",
        "Explain the difference between L1 and L2 regularization.",
        "What is feature engineering and why is it important?"
      ]
    },
    hr: {
      'default': [
        "Why are you interested in this role?",
        "Where do you see yourself in 5 years?",
        "What are your salary expectations?",
        "Why are you leaving your current job?",
        "What is your greatest strength and weakness?",
        "Tell me about yourself.",
        "Why should we hire you?",
        "Do you have any questions for us?"
      ]
    }
  };

  const tips: Record<string, {title: string; tips: string[]}[]> = {
    behavioral: [
      {
        title: "Use the STAR Method",
        tips: [
          "Situation: Set the context for your story",
          "Task: Describe your responsibility",
          "Action: Explain what you did step by step",
          "Result: Share the outcome with metrics if possible"
        ]
      },
      {
        title: "Prepare Stories in Advance",
        tips: [
          "Have 5-7 stories ready that showcase different skills",
          "Include challenges, conflicts, and achievements",
          "Quantify results wherever possible",
          "Practice telling them in 2-3 minutes"
        ]
      }
    ],
    technical: [
      {
        title: "Problem-Solving Approach",
        tips: [
          "Clarify requirements before jumping into solutions",
          "Think out loud - interviewers want to see your process",
          "Start with a brute force solution, then optimize",
          "Consider edge cases and error handling"
        ]
      },
      {
        title: "System Design Tips",
        tips: [
          "Ask about scale and requirements first",
          "Start with high-level architecture",
          "Discuss trade-offs in your decisions",
          "Consider scalability, reliability, and performance"
        ]
      }
    ],
    hr: [
      {
        title: "Research the Company",
        tips: [
          "Know the company's mission, values, and recent news",
          "Understand the role and how it fits the team",
          "Prepare questions that show genuine interest",
          "Know why you want THIS specific role at THIS company"
        ]
      },
      {
        title: "Salary Negotiation",
        tips: [
          "Research market rates for your role and location",
          "Consider total compensation, not just base salary",
          "Be confident but flexible",
          "Ask for time to consider offers"
        ]
      }
    ]
  };

  const getQuestions = () => {
    if (interviewType === 'hr') {
      return questionBank.hr.default;
    }
    return questionBank[interviewType]?.[selectedRole] || questionBank[interviewType]?.['Software Engineer'] || [];
  };

  const startInterview = () => {
    const questions = getQuestions();
    if (questions.length > 0) {
      setIsInterviewing(true);
      setQuestionIndex(0);
      setCurrentQuestion(questions[0]);
      setUserAnswer('');
      setFeedback('');
      setScore(null);
      setInterviewHistory([]);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !ai) return;

    setIsLoading(true);
    try {
      const prompt = `You are LEKI, an expert interview coach. Evaluate this interview answer:

**Role:** ${selectedRole}
**Interview Type:** ${interviewType}
**Question:** ${currentQuestion}
**Candidate's Answer:** ${userAnswer}

Provide feedback in this exact JSON format:
{
  "score": <number 1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "sampleAnswer": "A brief example of a strong answer",
  "overallFeedback": "2-3 sentences of encouraging, constructive feedback"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setScore(result.score);
        setFeedback(`**Score: ${result.score}/10**

**Strengths:**
${result.strengths?.map((s: string) => `✅ ${s}`).join('\n') || 'Good effort!'}

**Areas to Improve:**
${result.improvements?.map((i: string) => `💡 ${i}`).join('\n') || 'Keep practicing!'}

**Sample Strong Answer:**
${result.sampleAnswer || 'N/A'}

**Overall:** ${result.overallFeedback || 'Good job!'}`);

        setInterviewHistory(prev => [...prev, {
          question: currentQuestion,
          answer: userAnswer,
          feedback: result.overallFeedback || '',
          score: result.score || 0
        }]);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Unable to get AI feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    const questions = getQuestions();
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setCurrentQuestion(questions[questionIndex + 1]);
      setUserAnswer('');
      setFeedback('');
      setScore(null);
    } else {
      // Interview complete
      setIsInterviewing(false);
    }
  };

  const endInterview = () => {
    setIsInterviewing(false);
    setCurrentQuestion('');
    setUserAnswer('');
    setFeedback('');
  };

  const avgScore = interviewHistory.length > 0 
    ? Math.round(interviewHistory.reduce((acc, h) => acc + h.score, 0) / interviewHistory.length * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12">
      <div className="site-container max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('job-portal')} className="p-2 hover:bg-white rounded-lg transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-heading flex items-center gap-3">
              <span className="text-4xl">🎤</span> Interview Prep
            </h1>
            <p className="text-[#3B4235]/60 text-sm">Practice with AI and ace your interviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'practice', label: 'Mock Interview', icon: '🎯' },
            { id: 'questions', label: 'Question Bank', icon: '❓' },
            { id: 'tips', label: 'Interview Tips', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {!isInterviewing ? (
              <>
                {/* Setup */}
                <div className="bg-white rounded-2xl border border-[#CBD0D2] p-8">
                  <h2 className="text-2xl font-bold mb-6">Start Mock Interview</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Select Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Interview Type</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'behavioral', label: '🧠 Behavioral' },
                          { id: 'technical', label: '💻 Technical' },
                          { id: 'hr', label: '👔 HR' }
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setInterviewType(type.id as any)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                              interviewType === type.id
                                ? 'bg-black text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startInterview}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all"
                  >
                    <Rocket size={24} /> Start Interview
                  </button>
                </div>

                {/* Previous Session Results */}
                {interviewHistory.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#CBD0D2] p-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      📊 Last Session Results
                      <span className="text-sm font-normal text-gray-500">Average Score: {avgScore}/10</span>
                    </h3>
                    <div className="space-y-4">
                      {interviewHistory.map((h, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-sm">{h.question}</p>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              h.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                              h.score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {h.score}/10
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{h.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Interview in Progress */
              <div className="bg-white rounded-2xl border border-[#CBD0D2] overflow-hidden">
                <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-60">Question {questionIndex + 1} of {getQuestions().length}</p>
                      <p className="text-sm opacity-80">{selectedRole} • {interviewType} Interview</p>
                    </div>
                    <button onClick={endInterview} className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                      End Interview
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {/* Question */}
                  <div className="mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                        🤖
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-2xl rounded-tl-none p-6">
                        <p className="text-lg font-medium">{currentQuestion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer Input */}
                  {!feedback && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Your Answer</label>
                        <div className="flex items-center gap-2">
                          {isRecording && (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-bold animate-pulse">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span> Recording...
                            </span>
                          )}
                          <button
                            onClick={toggleRecording}
                            className={`p-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                              isRecording 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                            }`}
                            title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                          >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            {isRecording ? 'Stop' : 'Speak'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder={isRecording ? "🎤 Listening... speak your answer clearly" : "Type your answer or click 'Speak' to use voice input..."}
                          rows={6}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:border-black outline-none resize-none transition-all ${
                            isRecording ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        {isRecording && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1">
                            <Volume2 size={16} className="text-red-500 animate-pulse" />
                            <div className="flex gap-0.5">
                              {[1,2,3,4].map(i => (
                                <div key={i} className="w-1 bg-red-500 rounded animate-pulse" style={{
                                  height: `${8 + Math.random() * 12}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Mic size={12} /> Pro tip: Speak naturally like you would in a real interview!
                      </p>
                      
                      <div className="flex justify-end mt-4 gap-3">
                        {userAnswer && (
                          <button
                            onClick={() => setUserAnswer('')}
                            className="px-6 py-3 border rounded-xl font-bold text-gray-500 hover:bg-gray-50"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={submitAnswer}
                          disabled={!userAnswer.trim() || isLoading || isRecording}
                          className="px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl ${
                        score && score >= 8 ? 'bg-emerald-50 border border-emerald-200' :
                        score && score >= 6 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        <div className="prose prose-sm max-w-none whitespace-pre-line">
                          {feedback}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {questionIndex < getQuestions().length - 1 ? (
                          <button
                            onClick={nextQuestion}
                            className="flex-1 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                            Next Question <ArrowRight size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={endInterview}
                            className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} /> Complete Interview
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:border-black outline-none"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {(['behavioral', 'technical', 'hr'] as const).map((type) => (
              <div key={type} className="bg-white rounded-2xl border border-[#CBD0D2] overflow-hidden">
                <div className={`p-4 ${
                  type === 'behavioral' ? 'bg-purple-50' :
                  type === 'technical' ? 'bg-blue-50' : 'bg-orange-50'
                }`}>
                  <h3 className="font-bold capitalize flex items-center gap-2">
                    {type === 'behavioral' ? '🧠' : type === 'technical' ? '💻' : '👔'}
                    {type} Questions
                  </h3>
                </div>
                <div className="divide-y">
                  {(type === 'hr' 
                    ? questionBank.hr.default 
                    : questionBank[type]?.[selectedRole] || questionBank[type]?.['Software Engineer'] || []
                  ).map((q, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 flex items-start gap-3">
                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            {(['behavioral', 'technical', 'hr'] as const).map((type) => (
              <div key={type} className="bg-white rounded-2xl border border-[#CBD0D2] overflow-hidden">
                <div className={`p-4 ${
                  type === 'behavioral' ? 'bg-purple-50' :
                  type === 'technical' ? 'bg-blue-50' : 'bg-orange-50'
                }`}>
                  <h3 className="font-bold capitalize flex items-center gap-2">
                    {type === 'behavioral' ? '🧠' : type === 'technical' ? '💻' : '👔'}
                    {type} Interview Tips
                  </h3>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {tips[type]?.map((section, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-bold mb-3">{section.title}</h4>
                      <ul className="space-y-2">
                        {section.tips.map((tip, j) => (
                          <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Application Tracker Component
const ApplicationTracker = ({ setView, user }: { setView: (v: View) => void; user?: FirebaseUser | null }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    salary: '',
    jobUrl: '',
    status: 'saved' as ApplicationStatus,
    notes: '',
    appliedDate: ''
  });

  const loadApplications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const apps = await getUserApplications(user.uid);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      company: '',
      location: '',
      salary: '',
      jobUrl: '',
      status: 'saved',
      notes: '',
      appliedDate: ''
    });
    setEditingApp(null);
  };

  const handleSubmit = async () => {
    if (!user || !formData.jobTitle || !formData.company) {
      alert('Please fill in job title and company');
      return;
    }

    try {
      if (editingApp) {
        await updateJobApplication(editingApp.id, {
          ...formData,
          appliedDate: formData.appliedDate ? new Date(formData.appliedDate) : undefined
        });
      } else {
        await saveJobApplication(user.uid, {
          ...formData,
          appliedDate: formData.appliedDate ? new Date(formData.appliedDate) : undefined
        });
      }
      setShowAddModal(false);
      resetForm();
      await loadApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    try {
      await deleteJobApplication(id);
      await loadApplications();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await updateJobApplication(id, { status: newStatus });
      await loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openEditModal = (app: JobApplication) => {
    setFormData({
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location,
      salary: app.salary || '',
      jobUrl: app.jobUrl || '',
      status: app.status,
      notes: app.notes,
      appliedDate: app.appliedDate ? app.appliedDate.toISOString().split('T')[0] : ''
    });
    setEditingApp(app);
    setShowAddModal(true);
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const statusColors: Record<ApplicationStatus, string> = {
    saved: 'bg-gray-100 text-gray-700',
    applied: 'bg-blue-100 text-blue-700',
    interviewing: 'bg-purple-100 text-purple-700',
    offer: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
    saved: <Heart size={14} />,
    applied: <Send size={14} />,
    interviewing: <MessageSquare size={14} />,
    offer: <CheckCircle2 size={14} />,
    rejected: <X size={14} />
  };

  const stats = {
    total: applications.length,
    saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offers: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to track your job applications</p>
          <button onClick={() => setView('login')} className="px-6 py-3 bg-black text-white rounded-xl font-bold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12">
      <div className="site-container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('job-portal')} className="p-2 hover:bg-white rounded-lg transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-heading">Application Tracker</h1>
              <p className="text-[#3B4235]/60 text-sm">Track all your job applications in one place</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#3B4235] transition-all"
          >
            <Plus size={18} /> Add Application
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-black text-white' },
            { label: 'Saved', value: stats.saved, color: 'bg-gray-100' },
            { label: 'Applied', value: stats.applied, color: 'bg-blue-100' },
            { label: 'Interviewing', value: stats.interviewing, color: 'bg-purple-100' },
            { label: 'Offers', value: stats.offers, color: 'bg-emerald-100' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-100' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-center`}>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'saved', 'applied', 'interviewing', 'offer', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                filter === status ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#CBD0D2] overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-gray-500 mb-2">No applications yet</p>
              <p className="text-sm text-gray-400 mb-4">Start tracking your job search journey</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{app.jobTitle}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[app.status]}`}>
                          {statusIcons[app.status]} {app.status}
                        </span>
                      </div>
                      <p className="text-gray-600 flex items-center gap-2 mb-1">
                        <Briefcase size={14} /> {app.company}
                      </p>
                      {app.location && (
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <MapPin size={14} /> {app.location}
                        </p>
                      )}
                      {app.notes && (
                        <p className="text-gray-400 text-sm mt-2 italic">"{app.notes}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="text-sm border rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button onClick={() => openEditModal(app)} className="p-2 hover:bg-gray-200 rounded-lg">
                        <Settings size={16} />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingApp ? 'Edit Application' : 'Add Application'}</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                  className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Google"
                  className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="$120K - $150K"
                    className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Job URL</label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this application..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl focus:border-black outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-[#3B4235]"
              >
                {editingApp ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cover Letter Generator Component
const CoverLetterGenerator = ({ setView }: { setView: (v: View) => void }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [yourBackground, setYourBackground] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'conversational'>('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCoverLetter = async () => {
    if (!ai) {
      alert('AI service not configured. Please add your GEMINI_API_KEY.');
      return;
    }

    if (!jobTitle || !companyName || !jobDescription) {
      alert('Please fill in the job title, company name, and job description.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a professional cover letter for the following job application.

Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
${jobDescription}

Candidate Background:
${yourBackground || 'Fresh graduate with relevant skills and enthusiasm to learn.'}

Tone: ${tone}

Requirements:
1. Keep it concise (250-350 words)
2. Use a ${tone} tone
3. Highlight relevant skills that match the job description
4. Show enthusiasm for the company and role
5. Include a strong opening and closing
6. Do NOT use placeholder text like [Your Name] - write it ready to use
7. Make it ATS-friendly
8. No generic phrases - be specific to this role

Generate ONLY the cover letter text, ready to copy and use.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      const text = response.text || "";
      setGeneratedLetter(text);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#E9E1D1] pt-24 pb-12">
      <div className="site-container max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('job-portal')} className="p-2 hover:bg-white rounded-lg transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-heading">Cover Letter Generator</h1>
            <p className="text-[#3B4235]/60 text-sm">Create AI-powered, tailored cover letters in seconds</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#CBD0D2]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-emerald-500" />
              Job Details
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#3B4235] mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 border border-[#CBD0D2] rounded-xl focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#3B4235] mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Google"
                    className="w-full px-4 py-3 border border-[#CBD0D2] rounded-xl focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#3B4235] mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-[#CBD0D2] rounded-xl focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#3B4235] mb-2">
                  Your Background (Optional)
                </label>
                <textarea
                  value={yourBackground}
                  onChange={(e) => setYourBackground(e.target.value)}
                  placeholder="Brief summary of your experience, skills, and achievements..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#CBD0D2] rounded-xl focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#3B4235] mb-2">
                  Tone
                </label>
                <div className="flex gap-3">
                  {(['professional', 'enthusiastic', 'conversational'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                        tone === t 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateCoverLetter}
                disabled={isGenerating}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#3B4235] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Cover Letter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#CBD0D2]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail size={20} className="text-emerald-500" />
                Your Cover Letter
              </h2>
              {generatedLetter && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                  </button>
                  <button
                    onClick={downloadAsTxt}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    title="Download as text"
                  >
                    <FileText size={18} />
                  </button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div className="bg-[#FAFAFA] rounded-xl p-6 border border-[#E5E5E5] min-h-[400px]">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#3B4235]">
                  {generatedLetter}
                </pre>
              </div>
            ) : (
              <div className="bg-[#FAFAFA] rounded-xl p-6 border border-[#E5E5E5] min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Mail size={32} className="text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">No Cover Letter Yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Fill in the job details and click "Generate" to create a tailored cover letter.
                </p>
              </div>
            )}

            {generatedLetter && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Pro Tips</p>
                    <ul className="text-emerald-700 text-xs mt-1 space-y-1">
                      <li>• Personalize it with your name and contact info</li>
                      <li>• Review and adjust any details before sending</li>
                      <li>• Match the format to the company's culture</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ setView, onLoginSuccess }: { setView: (v: View) => void; onLoginSuccess?: () => void }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await signInWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
      setView('job-portal');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[#E9E1D1]">
      <div className="site-container w-full max-w-5xl grid lg:grid-cols-2 bg-white border border-[#CBD0D2] shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between p-16 bg-black text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#10B981,transparent_70%)] opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <Rocket size={40} className="text-emerald-400" />
              <span className="text-3xl font-black tracking-tighter uppercase italic">GradIndStud</span>
            </div>
            <h2 className="text-6xl font-heading leading-tight mb-8">
              The <span className="text-emerald-400 italic">AI-Native</span> <br /> Career Engine.
            </h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] max-w-xs leading-relaxed">
              Propelling Indian talent into global high-growth roles through strategic matching.
            </p>
          </div>
          <div className="relative z-10 flex gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
            <span>© 2025 GRADINDSTUD</span>
            <span>SECURE ACCESS</span>
          </div>
        </div>

        <div className="p-16 flex flex-col justify-center">
          <div className="mb-12">
            <h3 className="text-4xl font-heading mb-3">Initialize Access</h3>
            <p className="text-[#3B4235]/60 font-bold uppercase tracking-widest text-[10px]">Welcome to the inner circle.</p>
          </div>

          <div className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
            </div>
            )}

            {/* Google Sign-In Button */}
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-4 p-5 bg-white border-2 border-[#CBD0D2] font-bold text-sm hover:bg-gray-50 hover:border-black transition-all rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-[#3B4235]">
                {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#CBD0D2]"></div>
              <span className="flex-shrink mx-6 text-[9px] font-black uppercase tracking-[0.3em] text-[#CBD0D2]">Secure & Fast</span>
              <div className="flex-grow border-t border-[#CBD0D2]"></div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xs text-[#3B4235]/60">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-[#3B4235]/40">
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> Secure</span>
                <span className="flex items-center gap-2"><Zap size={14} /> Fast</span>
                <span className="flex items-center gap-2"><Lock size={14} /> Private</span>
                </div>
              </div>
                </div>
        </div>
      </div>
    </div>
  );
};

const Hero = ({ setView }: { setView: (v: View) => void }) => {
  return (
    <section className="relative pt-44 pb-32 overflow-hidden bg-[#E9E1D1]">
      <div className="hero-pattern absolute inset-0" />
      <div className="site-container grid lg:grid-cols-2 gap-20 items-center">
        <div className="relative z-10 space-y-10 fade-in-section">
          <div className="inline-flex items-center gap-3 px-5 py-2 border border-[#3B4235] text-[#3B4235] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Next-Gen Indian Workforce Only</span>
          </div>
          <h1 className="text-7xl lg:text-8xl font-heading leading-none text-black">
            We don't sell hope— <br />
            <span className="text-highlight-black italic">we sell access.</span>
          </h1>
          <p className="text-xl text-[#3B4235] max-w-lg leading-relaxed font-medium">
            Access to the data, the feedback, and the global roles that actually hire. Powered by our <span className="font-bold underline">LEKI Agent</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button onClick={() => setView('login')} className="btn-primary px-12 py-6 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 group rounded-2xl">
              Get my match score
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button onClick={() => setView('resume-builder')} className="border border-black px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-[#E9E1D1] transition-all rounded-2xl">
              Build AI Resume
            </button>
          </div>
        </div>
        <div className="relative">
          <FuturisticAgent />
        </div>
      </div>
    </section>
  );
};

const Stats = () => (
  <div className="py-20 bg-white border-y border-[#CBD0D2]">
    <div className="site-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
        {[
          { label: 'Verified Roles', val: '50k+', icon: <ShieldCheck className="text-[#3B4235]" /> },
          { label: 'Match Accuracy', val: '99.9%', icon: <Target className="text-[#3B4235]" /> },
          { label: 'Max Resumes', val: '03', icon: <FileText className="text-[#3B4235]" /> },
          { label: 'Deployment', val: 'Instant', icon: <Zap className="text-[#3B4235]" /> }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3 group fade-in-section" style={{animationDelay: `${i * 0.1}s`}}>
            <div className="p-4 bg-[#E9E1D1] group-hover:bg-[#3B4235] group-hover:text-white transition-colors">{stat.icon}</div>
            <div className="text-4xl font-heading">{stat.val}</div>
            <div className="text-[10px] font-black text-[#3B4235] uppercase tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeatureCards = () => {
  const cards = [
    { 
      title: 'Verification Layer', 
      desc: 'Our agent pings HR portals to ensure the role is actually hiring, not just a data point.',
      icon: <ShieldCheck size={32} />
    },
    { 
      title: 'Strategic Rewrite', 
      desc: 'One click transforms your base resume into a targeted masterpiece that bypasses every filter.',
      icon: <FileText size={32} />
    },
    { 
      title: 'Match Analysis', 
      desc: 'Get deep intelligence on missing keywords and cultural alignment before you hit apply.',
      icon: <ScanSearch size={32} />
    },
    { 
      title: 'Global Workflow', 
      desc: 'A unified dashboard to track versions and interview calls in high-definition.',
      icon: <Rocket size={32} />
    }
  ];

  return (
    <section id="features" className="py-32 bg-white">
      <div className="site-container">
        <div className="max-w-3xl mb-24 space-y-6 fade-in-section">
          <h2 className="text-5xl lg:text-6xl font-heading">AI Agents Designed <br/>for High-Performance.</h2>
          <p className="text-xl text-[#3B4235] font-medium leading-relaxed">The traditional application model is obsolete. We've built the intelligence layer that guarantees human eyes see your profile.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#CBD0D2] border border-[#CBD0D2]">
          {cards.map((card, i) => (
            <div key={i} className="group bg-white p-16 hover:bg-[#E9E1D1] transition-all duration-700 fade-in-section" style={{animationDelay: `${i * 0.1}s`}}>
              <div className="space-y-8">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                  {card.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-heading uppercase">{card.title}</h3>
                  <p className="text-[#3B4235] leading-relaxed text-lg font-medium">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section id="results" className="py-32 bg-[#3B4235] text-white">
    <div className="site-container">
      <h2 className="text-5xl font-heading text-center mb-24">Global Placement Success</h2>
      <div className="grid md:grid-cols-3 gap-12">
        {[
          { name: 'Ananya S.', role: 'Intern @ Zomato', text: 'I was applying to 100 jobs a week with zero replies. GradIndStud identified missing System Design signals. Hired in 12 days.' },
          { name: 'Rohan M.', role: 'SDE @ Cred', text: 'The verification layer is essential. No more wasted effort on dead links. Leki communicates the role requirements perfectly.' },
          { name: 'Isha P.', role: 'Analyst @ Swiggy', text: 'The multi-resume functionality allows me to pivot instantly between Product and Data roles. The match score is surgical.' }
        ].map((t, i) => (
          <div key={i} className="p-12 border border-white/20 hover:border-white transition-colors space-y-8 fade-in-section" style={{animationDelay: `${i * 0.1}s`}}>
            <div className="flex gap-1 text-[#E9E1D1]">
              {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
            </div>
            <p className="text-xl leading-relaxed italic">"{t.text}"</p>
            <div className="pt-8 border-t border-white/10 flex items-center gap-5">
              <div className="w-12 h-12 bg-white text-black font-black flex items-center justify-center">{t.name[0]}</div>
              <div>
                <div className="font-black uppercase tracking-tighter">{t.name}</div>
                <div className="text-[10px] text-[#E9E1D1] font-black uppercase tracking-widest">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [active, setActive] = useState<number | null>(0);
  const questions = [
    { q: "HOW DOES LEKI AI VERIFY POSTINGS?", a: "Leki utilizes multi-point API verification and behavioral tracking to cross-reference hiring manager activity across global databases." },
    { q: "CAN I MAINTAIN MULTIPLE PROFILES?", a: "Affirmative. You can optimize up to 3 distinct resumes for different career tracks (e.g., Engineering, Operations, Strategy)." },
    { q: "IS THIS FOR ENTRY-LEVEL ONLY?", a: "We specialize in the junior-to-mid transition within the Indian tech ecosystem and high-growth global startups." },
    { q: "WHAT IS A 'GHOST JOB'?", a: "Listings maintained by companies to build talent pools without active hiring budgets. We filter these with 99.9% accuracy." }
  ];

  return (
    <section id="faq" className="py-32 bg-white">
      <div className="site-container max-w-4xl">
        <h2 className="text-5xl font-heading text-center mb-20 uppercase tracking-tighter">Information Desk</h2>
        <div className="space-y-px bg-[#CBD0D2] border border-[#CBD0D2]">
          {questions.map((item, i) => (
            <div key={i} className="bg-white overflow-hidden">
              <button 
                className="w-full p-8 text-left flex justify-between items-center group"
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className={`text-lg font-black uppercase tracking-tight transition-colors ${active === i ? 'text-black' : 'text-[#3B4235]'}`}>{item.q}</span>
                <Plus className={`transition-transform duration-500 ${active === i ? 'rotate-45' : ''}`} />
              </button>
              <div className={`px-8 transition-all duration-500 ease-in-out ${active === i ? 'pb-8 opacity-100 max-h-40' : 'max-h-0 opacity-0'}`}>
                <p className="text-[#3B4235] font-medium leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = ({ setView }: { setView: (v: View) => void }) => (
  <section className="py-32">
    <div className="site-container">
      <div className="bg-black p-20 lg:p-32 text-center relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#3B4235,transparent_70%)] opacity-40" />
        <div className="relative z-10 space-y-12">
          <h2 className="text-6xl md:text-8xl font-heading text-white leading-none">
            Scale your <br /> career access.
          </h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto font-medium">
            Join the 25,000+ top performers already using AI to secure their next role.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 pt-6">
            <button onClick={() => setView('login')} className="bg-white text-black px-16 py-6 text-sm font-black uppercase tracking-[0.2em] hover:bg-[#E9E1D1] transition-all">
              Join for Free
            </button>
            <button className="border border-white/20 text-white px-16 py-6 text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
              Expert Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => {
  const footerData = [
    {
      title: 'Infrastructure',
      links: ['Resume Engine', 'Match AI', 'Agent Leki', 'Automation']
    },
    {
      title: 'Intel',
      links: ['Verification', 'Global Roles', 'Strategic Insights', 'Launch Pad']
    },
    {
      title: 'Connect',
      links: ['LinkedIn', 'Twitter', 'Instagram', 'Youtube']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security', 'Compliance']
    }
  ];

  return (
    <footer className="py-32 bg-white border-t border-[#CBD0D2]">
      <div className="site-container">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-32">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white">
                <Rocket size={24} />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase text-black italic">GradIndStud</span>
            </div>
            <p className="text-[#3B4235] max-w-xs font-bold leading-relaxed text-sm uppercase tracking-tight">
              Securing the future of high-performance student talent in India.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4 pt-4">
              <a href="#" className="w-10 h-10 border border-[#CBD0D2] flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#CBD0D2] flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#CBD0D2] flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#CBD0D2] flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-[#CBD0D2] flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 lg:gap-24">
            {footerData.map((group, i) => (
              <div key={i} className="space-y-8">
                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#3B4235]">{group.title}</h4>
                <ul className="space-y-4">
                  {group.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-black hover:text-[#3B4235] text-xs font-black uppercase tracking-widest transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-[#CBD0D2] flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B4235]">
          <p>© 2025 GradIndStud. Strategic Career Assets.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-black">Privacy Protocol</a>
            <a href="#" className="hover:text-black">Terms of Access</a>
            <a href="#" className="hover:text-black">Governance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Resume Storage Hook ---
const useResumeStorage = () => {
  const MAX_SLOTS = 5;
  
  const getResumes = (): SavedResume[] => {
    try {
      const stored = localStorage.getItem('gradindstud_resumes');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((r: any) => ({
          ...r,
          lastModified: new Date(r.lastModified),
          createdAt: new Date(r.createdAt)
        }));
      }
    } catch (e) {
      console.warn('Failed to load resumes:', e);
    }
    return [];
  };

  const saveResumes = (resumes: SavedResume[]) => {
    localStorage.setItem('gradindstud_resumes', JSON.stringify(resumes));
  };

  const addResume = (resume: Omit<SavedResume, 'id' | 'createdAt' | 'lastModified'>): boolean => {
    const resumes = getResumes();
    if (resumes.length >= MAX_SLOTS) return false;
    
    const newResume: SavedResume = {
      ...resume,
      id: `resume_${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    // If this is set as primary, unset others
    if (newResume.isPrimary) {
      resumes.forEach(r => r.isPrimary = false);
    }
    
    saveResumes([...resumes, newResume]);
    return true;
  };

  const updateResume = (id: string, updates: Partial<SavedResume>) => {
    const resumes = getResumes();
    const index = resumes.findIndex(r => r.id === id);
    if (index !== -1) {
      if (updates.isPrimary) {
        resumes.forEach(r => r.isPrimary = false);
      }
      resumes[index] = { ...resumes[index], ...updates, lastModified: new Date() };
      saveResumes(resumes);
    }
  };

  const deleteResume = (id: string) => {
    const resumes = getResumes().filter(r => r.id !== id);
    saveResumes(resumes);
  };

  return { getResumes, addResume, updateResume, deleteResume, MAX_SLOTS };
};

// --- Time Ago Helper ---
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

interface LekiAnalysis {
  summary_analysis: {
    ats_score: number;
    overall_grade: string;
    critical_issues: string[];
    missing_keywords: string[];
  };
  issues: {
    typos: Array<{ original: string; corrected: string; context: string }>;
    formatting: Array<{ issue: string; suggestion: string }>;
    content: Array<{ section: string; problem: string; fix: string }>;
    missing_sections: string[];
  };
  optimized_content: {
    professional_summary: string;
    contact_info_status: string;
    work_experience: Array<{
      id: string;
      original_text: string;
      optimized_text: string;
      change_reason: string;
      user_action_required?: string;
    }>;
    skills_section: string;
    education_section: string;
  };
  full_optimized_resume: string;
}

const ResumeBuilder = () => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'report'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<LekiAnalysis | null>(null);
  const [rawResult, setRawResult] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'typos' | 'format' | 'content' | 'optimized'>('overview');

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text.");
      return;
    }
    if (!ai) {
      setError("AI service not configured. Please add your GEMINI_API_KEY to .env file.");
      return;
    }
    
    setStep('analyzing');
    setError('');
    setResult(null);
    
    try {
      const userInput = jobDesc 
        ? `Resume Text:\n${resumeText}\n\nTarget Job Description:\n${jobDesc}`
        : `Resume Text:\n${resumeText}\n\nNo specific job description provided. Optimize for general ATS compliance.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userInput,
        config: {
          systemInstruction: LEKI_SYSTEM_PROMPT
        }
      });
      
      const text = response.text || "";
      setRawResult(text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as LekiAnalysis;
          setResult(parsed);
          setStep('report');
        } catch {
          setError("LEKI returned an unexpected format. Please try again.");
          setStep('upload');
        }
      } else {
        setError("Could not parse LEKI response. Please try again.");
        setStep('upload');
      }
    } catch (err) {
      setError("Error connecting to AI service. Please check your API key.");
      setStep('upload');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'bg-emerald-500';
    if (grade === 'B' || grade === 'B+') return 'bg-emerald-400';
    if (grade === 'C' || grade === 'C+') return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Upload Step
  if (step === 'upload') {
  return (
    <div className="min-h-screen pt-44 pb-32 bg-[#E9E1D1]">
        <div className="site-container">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest mb-8">
                <Sparkles size={14} className="text-emerald-400" />
                Powered by LEKI Agent
              </div>
              <h1 className="text-5xl lg:text-6xl font-heading mb-6">
                Get Your <span className="text-highlight-black italic">ATS Score</span>
              </h1>
              <p className="text-xl text-[#3B4235] font-medium max-w-2xl mx-auto">
                Upload your resume and let LEKI analyze it for ATS compatibility, typos, formatting issues, and optimization opportunities.
              </p>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#CBD0D2] shadow-2xl overflow-hidden">
              <div className="p-12">
                {/* Resume Input */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase tracking-widest text-[#3B4235]">
                      Paste Your Resume
                    </label>
                    <span className="text-[10px] font-bold text-[#CBD0D2] uppercase tracking-widest">
                      {resumeText.length} characters
                    </span>
                  </div>
                  <textarea 
                    value={resumeText} 
                    onChange={(e) => setResumeText(e.target.value)} 
                    placeholder="Copy and paste your entire resume text here...

Example:
John Doe
Software Engineer
john@email.com | (555) 123-4567

EXPERIENCE
Software Developer at Tech Corp (2022-Present)
- Developed web applications using React
- Collaborated with team members

EDUCATION
B.Tech Computer Science, XYZ University, 2022

SKILLS
JavaScript, Python, React, Node.js"
                    className="w-full h-72 p-6 bg-[#E9E1D1]/20 border-2 border-dashed border-[#CBD0D2] rounded-2xl outline-none focus:border-black transition-all text-sm font-medium resize-none" 
                  />
                </div>

                {/* Job Description (Optional) */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-black uppercase tracking-widest text-[#3B4235]">
                      Target Job Description
                    </label>
                    <span className="px-2 py-0.5 bg-[#E9E1D1] rounded-full text-[9px] font-black uppercase tracking-wider text-[#3B4235]/60">
                      Optional
                    </span>
                  </div>
                  <textarea 
                    value={jobDesc} 
                    onChange={(e) => setJobDesc(e.target.value)} 
                    placeholder="Paste the job description you're applying for to get keyword matching analysis..."
                    className="w-full h-32 p-6 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-2xl outline-none focus:border-black transition-all text-sm font-medium resize-none" 
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center gap-3 mb-8">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* Analyze Button */}
                <button 
                  onClick={analyzeResume} 
                  disabled={!resumeText.trim()}
                  className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#3B4235] transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
                >
                  <ScanSearch size={22} />
                  Analyze My Resume
                </button>
              </div>

              {/* Features */}
              <div className="bg-[#E9E1D1]/30 px-12 py-8 border-t border-[#CBD0D2]">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: <Target size={20} />, label: 'ATS Score' },
                    { icon: <FileText size={20} />, label: 'Typo Detection' },
                    { icon: <Zap size={20} />, label: 'Format Check' },
                    { icon: <Sparkles size={20} />, label: 'Auto-Fix' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#3B4235]/60">
                      <div className="text-[#3B4235]">{item.icon}</div>
                      <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analyzing Step
  if (step === 'analyzing') {
    return (
      <div className="min-h-screen pt-44 pb-32 bg-[#E9E1D1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Loader2 size={48} className="text-emerald-400 animate-spin" />
          </div>
          <h2 className="text-3xl font-heading mb-4">LEKI is Analyzing...</h2>
          <p className="text-[#3B4235]/60 font-medium">Scanning for ATS compatibility, typos, and optimization opportunities</p>
          
          <div className="mt-12 space-y-3 max-w-sm mx-auto">
            {['Parsing resume structure...', 'Detecting typos & grammar...', 'Checking ATS compatibility...', 'Generating optimizations...'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-[#3B4235]/60" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Report Step
  if (step === 'report' && result) {
    const score = typeof result.summary_analysis.ats_score === 'number' 
      ? result.summary_analysis.ats_score 
      : parseInt(String(result.summary_analysis.ats_score)) || 0;
    
    const totalIssues = (result.issues?.typos?.length || 0) + 
                        (result.issues?.formatting?.length || 0) + 
                        (result.issues?.content?.length || 0);

    return (
      <div className="min-h-screen pt-32 pb-32 bg-[#E9E1D1]">
      <div className="site-container">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <button 
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-2 text-[#3B4235]/60 hover:text-black font-bold text-sm mb-4 transition-colors"
                >
                  <ChevronLeft size={18} /> Back to Upload
                </button>
                <h1 className="text-4xl font-heading">Resume Analysis Report</h1>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => copyToClipboard(result.full_optimized_resume || '')}
                  className="px-6 py-3 bg-white border border-[#CBD0D2] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#E9E1D1] transition-all flex items-center gap-2"
                >
                  <FileText size={16} /> Copy Optimized Resume
                </button>
                <button 
                  onClick={() => setStep('upload')}
                  className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3B4235] transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} /> Analyze Another
                </button>
              </div>
          </div>

            {/* Score Overview */}
            <div className="grid lg:grid-cols-4 gap-6 mb-12">
              {/* Main Score */}
              <div className="lg:col-span-1 bg-[#3B4235] text-white p-8 rounded-3xl shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">ATS Score</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-6xl font-black ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-2xl font-bold text-white/40 mb-2">/100</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 ${getGradeColor(result.summary_analysis.overall_grade || 'C')} rounded-full text-white text-sm font-black`}>
                    Grade {result.summary_analysis.overall_grade || 'C'}
                  </div>
                  <span className="text-white/40 text-xs font-bold">
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white p-6 rounded-3xl border border-[#CBD0D2] shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Issues Found</p>
                <div className="text-4xl font-black text-red-500">{totalIssues}</div>
                <p className="text-xs text-[#3B4235]/40 font-bold mt-1">Typos, format & content</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#CBD0D2] shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Missing Sections</p>
                <div className="text-4xl font-black text-orange-500">{result.issues?.missing_sections?.length || 0}</div>
                <p className="text-xs text-[#3B4235]/40 font-bold mt-1">Required sections</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#CBD0D2] shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Missing Keywords</p>
                <div className="text-4xl font-black text-blue-500">{result.summary_analysis.missing_keywords?.length || 0}</div>
                <p className="text-xs text-[#3B4235]/40 font-bold mt-1">From job description</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-[#CBD0D2] shadow-xl overflow-hidden">
              <div className="flex border-b border-[#E9E1D1]">
                {[
                  { id: 'overview', label: 'Overview', count: null },
                  { id: 'typos', label: 'Typos & Grammar', count: result.issues?.typos?.length || 0 },
                  { id: 'format', label: 'Formatting', count: result.issues?.formatting?.length || 0 },
                  { id: 'content', label: 'Content', count: result.issues?.content?.length || 0 },
                  { id: 'optimized', label: 'Optimized Resume', count: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-black text-white' 
                        : 'text-[#3B4235]/60 hover:bg-[#E9E1D1]/30'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-red-100 text-red-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
              </button>
                ))}
            </div>

              <div className="p-10">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Critical Issues */}
                    {result.summary_analysis.critical_issues?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                          <AlertCircle size={18} /> Critical Issues
                        </h3>
                        <div className="space-y-3">
                          {result.summary_analysis.critical_issues.map((issue, i) => (
                            <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-3">
                              <X size={16} className="mt-0.5 flex-shrink-0" />
                              {issue}
            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Sections */}
                    {result.issues?.missing_sections?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                          <AlertCircle size={18} /> Missing Sections
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {result.issues.missing_sections.map((section, i) => (
                            <span key={i} className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-bold">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {result.summary_analysis.missing_keywords?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                          <Search size={18} /> Missing Keywords from JD
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.summary_analysis.missing_keywords.map((keyword, i) => (
                            <span key={i} className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-bold">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Info Status */}
                    {result.optimized_content.contact_info_status && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#3B4235] mb-4">Contact Information</h3>
                        <div className={`p-4 rounded-xl text-sm font-medium ${
                          result.optimized_content.contact_info_status === 'Complete' 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                            : 'bg-orange-50 border border-orange-200 text-orange-700'
                        }`}>
                          {result.optimized_content.contact_info_status === 'Complete' ? (
                            <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Contact information is complete</span>
                          ) : (
                            <span className="flex items-center gap-2"><AlertCircle size={16} /> {result.optimized_content.contact_info_status}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Typos Tab */}
                {activeTab === 'typos' && (
                  <div className="space-y-4">
                    {result.issues?.typos?.length > 0 ? (
                      result.issues.typos.map((typo, i) => (
                        <div key={i} className="p-6 bg-[#E9E1D1]/20 rounded-2xl border border-[#CBD0D2]">
                          <div className="flex items-start gap-6">
                            <div className="flex-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Original</p>
                              <p className="text-lg font-bold text-red-600 line-through">{typo.original}</p>
                            </div>
                            <ArrowRight size={20} className="text-[#CBD0D2] mt-4" />
                            <div className="flex-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Corrected</p>
                              <p className="text-lg font-bold text-emerald-600">{typo.corrected}</p>
                            </div>
                          </div>
                          {typo.context && (
                            <p className="text-xs text-[#3B4235]/60 mt-3 italic">Context: "{typo.context}"</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-emerald-600">No typos found!</p>
                        <p className="text-[#3B4235]/60 text-sm">Your resume is free of spelling errors.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Format Tab */}
                {activeTab === 'format' && (
                  <div className="space-y-4">
                    {result.issues?.formatting?.length > 0 ? (
                      result.issues.formatting.map((issue, i) => (
                        <div key={i} className="p-6 bg-[#E9E1D1]/20 rounded-2xl border border-[#CBD0D2]">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <AlertCircle size={20} className="text-orange-600" />
                            </div>
                            <div>
                              <p className="font-bold text-[#3B4235] mb-1">{issue.issue}</p>
                              <p className="text-sm text-[#3B4235]/60">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-emerald-600">Formatting looks good!</p>
                        <p className="text-[#3B4235]/60 text-sm">No major formatting issues detected.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    {/* Content Issues */}
                    {result.issues?.content?.length > 0 && (
                      <div className="space-y-4">
                        {result.issues.content.map((issue, i) => (
                          <div key={i} className="p-6 bg-[#E9E1D1]/20 rounded-2xl border border-[#CBD0D2]">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-[#3B4235] text-white rounded-full text-[10px] font-black uppercase">
                                {issue.section}
                              </span>
                            </div>
                            <p className="text-red-600 font-medium mb-2">Problem: {issue.problem}</p>
                            <p className="text-emerald-600 font-bold">Fix: {issue.fix}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Optimized Experience */}
                    {result.optimized_content.work_experience?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#3B4235] mb-4">Experience Improvements</h3>
                        <div className="space-y-4">
                          {result.optimized_content.work_experience.map((exp) => (
                            <div key={exp.id} className="p-6 bg-white rounded-2xl border border-[#CBD0D2] space-y-4">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Original</p>
                                <p className="text-sm text-[#3B4235]/60 line-through">{exp.original_text}</p>
                              </div>
                              <ArrowRight className="text-[#CBD0D2] rotate-90 mx-auto" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Optimized</p>
                                <p className="text-sm font-bold text-[#3B4235]">{exp.optimized_text}</p>
                              </div>
                              <p className="text-xs text-[#3B4235]/60 italic bg-[#E9E1D1]/30 p-3 rounded-xl">{exp.change_reason}</p>
                              {exp.user_action_required && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-xs font-bold flex items-start gap-2">
                                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                  {exp.user_action_required}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Optimized Resume Tab */}
                {activeTab === 'optimized' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-[#3B4235]">Your ATS-Optimized Resume</h3>
                      <button 
                        onClick={() => copyToClipboard(result.full_optimized_resume || '')}
                        className="px-4 py-2 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3B4235] transition-all flex items-center gap-2"
                      >
                        <FileText size={14} /> Copy to Clipboard
                      </button>
                    </div>
                    
                    {result.full_optimized_resume ? (
                      <div className="bg-white border-2 border-[#3B4235] rounded-2xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                        {result.full_optimized_resume}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {result.optimized_content.professional_summary && (
                          <div className="p-6 bg-[#E9E1D1]/20 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Professional Summary</p>
                            <p className="text-sm font-medium leading-relaxed">{result.optimized_content.professional_summary}</p>
                          </div>
                        )}
                        {result.optimized_content.skills_section && (
                          <div className="p-6 bg-[#E9E1D1]/20 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Skills</p>
                            <p className="text-sm font-medium">{result.optimized_content.skills_section}</p>
                          </div>
                        )}
                        {result.optimized_content.education_section && (
                          <div className="p-6 bg-[#E9E1D1]/20 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#3B4235]/60 mb-2">Education</p>
                            <p className="text-sm font-medium">{result.optimized_content.education_section}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return null;
};

const ResumeManager = ({ setView, user }: { setView: (v: View) => void; user?: FirebaseUser | null }) => {
  const localStorageHook = useResumeStorage();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [newResumeTarget, setNewResumeTarget] = useState('');
  const [newResumeContent, setNewResumeContent] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_SLOTS = 5;

  // Load resumes from Firebase or localStorage
  const loadResumes = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Use Firebase
        const firebaseResumes = await getUserResumes(user.uid);
        const mapped: SavedResume[] = firebaseResumes.map(r => ({
          id: r.id,
          name: r.name,
          targetJob: r.targetRole,
          content: r.content,
          isPrimary: r.isPrimary,
          analysisComplete: r.isAnalyzed,
          atsScore: r.atsScore || null,
          createdAt: r.createdAt,
          lastModified: r.updatedAt
        }));
        setResumes(mapped);
      } else {
        // Use localStorage
        setResumes(localStorageHook.getResumes());
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [user]);

  const handleAddResume = async () => {
    if (!newResumeName.trim()) return;
    
    if (resumes.length >= MAX_SLOTS) {
      alert('Maximum resume slots reached!');
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        // Save to Firebase
        await saveResume(user.uid, {
          name: newResumeName,
          targetRole: newResumeTarget,
          content: newResumeContent,
          isPrimary: resumes.length === 0,
          isAnalyzed: false,
          atsScore: undefined
        });
      } else {
        // Save to localStorage
        localStorageHook.addResume({
          name: newResumeName,
          targetJob: newResumeTarget,
          content: newResumeContent,
          isPrimary: resumes.length === 0,
          analysisComplete: false,
          atsScore: null
        });
      }
      
      setShowAddModal(false);
      setNewResumeName('');
      setNewResumeTarget('');
      setNewResumeContent('');
      await loadResumes();
    } catch (error) {
      console.error('Error adding resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await deleteResume(id);
      } else {
        localStorageHook.deleteResume(id);
      }
      await loadResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
    } finally {
      setIsLoading(false);
      setActiveMenu(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await setPrimaryResume(user.uid, id);
      } else {
        localStorageHook.updateResume(id, { isPrimary: true });
      }
      await loadResumes();
    } catch (error) {
      console.error('Error setting primary:', error);
    } finally {
      setIsLoading(false);
      setActiveMenu(null);
    }
  };

  const slotsUsed = resumes.length;
  const slotsAvailable = MAX_SLOTS;

  return (
    <div className="min-h-screen pt-44 pb-32 bg-[#E9E1D1]">
      <div className="site-container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-5xl font-heading uppercase tracking-tight">Resume</h1>
              <p className="text-[#3B4235]/60 font-bold mt-2">Manage your resume versions for different roles</p>
            </div>
            <button 
              onClick={() => setView('resume-builder')}
              className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3B4235] transition-all flex items-center gap-2"
            >
              <Sparkles size={16} /> AI Optimizer
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-[#CBD0D2] shadow-xl overflow-hidden">
            {/* Slots Header */}
            <div className="px-8 py-6 border-b border-[#E9E1D1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${slotsUsed >= slotsAvailable ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {slotsUsed >= slotsAvailable ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <span className="font-bold text-sm text-[#3B4235]">
                  You have <span className="font-black">{slotsUsed} resumes</span> saved out of <span className="font-black">{slotsAvailable} available slots</span>.
                </span>
                <button className="text-[#CBD0D2] hover:text-[#3B4235]">
                  <HelpCircle size={16} />
                </button>
              </div>
              <button 
                onClick={() => slotsUsed < slotsAvailable && setShowAddModal(true)}
                disabled={slotsUsed >= slotsAvailable}
                className="flex items-center gap-2 text-sm font-black text-black hover:text-[#3B4235] disabled:text-[#CBD0D2] disabled:cursor-not-allowed"
              >
                <PlusCircle size={18} /> Add Resume
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#E9E1D1]/30 text-[10px] font-black uppercase tracking-widest text-[#3B4235]/60">
              <div className="col-span-5">Resume</div>
              <div className="col-span-3">Target Job Title</div>
              <div className="col-span-2">Last Modified</div>
              <div className="col-span-1">Created</div>
              <div className="col-span-1"></div>
            </div>

            {/* Resume List */}
            {resumes.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="w-16 h-16 bg-[#E9E1D1] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText size={32} className="text-[#CBD0D2]" />
                </div>
                <p className="font-bold text-[#3B4235]/60 mb-4">No resumes yet</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3B4235] transition-all"
                >
                  Add Your First Resume
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E9E1D1]">
                {resumes.map((resume) => (
                  <div key={resume.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-[#E9E1D1]/10 transition-colors group">
                    {/* Resume Name */}
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                        {resume.name[0]?.toUpperCase() || 'R'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-black truncate">{resume.name}</span>
                          {resume.isPrimary && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                              <Star size={10} fill="currentColor" /> PRIMARY
                            </span>
                          )}
                          {resume.analysisComplete && (
                            <span className="px-2 py-0.5 bg-[#E9E1D1] text-[#3B4235] rounded-full text-[9px] font-black uppercase tracking-wider">
                              Analysis Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Target Job */}
                    <div className="col-span-3 text-sm text-[#3B4235]/60 font-medium truncate">
                      {resume.targetJob || '—'}
                    </div>

                    {/* Last Modified */}
                    <div className="col-span-2 text-sm text-[#3B4235]/60 font-medium">
                      {timeAgo(resume.lastModified)}
                    </div>

                    {/* Created */}
                    <div className="col-span-1 text-sm text-[#3B4235]/60 font-medium">
                      {timeAgo(resume.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === resume.id ? null : resume.id)}
                        className="p-2 hover:bg-[#E9E1D1] rounded-lg text-[#CBD0D2] hover:text-[#3B4235] transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      
                      {activeMenu === resume.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-[#CBD0D2] rounded-xl shadow-xl py-2 min-w-[160px] z-10">
                          {!resume.isPrimary && (
                            <button 
                              onClick={() => handleSetPrimary(resume.id)}
                              className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-[#E9E1D1] flex items-center gap-2"
                            >
                              <Star size={14} /> Set as Primary
                            </button>
                          )}
                          <button 
                            onClick={() => { setActiveMenu(null); setView('resume-builder'); }}
                            className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-[#E9E1D1] flex items-center gap-2"
                          >
                            <Sparkles size={14} /> Analyze with LEKI
                          </button>
                          <button 
                            onClick={() => handleDelete(resume.id)}
                            className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <X size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Resume Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-heading">Add New Resume</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[#E9E1D1] rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]">Resume Name *</label>
                <input 
                  type="text"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  className="w-full px-5 py-4 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-xl outline-none focus:border-black transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]">Target Job Title</label>
                <input 
                  type="text"
                  value={newResumeTarget}
                  onChange={(e) => setNewResumeTarget(e.target.value)}
                  placeholder="e.g., DevOps Engineer, Cloud Engineer"
                  className="w-full px-5 py-4 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-xl outline-none focus:border-black transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#3B4235]">Resume Content</label>
                <textarea 
                  value={newResumeContent}
                  onChange={(e) => setNewResumeContent(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full px-5 py-4 bg-[#E9E1D1]/20 border border-[#CBD0D2] rounded-xl outline-none focus:border-black transition-all font-medium h-32 resize-none"
                />
              </div>

              <button 
                onClick={handleAddResume}
                disabled={!newResumeName.trim()}
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#3B4235] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FuturisticAgent = () => (
  <div className="relative w-full aspect-square max-w-[500px] mx-auto fade-in-section">
    <div className="absolute inset-0 bg-[#3B4235]/10 blur-[120px]" />
    <div className="relative z-10 w-full h-full bg-white border border-[#CBD0D2] p-10 flex flex-col justify-center gap-8 shadow-xl rounded-[3rem]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#3B4235] flex items-center justify-center text-3xl shadow-lg rounded-2xl">
            <span className="animate-pulse">🤖</span>
          </div>
          <div>
            <h4 className="font-bold text-xl uppercase tracking-tight">Leki Agent</h4>
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Live Analyzing
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold font-heading">98%</div>
          <div className="text-[10px] text-[#3B4235] uppercase font-black tracking-widest">ATS Score</div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { text: "Identity verification verified", status: "done" },
          { text: "Parsing role requirements...", status: "done" },
          { text: "Mapping skill matrix...", status: "active" }
        ].map((step, i) => (
          <div key={i} className={`flex items-center gap-4 p-4 border transition-all duration-500 ${step.status === 'active' ? 'border-[#3B4235] bg-[#3B4235]/5 rounded-xl' : 'border-[#CBD0D2] rounded-xl'}`}>
            <div className={`w-5 h-5 flex items-center justify-center ${step.status === 'done' ? 'text-emerald-600' : 'text-[#3B4235]'}`}>
              {step.status === 'done' ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-[#3B4235] animate-bounce" />}
            </div>
            <span className="text-sm font-bold uppercase tracking-tight">{step.text}</span>
          </div>
        ))}
      </div>

      <div className="p-5 bg-[#000000] text-[11px] min-h-[120px] shadow-inner overflow-hidden rounded-xl">
        <TypingText 
          lines={[
            "# INITIALIZING LEKI V3.1...",
            "SUCCESS: RECRUITER STATUS VERIFIED",
            "MAPPING 'SCALABLE ARCHITECTURE'...",
            "MATCHING 95% CONFIDENCE INTERVAL"
          ]} 
        />
      </div>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleLogout = async () => {
    await logOut();
    setView('landing');
  };

  return (
    <div className="min-h-screen">
      <Navbar setView={setView} currentView={view} user={user} onLogout={handleLogout} />
      
      {view === 'landing' && (
        <>
          <Hero setView={setView} />
          <Stats />
          <FeatureCards />
          <Testimonials />
          <FAQ />
          <FinalCTA setView={setView} />
        </>
      )}

      {view === 'login' && <LoginPage setView={setView} />}
      
      {view === 'resume-manager' && <ResumeManager setView={setView} user={user} />}
      
      {view === 'resume-builder' && <ResumeBuilder />}

      {view === 'cover-letter' && <CoverLetterGenerator setView={setView} />}

      {view === 'applications' && <ApplicationTracker setView={setView} user={user} />}

      {view === 'interview-prep' && <InterviewPrep setView={setView} />}

      {view === 'company-insights' && <CompanyInsights setView={setView} />}

      {view === 'notifications' && <NotificationCenter setView={setView} user={user} />}

      {view === 'job-portal' && <JobPortal setView={setView} user={user} />}
      
      {view !== 'job-portal' && <Footer />}
    </div>
  );
}
