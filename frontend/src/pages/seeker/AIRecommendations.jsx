import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { Brain, Sparkles, MapPin, Briefcase, Calendar, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIRecommendations() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({}); // jobId -> explanation string
  const [explainingId, setExplainingId] = useState(null); // tracking current loading explanation

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const { data } = await aiAPI.getRecommendations();
        setJobs(data);
      } catch (err) {
        toast.error('Failed to load AI recommendations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  const handleToggleExplanation = async (jobId) => {
    // If already exists, toggle off by resetting or keep it
    if (explanations[jobId]) {
      // Toggle visibility
      const updated = { ...explanations };
      delete updated[jobId];
      setExplanations(updated);
      return;
    }

    setExplainingId(jobId);
    try {
      const { data } = await aiAPI.explainRecommendation(jobId);
      setExplanations({ ...explanations, [jobId]: data });
    } catch (err) {
      toast.error('Failed to retrieve matching evaluation');
    } finally {
      setExplainingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Generating your recommendations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
            AI Match Recommendations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tailored list of opportunities automatically ranked against your profile skills and experience.
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <AlertCircle className="w-14 h-14 text-slate-350 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No recommendations available</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Add skills or upload a resume in profile settings so our AI algorithm can evaluate your background.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link to="/seeker/profile" className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50">
              Configure Skills
            </Link>
            <Link to="/seeker/resume" className="gradient-button px-5 py-2.5 rounded-xl text-sm font-semibold">
              Upload Resume PDF
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => {
            const hasExplanation = !!explanations[job.id];
            
            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                        {job.jobType?.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {job.workMode}
                      </span>
                    </div>

                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-650 transition-colors">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-slate-500 text-sm font-semibold mt-0.5">
                      {job.employer?.companyName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-450 block font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote'}
                      </span>
                      {job.salaryMin && job.salaryMax ? (
                        <span className="text-sm font-bold text-slate-700 block mt-0.5">
                          ₹{job.salaryMin}L - ₹{job.salaryMax}LPA
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 block mt-0.5 font-semibold italic">Negotiable</span>
                      )}
                    </div>

                    <Link to={`/jobs/${job.id}`} className="gradient-button px-5 py-2.5 rounded-xl text-sm font-bold">
                      Apply
                    </Link>
                  </div>
                </div>

                {/* Required Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills?.map((skill, index) => (
                    <span key={index} className="px-2.5 py-0.5 rounded bg-slate-100 text-xs text-slate-600 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Match Explanation Toggle */}
                <div className="border-t border-slate-100/80 pt-3">
                  <button
                    onClick={() => handleToggleExplanation(job.id)}
                    disabled={explainingId === job.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                    {explainingId === job.id ? 'Analyzing match criteria...' : hasExplanation ? 'Hide AI Assessment' : 'Show AI Assessment Explanation'}
                    {hasExplanation ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>

                  {hasExplanation && (
                    <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl mt-3 text-sm leading-relaxed text-slate-700">
                      <p className="italic">"{explanations[job.id]}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
