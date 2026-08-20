import React, { useState, useEffect } from 'react';
import {
  MOCK_OFFLINE_LECTURES,
  MOCK_OFFLINE_ROSTER,
  MOCK_OFFLINE_SYNC_SESSIONS,
  AVATAR_URL,
  generateUniqueId,
} from '../data/mockData';
import {
  OfflineRosterStudent,
  OfflineSyncSessionItem,
} from '../types';

interface TeacherOfflineAttendanceProps {
  onNavigateDashboard?: () => void;
}

export const TeacherOfflineAttendance: React.FC<TeacherOfflineAttendanceProps> = ({
  onNavigateDashboard,
}) => {
  // Navigation View Modes
  // 'readiness' | 'network_setup' | 'dynamic_qr' | 'live_roster' | 'sync_hub' | 'history'
  const [currentView, setCurrentView] = useState<
    'readiness' | 'network_setup' | 'dynamic_qr' | 'live_roster' | 'sync_hub' | 'history'
  >('readiness');

  // Network & Connectivity Simulation States
  const [isInternetOnline, setIsInternetOnline] = useState<boolean>(false);
  const [isLocalNetworkActive, setIsLocalNetworkActive] = useState<boolean>(true);
  const [isLimitedMode, setIsLimitedMode] = useState<boolean>(false);
  const [showNetworkPassword, setShowNetworkPassword] = useState<boolean>(false);
  const [copiedNetwork, setCopiedNetwork] = useState<boolean>(false);

  // Active Offline Session State
  const [selectedLecture, setSelectedLecture] = useState(MOCK_OFFLINE_LECTURES[0]);
  const [connectedStudentsCount, setConnectedStudentsCount] = useState<number>(38);
  const [showStartLectureModal, setShowStartLectureModal] = useState<boolean>(false);
  const [sessionActive, setSessionActive] = useState<boolean>(false);

  // Dynamic QR Code Rotation State (15 Seconds countdown)
  const [qrToken, setQrToken] = useState<string>('OFFLINE-NONCE-7729-SEC');
  const [tokenCountdown, setTokenCountdown] = useState<number>(15);
  const [qrRefreshCount, setQrRefreshCount] = useState<number>(1);

  // Live Roster & Student Records State
  const [roster, setRoster] = useState<OfflineRosterStudent[]>(MOCK_OFFLINE_ROSTER);
  const [rosterFilter, setRosterFilter] = useState<
    'all' | 'verified_present' | 'probable_present' | 'needs_review' | 'possible_proxy' | 'not_verified'
  >('all');
  const [searchRosterQuery, setSearchRosterQuery] = useState<string>('');
  const [inspectedStudent, setInspectedStudent] = useState<OfflineRosterStudent | null>(null);

  // End Lecture & Saved States
  const [showEndConfirmModal, setShowEndConfirmModal] = useState<boolean>(false);
  const [sessionSavedSummary, setSessionSavedSummary] = useState<boolean>(false);

  // Sync Hub & Multi-Stage Sync States
  const [syncSessions, setSyncSessions] = useState<OfflineSyncSessionItem[]>(MOCK_OFFLINE_SYNC_SESSIONS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<number>(0);
  const [showSyncResult, setShowSyncResult] = useState<boolean>(false);
  const [showSyncFailed, setShowSyncFailed] = useState<boolean>(false);
  const [syncFailureReason, setSyncFailureReason] = useState<string>('');

  // History Tab Filter
  const [historyFilter, setHistoryFilter] = useState<
    'all' | 'online' | 'offline' | 'pending_sync' | 'synced' | 'needs_review'
  >('all');

  // Dynamic 15-Second QR Timer Interval
  useEffect(() => {
    if (!sessionActive) return;
    const timer = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(`OFFLINE-NONCE-${Math.floor(1000 + Math.random() * 9000)}-SEC`);
          setQrRefreshCount((c) => c + 1);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionActive]);

  // Simulate incoming student connections during network setup and active QR
  useEffect(() => {
    if (currentView === 'network_setup' || currentView === 'dynamic_qr') {
      const interval = setInterval(() => {
        setConnectedStudentsCount((prev) => (prev < 43 ? prev + 1 : 43));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [currentView]);

  // Derived Roster Counts
  const presentCount = roster.filter((s) => s.status === 'verified_present').length;
  const probableCount = roster.filter((s) => s.status === 'probable_present').length;
  const reviewCount = roster.filter((s) => s.status === 'needs_review').length;
  const proxyCount = roster.filter((s) => s.status === 'possible_proxy').length;
  const notVerifiedCount = roster.filter((s) => s.status === 'not_verified').length;
  const pendingSyncSessionsCount = syncSessions.filter((s) => s.status === 'pending_sync').length;
  const pendingRecordsTotal = syncSessions
    .filter((s) => s.status === 'pending_sync')
    .reduce((acc, s) => acc + s.recordsCount, 0);

  // Roster Student Review Actions
  const handleApproveStudent = (studentId: string, note = 'Approved by faculty during offline session') => {
    setRoster((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: 'verified_present',
              teacherReviewed: true,
              teacherNotes: note,
              anomalyReason: undefined,
            }
          : s
      )
    );
    if (inspectedStudent?.studentId === studentId) {
      setInspectedStudent(null);
    }
  };

  const handleKeepForReview = (studentId: string, note = 'Flagged for server validation') => {
    setRoster((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: 'needs_review',
              teacherReviewed: true,
              teacherNotes: note,
            }
          : s
      )
    );
    if (inspectedStudent?.studentId === studentId) {
      setInspectedStudent(null);
    }
  };

  const handleRejectStudent = (studentId: string, note = 'Rejected by faculty after inspection') => {
    setRoster((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: 'not_verified',
              teacherReviewed: true,
              teacherNotes: note,
            }
          : s
      )
    );
    if (inspectedStudent?.studentId === studentId) {
      setInspectedStudent(null);
    }
  };

  // Start Offline Lecture Action
  const handleConfirmStartOfflineLecture = () => {
    setShowStartLectureModal(false);
    setCurrentView('network_setup');
    setIsLocalNetworkActive(true);
    setSessionActive(true);
    setTokenCountdown(15);
    setQrRefreshCount(1);
    setSessionSavedSummary(false);
  };

  // End Offline Lecture Action
  const handleConfirmEndLecture = () => {
    setShowEndConfirmModal(false);
    setSessionActive(false);
    setSessionSavedSummary(true);

    // Save to sync sessions
    const newSyncItem: OfflineSyncSessionItem = {
      id: generateUniqueId('sync'),
      lectureName: selectedLecture.subjectName,
      lectureCode: selectedLecture.subjectCode,
      time: selectedLecture.scheduledTime,
      room: selectedLecture.room,
      recordsCount: roster.length,
      status: 'pending_sync',
    };

    setSyncSessions((prev) => [newSyncItem, ...prev]);
  };

  // Trigger 5-Stage Sync Flow
  const handleTriggerSync = (simulateError = false) => {
    if (!isInternetOnline) {
      // Auto-restore internet to show transition
      setIsInternetOnline(true);
    }
    setIsSyncing(true);
    setShowSyncResult(false);
    setShowSyncFailed(false);
    setSyncStep(1);

    setTimeout(() => setSyncStep(2), 700);
    setTimeout(() => setSyncStep(3), 1400);
    setTimeout(() => setSyncStep(4), 2100);
    setTimeout(() => {
      setSyncStep(5);
      setTimeout(() => {
        setIsSyncing(false);
        if (simulateError) {
          setShowSyncFailed(true);
          setSyncFailureReason('Campus Gateway SSL Timeout (Error 504)');
        } else {
          setSyncSessions((prev) =>
            prev.map((s) => (s.status === 'pending_sync' ? { ...s, status: 'synced' } : s))
          );
          setShowSyncResult(true);
        }
      }, 800);
    }, 2800);
  };

  const handleCopyNetwork = () => {
    navigator.clipboard?.writeText(
      `SSID: ${selectedLecture.networkSsid}\nPassword: ${selectedLecture.networkPassword}`
    );
    setCopiedNetwork(true);
    setTimeout(() => setCopiedNetwork(false), 2500);
  };

  const filteredRoster = roster
    .filter((s) => {
      if (rosterFilter === 'all') return true;
      return s.status === rosterFilter;
    })
    .filter((s) => {
      if (!searchRosterQuery.trim()) return true;
      const q = searchRosterQuery.toLowerCase();
      return s.studentName.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    });

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] font-sans pb-16">
      {/* ========================================================
          TOP STATUS & SIMULATION CONTROL BAR
         ======================================================== */}
      <div className="bg-[#031635] text-white border-b border-white/10 px-4 py-2.5 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[12px]">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Internet Status Badge */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <span
                className={`w-2 h-2 rounded-full ${
                  isInternetOnline ? 'bg-[#a0f399] animate-pulse' : 'bg-[#ffdcc6]'
                }`}
              />
              <span className="font-semibold text-white/90">
                Internet: {isInternetOnline ? '🟢 Online' : '🟠 Offline'}
              </span>
            </div>

            {/* Local Classroom Network Status */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLocalNetworkActive ? 'bg-[#70a4ff] animate-ping' : 'bg-white/40'
                }`}
              />
              <span className="font-semibold text-white/90">
                Local Network: {isLocalNetworkActive ? '🔵 SmartAttend-Room204 Active' : '⚪ Not Connected'}
              </span>
            </div>

            {/* Pending Records Badge */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              <span className="material-symbols-outlined text-[15px] text-[#ffdcc6]">cloud_upload</span>
              <span>Pending Sync: <strong>{pendingRecordsTotal} Records</strong></span>
            </div>
          </div>

          {/* Quick Simulation Toggles for User Testing */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInternetOnline(!isInternetOnline)}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/10"
              title="Toggle Internet Connectivity on/off to test transitions"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isInternetOnline ? 'wifi_off' : 'wifi'}
              </span>
              <span>Simulate {isInternetOnline ? 'Internet Drop' : 'Internet Restore'}</span>
            </button>

            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
              >
                Back to Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Internet Restored Alert Notification */}
      {isInternetOnline && pendingRecordsTotal > 0 && (
        <div className="bg-[#a0f399] text-[#005312] px-4 py-2.5 border-b border-[#005312]/20 shadow-xs animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="font-bold">
                Internet connection restored — {pendingRecordsTotal} offline attendance records are ready to synchronize.
              </span>
            </div>
            <button
              onClick={() => handleTriggerSync(false)}
              className="px-3.5 py-1 bg-[#005312] text-white hover:bg-[#003e0d] font-bold rounded-lg transition-all cursor-pointer text-[11px] shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-NAV TABS FOR TEACHER OFFLINE WORKFLOW
         ======================================================== */}
      <div className="bg-white border-b border-[#e1e3e4] sticky top-[108px] z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto py-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setCurrentView('readiness')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'readiness'
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'text-[#44474e] hover:bg-[#f3f4f5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Offline Readiness</span>
            </button>

            {sessionActive && (
              <>
                <button
                  onClick={() => setCurrentView('network_setup')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'network_setup'
                      ? 'bg-[#031635] text-white shadow-xs'
                      : 'text-[#44474e] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">router</span>
                  <span>Classroom Network</span>
                </button>

                <button
                  onClick={() => setCurrentView('dynamic_qr')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'dynamic_qr'
                      ? 'bg-[#031635] text-white shadow-xs'
                      : 'text-[#44474e] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Dynamic QR (15s)</span>
                </button>

                <button
                  onClick={() => setCurrentView('live_roster')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'live_roster'
                      ? 'bg-[#031635] text-white shadow-xs'
                      : 'text-[#44474e] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>Live Roster ({roster.length})</span>
                  {reviewCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentView('sync_hub')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'sync_hub'
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'text-[#44474e] hover:bg-[#f3f4f5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>Pending Sync ({syncSessions.length})</span>
            </button>

            <button
              onClick={() => setCurrentView('history')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'history'
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'text-[#44474e] hover:bg-[#f3f4f5]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Attendance History</span>
            </button>
          </div>

          {sessionActive && (
            <button
              onClick={() => setShowEndConfirmModal(true)}
              className="px-3 py-1.5 bg-[#ba1a1a] text-white hover:bg-[#93000a] text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">stop_circle</span>
              <span>End Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          MAIN VIEW CONTAINER
         ======================================================== */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-5 flex flex-col gap-5">
        {/* ========================================================
            VIEW 1: OFFLINE READINESS & TIMETABLE
           ======================================================== */}
        {currentView === 'readiness' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Title & Subtitle */}
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[22px] font-bold text-[#031635]">Offline Attendance</h1>
                  <span className="bg-[#ffdcc6] text-[#723600] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    Local Classroom Mesh
                  </span>
                </div>
                <p className="text-[13px] text-[#75777f] mt-0.5">
                  Conduct attendance without Internet using the classroom local network.
                </p>
              </div>

              {!isInternetOnline ? (
                <div className="bg-[#fffaf0] border border-[#ffdcc6] px-3.5 py-2 rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#723600] text-[20px]">wifi_off</span>
                  <div className="text-[12px]">
                    <p className="font-bold text-[#723600]">Internet unavailable</p>
                    <p className="text-[#75777f] text-[11px]">Offline Attendance is ready and available</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#eef2ff] border border-[#d8e2ff] px-3.5 py-2 rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005312] text-[20px]">wifi</span>
                  <div className="text-[12px]">
                    <p className="font-bold text-[#005312]">Internet Online</p>
                    <p className="text-[#75777f] text-[11px]">Ready for offline pre-caching or standard sessions</p>
                  </div>
                </div>
              )}
            </div>

            {/* 4-Card Connection Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[11px] font-bold uppercase">Internet</span>
                  <span className="material-symbols-outlined text-[20px]">
                    {isInternetOnline ? 'wifi' : 'wifi_off'}
                  </span>
                </div>
                <span className={`text-[15px] font-bold ${isInternetOnline ? 'text-[#005312]' : 'text-[#723600]'}`}>
                  {isInternetOnline ? '🟢 Online' : '🟠 Offline'}
                </span>
                <span className="text-[10px] text-[#75777f]">
                  {isInternetOnline ? 'Campus uplink active' : 'Disconnected'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[11px] font-bold uppercase">Local Network</span>
                  <span className="material-symbols-outlined text-[20px]">router</span>
                </div>
                <span className={`text-[15px] font-bold ${isLocalNetworkActive ? 'text-[#031635]' : 'text-[#75777f]'}`}>
                  {isLocalNetworkActive ? '🔵 Active' : '⚪ Not Connected'}
                </span>
                <span className="text-[10px] text-[#75777f]">SmartAttend-Room204</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[11px] font-bold uppercase">Offline Data</span>
                  <span className="material-symbols-outlined text-[20px] text-[#005312]">database</span>
                </div>
                <span className={`text-[15px] font-bold ${isLimitedMode ? 'text-[#723600]' : 'text-[#005312]'}`}>
                  {isLimitedMode ? '🟡 Limited' : '🟢 Ready'}
                </span>
                <span className="text-[10px] text-[#75777f]">Roster & keys pre-cached</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[11px] font-bold uppercase">Pending Sync</span>
                  <span className="material-symbols-outlined text-[20px] text-[#723600]">cloud_upload</span>
                </div>
                <span className="text-[15px] font-bold text-[#723600]">
                  {pendingRecordsTotal} Records
                </span>
                <button
                  onClick={() => setCurrentView('sync_hub')}
                  className="text-[10px] font-bold text-[#031635] hover:underline text-left cursor-pointer"
                >
                  View Sync Status →
                </button>
              </div>
            </div>

            {/* Offline Readiness Check 7-Point Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-[16px] font-bold text-[#031635]">Offline Readiness Check</h3>
                  <p className="text-[12px] text-[#75777f]">
                    Verifies cryptographic keys, roster signatures, and classroom mesh capability
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
                      isLimitedMode
                        ? 'bg-[#ffdcc6] text-[#723600]'
                        : 'bg-[#a0f399] text-[#005312]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isLimitedMode ? 'warning' : 'check_circle'}
                    </span>
                    <span>
                      {isLimitedMode ? 'Limited Offline Mode' : 'Ready for Full Offline Attendance'}
                    </span>
                  </span>

                  <button
                    onClick={() => setIsLimitedMode(!isLimitedMode)}
                    className="text-[11px] text-[#75777f] hover:text-[#031635] underline cursor-pointer"
                    title="Toggle to test Limited Offline Mode fallback"
                  >
                    Test {isLimitedMode ? 'Full' : 'Limited'}
                  </button>
                </div>
              </div>

              {/* 7-Item Verification Readiness Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1 text-[12px]">
                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Student Roster</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Today's Timetable</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Teacher Credentials</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Registered Device Data</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Classroom Configuration</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Security Credentials</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] flex items-center justify-between">
                  <span className="font-semibold text-[#191c1d]">Local Storage Engine</span>
                  <span className="text-[#005312] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span> Available
                  </span>
                </div>

                {isLimitedMode && (
                  <div className="p-3 bg-[#fffaf0] rounded-xl border border-[#ffdcc6] flex items-center justify-between">
                    <span className="font-semibold text-[#723600]">Indoor BLE Beacon</span>
                    <span className="text-[#723600] font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[16px]">warning</span> Partial
                    </span>
                  </div>
                )}
              </div>

              {isLimitedMode && (
                <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-3.5 flex items-start justify-between flex-wrap gap-2 text-[12px]">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#723600] text-[18px] shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="text-[#723600]">
                      Some verification data is unavailable. Attendance will record normally and may require additional review after synchronization.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLecture(MOCK_OFFLINE_LECTURES[0]);
                      setShowStartLectureModal(true);
                    }}
                    className="px-3 py-1 bg-[#723600] text-white hover:bg-[#572800] rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Continue in Limited Mode
                  </button>
                </div>
              )}
            </div>

            {/* Today's Offline Classes */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">
                  Today's Offline Classes (Assigned to Prof. Sharma)
                </span>
                <span className="text-[11px] text-[#75777f]">Springfield Univ BCA Dept</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_OFFLINE_LECTURES.map((lec) => (
                  <div
                    key={lec.id}
                    className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col justify-between gap-4 hover:border-[#031635] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#eef2ff] text-[#031635] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {lec.subjectCode}
                          </span>
                          <span className="text-[12px] font-bold text-[#44474e]">{lec.className}</span>
                        </div>
                        <h3 className="text-[17px] font-bold text-[#031635] mt-0.5">{lec.subjectName}</h3>
                        <p className="text-[12px] text-[#75777f]">
                          {lec.teacherName} • {lec.room}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[12px] font-bold text-[#031635]">{lec.scheduledTime}</span>
                        <span className="block text-[10px] text-[#005312] font-semibold mt-0.5">
                          ✓ Roster Loaded
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#f8f9fa] rounded-2xl p-3 flex items-center justify-between text-[11px]">
                      <span className="text-[#75777f]">Status:</span>
                      <span className="font-bold text-[#005312] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#005312]" />
                        Ready for Offline Attendance
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setShowStartLectureModal(true);
                        }}
                        className="flex-1 bg-[#031635] text-white hover:bg-[#1a2b4b] py-2.5 px-4 rounded-xl font-bold text-[12px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        <span>Start Offline Lecture</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLecture(lec);
                          setCurrentView('sync_hub');
                        }}
                        className="px-3.5 py-2.5 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl font-bold text-[12px] transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Offline Summary Card (If previously ended) */}
            {sessionSavedSummary && (
              <div className="bg-[#a0f399]/30 border border-[#a0f399] rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#005312] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">check</span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#005312]">Offline Attendance Saved</h3>
                    <p className="text-[12px] text-[#44474e]">
                      Lecture: <strong>{selectedLecture.subjectName}</strong> • Records:{' '}
                      <strong>{roster.length}</strong> • Status:{' '}
                      <span className="text-[#723600] font-bold">🟠 Pending Synchronization</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentView('live_roster')}
                    className="px-3.5 py-2 bg-white text-[#031635] border border-[#e1e3e4] rounded-xl font-bold text-[11px] shadow-xs cursor-pointer"
                  >
                    View Attendance
                  </button>
                  <button
                    onClick={() => setCurrentView('sync_hub')}
                    className="px-3.5 py-2 bg-[#005312] text-white rounded-xl font-bold text-[11px] shadow-md cursor-pointer"
                  >
                    View Sync Status
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW 2: LOCAL CLASSROOM NETWORK SETUP
           ======================================================== */}
        {currentView === 'network_setup' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] shadow-xs flex flex-col gap-6 max-w-3xl mx-auto w-full animate-in fade-in duration-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                Classroom Infrastructure
              </span>
              <h2 className="text-[20px] font-bold text-[#031635] mt-0.5">Set Up Classroom Connection</h2>
              <p className="text-[13px] text-[#75777f] mt-0.5">
                Students connect to this local classroom network. Internet access is not required.
              </p>
            </div>

            {/* Network Credentials Card */}
            <div className="bg-[#031635] text-white rounded-3xl p-5 shadow-lg border border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#70a4ff]">router</span>
                  <span className="text-[14px] font-bold">Classroom Local Network</span>
                </div>
                <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Active Mesh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="bg-white/10 p-3.5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[11px] text-white/70">Network Name (SSID)</span>
                  <span className="text-[16px] font-mono font-bold text-white">
                    {selectedLecture.networkSsid}
                  </span>
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[11px] text-white/70">Password</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-mono font-bold text-white">
                      {showNetworkPassword ? selectedLecture.networkPassword : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowNetworkPassword(!showNetworkPassword)}
                      className="text-white/70 hover:text-white cursor-pointer text-[11px]"
                    >
                      {showNetworkPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={handleCopyNetwork}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-bold text-[12px] text-white transition-all cursor-pointer flex items-center gap-1.5 border border-white/10"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>{copiedNetwork ? 'Copied to Clipboard!' : 'Copy Network Details'}</span>
                </button>

                <div className="ml-auto flex items-center gap-2 bg-[#005312]/50 border border-[#a0f399]/30 px-3 py-1.5 rounded-xl">
                  <span className="material-symbols-outlined text-[16px] text-[#a0f399]">groups</span>
                  <span className="text-[12px] font-bold text-[#a0f399]">
                    Connected Students: {connectedStudentsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Clarification Rule Note */}
            <div className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-4 flex items-start gap-3 text-[12px]">
              <span className="material-symbols-outlined text-[#031635] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <p className="text-[#44474e] leading-relaxed">
                <strong>Important Architecture Rule:</strong> Local classroom Wi-Fi is purely the communication channel to broadcast the dynamic rotating challenges and collect cryptographic signatures. Wi-Fi connection alone does <em>not</em> prove attendance — attendance is verified via single-device keystore, geofence, and the 15-second rotating nonce.
              </p>
            </div>

            {/* Launch Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentView('readiness')}
                className="px-4 py-2.5 text-[#75777f] hover:text-[#031635] font-bold text-[13px] cursor-pointer"
              >
                ← Back to Readiness
              </button>

              <button
                onClick={() => setCurrentView('dynamic_qr')}
                className="bg-[#031635] text-white hover:bg-[#1a2b4b] py-3 px-6 rounded-2xl font-bold text-[13px] transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>Launch Dynamic QR Session</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: OFFLINE DYNAMIC QR SCREEN
           ======================================================== */}
        {currentView === 'dynamic_qr' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] shadow-xs flex flex-col items-center gap-6 max-w-2xl mx-auto w-full animate-in fade-in duration-200">
            {/* Header Details */}
            <div className="w-full flex justify-between items-start border-b border-[#f3f4f5] pb-4 flex-wrap gap-2">
              <div>
                <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  {selectedLecture.subjectCode} • {selectedLecture.className}
                </span>
                <h2 className="text-[20px] font-bold text-[#031635] mt-1">
                  {selectedLecture.subjectName}
                </h2>
                <p className="text-[12px] text-[#75777f]">
                  Session: <strong>{selectedLecture.sessionCode}</strong> • {selectedLecture.room} • Started: {selectedLecture.startTime}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-0.5 rounded-full">
                  Internet: Offline
                </span>
                <span className="text-[11px] font-bold text-[#005312] bg-[#a0f399] px-2.5 py-0.5 rounded-full">
                  Local Network: Active
                </span>
              </div>
            </div>

            {/* Center Dynamic QR Container */}
            <div className="flex flex-col items-center gap-4 py-2 w-full">
              <div className="relative p-6 bg-white border-4 border-[#031635] rounded-3xl shadow-xl flex flex-col items-center justify-center">
                {/* SVG Mock of high-density cryptographic QR */}
                <div className="w-64 h-64 bg-[#f8f9fa] rounded-2xl flex flex-col items-center justify-center p-3 relative border border-[#e1e3e4]">
                  {/* Outer Frame Corners */}
                  <div className="w-full h-full border-4 border-[#031635] rounded-xl p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-10 h-10 bg-[#031635] rounded-md p-1.5 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-xs" />
                      </div>
                      <div className="w-10 h-10 bg-[#031635] rounded-md p-1.5 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-xs" />
                      </div>
                    </div>

                    {/* Center rotating nonce glyph */}
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[36px] text-[#031635]">qr_code_2</span>
                      <span className="font-mono text-[10px] font-bold text-[#031635] bg-white px-2 py-0.5 rounded border border-[#e1e3e4]">
                        {qrToken}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <div className="w-10 h-10 bg-[#031635] rounded-md p-1.5 flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-xs" />
                      </div>
                      <div className="text-[9px] font-mono text-[#75777f] self-end">
                        REFRESH #{qrRefreshCount}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle instructions */}
                <span className="text-[12px] font-bold text-[#031635] mt-3">
                  Students scan this QR code using SmartAttend.
                </span>
              </div>

              {/* Dynamic 15s Countdown Progress Bar */}
              <div className="w-full max-w-sm flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#75777f] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                    <span>Rotating Cryptographic Nonce</span>
                  </span>
                  <span className="font-bold text-[#031635]">
                    Code refreshes in {tokenCountdown} seconds
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f3f4f5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#031635] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(tokenCountdown / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-between border-t border-[#f3f4f5] pt-4 flex-wrap gap-2">
              <button
                onClick={() => {
                  setQrToken(`OFFLINE-NONCE-${Math.floor(1000 + Math.random() * 9000)}-SEC`);
                  setTokenCountdown(15);
                  setQrRefreshCount((c) => c + 1);
                }}
                className="px-4 py-2.5 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl font-bold text-[12px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Refresh QR</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('live_roster')}
                  className="px-5 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>View Live Attendance ({presentCount} Present)</span>
                </button>

                <button
                  onClick={() => setShowEndConfirmModal(true)}
                  className="px-4 py-2.5 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-xl font-bold text-[12px] transition-all cursor-pointer shadow-md flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                  <span>End Attendance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 4: LIVE OFFLINE ATTENDANCE ROSTER
           ======================================================== */}
        {currentView === 'live_roster' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Header & Status */}
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-[#031635]">Offline Live Attendance</h2>
                  <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    Offline Session Active
                  </span>
                </div>
                <p className="text-[12px] text-[#75777f] mt-0.5">
                  {selectedLecture.subjectName} • {selectedLecture.className} • {selectedLecture.room}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentView('dynamic_qr')}
                  className="px-3.5 py-1.5 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[12px] font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  <span>Back to QR</span>
                </button>

                <button
                  onClick={() => setShowEndConfirmModal(true)}
                  className="px-3.5 py-1.5 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-xl text-[12px] font-bold cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                  <span>End Attendance</span>
                </button>
              </div>
            </div>

            {/* 5 Summary Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-[#f8f9fa] border-b border-[#e1e3e4] text-[12px]">
              <div
                onClick={() => setRosterFilter('verified_present')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  rosterFilter === 'verified_present'
                    ? 'bg-[#a0f399]/40 border-[#005312]'
                    : 'bg-white border-[#e1e3e4]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Present</span>
                <span className="text-[18px] font-bold text-[#005312] mt-0.5">{presentCount}</span>
              </div>

              <div
                onClick={() => setRosterFilter('probable_present')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  rosterFilter === 'probable_present'
                    ? 'bg-[#d8e2ff] border-[#031635]'
                    : 'bg-white border-[#e1e3e4]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Probable</span>
                <span className="text-[18px] font-bold text-[#031635] mt-0.5">{probableCount}</span>
              </div>

              <div
                onClick={() => setRosterFilter('needs_review')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  rosterFilter === 'needs_review'
                    ? 'bg-[#ffdcc6] border-[#723600]'
                    : 'bg-white border-[#e1e3e4]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Needs Review</span>
                <span className="text-[18px] font-bold text-[#723600] mt-0.5">{reviewCount}</span>
              </div>

              <div
                onClick={() => setRosterFilter('possible_proxy')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  rosterFilter === 'possible_proxy'
                    ? 'bg-[#ffdad6] border-[#ba1a1a]'
                    : 'bg-white border-[#e1e3e4]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Possible Proxy</span>
                <span className="text-[18px] font-bold text-[#ba1a1a] mt-0.5">{proxyCount}</span>
              </div>

              <div
                onClick={() => setRosterFilter('not_verified')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col ${
                  rosterFilter === 'not_verified'
                    ? 'bg-[#e1e3e4] border-[#75777f]'
                    : 'bg-white border-[#e1e3e4]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Not Verified</span>
                <span className="text-[18px] font-bold text-[#44474e] mt-0.5">{notVerifiedCount}</span>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#f3f4f5]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setRosterFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    rosterFilter === 'all'
                      ? 'bg-[#031635] text-white'
                      : 'bg-[#f8f9fa] text-[#44474e] hover:bg-[#eef2ff]'
                  }`}
                >
                  All ({roster.length})
                </button>
                <button
                  onClick={() => setRosterFilter('verified_present')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    rosterFilter === 'verified_present'
                      ? 'bg-[#a0f399] text-[#005312]'
                      : 'bg-[#f8f9fa] text-[#44474e]'
                  }`}
                >
                  Present ({presentCount})
                </button>
                <button
                  onClick={() => setRosterFilter('needs_review')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    rosterFilter === 'needs_review'
                      ? 'bg-[#ffdcc6] text-[#723600]'
                      : 'bg-[#f8f9fa] text-[#44474e]'
                  }`}
                >
                  Needs Review ({reviewCount})
                </button>
                <button
                  onClick={() => setRosterFilter('possible_proxy')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    rosterFilter === 'possible_proxy'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#f8f9fa] text-[#44474e]'
                  }`}
                >
                  Proxy Flags ({proxyCount})
                </button>
              </div>

              <input
                type="text"
                placeholder="Search student name or roll..."
                value={searchRosterQuery}
                onChange={(e) => setSearchRosterQuery(e.target.value)}
                className="px-3.5 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635] w-full sm:w-60"
              />
            </div>

            {/* Roster Table / Card List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Time</th>
                    <th className="py-3 px-5">Multi-Factor Evidence</th>
                    <th className="py-3 px-5 text-right">Faculty Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5]">
                  {filteredRoster.map((st) => {
                    const isPresent = st.status === 'verified_present';
                    const isProbable = st.status === 'probable_present';
                    const isReview = st.status === 'needs_review';
                    const isProxy = st.status === 'possible_proxy';

                    return (
                      <tr key={st.studentId} className="hover:bg-[#f8f9fa]/80 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.avatarUrl || AVATAR_URL}
                              alt={st.studentName}
                              className="w-9 h-9 rounded-full object-cover border border-[#e1e3e4]"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-[#191c1d]">{st.studentName}</span>
                              <span className="text-[11px] font-mono text-[#75777f]">{st.rollNo}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isPresent
                                ? 'bg-[#a0f399] text-[#005312]'
                                : isProbable
                                ? 'bg-[#d8e2ff] text-[#031635]'
                                : isReview
                                ? 'bg-[#ffdcc6] text-[#723600]'
                                : isProxy
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#e1e3e4] text-[#44474e]'
                            }`}
                          >
                            {st.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-5 font-mono text-[#75777f] whitespace-nowrap">
                          {st.time}
                        </td>

                        <td className="py-3 px-5">
                          <div className="flex flex-col gap-1 max-w-sm">
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold">
                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  st.evidence.registeredDevice === 'verified'
                                    ? 'bg-[#a0f399]/40 text-[#005312]'
                                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                                }`}
                              >
                                {st.evidence.registeredDevice === 'verified' ? '✓ Device' : '⚠ Device Mismatch'}
                              </span>

                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  st.evidence.dynamicQr === 'valid'
                                    ? 'bg-[#a0f399]/40 text-[#005312]'
                                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                                }`}
                              >
                                {st.evidence.dynamicQr === 'valid' ? '✓ 15s QR' : '⚠ Expired QR'}
                              </span>

                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  st.evidence.location === 'within_area'
                                    ? 'bg-[#a0f399]/40 text-[#005312]'
                                    : 'bg-[#ffdcc6] text-[#723600]'
                                }`}
                              >
                                {st.evidence.location === 'within_area' ? '✓ Location' : '⚠ GPS Jitter'}
                              </span>

                              <span
                                className={`px-1.5 py-0.5 rounded ${
                                  st.evidence.ble === 'detected'
                                    ? 'bg-[#a0f399]/40 text-[#005312]'
                                    : 'bg-[#f3f4f5] text-[#75777f]'
                                }`}
                              >
                                {st.evidence.ble === 'detected' ? '✓ BLE' : '⚪ No BLE'}
                              </span>
                            </div>

                            {st.anomalyReason && (
                              <span className="text-[11px] text-[#723600] font-medium leading-tight">
                                {st.anomalyReason}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedStudent(st)}
                              className="px-2.5 py-1 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-lg text-[11px] font-bold cursor-pointer shadow-xs"
                            >
                              Review
                            </button>

                            {!isPresent && (
                              <button
                                onClick={() => handleApproveStudent(st.studentId)}
                                className="px-2.5 py-1 bg-[#a0f399] hover:bg-[#b5f9af] text-[#005312] rounded-lg text-[11px] font-bold cursor-pointer shadow-xs"
                              >
                                Approve
                              </button>
                            )}

                            {isPresent && (
                              <button
                                onClick={() => handleKeepForReview(st.studentId)}
                                className="px-2.5 py-1 bg-[#ffdcc6] hover:bg-[#ffd0b3] text-[#723600] rounded-lg text-[11px] font-bold cursor-pointer shadow-xs"
                              >
                                Flag
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Architecture Governance Footer Note */}
            <div className="p-4 bg-[#f8f9fa] border-t border-[#e1e3e4] text-[11px] text-[#75777f] flex items-center justify-between">
              <span>
                <strong>Faculty Authority:</strong> AI anomaly detection only flags potential variance. The teacher makes all authoritative decisions.
              </span>
              <span>Total Roster: {roster.length} enrolled</span>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 5: OFFLINE SYNC HUB / PENDING LOCAL STORAGE
           ======================================================== */}
        {currentView === 'sync_hub' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-[20px] font-bold text-[#031635]">Offline Synchronization Hub</h2>
              <p className="text-[13px] text-[#75777f] mt-0.5">
                Local storage vault and cryptographic batch synchronization with campus server
              </p>
            </div>

            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[10px] font-bold uppercase">Pending Records</span>
                  <span className="material-symbols-outlined text-[18px] text-[#723600]">cloud_upload</span>
                </div>
                <span className="text-[22px] font-bold text-[#723600]">{pendingRecordsTotal}</span>
                <span className="text-[10px] text-[#75777f]">Saved safely in local storage</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[10px] font-bold uppercase">Synced Records</span>
                  <span className="material-symbols-outlined text-[18px] text-[#005312]">check_circle</span>
                </div>
                <span className="text-[22px] font-bold text-[#005312]">128</span>
                <span className="text-[10px] text-[#75777f]">Authoritative on server</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[10px] font-bold uppercase">Failed Records</span>
                  <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">error</span>
                </div>
                <span className="text-[22px] font-bold text-[#ba1a1a]">2</span>
                <span className="text-[10px] text-[#ba1a1a] font-semibold">Retained in vault</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[#75777f]">
                  <span className="text-[10px] font-bold uppercase">Last Sync</span>
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <span className="text-[14px] font-bold text-[#031635] mt-1">Today, 9:15 AM</span>
                <span className="text-[10px] text-[#75777f]">Springfield Cloud API</span>
              </div>
            </div>

            {/* Sync Sessions List */}
            <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#f3f4f5] pb-3">
                <h3 className="text-[16px] font-bold text-[#031635]">Offline Attendance Sessions</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerSync(false)}
                    className="px-4 py-2 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    <span>Sync Now</span>
                  </button>

                  <button
                    onClick={() => handleTriggerSync(true)}
                    className="px-3.5 py-2 bg-[#f8f9fa] hover:bg-[#ffdcc6]/60 text-[#723600] border border-[#ffdcc6] rounded-xl font-bold text-[12px] transition-all cursor-pointer flex items-center gap-1"
                    title="Simulate a temporary network error during sync to verify record retention"
                  >
                    <span>Test Sync Failure</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {syncSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] shrink-0 ${
                          sess.status === 'synced'
                            ? 'bg-[#a0f399] text-[#005312]'
                            : sess.status === 'pending_sync'
                            ? 'bg-[#ffdcc6] text-[#723600]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {sess.status === 'synced'
                            ? 'cloud_done'
                            : sess.status === 'pending_sync'
                            ? 'cloud_upload'
                            : 'cloud_off'}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#191c1d] text-[14px]">{sess.lectureName}</h4>
                          <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-[#e1e3e4]">
                            {sess.lectureCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#75777f]">
                          {sess.time} • {sess.room} • <strong>{sess.recordsCount} records</strong>
                        </span>
                        {sess.failureReason && (
                          <span className="text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                            {sess.failureReason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          sess.status === 'synced'
                            ? 'bg-[#a0f399] text-[#005312]'
                            : sess.status === 'pending_sync'
                            ? 'bg-[#ffdcc6] text-[#723600]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {sess.status === 'synced'
                          ? '🟢 Synced'
                          : sess.status === 'pending_sync'
                          ? '🟠 Pending Sync'
                          : '🔴 Sync Failed'}
                      </span>

                      {sess.status === 'failed' && (
                        <button
                          onClick={() => handleTriggerSync(false)}
                          className="px-3 py-1 bg-[#031635] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 6: ATTENDANCE HISTORY
           ======================================================== */}
        {currentView === 'history' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Attendance History</h2>
                <p className="text-[12px] text-[#75777f]">
                  Complete log of online and offline verified lecture sessions
                </p>
              </div>

              {/* History Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'online', 'offline', 'pending_sync', 'synced', 'needs_review'] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                        historyFilter === f
                          ? 'bg-[#031635] text-white'
                          : 'bg-[#f8f9fa] text-[#44474e] hover:bg-[#eef2ff]'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e1e3e4] flex flex-col justify-between gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#e1e3e4]">
                      BCA-301
                    </span>
                    <h4 className="text-[15px] font-bold text-[#031635] mt-1">Java Programming</h4>
                    <p className="text-[12px] text-[#75777f]">10:00 AM • Room 204</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      🟠 Mode: Offline
                    </span>
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      🟢 Synced
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[12px] pt-2 border-t border-[#e1e3e4]">
                  <span className="text-[#75777f]">Records: <strong>43 Students</strong></span>
                  <span className="text-[#005312] font-semibold">100% Attendance Reconciled</span>
                </div>
              </div>

              <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e1e3e4] flex flex-col justify-between gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#e1e3e4]">
                      BCA-302
                    </span>
                    <h4 className="text-[15px] font-bold text-[#031635] mt-1">Database Systems</h4>
                    <p className="text-[12px] text-[#75777f]">11:00 AM • Room 204</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      🟠 Mode: Offline
                    </span>
                    <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      🟠 Pending Sync
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[12px] pt-2 border-t border-[#e1e3e4]">
                  <span className="text-[#75777f]">Records: <strong>41 Students</strong></span>
                  <span className="text-[#723600] font-semibold">Waiting for Network Sync</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL: START OFFLINE LECTURE
         ======================================================== */}
      {showStartLectureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
              <div>
                <h3 className="text-[18px] font-bold text-[#031635]">Start Offline Attendance</h3>
                <p className="text-[12px] text-[#75777f]">Classroom local mesh session</p>
              </div>
              <button
                onClick={() => setShowStartLectureModal(false)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] flex items-center justify-center hover:bg-[#e1e3e4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Course Summary Details */}
            <div className="bg-[#f8f9fa] rounded-2xl p-4 flex flex-col gap-2.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#75777f]">Subject:</span>
                <span className="font-bold text-[#031635]">{selectedLecture.subjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Class:</span>
                <span className="font-bold text-[#031635]">{selectedLecture.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Room:</span>
                <span className="font-bold text-[#031635]">{selectedLecture.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Scheduled Time:</span>
                <span className="font-bold text-[#031635]">{selectedLecture.scheduledTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Teacher:</span>
                <span className="font-bold text-[#031635]">{selectedLecture.teacherName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#e1e3e4]">
                <span className="text-[#75777f]">Attendance Mode:</span>
                <span className="font-extrabold text-[#723600] flex items-center gap-1">
                  🟠 Offline Classroom Mode
                </span>
              </div>
            </div>

            {/* Verification Methods Checklist */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                Active Verification Methods:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  Student Authentication
                </span>
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">smartphone</span>
                  Registered Device
                </span>
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">qr_code</span>
                  Dynamic QR (15s)
                </span>
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">timer</span>
                  Lecture Session
                </span>
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  Location / Geofence
                </span>
                <span className="flex items-center gap-1.5 text-[#005312] font-semibold bg-[#f8f9fa] p-2 rounded-xl">
                  <span className="material-symbols-outlined text-[15px]">bluetooth</span>
                  BLE Proximity Beacon
                </span>
              </div>
            </div>

            {/* Warning Note */}
            <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-3 flex items-start gap-2 text-[11px] text-[#723600]">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">wifi_off</span>
              <p>
                Internet is unavailable. Attendance records will be stored locally and synchronized when Internet connectivity returns.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowStartLectureModal(false)}
                className="px-4 py-2.5 bg-[#f8f9fa] hover:bg-[#e1e3e4] text-[#44474e] rounded-xl font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStartOfflineLecture}
                className="px-5 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Start Offline Lecture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STUDENT VERIFICATION DETAIL
         ======================================================== */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
              <div>
                <h3 className="text-[17px] font-bold text-[#031635]">Verification Details</h3>
                <p className="text-[12px] text-[#75777f]">Multi-factor offline evidence breakdown</p>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] flex items-center justify-center hover:bg-[#e1e3e4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Student Header Card */}
            <div className="flex items-center gap-3 bg-[#f8f9fa] p-3.5 rounded-2xl border border-[#e1e3e4]">
              <img
                src={inspectedStudent.avatarUrl || AVATAR_URL}
                alt={inspectedStudent.studentName}
                className="w-12 h-12 rounded-full object-cover border border-[#e1e3e4]"
              />
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#031635]">{inspectedStudent.studentName}</span>
                <span className="text-[12px] text-[#75777f]">
                  Student ID: <strong>{inspectedStudent.rollNo}</strong> ({inspectedStudent.studentId})
                </span>
                <span className="text-[11px] text-[#75777f]">Timestamp: {inspectedStudent.time}</span>
              </div>
            </div>

            {/* Verification Evidence List */}
            <div className="flex flex-col gap-2 text-[12px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                Verification Evidence:
              </span>

              <div className="flex flex-col gap-1.5">
                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Student Identity</span>
                  <span className="text-[#005312] font-bold">✓ Verified</span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Registered Device</span>
                  <span
                    className={`font-bold ${
                      inspectedStudent.evidence.registeredDevice === 'verified'
                        ? 'text-[#005312]'
                        : 'text-[#ba1a1a]'
                    }`}
                  >
                    {inspectedStudent.evidence.registeredDevice === 'verified'
                      ? '✓ Verified'
                      : '⚠ Device Mismatch'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Lecture Session</span>
                  <span className="text-[#005312] font-bold">✓ Valid</span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Dynamic QR (15s Nonce)</span>
                  <span className="text-[#005312] font-bold">✓ Valid</span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Location</span>
                  <span
                    className={`font-bold ${
                      inspectedStudent.evidence.location === 'within_area'
                        ? 'text-[#005312]'
                        : 'text-[#723600]'
                    }`}
                  >
                    {inspectedStudent.evidence.location === 'within_area'
                      ? '✓ Within configured area'
                      : '⚠ GPS signal uncertain (supporting only)'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">BLE Proximity</span>
                  <span
                    className={`font-bold ${
                      inspectedStudent.evidence.ble === 'detected'
                        ? 'text-[#005312]'
                        : 'text-[#75777f]'
                    }`}
                  >
                    {inspectedStudent.evidence.ble === 'detected'
                      ? '✓ Classroom beacon detected'
                      : '⚪ Not detected'}
                  </span>
                </div>

                <div className="p-2.5 bg-[#f8f9fa] rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-[#191c1d]">Visual Verification</span>
                  <span className="text-[#75777f] font-semibold">Not Available (Optional)</span>
                </div>
              </div>
            </div>

            {/* Visual verification rule note */}
            <div className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl p-2.5 text-[11px] text-[#75777f]">
              <em>Note: Visual evidence is optional. Missing camera feeds do not mark a student absent.</em>
            </div>

            {/* Faculty Decision Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f3f4f5]">
              <button
                onClick={() => handleApproveStudent(inspectedStudent.studentId)}
                className="py-2.5 bg-[#a0f399] hover:bg-[#b5f9af] text-[#005312] font-bold text-[11px] rounded-xl cursor-pointer shadow-xs"
              >
                Approve Attendance
              </button>

              <button
                onClick={() => handleKeepForReview(inspectedStudent.studentId)}
                className="py-2.5 bg-[#ffdcc6] hover:bg-[#ffd0b3] text-[#723600] font-bold text-[11px] rounded-xl cursor-pointer shadow-xs"
              >
                Keep for Review
              </button>

              <button
                onClick={() => handleRejectStudent(inspectedStudent.studentId)}
                className="py-2.5 bg-[#ffdad6] hover:bg-[#ffc8c4] text-[#ba1a1a] font-bold text-[11px] rounded-xl cursor-pointer shadow-xs"
              >
                Reject Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: END OFFLINE LECTURE CONFIRMATION
         ======================================================== */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 border-b border-[#f3f4f5] pb-3">
              <div className="w-9 h-9 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">stop</span>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#031635]">End Offline Attendance?</h3>
                <p className="text-[12px] text-[#75777f]">Finalize and seal local roster</p>
              </div>
            </div>

            {/* Current Summary Breakdown */}
            <div className="bg-[#f8f9fa] rounded-2xl p-4 flex flex-col gap-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#75777f]">Present:</span>
                <span className="font-bold text-[#005312]">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Probable:</span>
                <span className="font-bold text-[#031635]">{probableCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Needs Review:</span>
                <span className="font-bold text-[#723600]">{reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Possible Proxy:</span>
                <span className="font-bold text-[#ba1a1a]">{proxyCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#75777f]">Not Verified:</span>
                <span className="font-bold text-[#44474e]">{notVerifiedCount}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#75777f]">
              Attendance records will be securely stored locally in browser storage and pending server synchronization.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="px-4 py-2.5 bg-[#f8f9fa] hover:bg-[#e1e3e4] text-[#44474e] rounded-xl font-bold text-[12px] cursor-pointer"
              >
                Continue Attendance
              </button>
              <button
                onClick={handleConfirmEndLecture}
                className="px-5 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] cursor-pointer shadow-md"
              >
                End & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 5-STAGE SECURE SYNCHRONIZATION PROGRESS
         ======================================================== */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="text-center flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-[#031635] text-white flex items-center justify-center shadow-md animate-spin">
                <span className="material-symbols-outlined text-[24px]">sync</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#031635] mt-2">
                Synchronizing Attendance Vault
              </h3>
              <p className="text-[12px] text-[#75777f]">
                Validating cryptographic signatures against Springfield Central Server
              </p>
            </div>

            {/* 5 Progress Stages */}
            <div className="flex flex-col gap-2.5 text-[13px] bg-[#f8f9fa] p-4 rounded-2xl border border-[#e1e3e4]">
              <div className="flex items-center justify-between">
                <span className={syncStep >= 1 ? 'font-bold text-[#031635]' : 'text-[#75777f]'}>
                  1. Preparing records...
                </span>
                {syncStep >= 1 && <span className="text-[#005312] font-bold">✓</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className={syncStep >= 2 ? 'font-bold text-[#031635]' : 'text-[#75777f]'}>
                  2. Uploading batch payload...
                </span>
                {syncStep >= 2 && <span className="text-[#005312] font-bold">✓</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className={syncStep >= 3 ? 'font-bold text-[#031635]' : 'text-[#75777f]'}>
                  3. Server cryptographic validation...
                </span>
                {syncStep >= 3 && <span className="text-[#005312] font-bold">✓</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className={syncStep >= 4 ? 'font-bold text-[#031635]' : 'text-[#75777f]'}>
                  4. Checking duplicates & nonce replay...
                </span>
                {syncStep >= 4 && <span className="text-[#005312] font-bold">✓</span>}
              </div>

              <div className="flex items-center justify-between">
                <span className={syncStep >= 5 ? 'font-bold text-[#031635]' : 'text-[#75777f]'}>
                  5. Finalizing immutable ledger...
                </span>
                {syncStep >= 5 && <span className="text-[#005312] font-bold">✓</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SYNCHRONIZATION RESULT
         ======================================================== */}
      {showSyncResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#f3f4f5] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#a0f399] text-[#005312] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">cloud_done</span>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#031635]">Synchronization Result</h3>
                <p className="text-[12px] text-[#75777f]">Server validation completed</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#e1e3e4]">
                <span className="text-[10px] text-[#75777f] font-bold uppercase">Total</span>
                <span className="text-[18px] font-bold text-[#031635] block">43</span>
              </div>
              <div className="bg-[#a0f399]/30 p-3 rounded-xl border border-[#a0f399]">
                <span className="text-[10px] text-[#005312] font-bold uppercase">Synced</span>
                <span className="text-[18px] font-bold text-[#005312] block">41</span>
              </div>
              <div className="bg-[#ffdcc6]/40 p-3 rounded-xl border border-[#ffdcc6]">
                <span className="text-[10px] text-[#723600] font-bold uppercase">Review</span>
                <span className="text-[18px] font-bold text-[#723600] block">2</span>
              </div>
            </div>

            <div className="bg-[#f8f9fa] rounded-2xl p-3.5 flex flex-col gap-2 text-[12px]">
              <div className="flex items-center gap-2 text-[#005312] font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>41 Records successfully synchronized</span>
              </div>
              <div className="flex items-center gap-2 text-[#723600] font-semibold">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>2 Records require server review</span>
              </div>
            </div>

            <p className="text-[11px] text-[#75777f]">
              Server validation may update attendance status if conflicting evidence or off-campus anomalies are detected.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f5]">
              <button
                onClick={() => {
                  setShowSyncResult(false);
                  setCurrentView('live_roster');
                  setRosterFilter('needs_review');
                }}
                className="px-3.5 py-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl font-bold text-[12px] cursor-pointer"
              >
                View Review Items
              </button>
              <button
                onClick={() => setShowSyncResult(false)}
                className="px-5 py-2 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SYNCHRONIZATION FAILED
         ======================================================== */}
      {showSyncFailed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#f3f4f5] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">cloud_off</span>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#ba1a1a]">Synchronization Failed</h3>
                <p className="text-[12px] text-[#75777f]">Reason: {syncFailureReason}</p>
              </div>
            </div>

            <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-4 flex flex-col gap-1.5 text-[12px]">
              <span className="font-bold text-[#723600]">Your offline attendance has NOT been deleted.</span>
              <p className="text-[#75777f] leading-relaxed">
                All 43 attendance signatures remain safely stored in the local encrypted storage vault and will be automatically synchronized when the server recovers.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSyncFailed(false)}
                className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#e1e3e4] text-[#44474e] rounded-xl font-bold text-[12px] cursor-pointer"
              >
                Try Later
              </button>
              <button
                onClick={() => handleTriggerSync(false)}
                className="px-5 py-2 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[12px] cursor-pointer shadow-md"
              >
                Retry Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
