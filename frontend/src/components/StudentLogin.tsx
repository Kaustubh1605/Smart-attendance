import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';

interface StudentLoginProps {
  onLoginSuccess: () => void;
  onOpenRecovery: () => void;
  onSwitchToAdmin?: () => void;
  onSwitchToTeacher?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLoginSuccess,
  onOpenRecovery,
  onSwitchToAdmin,
  onSwitchToTeacher,
}) => {
  const [email, setEmail] = useState('aarav.sharma@springfield.edu');
  const [password, setPassword] = useState('••••••••');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your Student ID or Email.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 700);
  };

  const handleQuickFill = () => {
    setEmail('aarav.sharma@springfield.edu');
    setPassword('StudentKey2024#');
    setRememberDevice(true);
  };

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center px-4 bg-[#f3f4f5] py-12 text-[#191c1d] font-sans">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <img alt="SmartAttend" className="h-12 w-auto mb-1 drop-shadow-sm" src={LOGO_URL} />
            <span className="absolute -bottom-1 -right-2 bg-[#031635] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-white">
              Student
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#031635] tracking-tight">SmartAttend</h1>
          <p className="text-[13px] text-[#75777f]">
            Springfield University • Student Authentication Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] p-7 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f5]">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#031635] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-[#1b6d24]">smartphone</span>
              <span>Device Bound Authentication</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Student
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-2xl text-[12px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ID/Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]" htmlFor="studentId">
                Institutional Email or Student ID
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  person
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d] placeholder:text-[#75777f]"
                  id="studentId"
                  name="studentId"
                  placeholder="e.g. aarav.sharma@springfield.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="text"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-[#44474e]" htmlFor="password">
                  Password Credential
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered email.')}
                  className="text-[11px] font-bold text-[#031635] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d]"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#191c1d]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Device Binding Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded text-[#031635] accent-[#031635] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="rememberDevice" className="text-[12px] text-[#44474e] cursor-pointer">
                Bind session to this verified mobile device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#031635] hover:bg-[#1a2b4b] text-white py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Authenticating Hardware Token...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Student Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Device Recovery Option & Portal Switch */}
          <div className="border-t border-[#f3f4f5] pt-4 flex flex-col gap-2.5 text-center text-[12px] text-[#75777f]">
            <p>
              Lost or replaced your registered phone?{' '}
              <button
                type="button"
                onClick={onOpenRecovery}
                className="font-bold text-[#031635] hover:underline cursor-pointer"
              >
                Recover Device
              </button>
            </p>

            <p className="mt-1">
              New here?{' '}
              <a href="/register" className="font-bold text-[#031635] hover:underline">
                Create an Account
              </a>
            </p>

            {(onSwitchToAdmin || onSwitchToTeacher) && (
              <div className="pt-2 border-t border-[#f3f4f5] flex items-center justify-center gap-3">
                <span>Switch Portal:</span>
                {onSwitchToTeacher && (
                  <button
                    type="button"
                    onClick={onSwitchToTeacher}
                    className="font-bold text-[#031635] hover:underline cursor-pointer"
                  >
                    Teacher Portal
                  </button>
                )}
                {onSwitchToAdmin && onSwitchToTeacher && <span>•</span>}
                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="font-bold text-[#031635] hover:underline cursor-pointer"
                  >
                    Admin Portal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
