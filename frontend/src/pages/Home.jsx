import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { Search, Brain, Sparkles, MapPin, Briefcase, Calendar, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [smartQuery, setSmartQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data } = await jobsAPI.getFeatured();
        setFeaturedJobs(data.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Error fetching featured jobs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleSmartSearch = (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    navigate(`/jobs?smart=true&q=${encodeURIComponent(smartQuery)}`);
  };

  const sampleQueries = [
    "Remote React developer paying 10LPA+",
    "Frontend Intern in Bangalore",
    "Onsite Java engineer with 3 years experience"
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[5%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-indigo-300 to-violet-300 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] aspect-square rounded-full bg-gradient-to-br from-purple-200 to-pink-200 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">AI-Powered Recruitment Portal</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.15]">
          Find Your Dream Job with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">
            AI Smart Search
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Say goodbye to keyword matching. Search for jobs using normal sentences, get your resume scored against job descriptions, and view personalized recommendations.
        </p>

        {/* AI Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <form onSubmit={handleSmartSearch} className="relative p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-indigo-100/40 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-2">
              <Brain className="w-6 h-6 text-indigo-500 shrink-0" />
              <input
                type="text"
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                placeholder='Try: "Remote React Developer with 3+ years experience paying 12LPA..."'
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base font-medium"
              />
            </div>
            <button
              type="submit"
              className="gradient-button px-8 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold text-base"
            >
              <Search className="w-5 h-5" />
              AI Search
            </button>
          </form>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Suggested searches:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSmartQuery(q);
                toast.success('Search query filled!');
              }}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white/50 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-24 border-y border-slate-200/60 py-10 bg-white/30 backdrop-blur-sm rounded-3xl">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-indigo-600">12k+</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Active Job Listings</p>
          </div>
          <div className="text-center border-l border-slate-200/60">
            <h3 className="text-3xl font-extrabold text-indigo-600">8.4k+</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Verified Companies</p>
          </div>
          <div className="text-center border-l border-slate-200/60">
            <h3 className="text-3xl font-extrabold text-indigo-600">98%</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">AI Match Accuracy</p>
          </div>
          <div className="text-center border-l border-slate-200/60">
            <h3 className="text-3xl font-extrabold text-indigo-600">24LPA</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Average Max Salary</p>
          </div>
        </div>

        {/* Featured Jobs Section */}
        <div className="max-w-6xl mx-auto mb-20 text-left">
          <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Opportunities</h2>
              <p className="text-slate-500 text-sm mt-1">Discover recently posted premium job listings.</p>
            </div>
            <Link to="/jobs" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1 group">
              View all jobs <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-56 animate-pulse" />
              ))}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center bg-white border border-slate-200 rounded-2xl p-12 shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No jobs listed yet</h3>
              <p className="text-slate-500 text-sm mt-1">Be the first to post a job opportunity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div key={job.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider">
                        {job.jobType?.replace('_', ' ')}
                      </div>
                      <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-semibold mb-3">
                      {job.employer?.companyName || 'Verified Employer'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {job.requiredSkills?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <span className="text-slate-600 text-xs font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location || 'Remote'}
                    </span>
                    <Link to={`/jobs/${job.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-0.5 group/btn">
                      Apply Now <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-gradient-to-r from-slate-950 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-4">Are you hiring talent?</h2>
            <p className="text-indigo-200 text-base leading-relaxed mb-8">
              Post your jobs, filter applicants based on an AI-generated Match Score, and schedule interviews. Start recruiting smarter and faster today.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/register" className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md">
                Create Employer Account
              </Link>
              <Link to="/login" className="text-white hover:text-slate-200 font-bold text-sm flex items-center gap-1 group">
                Sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="hidden md:flex flex-col justify-center gap-4 border-l border-slate-800 pl-12">
            <div className="flex gap-4">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">AI Resume Matching</h4>
                <p className="text-slate-400 text-sm mt-0.5">Auto-scores candidates against job descriptions using advanced LLM processing.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Verified Applicants</h4>
                <p className="text-slate-400 text-sm mt-0.5">Direct profiles connected to genuine user accounts with portfolio uploads.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
