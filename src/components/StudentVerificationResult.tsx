import React from 'react';
import { LOGO_URL } from '../data/mockData';
import { Lecture, VerificationResultStatus } from '../types';

interface StudentVerificationResultProps {
  lecture: Lecture;
  status: VerificationResultStatus;
  timestamp?: string;
  studentName?: string;
  onBackToDashboard: () => void;
  onViewHistory: () => void;
  onRequestCorrection?: () => void;
}

export const StudentVerificationResult: React.FC<StudentVerificationResultProps> = ({
  lecture,
  status,
  timestamp = 'Just now (10:02 AM)',
  studentName = 'Kaustubh Nikam',
  onBackToDashboard,
  onViewHistory,
  onRequestCorrection,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified_present':
        return {
          title: 'Verified Present',
          badgeBg: 'bg-[#a0f399]',
          badgeText: 'text-[#005312]',
          icon: 'verified',
          iconBg: 'bg-[#a0f399]',
          iconColor: 'text-[#005312]',
          message: 'Your attendance has been cryptographically confirmed and permanently logged.',
          border: 'border-[#a0f399]/40',
        };
      case 'probable_present':
        return {
          title: 'Probable Present',
          badgeBg: 'bg-[#d8e2ff]',
          badgeText: 'text-[#001d36]',
          icon: 'check_circle',
          iconBg: 'bg-[#d8e2ff]',
          iconColor: 'text-[#001d36]',
          message: 'Attendance recorded during the late grace window. Verified with local hardware binding.',
          border: 'border-[#d8e2ff]',
        };
      case 'needs_review':
        return {
          title: 'Needs Review',
          badgeBg: 'bg-[#ffdcc6]',
          badgeText: 'text-[#723600]',
          icon: 'warning',
          iconBg: 'bg-[#ffdcc6]',
          iconColor: 'text-[#723600]',
          message: 'Attendance flagged for instructor review due to location perimeter boundary variance.',
          border: 'border-[#ffdcc6]',
        };
      case 'possible_proxy':
        return {
          title: 'Possible Proxy Flagged',
          badgeBg: 'bg-[#ffdad6]',
          badgeText: 'text-[#ba1a1a]',
          icon: 'gpp_maybe',
          iconBg: 'bg-[#ffdad6]',
          iconColor: 'text-[#ba1a1a]',
          message: 'Multiple challenge submissions detected from identical network node. Held for faculty verification.',
          border: 'border-[#ffdad6]',
        };
      case 'not_verified':
      default:
        return {
          title: 'Not Verified',
          badgeBg: 'bg-[#ffdad6]',
          badgeText: 'text-[#ba1a1a]',
          icon: 'cancel',
          iconBg: 'bg-[#ffdad6]',
          iconColor: 'text-[#ba1a1a]',
          message: 'Attendance could not be verified. You may submit an attendance correction dispute.',
          border: 'border-[#ffdad6]',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] font-sans pb-10">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img alt="SmartAttend" className="h-7 w-auto" src={LOGO_URL} />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Springfield Univ</span>
              <span className="text-base font-bold text-[#031635]">SmartAttend</span>
            </div>
          </div>
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full ${config.badgeBg} ${config.badgeText}`}>
            {config.title}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 pt-5">
        {/* Status Hero Card */}
        <div className={`bg-white rounded-3xl p-6 border ${config.border} shadow-sm flex flex-col items-center text-center gap-3`}>
          <div className={`w-18 h-18 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center shadow-md animate-in zoom-in-75`}>
            <span className="material-symbols-outlined text-[38px]">{config.icon}</span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className={`text-[12px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full mx-auto ${config.badgeBg} ${config.badgeText}`}>
              {config.title}
            </span>
            <h1 className="text-[22px] font-extrabold text-[#031635] mt-1">
              Attendance Status Logged
            </h1>
            <p className="text-[13px] text-[#44474e] max-w-xs leading-relaxed">
              {config.message}
            </p>
          </div>
        </div>

        {/* Session Details Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
            Class & Session Information
          </span>

          <div className="flex flex-col divide-y divide-[#f3f4f5] text-[13px]">
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Student:</span>
              <span className="font-bold text-[#191c1d]">{studentName}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Subject:</span>
              <span className="font-bold text-[#031635]">{lecture.name}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Course Code:</span>
              <span className="font-semibold text-[#191c1d]">{lecture.code}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Class / Division:</span>
              <span className="font-medium text-[#191c1d]">BCA Sem 3 • Div A</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Venue / Room:</span>
              <span className="font-semibold text-[#191c1d]">{lecture.room}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Lecture Time:</span>
              <span className="font-medium text-[#191c1d]">{lecture.timeSlot}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#75777f]">Attendance Timestamp:</span>
              <span className="font-mono text-[12px] font-bold text-[#031635]">{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Non-Cryptographic Simple Verification Details (As Specified) */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
              Verification Factors
            </span>
            <span className="text-[11px] font-semibold text-[#1b6d24] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1b6d24]" />
              Multi-Factor Confirmed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[12px]">
            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">Student Identity</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                Verified
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">Registered Device</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                Verified
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">Lecture Session</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                Verified
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">Dynamic QR Code</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                Verified
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">Class Location</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                status === 'needs_review' || status === 'not_verified'
                  ? 'bg-[#ffdcc6] text-[#723600]'
                  : 'bg-[#a0f399] text-[#005312]'
              }`}>
                {status === 'needs_review' ? 'Uncertain' : 'Verified'}
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
              <span className="text-[#44474e] font-medium">BLE Proximity</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                Detected
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={onBackToDashboard}
            className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={onViewHistory}
            className="w-full bg-white border border-[#e1e3e4] text-[#031635] hover:bg-[#f8f9fa] active:scale-[0.98] py-3 px-4 rounded-2xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>View Attendance History</span>
          </button>

          {(status === 'needs_review' || status === 'not_verified' || status === 'possible_proxy') && onRequestCorrection && (
            <button
              onClick={onRequestCorrection}
              className="w-full bg-[#fff8f6] border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffded9] py-2.5 px-4 rounded-2xl font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
              <span>Submit Attendance Dispute Request</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
