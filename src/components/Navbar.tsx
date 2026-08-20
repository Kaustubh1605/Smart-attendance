import React from 'react';
import { LOGO_URL } from '../data/mockData';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  isStudentLoggedIn: boolean;
  isTeacherLoggedIn: boolean;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  isPhoneFrame,
  onTogglePhoneFrame,
  isStudentLoggedIn,
  isTeacherLoggedIn,
  isAdminLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#031635] text-white border-b border-white/10 px-3 sm:px-4 md:px-6 py-2.5 shadow-md w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 w-full">
        {/* Top row on mobile: Brand Logo + Phone Frame Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between gap-2">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2">
            <img alt="SmartAttend" className="h-6 sm:h-7 md:h-8 w-auto shrink-0" src={LOGO_URL} />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] sm:text-[15px] md:text-[16px] tracking-tight text-white">SmartAttend</span>
              <span className="text-[9px] font-bold bg-[#a0f399] text-[#005312] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                PRD
              </span>
            </div>
          </div>

          {/* Right Tools on mobile (and desktop): Frame Toggle for Student App only */}
          {currentRole === 'student' && (
            <button
              onClick={onTogglePhoneFrame}
              title="Toggle mobile device mockup frame vs full viewport"
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isPhoneFrame
                  ? 'bg-[#1a2b4b] border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-[#b6c6ef] hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isPhoneFrame ? 'devices' : 'stay_current_portrait'}
              </span>
              <span className="text-[11px]">
                {isPhoneFrame ? 'Frame: ON' : 'Frame: OFF'}
              </span>
            </button>
          )}
        </div>

        {/* Role & Screen Navigation Switcher - Fits 100% on screen without horizontal scrolling */}
        <nav className="w-full md:w-auto grid grid-cols-3 md:flex items-center gap-1 bg-[#081b3a] p-1 rounded-2xl border border-white/10 max-w-full">
          <button
            onClick={() => onChangeRole('student')}
            className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              currentRole === 'student'
                ? 'bg-white text-[#031635] shadow-xs'
                : 'text-[#b6c6ef] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">smartphone</span>
            <span className="truncate">
              <span className="inline sm:hidden">Student</span>
              <span className="hidden sm:inline">Student Portal</span>
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isStudentLoggedIn ? 'bg-[#a0f399]' : 'bg-[#ffb4ab]'
              }`}
              title={isStudentLoggedIn ? 'Student Logged In' : 'Student Logged Out'}
            />
          </button>

          <button
            onClick={() => onChangeRole('teacher')}
            className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              currentRole === 'teacher'
                ? 'bg-white text-[#031635] shadow-xs'
                : 'text-[#b6c6ef] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">co_present</span>
            <span className="truncate">
              <span className="inline sm:hidden">Teacher</span>
              <span className="hidden sm:inline">Teacher Portal</span>
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isTeacherLoggedIn ? 'bg-[#a0f399]' : 'bg-[#ffb4ab]'
              }`}
              title={isTeacherLoggedIn ? 'Teacher Logged In' : 'Teacher Logged Out'}
            />
          </button>

          <button
            onClick={() => onChangeRole('admin')}
            className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              currentRole === 'admin'
                ? 'bg-white text-[#031635] shadow-xs'
                : 'text-[#b6c6ef] hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">admin_panel_settings</span>
            <span className="truncate">
              <span className="inline sm:hidden">Admin</span>
              <span className="hidden sm:inline">Admin Portal</span>
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isAdminLoggedIn ? 'bg-[#a0f399]' : 'bg-[#ffb4ab]'
              }`}
              title={isAdminLoggedIn ? 'Admin Logged In' : 'Admin Logged Out'}
            />
          </button>
        </nav>
      </div>
    </header>
  );
};

