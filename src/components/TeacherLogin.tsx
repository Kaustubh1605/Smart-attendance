import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';

interface TeacherLoginProps {
  onLoginSuccess: () => void;
  onSwitchToStudent?: () => void;
  onSwitchToAdmin?: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({
  onLoginSuccess,
  onSwitchToStudent,
  onSwitchToAdmin,
}) => {
  const [facultyEmail, setFacultyEmail] = useState('prof.sharma@springfield.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [department, setDepartment] = useState('Computer Science & IT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyEmail || !password) {
      setErrorMsg('Please enter your Faculty email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  const handleQuickFill = () => {
    setFacultyEmail('prof.sharma@springfield.edu');
    setPassword('FacultyPass2024!');
    setDepartment('Computer Science & IT');
  };

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center px-4 bg-[#f3f4f5] py-12 text-[#191c1d] font-sans">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <img alt="SmartAttend" className="h-12 w-auto mb-1 drop-shadow-sm" src={LOGO_URL} />
            <span className="absolute -bottom-1 -right-2 bg-[#005312] text-[#a0f399] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-white">
              Faculty
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#031635] tracking-tight">
            Faculty & Teacher Portal
          </h1>
          <p className="text-[13px] text-[#75777f]">
            Springfield University • Real-Time Attendance Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] p-7 flex flex-col gap-5 shadow-lg relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f5]">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#031635] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-[#005312]">school</span>
              <span>Instructor Authentication</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Faculty
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-2xl text-[12px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]" htmlFor="dept">
                Academic Department
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  apartment
                </span>
                <select
                  id="dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d] appearance-none font-medium cursor-pointer"
                >
                  <option value="Computer Science & IT">Computer Science & IT (BCA / MCA)</option>
                  <option value="Electrical Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mathematics">Department of Mathematics</option>
                  <option value="Business Administration">School of Business Administration</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777f] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]" htmlFor="facultyEmail">
                Faculty Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  badge
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d] placeholder:text-[#75777f]"
                  id="facultyEmail"
                  name="facultyEmail"
                  placeholder="prof.sharma@springfield.edu"
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-[#44474e]" htmlFor="facultyPass">
                  Staff Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to faculty email.')}
                  className="text-[11px] font-bold text-[#031635] hover:underline cursor-pointer"
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
                  id="facultyPass"
                  name="facultyPass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#191c1d] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#031635] hover:bg-[#1a2b4b] text-white py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Authenticating Faculty Roster Access...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Open Classroom Ingest</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Portal Switch Footer */}
          <div className="border-t border-[#f3f4f5] pt-4 flex items-center justify-between text-[12px] text-[#75777f]">
            <span>Switch Portal:</span>
            <div className="flex items-center gap-3">
              {onSwitchToStudent && (
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="font-bold text-[#031635] hover:underline cursor-pointer"
                >
                  Student Portal
                </button>
              )}
              {onSwitchToAdmin && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="font-bold text-[#031635] hover:underline cursor-pointer"
                  >
                    Admin Portal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
