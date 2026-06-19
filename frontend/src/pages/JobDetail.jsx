import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI, aiAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { MapPin, Briefcase, Calendar, Award, IndianRupee, Brain, Sparkles, AlertCircle, ArrowLeft, ArrowUpRight, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI & Application States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const { data } = await jobsAPI.getById(id);
        setJob(data);

        // If authenticated as SEEKER, check if already applied or if there's prior analysis
        if (isAuthenticated && user?.role === 'SEEKER') {
          // Since the API returns applications, let's see if we already applied
          const appsRes = await applicationsAPI.getMyApplications();
          const match = appsRes.data.find(app => app.job.id === parseInt(id, 10));
          if (match) {
            setApplied(true);
            if (match.aiMatchScore) {
              setAnalysis({ score: match.aiMatchScore });
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id, isAuthenticated, user]);

  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const { data } = await aiAPI.analyzeResume(id);
      setAnalysis(data);
      toast.success('Resume analysis completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume analysis failed. Have you uploaded a resume in Profile settings?');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetExplanation = async () => {
    setExplaining(true);
    try {
      const { data } = await aiAPI.explainRecommendation(id);
      setExplanation(data);
    } catch (err) {
      toast.error('Failed to get match explanation');
    } finally {
      setExplaining(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (applied) return;

    setApplying(true);
    try {
      await applicationsAPI.apply(id, { coverLetter });
      setApplied(true);
      toast.success('Successfully applied for this job!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Job Not Found</h3>
        <p className="text-slate-500 mt-1">This listing may have been closed or deleted.</p>
        <Link to="/jobs" className="mt-6 inline-flex items-center gap-1.5 text-indigo-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to job listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Description Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Header info */}
            <div className="border-b border-slate-100 pb-6 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                  {job.jobType?.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                  {job.workMode}
                </span>
              </div>

              <h1 className="text-3xl font-bold font-display text-slate-900 leading-tight mb-2">
                {job.title}
              </h1>
              <p className="text-slate-600 font-semibold text-lg">
                {job.employer?.companyName || 'Verified Employer'}
              </p>
            </div>

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Location</span>
                  <span className="text-sm font-semibold text-slate-800">{job.location || 'Remote'}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <Award className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
                  <span className="text-sm font-semibold text-slate-800">{job.experienceRequired != null ? `${job.experienceRequired} Years` : 'Freshers'}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Salary Range</span>
                  <span className="text-sm font-semibold text-slate-800">{job.salaryMin && job.salaryMax ? `${job.salaryMin}L-${job.salaryMax}LPA` : 'Disclosed Later'}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deadline</span>
                  <span className="text-sm font-semibold text-slate-800">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                {job.description}
              </div>
            </div>

            {/* Required Skills */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Required Technical Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills?.map((skill, index) => (
                  <span key={index} className="px-3.5 py-1 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Application/AI Panel */}
        <div className="space-y-6">
          
          {/* Seeker AI Analysis Panel */}
          {isAuthenticated && user?.role === 'SEEKER' && (
            <div className="bg-gradient-to-br from-white to-indigo-50/25 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                <Brain className="w-6 h-6 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">AI Assistant</h3>
              </div>

              {!analysis ? (
                <div className="text-center py-4">
                  <p className="text-xs font-semibold text-slate-500 mb-4 leading-normal">
                    Evaluate if this job is a good fit for you. AI will score your skills and experience against these requirements.
                  </p>
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={analyzing}
                    className="gradient-button w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Analyze Resume Fit
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Gauge score display */}
                  <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Match Score</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-1">{analysis.score || 'N/A'}/100</h4>
                    </div>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-50 text-indigo-700 border-2 border-indigo-200">
                      {analysis.score ? `${Math.round(analysis.score)}%` : '—'}
                    </div>
                  </div>

                  {/* Rest of AI info if complete object exists */}
                  {analysis.matchedSkills && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Skills</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {JSON.parse(analysis.matchedSkills || '[]').map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {JSON.parse(analysis.missingSkills || '[]').length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Skills</span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {JSON.parse(analysis.missingSkills || '[]').map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-rose-50 text-[10px] font-bold text-rose-700 border border-rose-100">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.strengths && (
                        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/40 text-xs">
                          <strong className="text-slate-800 font-bold block mb-0.5">Strengths:</strong>
                          <p className="text-slate-600 leading-normal">{analysis.strengths}</p>
                        </div>
                      )}

                      {analysis.improvements && (
                        <div className="bg-white/60 rounded-xl p-3 border border-slate-200/40 text-xs">
                          <strong className="text-slate-800 font-bold block mb-0.5">Areas to Improve:</strong>
                          <p className="text-slate-600 leading-normal">{analysis.improvements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ask AI Explanation */}
                  {!explanation ? (
                    <button
                      onClick={handleGetExplanation}
                      disabled={explaining}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-indigo-200 hover:bg-indigo-50/50 text-indigo-600 text-xs font-bold rounded-xl transition-all mt-4 cursor-pointer"
                    >
                      {explaining ? 'Loading Explanation...' : 'Explain Match with AI'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl mt-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">AI Evaluation</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal italic">"{explanation}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Apply Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Application Panel</h3>

            {!isAuthenticated ? (
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-sm mb-4 font-semibold px-4">Log in as a Job Seeker to apply for this job and see your AI Match Score.</p>
                <Link to="/login" className="gradient-button px-6 py-2.5 rounded-xl text-sm font-bold inline-block">
                  Sign In to Apply
                </Link>
              </div>
            ) : user?.role !== 'SEEKER' ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold leading-normal">
                  Employer and Admin accounts cannot apply for job listings.
                </p>
              </div>
            ) : applied ? (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-800 text-sm">Application Submitted</h4>
                <p className="text-xs text-emerald-600/80 mt-0.5">You have applied for this listing. Check your status in the Seeker Dashboard.</p>
                <Link to="/seeker/applications" className="text-xs font-bold text-indigo-600 hover:underline block mt-3">
                  View applications
                </Link>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cover Letter (Optional)</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly pitch yourself or describe why you're a great fit..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="gradient-button w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold text-sm"
                >
                  {applying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
