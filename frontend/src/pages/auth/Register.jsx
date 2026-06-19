import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SEEKER', 'EMPLOYER']),
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'SEEKER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data.name, data.email, data.password, data.role);
      toast.success('Account created! Welcome to HireIQ.');
      redirectByRole(user.role);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign-Up ────────────────────────────────────────────────────────
  // We need the role before Google login for new users — ask first, then trigger Google
  const handleGoogleSignUp = (role) => {
    setGoogleLoading(true);

    const initGoogle = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const user = await googleLogin(response.credential, role);
            toast.success(`Welcome to HireIQ, ${user.name}!`);
            redirectByRole(user.role);
          } catch {
            toast.error('Google sign-up failed.');
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  };

  const redirectByRole = (role) => {
    if (role === 'SEEKER') navigate('/seeker');
    else if (role === 'EMPLOYER') navigate('/employer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">HireIQ</h1>
          <p className="text-slate-500 mt-1">Create your account</p>
        </div>

        {/* Role Selector */}
        <div className="flex rounded-xl border border-slate-200 p-1 mb-6 bg-slate-50">
          {['SEEKER', 'EMPLOYER'].map((role) => (
            <label key={role} className="flex-1 cursor-pointer">
              <input {...register('role')} type="radio" value={role} className="sr-only" />
              <div className={`text-center py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRole === role
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
                {role === 'SEEKER' ? '🙋 Job Seeker' : '🏢 Employer'}
              </div>
            </label>
          ))}
        </div>

        {/* Google Sign-Up */}
        <button
          onClick={() => handleGoogleSignUp(selectedRole)}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.6 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {googleLoading ? 'Connecting...' : `Continue with Google as ${selectedRole === 'SEEKER' ? 'Job Seeker' : 'Employer'}`}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">or fill in details</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              {...register('name')}
              placeholder="John Doe"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Min. 8 characters"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
