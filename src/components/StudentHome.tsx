import React, { useState } from 'react';
import {
  AVATAR_URL,
  LOGO_URL,
  MOCK_SUBJECTS,
  MOCK_STUDENT_NOTIFICATIONS,
  MOCK_OFFLINE_ATTENDANCE_RECORDS,
} from '../data/mockData';
import {
  StudentProfile,
  Lecture,
  SubjectAttendance,
  AttendanceRecord,
  StudentNotification,
  OfflineAttendanceRecord,
} from '../types';
import { StudentSubjectDetails } from './StudentSubjectDetails';
import { StudentNotificationsModal } from './StudentNotificationsModal';
import { OfflineAttendanceModal } from './OfflineAttendanceModal';
import { HelpSupportModal } from './HelpSupportModal';

interface StudentHomeProps {
  student: StudentProfile;
  activeLecture: Lecture;
  upcomingLectures: Lecture[];
  attendanceHistory?: AttendanceRecord[];
  onStartVerification: () => void;
  onNavigateHistory: () => void;
  onNavigateProfile: () => void;
  onRequestCorrection?: (record: AttendanceRecord) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  student,
  activeLecture,
  upcomingLectures,
  attendanceHistory = [],
  onStartVerification,
  onNavigateHistory,
  onNavigateProfile,
  onRequestCorrection,
}) => {
  // Sub-view state
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendance | null>(null);

  // Modals state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Notifications and Offline state
  const [notifications, setNotifications] = useState<StudentNotification[]>(MOCK_STUDENT_NOTIFICATIONS);
  const [offlineRecords, setOfflineRecords] = useState<OfflineAttendanceRecord[]>(MOCK_OFFLINE_ATTENDANCE_RECORDS);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const pendingOfflineCount = offlineRecords.filter((r) => r.status === 'pending_sync').length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRecordOffline = (newRec: OfflineAttendanceRecord) => {
    setOfflineRecords((prev) => [newRec, ...prev]);
  };

  const handleSyncAllOffline = () => {
    setOfflineRecords((prev) => prev.map((r) => ({ ...r, status: 'synced' as const })));
  };

  // If a subject is selected, drill down to StudentSubjectDetails
  if (selectedSubject) {
    return (
      <StudentSubjectDetails
        subject={selectedSubject}
        student={student}
        records={attendanceHistory}
        onBack={() => setSelectedSubject(null)}
        onRequestCorrection={(rec) => {
          setSelectedSubject(null);
          if (onRequestCorrection) {
            onRequestCorrection(rec);
          } else {
            onNavigateHistory();
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] pb-24 font-sans">
      {/* App Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img alt="SmartAttend" className="h-7 w-auto shrink-0" src={LOGO_URL} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#75777f] uppercase tracking-wider">Springfield Univ</span>
              <span className="text-sm font-bold text-[#031635]">SmartAttend</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Offline Mesh Status Pill / Button */}
            <button
              onClick={() => setShowOfflineModal(true)}
              className="relative p-2 rounded-full hover:bg-[#f8f9fa] text-[#75777f] hover:text-[#031635] transition-colors cursor-pointer"
              title="Offline Attendance & Mesh Sync"
            >
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
              {pendingOfflineCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#723600] ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full hover:bg-[#f8f9fa] text-[#75777f] hover:text-[#031635] transition-colors cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Help & Support Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-full hover:bg-[#f8f9fa] text-[#75777f] hover:text-[#031635] transition-colors cursor-pointer"
              title="Help & Knowledge Base"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={onNavigateProfile}
              className="w-9 h-9 rounded-full border-2 border-[#d8e2ff] overflow-hidden shadow-xs hover:ring-2 hover:ring-[#031635]/20 transition-all cursor-pointer ml-1"
              title="View Profile"
            >
              <img
                alt={student.name}
                className="w-full h-full object-cover"
                src={student.avatarUrl || AVATAR_URL}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 pt-3.5">
        {/* Welcome Greeting & Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-[#75777f] uppercase tracking-wider">Welcome back</span>
              <h1 className="text-[20px] font-bold text-[#031635] mt-0.5">
                Hi, {student.name.split(' ')[0]} 👋
              </h1>
              <p className="text-[12px] text-[#44474e] mt-0.5">{student.program} • Roll: {student.rollNo}</p>
            </div>
            <div className="flex flex-col items-center bg-[#eef2ff] border border-[#d8e2ff] rounded-2xl px-3.5 py-2">
              <span className="text-[20px] font-extrabold text-[#031635] leading-none">
                {student.overallAttendancePercentage}%
              </span>
              <span className="text-[10px] font-bold text-[#005312] mt-1 bg-[#a0f399] px-2 py-0.5 rounded-full">
                Good Standing
              </span>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f3f4f5]">
            <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ffdcc6] text-[#723600] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#191c1d]">{student.currentStreak} Days</span>
                <span className="text-[10px] text-[#75777f]">Active Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d8e2ff] text-[#001d36] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#191c1d]">+{student.weeklyDelta}%</span>
                <span className="text-[10px] text-[#75777f]">This Week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Now Card */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">Active Class Now</span>
            <span className="text-[12px] font-bold text-[#1b6d24] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1b6d24] animate-ping" />
              Live In Session
            </span>
          </div>

          <div className="bg-[#031635] text-white rounded-3xl p-5 shadow-lg border border-white/10 flex flex-col gap-4 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#1a2b4b] rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-1 max-w-[70%]">
                <span className="bg-[#a0f399] text-[#005312] text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit">
                  {activeLecture.code}
                </span>
                <h3 className="text-[18px] font-bold text-white mt-1 leading-tight">
                  {activeLecture.name}
                </h3>
                <p className="text-[12px] text-[#b6c6ef]">
                  {activeLecture.instructor} • {activeLecture.room}
                </p>
              </div>

              <div className="flex flex-col items-end text-right z-10 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[12px] text-white font-bold">
                  {activeLecture.timeSlot}
                </span>
                <span className="text-[11px] text-[#b6c6ef]">{activeLecture.duration}</span>
              </div>
            </div>

            {/* Geofence & BLE Metadata Pill */}
            <div className="flex items-center gap-2 z-10 text-[11px] text-[#d8e2ff] bg-[#081b3a] px-3 py-2 rounded-xl border border-white/5 flex-wrap">
              <span className="material-symbols-outlined text-[15px] text-[#a0f399]">my_location</span>
              <span>Geofence: {activeLecture.geofence.radiusMeters || 35}m Radius</span>
              <span className="text-white/30">•</span>
              <span className="material-symbols-outlined text-[15px] text-[#a0f399]">bluetooth</span>
              <span>BLE Beacon Active</span>
            </div>

            {/* Verify Attendance Button */}
            <button
              onClick={onStartVerification}
              id="verifyBtn"
              className="w-full bg-[#a0f399] text-[#005312] hover:bg-[#b5f9af] active:scale-[0.98] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 z-10 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span>Verify Attendance Now</span>
            </button>
          </div>
        </div>

        {/* Course / Subject Breakdown Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">
              Courses & Subject Standing
            </span>
            <span className="text-[11px] text-[#75777f]">Tap for breakdown</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {MOCK_SUBJECTS.map((sub) => {
              const isWarning = sub.percentage < 75;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] hover:border-[#031635] shadow-xs flex flex-col justify-between gap-2 transition-all cursor-pointer hover:shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold bg-[#f8f9fa] text-[#031635] px-1.5 py-0.5 rounded border border-[#e1e3e4]">
                      {sub.code}
                    </span>
                    <span
                      className={`text-[12px] font-extrabold ${
                        isWarning ? 'text-[#ba1a1a]' : 'text-[#005312]'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-bold text-[#191c1d] line-clamp-1">{sub.name}</h4>
                    <p className="text-[10px] text-[#75777f]">
                      {sub.present}/{sub.totalLectures} attended
                    </p>
                  </div>

                  <div className="w-full bg-[#f3f4f5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isWarning ? 'bg-[#ba1a1a]' : 'bg-[#005312]'
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Lectures Today */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">Upcoming Today</span>
            <span className="text-[12px] font-semibold text-[#75777f]">
              {upcomingLectures.length} Lectures Remaining
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {upcomingLectures.map((lec, idx) => (
              <div
                key={lec.id || idx}
                className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex items-center justify-between hover:border-[#c5c6cf] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eef2ff] border border-[#d8e2ff] text-[#031635] flex items-center justify-center font-bold text-[12px] shrink-0">
                    {lec.code.split(' ')[1] || '0' + (idx + 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#191c1d] line-clamp-1">{lec.name}</span>
                    <span className="text-[11px] text-[#75777f]">
                      {lec.code} • {lec.room}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-[#031635]">{lec.timeSlot}</span>
                  <span className="text-[10px] text-[#75777f]">{lec.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Notice / Dispute Prompt */}
        <div
          onClick={onNavigateHistory}
          className="bg-[#fff8f6] border border-[#ffdad6] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#ffedea] transition-colors shadow-xs mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#ba1a1a]">1 Record Flagged For Review</p>
              <p className="text-[11px] text-[#75777f]">ENG 101 Design Ethics • Oct 22</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#ba1a1a] flex items-center">
            Review <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </span>
        </div>
      </main>

      {/* Notifications Modal */}
      <StudentNotificationsModal
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Offline Attendance Modal */}
      <OfflineAttendanceModal
        student={student}
        activeLecture={activeLecture}
        offlineRecords={offlineRecords}
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        onRecordOfflineAttendance={handleRecordOffline}
        onSyncAll={handleSyncAllOffline}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        userRole="student"
      />
    </div>
  );
};
