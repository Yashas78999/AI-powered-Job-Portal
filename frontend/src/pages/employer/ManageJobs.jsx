import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { jobsAPI } from '../../services/api';
import { Briefcase, Eye, Calendar, UserCheck, Trash2, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data } = await jobsAPI.getMyJobs();
        setJobs(data);
      } catch (err) {
        toast.error('Failed to load your listings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      // Endpoint: PATCH /api/employer/jobs/{id}/status?status=...
      await api.patch(`/employer/jobs/${jobId}/status`, null, {
        params: { status: newStatus }
      });
      
      setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      toast.success(`Job status updated to ${newStatus}!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to update job status.', { id: toastId });
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job post? All applicant entries will be lost.')) return;
    const toastId = toast.loading('Deleting job posting...');
    try {
      await jobsAPI.delete(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job posting deleted successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete job post.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading your active listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <button
        onClick={() => navigate('/employer')}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Manage Job Postings</h1>
          <p className="text-slate-500 text-sm mt-1">Review applicant lists, views statistics, and toggle listing availability.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <Briefcase className="w-14 h-14 text-slate-355 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-850">No job postings found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            You haven't posted any job listings. Get started by creating your first hiring opportunity.
          </p>
          <Link
            to="/employer/post-job"
            className="gradient-button mt-6 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
          >
            Post a Job Opportunity <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    job.status === 'CLOSED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                    'bg-indigo-50 text-indigo-700 border border-indigo-150'
                  }`}>
                    {job.status}
                  </span>
                  
                  <span className="text-slate-400 text-xs flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Published {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link to={`/jobs/${job.id}`}>
                  <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-650 transition-colors">
                    {job.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {job.viewsCount || 0} views
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                {job.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusChange(job.id, 'CLOSED')}
                    className="px-4 py-2 border border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-slate-400" />
                    Close Post
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(job.id, 'ACTIVE')}
                    className="px-4 py-2 border border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Reopen Post
                  </button>
                )}

                <Link
                  to={`/employer/jobs/${job.id}/applicants`}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  View Applicants
                </Link>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  title="Delete Job Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
