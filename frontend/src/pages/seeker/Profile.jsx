import { useState, useEffect } from 'react';
import { seekerAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { User, Globe, Mail, MapPin, Plus, X, Save, Edit, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeekerProfile() {
  const { updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form States
  const [currentTitle, setCurrentTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  
  // Skills Tags Input
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await seekerAPI.getProfile();
        setProfile(data);
        setCurrentTitle(data.currentTitle || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setExpectedSalary(data.expectedSalary || '');
        setExperienceYears(data.experienceYears || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setGithubUrl(data.githubUrl || '');
        setPortfolioUrl(data.portfolioUrl || '');
        setIsOpenToWork(data.isOpenToWork !== false);
        setSkills(data.skills || []);
      } catch (err) {
        toast.error('Failed to load profile details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;
    if (skills.includes(clean)) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, clean]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        currentTitle,
        bio,
        location,
        expectedSalary: expectedSalary ? parseInt(expectedSalary, 10) : null,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        isOpenToWork,
        skills
      };
      const { data } = await seekerAPI.updateProfile(payload);
      setProfile(data);
      updateUser({ name: data.user.name }); // update local auth store name if synchronized
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile details');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Profile Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your personal professional information for employers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Professional Title</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Years of Experience</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 5"
                min="0"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Expected Salary (LPA)</label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="e.g. 15"
                min="0"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Professional Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about your background, achievements, and career goals..."
              className="w-full border border-slate-355 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl">
            <input
              type="checkbox"
              id="isOpenToWork"
              checked={isOpenToWork}
              onChange={(e) => setIsOpenToWork(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <label htmlFor="isOpenToWork" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
              Open to Work (Show a badge to recruiters)
            </label>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Skills Tag Profile
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Add Technical Skill</label>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. React, Node.js, Spring Boot"
                className="flex-1 border border-slate-350 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Add skills to help our AI matching algorithm recommend matching jobs.</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills listed yet. Add some skills tags above.</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-slate-650"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Social / Portfolio Links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Social & Portfolios
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Portfolio or Personal Website URL</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.com"
                className="w-full border border-slate-350 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="gradient-button px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                Save Profile Configuration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
