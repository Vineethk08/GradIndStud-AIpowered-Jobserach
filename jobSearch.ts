// Job Search API Service using JSearch (RapidAPI)
// Free tier: 100 requests/month

export interface RealJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  salary?: string;
  type: string;
  postedAt: string;
  applyUrl: string;
  isRemote: boolean;
  source: string;
}

// Default API key (free tier - 100 requests/month)
const DEFAULT_RAPIDAPI_KEY = '97cb26c9demshed15b897142702bp16047cjsncaf9fac0c25d';

// Get API key from environment or localStorage
const getApiKey = (): string => {
  // Check localStorage first (for runtime config)
  const storedKey = localStorage.getItem('rapidapi_key');
  if (storedKey) return storedKey;
  
  // Fall back to env variable, then default key
  return process.env.RAPIDAPI_KEY || DEFAULT_RAPIDAPI_KEY;
};

// Set API key (for runtime config)
export const setJobApiKey = (key: string) => {
  localStorage.setItem('rapidapi_key', key);
};

// Check if API key is configured
export const hasJobApiKey = (): boolean => {
  return !!getApiKey();
};

// Search for jobs
export const searchJobs = async (
  query: string,
  location: string = 'India',
  page: number = 1
): Promise<RealJob[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn('No RapidAPI key configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}%20in%20${encodeURIComponent(location)}&page=${page}&num_pages=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) return [];

    return data.data.map((job: any) => ({
      id: job.job_id || String(Math.random()),
      title: job.job_title || 'Unknown Role',
      company: job.employer_name || 'Unknown Company',
      companyLogo: job.employer_logo || null,
      location: job.job_city 
        ? `${job.job_city}, ${job.job_state || job.job_country}` 
        : job.job_country || 'Remote',
      description: job.job_description || '',
      salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
      type: job.job_employment_type || 'Full-time',
      postedAt: formatPostedDate(job.job_posted_at_datetime_utc),
      applyUrl: job.job_apply_link || '',
      isRemote: job.job_is_remote || false,
      source: job.job_publisher || 'JSearch'
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

// Format salary range
const formatSalary = (min?: number, max?: number, currency?: string): string | undefined => {
  if (!min && !max) return undefined;
  
  const curr = currency || 'USD';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    maximumFractionDigits: 0
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) return `${formatter.format(min)}+`;
  if (max) return `Up to ${formatter.format(max)}`;
  return undefined;
};

// Format posted date
const formatPostedDate = (dateStr?: string): string => {
  if (!dateStr) return 'Recently';
  
  const posted = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Popular job categories for quick search
export const JOB_CATEGORIES = [
  { name: 'Software Engineer', query: 'software engineer' },
  { name: 'Data Scientist', query: 'data scientist' },
  { name: 'Product Manager', query: 'product manager' },
  { name: 'Frontend Developer', query: 'frontend developer react' },
  { name: 'Backend Developer', query: 'backend developer' },
  { name: 'Full Stack', query: 'full stack developer' },
  { name: 'DevOps', query: 'devops engineer' },
  { name: 'Machine Learning', query: 'machine learning engineer' },
  { name: 'Business Analyst', query: 'business analyst' },
  { name: 'UX Designer', query: 'ux designer' }
];

