import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI, seekerAPI } from '../../services/api';
import { UploadCloud, FileText, Trash2, ArrowRight, CheckCircle2, AlertTriangle, CloudLightning } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumeUpload() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await seekerAPI.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading resume PDF...');
    try {
      const { data } = await resumeAPI.upload(file);
      setProfile(data);
      toast.success('Resume uploaded and parsed successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.', { id: toastId });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume? This will clear your resume analysis matches.')) return;
    const toastId = toast.loading('Deleting resume...');
    try {
      await resumeAPI.delete();
      setProfile({ ...profile, resumeUrl: null, resumePublicId: null });
      toast.success('Resume deleted successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete resume.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900">Manage Resume</h1>
          <p className="text-slate-500 text-sm mt-1">Upload a PDF resume to automatically parse your skills and enable job match scoring.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Upload Dropzone Area */}
        {!profile?.resumeUrl ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/40'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-14 h-14 text-slate-400 mx-auto mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
            <h3 className="text-lg font-bold text-slate-800">Drag & drop your resume PDF</h3>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">Supported formats: PDF (max 5MB)</p>
            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all cursor-pointer shadow-md shadow-indigo-100"
            >
              Browse Files
            </button>
          </div>
        ) : (
          /* Uploaded File Detail Panel */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                <FileText className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 truncate max-w-[240px]">MyUploadedResume.pdf</h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Cloud Storage Status: Verified</span>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-xs inline-flex items-center gap-0.5 mt-2 transition-all hover:underline"
                >
                  View PDF Resume file <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={uploading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Delete Resume
            </button>
          </div>
        )}

        {/* Informational Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex gap-3.5">
            <CloudLightning className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Automatic Parsing</h4>
              <p className="text-slate-500 text-xs leading-normal mt-1">
                When you upload a resume, our parser automatically pulls your experience details and list of technical skills into your profile.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex gap-3.5">
            <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Privacy & Security</h4>
              <p className="text-slate-500 text-xs leading-normal mt-1">
                Your resume is securely stored on Cloudinary raw storage. It is only shared with employers of jobs you explicitly apply to.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
