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
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl text-white border-b border-slate-800/80 px-3 sm:px-4 md:px-6 py-2.5 shadow-lg shadow-black/20 w-full max-w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 w-full">
        {/* Brand & Phone Frame Toggle */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onChangeRole(currentRole)}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 p-1 shadow-md shadow-indigo-500/25">
              <img alt="SmartAttend" className="h-full w-full object-contain brightness-200" src={LOGO_URL} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] sm:text-[16px] tracking-tight text-white flex items-center gap-1">
                SmartAttend
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Enterprise
              </span>
            </div>
          </div>

          {/* Adaptive Viewport Switcher: 16:9 Laptop vs 9:16 Phone */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => { if (isPhoneFrame) onTogglePhoneFrame(); }}
              title="16:9 Laptop / Desktop Widescreen Layout"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                !isPhoneFrame
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">laptop</span>
              <span className="hidden sm:inline">16:9 Laptop</span>
            </button>
            <button
              type="button"
              onClick={() => { if (!isPhoneFrame) onTogglePhoneFrame(); }}
              title="9:16 Phone Mobile Layout"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                isPhoneFrame
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">stay_current_portrait</span>
              <span className="hidden sm:inline">9:16 Phone</span>
            </button>
          </div>
        </div>

        {/* Role & Screen Navigation Switcher - Segmented Control */}
        <nav className="w-full md:w-auto grid grid-cols-3 md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner max-w-full">
          <button
            onClick={() => onChangeRole('student')}
            className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              currentRole === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">school</span>
            <span className="truncate">
              <span className="inline sm:hidden">Student</span>
              <span className="hidden sm:inline">Student Portal</span>
            </span>
            <span
              className={`relative flex h-2 w-2 shrink-0`}
              title={isStudentLoggedIn ? 'Active Student Session' : 'Logged Out'}
            >
              {isStudentLoggedIn && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isStudentLoggedIn ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
            </span>
          </button>

          <button
            onClick={() => onChangeRole('teacher')}
            className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              currentRole === 'teacher'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">co_present</span>
            <span className="truncate">
              <span className="inline sm:hidden">Faculty</span>
              <span className="hidden sm:inline">Teacher Portal</span>
            </span>
            <span
              className={`relative flex h-2 w-2 shrink-0`}
              title={isTeacherLoggedIn ? 'Active Teacher Session' : 'Logged Out'}
            >
              {isTeacherLoggedIn && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isTeacherLoggedIn ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
            </span>
          </button>

          <button
            onClick={() => onChangeRole('admin')}
            className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] md:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              currentRole === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">shield_person</span>
            <span className="truncate">
              <span className="inline sm:hidden">Admin</span>
              <span className="hidden sm:inline">Admin Portal</span>
            </span>
            <span
              className={`relative flex h-2 w-2 shrink-0`}
              title={isAdminLoggedIn ? 'Active Admin Session' : 'Logged Out'}
            >
              {isAdminLoggedIn && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAdminLoggedIn ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

