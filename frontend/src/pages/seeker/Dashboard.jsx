import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { seekerAPI, applicationsAPI, aiAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { User, Briefcase, FileText, CheckCircle, Brain, Calendar, ArrowRight, Star, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeekerDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [profRes, appsRes, recsRes] = await Promise.all([
          seekerAPI.getProfile(),
          applicationsAPI.getMyApplications(),
          aiAPI.getRecommendations()
        ]);
        setProfile(profRes.data);
        setApplications(appsRes.data);
        setRecommendations(recsRes.data.slice(0, 3));
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const averageMatchScore = () => {
    if (applications.length === 0) return 0;
    const scoredApps = applications.filter(app => app.aiMatchScore != null);
    if (scoredApps.length === 0) return 0;
    const sum = scoredApps.reduce((acc, app) => acc + app.aiMatchScore, 0);
    return Math.round(sum / scoredApps.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <Brain className="w-full h-full text-indigo-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">Welcome Back, {user?.name}!</h1>
        <p className="text-indigo-200/80 text-sm sm:text-base mt-2 max-w-xl">
          Track your active applications, edit your technical profile, or look at what jobs our AI matching system recommends for you.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applied Jobs</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{applications.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg AI Match Score</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {averageMatchScore() > 0 ? `${averageMatchScore()}%` : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resume Profile Status</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1.5 truncate max-w-[180px]">
              {profile?.resumeUrl ? 'Active Resume' : 'No Resume Uploaded'}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Applications & Quick Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Applications list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
              <Link to="/seeker/applications" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm">
                View all
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">You haven't applied to any jobs yet.</p>
                <Link to="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
                  Find jobs to apply <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{app.job.title}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{app.job.employer?.companyName}</p>
                      
                      <span className="text-[10px] text-slate-400 font-medium block mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        app.status === 'APPLIED' ? 'bg-indigo-50 text-indigo-700' :
                        app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' || app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status}
                      </span>
                      {app.aiMatchScore != null && (
                        <p className="text-xs font-semibold text-slate-500 mt-1">Match: {Math.round(app.aiMatchScore)}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Profile Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Professional Summary</h2>
              <Link to="/seeker/profile" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm">
                Edit profile
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{profile?.currentTitle || 'Professional Role (Empty)'}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{profile?.bio || 'Write a short professional bio in your profile settings.'}</p>
                </div>
              </div>

              {profile?.skills && profile.skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Technical Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-150 text-xs font-semibold text-slate-700 border border-slate-200/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-indigo-800">
              <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-lg font-display text-white">AI Recommended Jobs</h3>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-6 text-indigo-200">
                <Brain className="w-10 h-10 mx-auto mb-2 text-indigo-300 opacity-60" />
                <p className="text-xs">Add skills and experience to see tailored job opportunities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((job) => (
                  <div key={job.id} className="p-4 bg-white/5/80 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                    <h4 className="font-bold text-sm line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-indigo-300 font-semibold">{job.employer?.companyName}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills?.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold text-indigo-100">
                          {s}
                        </span>
                      ))}
                    </div>
                    <Link to={`/jobs/${job.id}`} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 mt-3 justify-end group">
                      Review Job <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                ))}
                
                <Link
                  to="/seeker/recommendations"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white text-indigo-950 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all mt-4 font-display shadow-md cursor-pointer"
                >
                  View All Matches
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
