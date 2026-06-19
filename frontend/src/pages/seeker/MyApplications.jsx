import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../services/api';
import { FileText, MapPin, Calendar, ExternalLink, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const { data } = await applicationsAPI.getMyApplications();
        setApplications(data);
      } catch (err) {
        toast.error('Failed to load applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'REVIEWED':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'SHORTLISTED':
        return 'bg-emerald-50 border-emerald-250 text-emerald-700';
      case 'INTERVIEW':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'REJECTED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'HIRED':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Application History</h1>
          <p className="text-slate-500 text-sm mt-1">Review the status and feedback of all jobs you have applied to.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No applications found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            You haven't submitted any job applications yet. Head over to the search page to find matching opportunities.
          </p>
          <Link
            to="/jobs"
            className="gradient-button mt-6 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
          >
            Explore Available Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-6 border-l-4 ${
                app.status === 'REJECTED' ? 'border-l-rose-500' :
                app.status === 'HIRED' || app.status === 'SHORTLISTED' ? 'border-l-emerald-500' :
                'border-l-indigo-500'
              }`}
            >
              <div className="flex-1 space-y-4">
                {/* Meta details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                    
                    {app.aiMatchScore != null && (
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-750 flex items-center gap-0.5 border border-indigo-100">
                        <Brain className="w-3 h-3 text-indigo-500 shrink-0" />
                        Match Score: {Math.round(app.aiMatchScore)}%
                      </span>
                    )}
                  </div>

                  <Link to={`/jobs/${app.job.id}`} className="hover:underline flex items-center gap-1 group">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {app.job.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-650 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </Link>
                  <p className="text-slate-500 text-sm font-semibold mt-0.5">
                    {app.job.employer?.companyName || 'Verified Employer'}
                  </p>
                </div>

                {/* Sub details */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {app.job.location || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Employer comments / notes */}
                {app.employerNotes && (
                  <div className="bg-slate-55 border border-slate-200/80 p-4 rounded-xl text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                      <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      Feedback from Recruiter:
                    </div>
                    <p className="text-slate-650 italic leading-relaxed">"{app.employerNotes}"</p>
                  </div>
                )}
              </div>

              {/* Cover Letter excerpt */}
              {app.coverLetter && (
                <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 text-xs text-slate-500">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Pitch:</span>
                  <p className="line-clamp-4 leading-relaxed italic">"{app.coverLetter}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
