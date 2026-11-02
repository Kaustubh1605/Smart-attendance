import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');
    try {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success !== false) {
          // Registered on backend
        } else if (response.status === 400 || response.status === 409) {
          throw new Error(data.message || 'Registration failed or email already registered');
        }
      } catch (netErr: any) {
        if (netErr.message && !netErr.message.includes('fetch')) {
          throw netErr;
        }
        console.warn('Backend unavailable, proceeding with local registration queue:', netErr);
      }

      // Record to pending registrations queue in localStorage for Admin review
      try {
        const saved = localStorage.getItem('smartattend_pending_registrations');
        const list = saved ? JSON.parse(saved) : [];
        const newEntry = {
          id: `reg-${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };
        const filtered = list.filter((item: any) => item.email !== newEntry.email);
        localStorage.setItem('smartattend_pending_registrations', JSON.stringify([newEntry, ...filtered]));
      } catch (storageErr) {
        console.error('Failed to save to localStorage:', storageErr);
      }

      setStatus('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e1e3e4] text-center max-w-md w-full">
          <div className="w-16 h-16 bg-[#eef2ff] text-[#031635] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">schedule</span>
          </div>
          <h2 className="text-2xl font-bold text-[#031635] mb-2">Registration Pending</h2>
          <p className="text-[#44474e]">
            Your account has been created successfully. An administrator must approve your registration before you can log in.
          </p>
          <button 
            onClick={() => navigate('/student')}
            className="mt-6 px-4 py-2 bg-[#031635] text-white rounded-xl font-bold hover:bg-[#1a2b4b]"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative font-sans"
      style={{
        background: "linear-gradient(135deg, rgba(3, 22, 53, 0.92), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80') center/cover no-repeat fixed",
      }}
    >
      <div className="bg-white/95 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-2xl border border-white/40 max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 mb-2">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-slate-500 text-xs mt-1">Smart Attendance • Institutional Self-Registration</p>
        </div>
        
        {status === 'ERROR' && (
          <div className="mb-4 p-3 bg-[#fff8f6] border border-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-[#44474e] mb-1">Full Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none focus:border-[#031635]" 
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#44474e] mb-1">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none focus:border-[#031635]" 
              placeholder="john@university.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#44474e] mb-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none focus:border-[#031635]" 
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#44474e] mb-1">I am a...</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input type="radio" checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} className="w-4 h-4 accent-[#031635]" />
                <span>Student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input type="radio" checked={role === 'TEACHER'} onChange={() => setRole('TEACHER')} className="w-4 h-4 accent-[#031635]" />
                <span>Teacher</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input type="radio" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} className="w-4 h-4 accent-[#031635]" />
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={status === 'LOADING'}
            className="mt-4 w-full py-3 bg-[#031635] text-white rounded-xl font-bold hover:bg-[#1a2b4b] disabled:opacity-70 transition-colors cursor-pointer shadow-md"
          >
            {status === 'LOADING' ? 'Submitting...' : 'Register'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="w-full py-2 bg-transparent text-[#75777f] font-bold hover:text-[#031635] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
