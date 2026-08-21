import React from 'react';
import { AVATAR_URL, LOGO_URL } from '../data/mockData';
import { StudentProfile } from '../types';

interface StudentProfileProps {
  student: StudentProfile;
  onLogout: () => void;
  onOpenDeviceRecovery: () => void;
}

export const StudentProfileView: React.FC<StudentProfileProps> = ({
  student,
  onLogout,
  onOpenDeviceRecovery,
}) => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Student Profile</span>
            <span className="text-base font-bold text-[#031635]">Institutional Account</span>
          </div>
          <span className="text-[11px] font-bold bg-[#eef2ff] text-[#031635] px-2.5 py-1 rounded-xl border border-[#d8e2ff]">
            BCA Term 3
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 pt-4">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#d8e2ff] overflow-hidden shadow-xs shrink-0">
            <img
              alt={student.name}
              className="w-full h-full object-cover"
              src={student.avatarUrl || AVATAR_URL}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#75777f]">Registered Student</span>
            <h2 className="text-[18px] font-bold text-[#031635] leading-tight">{student.name}</h2>
            <p className="text-[12px] text-[#44474e] font-medium mt-0.5">{student.studentId}</p>
            <p className="text-[11px] text-[#75777f] mt-0.5">{student.program}</p>
          </div>
        </div>

        {/* Registered Hardware Binding Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">
              Bound Hardware Device
            </span>
            <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005312]" />
              Trusted Node
            </span>
          </div>

          <div className="bg-[#f8f9fa] rounded-xl p-3.5 flex flex-col gap-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#75777f]">Model:</span>
              <span className="font-bold text-[#191c1d]">{student.registeredDevice.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75777f]">Hardware ID:</span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#e1e3e4] text-[#191c1d]">
                {student.registeredDevice.deviceId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75777f]">Last Attested:</span>
              <span className="font-semibold text-[#191c1d]">{student.registeredDevice.lastVerifiedAt}</span>
            </div>
          </div>

          <button
            onClick={onOpenDeviceRecovery}
            className="w-full py-2.5 bg-[#eef2ff] border border-[#d8e2ff] hover:bg-[#d8e2ff] text-[#031635] text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">sync_lock</span>
            <span>Initiate Device Transfer / Recovery</span>
          </button>
        </div>

        {/* Attendance Academic Analytics */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">
            Academic Standing
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col">
              <span className="text-[11px] text-[#75777f] font-medium">Cumulative Attendance</span>
              <span className="text-[22px] font-extrabold text-[#031635] mt-1">
                {student.overallAttendancePercentage}%
              </span>
              <span className="text-[10px] text-[#005312] font-bold mt-0.5">Compliant (&gt;75%)</span>
            </div>

            <div className="p-3.5 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex flex-col">
              <span className="text-[11px] text-[#75777f] font-medium">Consecutive Streak</span>
              <span className="text-[22px] font-extrabold text-[#031635] mt-1">
                {student.currentStreak} Days
              </span>
              <span className="text-[10px] text-[#75777f] font-semibold mt-0.5">Top 5% in Batch</span>
            </div>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="w-full py-3 bg-white border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/30 text-[13px] font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out of Session</span>
          </button>
        </div>
      </main>
    </div>
  );
};
