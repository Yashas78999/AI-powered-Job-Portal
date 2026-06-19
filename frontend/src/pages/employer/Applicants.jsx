import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { applicationsAPI, jobsAPI } from '../../services/api';
import { User, FileText, CheckCircle2, XCircle, Brain, Mail, Phone, Calendar, ArrowLeft, ArrowUpRight, MessageSquare, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal States
  const [activeApp, setActiveApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadApplicants() {
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobsAPI.getById(jobId),
          applicationsAPI.getJobApplications(jobId)
        ]);
        setJob(jobRes.data);
        setApplicants(appsRes.data);
      } catch (err) {
        toast.error('Failed to load applicant details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApplicants();
  }, [jobId]);

  const handleOpenReview = (app) => {
    setActiveApp(app);
    setReviewStatus(app.status);
    setReviewNotes(app.employerNotes || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!activeApp) return;

    setUpdating(true);
    const toastId = toast.loading('Saving review changes...');
    try {
      // Endpoint: PATCH /api/employer/applications/{appId}/status
      // Request body: { status, notes }
      const { data } = await api.patch(`/employer/applications/${activeApp.id}/status`, {
        status: reviewStatus,
        notes: reviewNotes
      });

      // Update state
      setApplicants(applicants.map(app => app.id === activeApp.id ? { ...app, status: data.status, employerNotes: data.employerNotes } : app));
      setActiveApp(null);
      toast.success('Applicant status updated successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to save applicant review.', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading applicant registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <button
        onClick={() => navigate('/employer/jobs')}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Job Applicants</h1>
          <p className="text-slate-500 text-sm mt-1">
            Reviewing candidates for <span className="font-bold text-indigo-600">"{job?.title}"</span>. Ranked by AI match score.
          </p>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <User className="w-14 h-14 text-slate-350 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No applicants yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            This job listing hasn't received any application submissions yet. Check back later once candidates apply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Highlight top matches */}
              {index === 0 && app.aiMatchScore >= 70 && (
                <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-br-xl flex items-center gap-1 tracking-wider shadow">
                  <Brain className="w-3.5 h-3.5 animate-pulse" />
                  Top AI Match
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    app.status === 'APPLIED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                    app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' || app.status === 'HIRED' ? 'bg-emerald-50 border-emerald-250 text-emerald-700' :
                    app.status === 'REJECTED' ? 'bg-rose-50 border-rose-250 text-rose-700' :
                    'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {app.status}
                  </span>
                  
                  {app.aiMatchScore != null && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-750 flex items-center gap-0.5 border border-indigo-150">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" />
                      Score: {Math.round(app.aiMatchScore)}%
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{app.jobSeeker?.user?.name}</h3>
                  <p className="text-slate-500 text-sm font-semibold">{app.jobSeeker?.currentTitle || 'Job Seeker'}</p>
                </div>

                {/* Candidate tags */}
                <div className="flex flex-wrap gap-1">
                  {app.jobSeeker?.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-650">
                      {skill}
                    </span>
                  ))}
                  {app.jobSeeker?.skills?.length > 5 && (
                    <span className="text-xs text-slate-400 font-semibold self-center ml-1">+{app.jobSeeker.skills.length - 5} more</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right text-xs text-slate-500 mr-2 font-medium">
                  {app.jobSeeker?.experienceYears != null && (
                    <p>{app.jobSeeker.experienceYears} Years Exp</p>
                  )}
                  <p className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenReview(app)}
                  className="gradient-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1"
                >
                  Review Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveApp(null)} />
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full relative z-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit mb-2">
                  <Brain className="w-3.5 h-3.5" /> Score: {activeApp.aiMatchScore ? `${Math.round(activeApp.aiMatchScore)}%` : 'N/A'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">{activeApp.jobSeeker?.user?.name}</h3>
                <p className="text-slate-500 text-sm font-semibold">{activeApp.jobSeeker?.currentTitle || 'Job Seeker'}</p>
              </div>
              <button onClick={() => setActiveApp(null)} className="text-slate-400 hover:text-slate-650 font-bold">Close</button>
            </div>

            {/* Candidate Professional details */}
            <div className="space-y-4 text-sm leading-relaxed">
              {activeApp.jobSeeker?.bio && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">Candidate Biography</h4>
                  <p className="text-slate-600">{activeApp.jobSeeker.bio}</p>
                </div>
              )}

              {activeApp.coverLetter && (
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                    Applicant Cover Pitch:
                  </h4>
                  <p className="text-slate-600 bg-indigo-50/20 border border-indigo-100/40 p-4 rounded-2xl italic">"{activeApp.coverLetter}"</p>
                </div>
              )}

              <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                {activeApp.jobSeeker?.resumeUrl && (
                  <a
                    href={activeApp.jobSeeker.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-650 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                  >
                    <FileText className="w-4 h-4" /> Download Resume PDF <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {activeApp.jobSeeker?.linkedinUrl && (
                  <a href={activeApp.jobSeeker.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-650 hover:text-indigo-800 hover:underline">
                    LinkedIn
                  </a>
                )}
                {activeApp.jobSeeker?.githubUrl && (
                  <a href={activeApp.jobSeeker.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-650 hover:text-indigo-800 hover:underline">
                    GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Evaluation Form */}
            <form onSubmit={handleSaveReview} className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Recruiter Evaluation & Status</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Application Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-semibold text-slate-700"
                  >
                    <option value="APPLIED">Applied (Under Review)</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW">Schedule Interview</option>
                    <option value="REJECTED">Reject Candidate</option>
                    <option value="HIRED">Hire Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Evaluation Comments</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Internal notes or messages sent to applicant detailing scheduled interviews, rejection feedback..."
                  className="w-full border border-slate-350 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                  Notes will be visible to the job seeker in their application history page.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveApp(null)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="gradient-button px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Decision
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
