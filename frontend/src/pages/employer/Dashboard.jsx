import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI, jobsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { Building, PlusCircle, Briefcase, Eye, UserCheck, Settings, ArrowRight, MapPin, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal States
  const [editOpen, setEditOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profRes, jobsRes] = await Promise.all([
          employerAPI.getProfile(),
          jobsAPI.getMyJobs()
        ]);
        setProfile(profRes.data);
        setJobs(jobsRes.data);
        
        // Populate edit state
        setCompanyName(profRes.data.companyName || '');
        setDescription(profRes.data.description || '');
        setWebsite(profRes.data.website || '');
        setIndustry(profRes.data.industry || '');
        setLocation(profRes.data.location || '');
        setCompanySize(profRes.data.companySize || '');
        setFoundedYear(profRes.data.foundedYear || '');
      } catch (err) {
        toast.error('Failed to load employer dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const totalViews = () => jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        companyName,
        description,
        website,
        industry,
        location,
        companySize,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : null
      };
      const { data } = await employerAPI.updateProfile(payload);
      setProfile(data);
      setEditOpen(false);
      toast.success('Company profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update company details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading employer portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Company Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <Building className="w-6 h-6 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Recruiter Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">{profile?.companyName || 'Update Company Profile'}</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            {profile?.industry ? `${profile.industry} • ${profile.location || 'Remote'}` : 'Click edit profile below to add your company details.'}
          </p>
        </div>
        
        <button
          onClick={() => setEditOpen(true)}
          className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-slate-100 font-bold rounded-xl text-sm transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Edit3 className="w-4 h-4" />
          Edit Company Profile
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Job Posts</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{jobs.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Job Views</span>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalViews()}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
            <Link to="/employer/post-job" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-2 block flex items-center gap-0.5">
              Post a new job <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Jobs List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Active Listings</h2>
              <Link to="/employer/jobs" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm">
                Manage all
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No active job listings. Create one to start accepting applications.</p>
                <Link to="/employer/post-job" className="gradient-button mt-4 px-6 py-2.5 rounded-xl text-sm font-bold inline-block">
                  Create Job Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{job.title}</h4>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {job.viewsCount || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || 'Remote'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/employer/jobs/${job.id}/applicants`}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100/80 rounded-xl text-xs font-bold text-slate-700 shrink-0 flex items-center gap-0.5 group"
                    >
                      Applicants <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Overview Details Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              Company Card
            </h3>
            
            {profile?.description ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed italic">"{profile.description}"</p>
                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
                  {profile.website && (
                    <p className="flex justify-between">
                      <span className="text-slate-450 font-medium">Website</span>
                      <a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{profile.website}</a>
                    </p>
                  )}
                  {profile.companySize && (
                    <p className="flex justify-between">
                      <span className="text-slate-450 font-medium">Size</span>
                      <span>{profile.companySize} employees</span>
                    </p>
                  )}
                  {profile.foundedYear && (
                    <p className="flex justify-between">
                      <span className="text-slate-450 font-medium">Founded</span>
                      <span>{profile.foundedYear}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No company descriptions available yet. Fill in your profile details.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-xl w-full relative z-10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900">Edit Company Profile</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Software, Finance"
                    className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="501+">501+ Employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Founded Year</label>
                <input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g. 2018"
                  className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your company background, culture, and core mission..."
                  className="w-full border border-slate-350 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gradient-button px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
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
