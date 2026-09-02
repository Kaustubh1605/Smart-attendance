import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
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
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e1e3e4] max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#031635]">Create an Account</h1>
          <p className="text-[#75777f] text-sm mt-1">Smart Attendance Portal</p>
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
