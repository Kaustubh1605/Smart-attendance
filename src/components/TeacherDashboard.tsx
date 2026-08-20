import React, { useState, useEffect, useRef } from 'react';
import { LOGO_URL, MOCK_SUBJECTS, MOCK_CORRECTION_REQUESTS, generateUniqueId } from '../data/mockData';
import { StudentAttendanceItem, Lecture, AttendanceStatus, CorrectionRequest } from '../types';
import { TeacherStudentVerificationModal } from './TeacherStudentVerificationModal';
import { TeacherReviewQueueModal } from './TeacherReviewQueueModal';
import { TeacherReportsModal } from './TeacherReportsModal';
import { TeacherOfflineModeModal } from './TeacherOfflineModeModal';
import { VisualVerificationModal } from './VisualVerificationModal';
import { HelpSupportModal } from './HelpSupportModal';
import { TeacherOfflineAttendance } from './TeacherOfflineAttendance';

interface TeacherDashboardProps {
  lectures: Lecture[];
  currentLecture: Lecture;
  onSelectLecture: (lecture: Lecture) => void;
  onCreateLecture: (newLecture: Lecture) => void;
  onUpdateLecture?: (updatedLecture: Lecture) => void;
  onDeleteLecture?: (lectureId: string, isArchive?: boolean) => void;
  onEndAttendance?: (lectureId: string) => void;
  students: StudentAttendanceItem[];
  onUpdateStudentStatus: (studentId: string, newStatus: AttendanceStatus, reason: string) => void;
  onNavigateHome: () => void;
  onLogout?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  lectures,
  currentLecture,
  onSelectLecture,
  onCreateLecture,
  onUpdateLecture,
  onDeleteLecture,
  onEndAttendance,
  students,
  onUpdateStudentStatus,
  onLogout,
}) => {
  // Navigation View: 'live' | 'events' | 'offline'
  const [activeTab, setActiveTab] = useState<'live' | 'events' | 'offline'>('live');
  const [isInternetOnline] = useState<boolean>(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [showProjectorQR, setShowProjectorQR] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3-Dot Action Menu State
  const [openMenuLectureId, setOpenMenuLectureId] = useState<string | null>(null);

  // Edit Lecture Modal State
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editClassroom, setEditClassroom] = useState('');
  const [editLectureDate, setEditLectureDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete / Archive Modal State
  const [deletingLecture, setDeletingLecture] = useState<Lecture | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modals for Teacher expansion
  const [inspectedStudent, setInspectedStudent] = useState<StudentAttendanceItem | null>(null);
  const [showReviewQueueModal, setShowReviewQueueModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showVisualAiModal, setShowVisualAiModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Correction requests state
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>(MOCK_CORRECTION_REQUESTS);

  // Dynamic 5-Second QR Refresh State
  const [qrToken, setQrToken] = useState('SA-5S-9821');
  const [tokenCountdown, setTokenCountdown] = useState(5);

  // Form State for Creating New Event / Lecture
  const [newEventName, setNewEventName] = useState('');
  const [newEventCode, setNewEventCode] = useState('');
  const [newEventClass, setNewEventClass] = useState('BCA-A');
  const [newEventInstructor, setNewEventInstructor] = useState('Prof. Sharma');
  const [newEventRoom, setNewEventRoom] = useState('Room 204');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventStartTime, setNewEventStartTime] = useState('11:45 AM');
  const [newEventEndTime, setNewEventEndTime] = useState('01:00 PM');
  const [newEventGeofence, setNewEventGeofence] = useState(35);
  const [newEventBeacon, setNewEventBeacon] = useState(
    'BEACON-HALL-UUID-' + Math.floor(100 + Math.random() * 900)
  );
  const [startImmediately, setStartImmediately] = useState(true);

  // Roster table reference for scrolling
  const rosterTableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close 3-dot menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenMenuLectureId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // EXACTLY 5-second countdown and dynamic challenge token rotation
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(`SA-5S-${Math.floor(1000 + Math.random() * 9000)}`);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const filteredStudents = students
    .filter((s) => {
      if (statusFilter === 'all') return true;
      return s.status === statusFilter;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return s.studentName.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    });

  const verifiedCount = students.filter((s) => s.status === 'present').length;
  const reviewCount = students.filter((s) => s.status === 'needs_review').length;
  const probableCount = students.filter((s) => s.status === 'probable').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const proxyCount = students.filter((s) => s.confidence < 40 && s.status === 'needs_review').length || 1;

  const handleStartLecture = (lec: Lecture) => {
    onSelectLecture(lec);
    setSessionActive(true);
    setActiveTab('live');
    setTokenCountdown(5);
    setQrToken(`SA-5S-${Math.floor(1000 + Math.random() * 9000)}`);
    showToast(`Started attendance session for ${lec.name}`);
  };

  const handleEndAttendanceSession = (lectureId: string) => {
    setSessionActive(false);
    if (onEndAttendance) {
      onEndAttendance(lectureId);
    }
    showToast('✓ Attendance session finalized successfully');
  };

  // Helper to parse time string like "10:00 AM", "11:30 PM", "10:00" to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return -1;
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const timeParts = clean.replace(/[APM\s]/g, '').split(':');
    if (timeParts.length < 2) return -1;
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return -1;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Open Edit Modal with lecture data pre-filled
  const handleOpenEditLecture = (lec: Lecture) => {
    setEditingLecture(lec);
    setEditSubjectName(lec.name);
    setEditSubjectCode(lec.code);
    setEditClassName(lec.className || 'BCA-A');
    setEditClassroom(lec.room);
    setEditLectureDate(lec.date || new Date().toISOString().slice(0, 10));

    // Extract start and end times
    if (lec.startTime && lec.endTime) {
      setEditStartTime(lec.startTime);
      setEditEndTime(lec.endTime);
    } else if (lec.timeSlot && lec.timeSlot.includes('–')) {
      const parts = lec.timeSlot.split('–');
      setEditStartTime(parts[0].trim());
      setEditEndTime(parts[1]?.trim() || '');
    } else if (lec.timeSlot && lec.timeSlot.includes('-')) {
      const parts = lec.timeSlot.split('-');
      setEditStartTime(parts[0].trim());
      setEditEndTime(parts[1]?.trim() || '');
    } else {
      setEditStartTime('10:00 AM');
      setEditEndTime('11:00 AM');
    }
    setEditError(null);
  };

  // Save changes to lecture details
  const handleSaveLectureEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture) return;

    if (!editSubjectName.trim() || !editSubjectCode.trim()) {
      setEditError('Subject name and code are required.');
      return;
    }

    const startMinutes = parseTimeToMinutes(editStartTime);
    const endMinutes = parseTimeToMinutes(editEndTime);

    if (startMinutes === -1 || endMinutes === -1) {
      setEditError('Please enter valid start and end times (e.g., 10:00 AM, 11:00 AM).');
      return;
    }

    if (startMinutes === endMinutes) {
      setEditError('Start time and end time cannot be identical.');
      return;
    }

    if (endMinutes < startMinutes) {
      setEditError('End time must be after start time.');
      return;
    }

    // Classroom conflict check with other non-completed lectures
    const hasConflict = lectures.some((l) => {
      if (l.id === editingLecture.id || l.status === 'completed' || l.isArchived) return false;
      if (l.room.toLowerCase().trim() === editClassroom.toLowerCase().trim()) {
        const lStart = parseTimeToMinutes(l.startTime || l.timeSlot.split('–')[0] || '');
        const lEnd = parseTimeToMinutes(l.endTime || l.timeSlot.split('–')[1] || '');
        if (lStart !== -1 && lEnd !== -1) {
          // Overlap check
          return Math.max(startMinutes, lStart) < Math.min(endMinutes, lEnd);
        }
      }
      return false;
    });

    if (hasConflict) {
      setEditError(`Classroom conflict: ${editClassroom} is already booked by another lecture during this time window.`);
      return;
    }

    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
    const formattedTimeSlot = `${editStartTime.trim()} – ${editEndTime.trim()}`;

    const updated: Lecture = {
      ...editingLecture,
      name: editSubjectName.trim(),
      code: editSubjectCode.trim().toUpperCase(),
      className: editClassName.trim() || 'BCA-A',
      room: editClassroom.trim() || 'Room 204',
      date: editLectureDate,
      startTime: editStartTime.trim(),
      endTime: editEndTime.trim(),
      timeSlot: formattedTimeSlot,
      duration: durationStr,
    };

    if (onUpdateLecture) {
      onUpdateLecture(updated);
    }
    setEditingLecture(null);
    setEditError(null);
    showToast('✓ Lecture updated successfully');
  };

  // Open Delete / Archive Modal
  const handleOpenDeleteLecture = (lec: Lecture) => {
    setDeletingLecture(lec);
    setDeleteError(null);
  };

  // Confirm delete or archive
  const handleConfirmDelete = () => {
    if (!deletingLecture) return;

    // Rule C: Active lecture cannot be deleted
    if (deletingLecture.status === 'active') {
      setDeleteError('Active lecture cannot be deleted. Teacher must first end the attendance session.');
      return;
    }

    // Rule D: Completed lecture with attendance -> Archive
    if (deletingLecture.status === 'completed' || (deletingLecture.attendanceCount && deletingLecture.attendanceCount > 0)) {
      if (onDeleteLecture) {
        onDeleteLecture(deletingLecture.id, true);
      }
      setDeletingLecture(null);
      showToast('✓ Lecture archived from schedule successfully (attendance records preserved)');
      return;
    }

    // Rule A & B: Scheduled/upcoming lecture with no finalized attendance -> Delete
    if (onDeleteLecture) {
      onDeleteLecture(deletingLecture.id, false);
    }
    setDeletingLecture(null);
    showToast('✓ Lecture deleted successfully');
  };

  const handleCreateNewLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventCode.trim()) return;

    const startMinutes = parseTimeToMinutes(newEventStartTime);
    const endMinutes = parseTimeToMinutes(newEventEndTime);
    const diffMinutes = startMinutes !== -1 && endMinutes !== -1 ? Math.max(15, endMinutes - startMinutes) : 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
    const formattedTimeSlot = `${newEventStartTime.trim()} – ${newEventEndTime.trim()}`;

    const newLec: Lecture = {
      id: generateUniqueId('lec'),
      name: newEventName.trim(),
      code: newEventCode.trim().toUpperCase(),
      className: newEventClass.trim() || 'BCA-A',
      instructor: newEventInstructor.trim() || 'Prof. Sharma',
      room: newEventRoom.trim() || 'Room 204',
      date: newEventDate,
      startTime: newEventStartTime.trim(),
      endTime: newEventEndTime.trim(),
      timeSlot: formattedTimeSlot,
      duration: durationStr,
      status: startImmediately ? 'active' : 'upcoming',
      attendanceCount: 0,
      geofence: {
        lat: 19.9975,
        lng: 73.7898,
        radiusMeters: Number(newEventGeofence) || 35,
      },
      bleBeaconId: newEventBeacon.trim() || `BEACON-${newEventRoom.replace(/\s+/g, '-').toUpperCase()}`,
    };

    onCreateLecture(newLec);
    setShowCreateEventModal(false);

    // Reset Form
    setNewEventName('');
    setNewEventCode('');
    showToast(`✓ Lecture ${newLec.name} created successfully`);

    if (startImmediately) {
      handleStartLecture(newLec);
    }
  };

  const handleApproveCorrection = (requestId: string, teacherNote: string) => {
    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              teacherNote: teacherNote || 'Approved attendance claim.',
            }
          : r
      )
    );
    showToast('Attendance correction claim approved');
  };

  const handleRejectCorrection = (requestId: string, teacherNote: string) => {
    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              teacherNote: teacherNote || 'Dispute could not be validated.',
            }
          : r
      )
    );
    showToast('Attendance correction claim rejected');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Roll No,Student Name,Status,Confidence,Verification Time,Lecture Code,Lecture Name,Class,Room\n' +
      students
        .map(
          (e) =>
            `${e.rollNo},${e.studentName},${e.status},${e.confidence}%,${e.time},${currentLecture.code},"${currentLecture.name}",${currentLecture.className || 'BCA-A'},${currentLecture.room}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartAttend_${currentLecture.code.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Attendance report exported to CSV');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] font-sans pb-16 overflow-x-hidden">
      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#031635] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 text-[13px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#a0f399]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Top Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 min-h-16 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <img alt="SmartAttend" className="h-7 md:h-8 w-auto shrink-0" src={LOGO_URL} />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                Faculty Portal
              </span>
              <span className="text-sm md:text-base font-bold text-[#031635]">
                {activeTab === 'live' ? 'Live Attendance Session' : 'Event & Lecture Hub'}
              </span>
            </div>
            <div className="h-5 w-px bg-[#e1e3e4] mx-1 hidden sm:block" />
            <span className="text-[12px] text-[#44474e] hidden md:inline">Prof. Sharma • BCA Dept</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Auxiliary Tools Buttons */}
            <button
              onClick={() => setShowReviewQueueModal(true)}
              className="relative flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold text-[#723600] bg-[#fffaf0] hover:bg-[#ffdcc6]/60 border border-[#ffdcc6] rounded-xl transition-all cursor-pointer shadow-xs"
              title="Open Review & Dispute Queue"
            >
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
              <span>Review Queue</span>
              {reviewCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#723600] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setShowReportsModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-[#031635] bg-[#f8f9fa] hover:bg-[#eef2ff] border border-[#e1e3e4] rounded-xl transition-all cursor-pointer shadow-xs"
              title="View Attendance Analytics & Export CSV"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span className="hidden sm:inline">Reports</span>
            </button>

            <button
              onClick={() => setShowVisualAiModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] border border-[#d8e2ff] rounded-xl transition-all cursor-pointer shadow-xs"
              title="Classroom AI Camera Stream"
            >
              <span className="material-symbols-outlined text-[16px]">videocam</span>
              <span className="hidden sm:inline">Visual AI</span>
            </button>

            <button
              onClick={() => setShowOfflineModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-[#723600] bg-[#fffaf0] hover:bg-[#ffdcc6]/60 border border-[#ffdcc6] rounded-xl transition-all cursor-pointer shadow-xs"
              title="Teacher Offline Lecture Mode"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_off</span>
              <span className="hidden md:inline">Offline Mode</span>
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#f8f9fa] hover:bg-[#eef2ff] border border-[#e1e3e4] text-[#031635] transition-all cursor-pointer shadow-xs"
              title="Help & Support"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
            </button>

            {activeTab === 'live' && (
              <button
                onClick={() => setShowProjectorQR(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold text-white bg-[#031635] hover:bg-[#1a2b4b] rounded-xl transition-all cursor-pointer shadow-md"
                title="Open high-contrast full-screen QR for room projector"
              >
                <span className="material-symbols-outlined text-[16px]">present_to_all</span>
                <span>Projector QR</span>
                <span className="bg-[#a0f399] text-[#005312] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  5s
                </span>
              </button>
            )}

            {activeTab === 'events' && (
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold text-white bg-[#031635] hover:bg-[#1a2b4b] rounded-xl transition-all cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
                <span>Start New Event</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-[12px] font-bold text-[#ba1a1a] bg-[#ffdad6]/60 hover:bg-[#ffdad6] px-3 py-1.5 rounded-xl border border-[#ba1a1a]/20 transition-all cursor-pointer shadow-xs"
                title="Sign out of faculty session"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 flex flex-col gap-5 md:gap-6 pt-4 md:pt-6">
        {/* Navigation Tabs between Live Session, Event Hub & Offline Attendance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 bg-[#f8f9fa] p-1.5 rounded-2xl border border-[#e1e3e4]">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-2 rounded-xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'live'
                ? 'bg-[#031635] text-white shadow-xs'
                : 'text-[#75777f] hover:bg-white hover:text-[#031635]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] shrink-0">radio_button_checked</span>
            <span className="truncate">
              Live Attendance: <strong className="font-extrabold">{currentLecture.code}</strong>
            </span>
            {sessionActive && <span className="w-2 h-2 rounded-full bg-[#a0f399] animate-pulse shrink-0" />}
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-2 rounded-xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'events'
                ? 'bg-[#031635] text-white shadow-xs'
                : 'text-[#75777f] hover:bg-white hover:text-[#031635]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] shrink-0">event_note</span>
            <span className="truncate">Start & Manage Events ({lectures.filter(l => !l.isArchived).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-2 rounded-xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'offline'
                ? 'bg-[#031635] text-white shadow-xs'
                : 'text-[#723600] bg-[#fffaf0] hover:bg-[#ffdcc6]/60 border border-[#ffdcc6]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] shrink-0">cloud_off</span>
            <span className="truncate">Offline Attendance</span>
            <span className="bg-[#ffdcc6] text-[#723600] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              Local Mesh
            </span>
          </button>
        </div>

        {/* Offline Readiness Warning Card if in Live View while Offline */}
        {activeTab !== 'offline' && !isInternetOnline && (
          <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffdcc6] text-[#723600] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">wifi_off</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#723600] text-[13px]">
                  Internet connection unavailable
                </span>
                <span className="text-[12px] text-[#75777f]">
                  Offline Attendance is operational. You can conduct attendance using the classroom local network.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setActiveTab('offline')}
                className="px-4 py-2 bg-[#723600] hover:bg-[#572800] text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_off</span>
                <span>Start Offline Attendance</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE ATTENDANCE FLOW */}
        {activeTab === 'offline' && (
          <div className="animate-in fade-in duration-200">
            <TeacherOfflineAttendance onNavigateDashboard={() => setActiveTab('live')} />
          </div>
        )}

        {/* TAB 1: LIVE ATTENDANCE RECORDING FOR CURRENT LECTURE */}
        {activeTab === 'live' && (
          <div className="flex flex-col gap-5 md:gap-6 animate-in fade-in duration-200">
            {/* Section 5: Teacher Active Session Card */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#e1e3e4] shadow-xs flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-[#031635] text-white flex items-center justify-center font-bold text-[16px] md:text-[18px] shadow-sm shrink-0">
                  {currentLecture.code.split(' ')[1] || 'LEC'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] md:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      sessionActive ? 'bg-[#a0f399] text-[#005312]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>
                      {sessionActive ? '🟢 Attendance Active' : 'Ingest Paused'}
                    </span>
                    <span className="text-[12px] font-bold text-[#031635] bg-[#eef2ff] px-2 py-0.5 rounded-md border border-[#d8e2ff]">
                      Class: {currentLecture.className || 'BCA-A'}
                    </span>
                    <span className="text-[12px] font-semibold text-[#75777f]">
                      Room: <strong className="text-[#031635]">{currentLecture.room}</strong>
                    </span>
                    <span className="text-[12px] font-semibold text-[#75777f] hidden sm:inline">
                      Timing: <strong className="text-[#031635]">{currentLecture.timeSlot}</strong>
                    </span>
                  </div>
                  <h1 className="text-[18px] md:text-[22px] font-bold text-[#031635] mt-1">
                    {currentLecture.name} ({currentLecture.code})
                  </h1>
                  <p className="text-[12px] md:text-[13px] text-[#44474e]">
                    Instructor: {currentLecture.instructor} • Geofence: {currentLecture.geofence.radiusMeters}m • Beacon: {currentLecture.bleBeaconId || 'Active'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    rosterTableRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] border border-[#d8e2ff] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>View Live Attendance</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-[#031635] bg-[#f8f9fa] hover:bg-[#eef2ff] border border-[#e1e3e4] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-[#031635] bg-[#f8f9fa] hover:bg-[#eef2ff] border border-[#e1e3e4] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  <span>Switch Lecture</span>
                </button>

                {sessionActive ? (
                  <button
                    onClick={() => handleEndAttendanceSession(currentLecture.id)}
                    className="px-3.5 py-2 rounded-xl font-bold text-[12px] bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[17px]">stop_circle</span>
                    <span>End Attendance</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSessionActive(true)}
                    className="px-3.5 py-2 rounded-xl font-bold text-[12px] bg-[#a0f399] text-[#005312] hover:bg-[#b5f9af] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[17px]">play_circle</span>
                    <span>Resume Ingest</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live 5-Second Dynamic QR Refresh Banner & Metric Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Dynamic 5-Second QR Card */}
              <div className="bg-[#031635] text-white p-5 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#a0f399] animate-ping" />
                      <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Dynamic QR
                      </span>
                      <span className="text-[11px] text-[#b6c6ef]">Changes every 5 seconds</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-white mt-1">Live Attendance QR</h3>
                  </div>

                  <button
                    onClick={() => setShowProjectorQR(true)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/15 transition-all cursor-pointer flex items-center justify-center"
                    title="Fullscreen for Classroom Projector"
                  >
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 my-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div
                    onClick={() => setShowProjectorQR(true)}
                    className="w-16 h-16 bg-white rounded-xl p-1 flex items-center justify-center text-[#031635] cursor-pointer hover:scale-105 transition-transform shrink-0 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[54px] select-none text-[#031635]">qr_code_2</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-mono font-bold text-white text-[13px]">{qrToken}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-[#b6c6ef]">QR refreshes in:</span>
                      <span className="bg-[#a0f399] text-[#005312] text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">timer</span>
                        <span>{tokenCountdown}s</span>
                      </span>
                    </div>
                    {/* Visual 5-second progress countdown bar */}
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#a0f399] h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(tokenCountdown / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-[#b6c6ef] border-t border-white/10 pt-2.5">
                  <div className="flex justify-between items-center">
                    <span>Security: Temporary challenge token</span>
                    <button
                      onClick={() => setShowProjectorQR(true)}
                      className="text-[#a0f399] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Projector Mode</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-white/70 italic">
                    Each QR code is temporary and expires after 5 seconds.
                  </p>
                </div>
              </div>

              {/* Attendance Breakdown Metrics (Verified, Probable, Needs Review, Absent, Proxy) */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {/* 1. Verified Present */}
                <div
                  onClick={() => setStatusFilter(statusFilter === 'present' ? 'all' : 'present')}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    statusFilter === 'present'
                      ? 'border-[#1b6d24] ring-2 ring-[#a0f399] shadow-md'
                      : 'border-[#e1e3e4] hover:border-[#c5c6cf] shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#75777f] uppercase">Verified</span>
                    <span className="w-6 h-6 rounded-full bg-[#a0f399] text-[#005312] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[24px] font-extrabold text-[#031635] leading-none">
                      {verifiedCount}
                    </span>
                    <span className="text-[10px] text-[#75777f] block mt-1">Present</span>
                  </div>
                </div>

                {/* 2. Probable Present */}
                <div
                  onClick={() => setStatusFilter(statusFilter === 'probable' ? 'all' : 'probable')}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    statusFilter === 'probable'
                      ? 'border-[#031635] ring-2 ring-[#d8e2ff] shadow-md'
                      : 'border-[#e1e3e4] hover:border-[#c5c6cf] shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#75777f] uppercase">Probable</span>
                    <span className="w-6 h-6 rounded-full bg-[#d8e2ff] text-[#031635] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">sensors</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[24px] font-extrabold text-[#031635] leading-none">
                      {probableCount}
                    </span>
                    <span className="text-[10px] text-[#75777f] block mt-1">BLE/WiFi</span>
                  </div>
                </div>

                {/* 3. Needs Review */}
                <div
                  onClick={() => setShowReviewQueueModal(true)}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    statusFilter === 'needs_review'
                      ? 'border-[#723600] ring-2 ring-[#ffdcc6] shadow-md'
                      : 'border-[#e1e3e4] hover:border-[#c5c6cf] shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#75777f] uppercase">Review</span>
                    <span className="w-6 h-6 rounded-full bg-[#ffdcc6] text-[#723600] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">warning</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[24px] font-extrabold text-[#723600] leading-none">
                      {reviewCount}
                    </span>
                    <span className="text-[10px] text-[#75777f] block mt-1">Disputes</span>
                  </div>
                </div>

                {/* 4. Not Verified / Absent */}
                <div
                  onClick={() => setStatusFilter(statusFilter === 'absent' ? 'all' : 'absent')}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    statusFilter === 'absent'
                      ? 'border-[#ba1a1a] ring-2 ring-[#ffdad6] shadow-md'
                      : 'border-[#e1e3e4] hover:border-[#c5c6cf] shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#75777f] uppercase">Unverified</span>
                    <span className="w-6 h-6 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">person_off</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[24px] font-extrabold text-[#ba1a1a] leading-none">
                      {absentCount}
                    </span>
                    <span className="text-[10px] text-[#75777f] block mt-1">Not Verified</span>
                  </div>
                </div>

                {/* 5. Possible Proxy */}
                <div
                  onClick={() => setShowReviewQueueModal(true)}
                  className="bg-white p-3.5 rounded-2xl border border-[#ffdcc6] hover:border-[#723600] shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#723600] uppercase">Proxy Flag</span>
                    <span className="w-6 h-6 rounded-full bg-[#ffdcc6] text-[#723600] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[15px]">shield</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[24px] font-extrabold text-[#723600] leading-none">
                      {proxyCount}
                    </span>
                    <span className="text-[10px] text-[#723600] block mt-1">Possible Proxy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Attendance Roster Table */}
            <div ref={rosterTableRef} className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 md:p-5 border-b border-[#f3f4f5] flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[16px] md:text-[18px] font-bold text-[#031635]">
                    Live Student Ingest Roster
                  </h2>
                  <span className="bg-[#f8f9fa] text-[#75777f] text-[11px] md:text-[12px] font-bold px-2.5 py-0.5 rounded-full border border-[#e1e3e4]">
                    {filteredStudents.length} of {students.length} students
                  </span>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#75777f] text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search name / roll..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[12px] text-[#191c1d] outline-none focus:border-[#031635]"
                    />
                  </div>

                  {/* Filter Pill Buttons */}
                  <div className="flex gap-1 flex-wrap">
                    {(['all', 'present', 'needs_review', 'probable', 'absent'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          statusFilter === f
                            ? 'bg-[#031635] text-white shadow-xs'
                            : 'bg-[#f8f9fa] text-[#75777f] hover:bg-[#eef2ff]'
                        }`}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-[13px] border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                      <th className="py-3 px-4 md:px-5">Roll No</th>
                      <th className="py-3 px-4 md:px-5">Student Name</th>
                      <th className="py-3 px-4 md:px-5">Attestation</th>
                      <th className="py-3 px-4 md:px-5">Confidence</th>
                      <th className="py-3 px-4 md:px-5">Ingest Time</th>
                      <th className="py-3 px-4 md:px-5">Status</th>
                      <th className="py-3 px-4 md:px-5 text-right">Verification Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f5]">
                    {filteredStudents.map((s) => (
                      <tr key={s.studentId} className="hover:bg-[#f8f9fa]/80 transition-colors">
                        <td className="py-3 px-4 md:px-5 font-mono text-[#75777f] font-semibold">{s.rollNo}</td>
                        <td className="py-3 px-4 md:px-5">
                          <div className="flex items-center gap-2.5">
                            <img
                              alt={s.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-[#d8e2ff]"
                              src={s.avatarUrl}
                            />
                            <span className="font-bold text-[#191c1d]">{s.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 md:px-5">
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded-md bg-[#eef2ff] text-[#031635] font-semibold border border-[#d8e2ff]">
                              GPS
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#eef2ff] text-[#031635] font-semibold border border-[#d8e2ff]">
                              Key
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#eef2ff] text-[#031635] font-semibold border border-[#d8e2ff]">
                              5s
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 md:px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#191c1d] text-[12px]">{s.confidence}%</span>
                            <div className="w-14 bg-[#f3f4f5] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.confidence >= 80
                                    ? 'bg-[#1b6d24]'
                                    : s.confidence >= 50
                                    ? 'bg-[#e57300]'
                                    : 'bg-[#ba1a1a]'
                                }`}
                                style={{ width: `${s.confidence}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 md:px-5 text-[#75777f] font-mono text-[12px]">{s.time}</td>
                        <td className="py-3 px-4 md:px-5">
                          {s.status === 'present' && (
                            <span className="bg-[#a0f399] text-[#005312] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Present
                            </span>
                          )}
                          {s.status === 'needs_review' && (
                            <span className="bg-[#ffdcc6] text-[#723600] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Review Req
                            </span>
                          )}
                          {s.status === 'probable' && (
                            <span className="bg-[#d8e2ff] text-[#031635] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Probable
                            </span>
                          )}
                          {s.status === 'absent' && (
                            <span className="bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 md:px-5 text-right">
                          <button
                            onClick={() => setInspectedStudent(s)}
                            className="px-3 py-1 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            Inspect Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: START & MANAGE EVENTS / LECTURES HUB */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-5 md:gap-6 animate-in fade-in duration-200">
            {/* Header & Quick Action */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#e1e3e4] shadow-xs flex justify-between items-center flex-wrap gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                  Event & Class Scheduler
                </span>
                <h2 className="text-[20px] md:text-[22px] font-bold text-[#031635] mt-0.5">
                  Select or Start an Attendance Event
                </h2>
                <p className="text-[13px] text-[#44474e] mt-0.5">
                  Manage schedule, edit lecture timings, venues, and launch dynamic 5-second QR attendance sessions.
                </p>
              </div>

              <button
                onClick={() => setShowCreateEventModal(true)}
                className="px-4 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-2xl font-bold text-[13px] transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Create & Start New Event</span>
              </button>
            </div>

            {/* Currently Active Lecture Banner */}
            <div className="bg-[#031635] text-white p-5 md:p-6 rounded-3xl border border-white/10 shadow-lg flex justify-between items-center flex-wrap gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-[16px] shrink-0">
                  {currentLecture.code.split(' ')[1] || 'ACT'}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Currently Active
                    </span>
                    <span className="text-[12px] text-[#b6c6ef]">Class: {currentLecture.className || 'BCA-A'}</span>
                    <span className="text-[12px] text-[#b6c6ef]">• {currentLecture.room}</span>
                  </div>
                  <h3 className="text-[18px] md:text-[20px] font-bold text-white mt-0.5">
                    {currentLecture.name} ({currentLecture.code})
                  </h3>
                  <p className="text-[12px] text-[#b6c6ef]">
                    {currentLecture.instructor} • Timing: {currentLecture.timeSlot} • Geofence: {currentLecture.geofence.radiusMeters}m
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 z-10">
                <button
                  onClick={() => setActiveTab('live')}
                  className="px-4 py-2 bg-[#a0f399] text-[#005312] hover:bg-[#b5f9af] rounded-xl font-bold text-[12px] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Open Live Recording Screen</span>
                </button>
              </div>
            </div>

            {/* List of Today's Lectures & Events with 3-Dot Action Menu */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#75777f]">
                  Today&apos;s Scheduled Lectures ({lectures.filter(l => !l.isArchived).length})
                </span>
                <span className="text-[12px] text-[#75777f]">Use the ⋮ menu to edit or delete scheduled lectures</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lectures.filter(l => !l.isArchived).map((lec) => {
                  const isCurrent = lec.id === currentLecture.id;
                  const isMenuOpen = openMenuLectureId === lec.id;

                  return (
                    <div
                      key={lec.id}
                      className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 shadow-xs relative ${
                        isCurrent ? 'border-[#031635] ring-2 ring-[#d8e2ff]' : 'border-[#e1e3e4] hover:border-[#c5c6cf]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#eef2ff] border border-[#d8e2ff] text-[#031635] flex items-center justify-center font-bold text-[13px] shrink-0">
                            {lec.code.split(' ')[1] || 'EVT'}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-[#75777f] uppercase">{lec.code}</span>
                              <span className="text-[10px] font-bold bg-[#f8f9fa] text-[#44474e] px-1.5 py-0.2 rounded border border-[#e1e3e4]">
                                {lec.className || 'BCA-A'}
                              </span>
                            </div>
                            <h4 className="text-[15px] font-bold text-[#031635] line-clamp-1">{lec.name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCurrent ? (
                            <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Active
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              lec.status === 'completed'
                                ? 'bg-[#eef2ff] text-[#031635] border-[#d8e2ff]'
                                : 'bg-[#f8f9fa] text-[#75777f] border-[#e1e3e4]'
                            }`}>
                              {lec.status}
                            </span>
                          )}

                          {/* 3-Dot Action Menu Button */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuLectureId(isMenuOpen ? null : lec.id);
                              }}
                              className="w-8 h-8 rounded-full hover:bg-[#f3f4f5] text-[#44474e] flex items-center justify-center transition-colors cursor-pointer"
                              title="Lecture options"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-9 z-30 w-52 bg-white rounded-2xl shadow-xl border border-[#e1e3e4] py-1.5 animate-in fade-in zoom-in-95 duration-150"
                              >
                                {lec.status === 'upcoming' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleOpenEditLecture(lec);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#031635] hover:bg-[#f8f9fa] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#031635]">edit</span>
                                      <span>Edit Lecture</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleOpenDeleteLecture(lec);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">delete</span>
                                      <span>Delete Lecture</span>
                                    </button>
                                  </>
                                )}

                                {lec.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleStartLecture(lec);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#031635] hover:bg-[#f8f9fa] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#031635]">visibility</span>
                                      <span>View Attendance</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleEndAttendanceSession(lec.id);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">stop_circle</span>
                                      <span>End Attendance</span>
                                    </button>
                                  </>
                                )}

                                {lec.status === 'completed' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleStartLecture(lec);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#031635] hover:bg-[#f8f9fa] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#031635]">visibility</span>
                                      <span>View Attendance</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        setShowReportsModal(true);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#031635] hover:bg-[#f8f9fa] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#031635]">bar_chart</span>
                                      <span>View Report</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setOpenMenuLectureId(null);
                                        handleOpenDeleteLecture(lec);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-[12px] font-bold text-[#723600] hover:bg-[#ffdcc6]/40 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[16px] text-[#723600]">archive</span>
                                      <span>Archive from Schedule</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-[#e1e3e4] text-[12px] flex flex-col gap-1.5">
                        <div className="flex justify-between text-[#44474e]">
                          <span>Class / Division:</span>
                          <strong className="text-[#031635]">{lec.className || 'BCA-A'}</strong>
                        </div>
                        <div className="flex justify-between text-[#44474e]">
                          <span>Classroom:</span>
                          <strong className="text-[#031635]">{lec.room}</strong>
                        </div>
                        <div className="flex justify-between text-[#44474e]">
                          <span>Timing:</span>
                          <strong className="text-[#031635]">{lec.timeSlot}</strong>
                        </div>
                        <div className="flex justify-between text-[#44474e]">
                          <span>Lecture Date:</span>
                          <strong className="text-[#031635]">{lec.date || '2026-08-20'}</strong>
                        </div>
                        <div className="flex justify-between text-[#44474e]">
                          <span>Attendance Count:</span>
                          <strong className="text-[#031635]">{lec.attendanceCount ?? (isCurrent ? verifiedCount : 0)} students</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartLecture(lec)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                            isCurrent
                              ? 'bg-[#031635] text-white hover:bg-[#1a2b4b]'
                              : 'bg-[#eef2ff] text-[#031635] hover:bg-[#d8e2ff] border border-[#d8e2ff]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isCurrent ? 'radio_button_checked' : 'play_circle'}
                          </span>
                          <span>{isCurrent ? 'Continue Live Attendance' : 'Start Attendance For This'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: EDIT LECTURE MODAL */}
      {editingLecture && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 my-8">
            <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                  Lecture Details
                </span>
                <h3 className="text-[18px] font-bold text-[#031635]">Edit Lecture</h3>
              </div>
              <button
                onClick={() => setEditingLecture(null)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] hover:text-[#191c1d] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-[12px] font-semibold flex items-center gap-2 border border-[#ba1a1a]/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLectureEdits} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={editSubjectName}
                    onChange={(e) => setEditSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={editSubjectCode}
                    onChange={(e) => setEditSubjectCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Class / Division *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA-A"
                    value={editClassName}
                    onChange={(e) => setEditClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Classroom / Venue *</label>
                  <select
                    value={editClassroom}
                    onChange={(e) => setEditClassroom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white cursor-pointer"
                  >
                    <option value="Room 204">Room 204</option>
                    <option value="Room 402">Room 402</option>
                    <option value="Room 405">Room 405</option>
                    <option value="Lab 2">Lab 2</option>
                    <option value="Lab 3">Lab 3</option>
                    <option value="Auditorium Hall A">Auditorium Hall A</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#44474e]">Lecture Date *</label>
                <input
                  type="date"
                  required
                  value={editLectureDate}
                  onChange={(e) => setEditLectureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:00 AM"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Immutable parameters note */}
              <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] text-[11px] text-[#75777f] flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Lecture ID (Immutable):</span>
                  <span className="font-mono font-bold text-[#031635]">{editingLecture.id}</span>
                </div>
                <span>Finalized attendance logs cannot be altered. Edits take effect immediately across all teacher and student dashboards.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f3f4f5]">
                <button
                  type="button"
                  onClick={() => setEditingLecture(null)}
                  className="px-4 py-2.5 text-[12px] font-bold text-[#75777f] hover:bg-[#f8f9fa] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[13px] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE / ARCHIVE LECTURE CONFIRMATION MODAL */}
      {deletingLecture && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 my-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-[#031635]">
                  {deletingLecture.status === 'completed' || (deletingLecture.attendanceCount && deletingLecture.attendanceCount > 0)
                    ? 'Archive Lecture from Schedule?'
                    : 'Delete Lecture?'}
                </h3>
                <span className="text-[12px] text-[#75777f]">Confirm lecture deletion</span>
              </div>
            </div>

            {/* Lecture Summary Box */}
            <div className="p-4 bg-[#f8f9fa] rounded-2xl border border-[#e1e3e4] flex flex-col gap-1.5 text-[12px]">
              <div className="font-bold text-[14px] text-[#031635]">{deletingLecture.name}</div>
              <div className="text-[#44474e]">{deletingLecture.className || 'BCA-A'} • {deletingLecture.room}</div>
              <div className="text-[#75777f]">{deletingLecture.timeSlot} • {deletingLecture.date || '2026-08-20'}</div>
            </div>

            {deleteError ? (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-[12px] font-bold flex items-center gap-2 border border-[#ba1a1a]/20">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{deleteError}</span>
              </div>
            ) : (
              <div className="p-3 bg-[#fffaf0] border border-[#ffdcc6] rounded-xl text-[12px] text-[#723600] flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Removal Notice</span>
                </span>
                <span>
                  This will remove the scheduled lecture from your dashboard. Attendance records that have already been finalized must not be silently deleted.
                </span>
                {(deletingLecture.status === 'completed' || (deletingLecture.attendanceCount && deletingLecture.attendanceCount > 0)) && (
                  <span className="font-bold text-[#005312] mt-1">
                    ✓ Attendance records are preserved for audit purposes.
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f5]">
              <button
                type="button"
                onClick={() => setDeletingLecture(null)}
                className="px-4 py-2.5 text-[12px] font-bold text-[#75777f] hover:bg-[#f8f9fa] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {deletingLecture.status !== 'active' && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-xl font-bold text-[13px] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {deletingLecture.status === 'completed' ? 'archive' : 'delete'}
                  </span>
                  <span>
                    {deletingLecture.status === 'completed' ? 'Archive Lecture' : 'Delete Lecture'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE & START NEW LECTURE / EVENT */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4 my-8">
            <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                  Event Initialization
                </span>
                <h3 className="text-[18px] font-bold text-[#031635]">Start New Lecture / Event</h3>
              </div>
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] hover:text-[#191c1d] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewLecture} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#44474e]">Subject / Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Programming, Cloud Security Seminar"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA 301"
                    value={newEventCode}
                    onChange={(e) => setNewEventCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Class / Division *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA-A"
                    value={newEventClass}
                    onChange={(e) => setNewEventClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Room / Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 204, Lab 2"
                    value={newEventRoom}
                    onChange={(e) => setNewEventRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Lecture Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:45 AM"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 01:00 PM"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:border-[#031635] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Geofence radius slider */}
              <div className="p-3.5 bg-[#f8f9fa] rounded-2xl border border-[#e1e3e4] flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-bold text-[#44474e]">Geofence Accuracy Radius:</span>
                  <span className="font-extrabold text-[#031635] bg-[#eef2ff] px-2 py-0.5 rounded-md border border-[#d8e2ff]">
                    {newEventGeofence} meters
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={100}
                  step={5}
                  value={newEventGeofence}
                  onChange={(e) => setNewEventGeofence(Number(e.target.value))}
                  className="w-full accent-[#031635] cursor-pointer"
                />
                <span className="text-[11px] text-[#75777f]">
                  Students outside this radius will be flagged for review during 5-second challenge submission.
                </span>
              </div>

              {/* Immediate start checkbox */}
              <label className="flex items-center gap-2.5 p-2.5 bg-[#eef2ff] rounded-xl border border-[#d8e2ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={startImmediately}
                  onChange={(e) => setStartImmediately(e.target.checked)}
                  className="w-4 h-4 accent-[#031635] rounded-md cursor-pointer"
                />
                <span className="text-[12px] font-bold text-[#031635]">
                  Start recording live attendance immediately upon creation
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f3f4f5]">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#75777f] hover:bg-[#f8f9fa] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#031635] text-white hover:bg-[#1a2b4b] rounded-xl font-bold text-[13px] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>{startImmediately ? 'Launch & Start Ingest' : 'Save Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECTOR FULLSCREEN QR MODAL WITH 5-SECOND REFRESH */}
      {showProjectorQR && (
        <div className="fixed inset-0 z-50 bg-[#031635]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-in fade-in overflow-y-auto">
          <button
            onClick={() => setShowProjectorQR(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Exit Projector Mode"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>

          <div className="max-w-xl w-full flex flex-col items-center text-center gap-5 my-auto">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 justify-center">
                <span className="bg-[#a0f399] text-[#005312] text-[12px] font-extrabold uppercase px-3.5 py-1 rounded-full w-fit shadow-sm">
                  Dynamic QR • 5-Second Rotation
                </span>
              </div>
              <h2 className="text-[28px] md:text-[34px] font-extrabold text-white mt-1">
                Scan With SmartAttend App
              </h2>
              <p className="text-[14px] text-[#b6c6ef]">
                {currentLecture.name} ({currentLecture.code}) • Class: {currentLecture.className || 'BCA-A'} • Room {currentLecture.room}
              </p>
            </div>

            {/* Large Projector QR Display */}
            <div className="p-6 bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-4 relative w-full max-w-sm">
              <div className="w-64 h-64 sm:w-72 sm:h-72 bg-[#031635] rounded-2xl flex items-center justify-center text-white relative overflow-hidden p-4">
                <span className="material-symbols-outlined text-[190px] sm:text-[220px] text-white select-none">
                  qr_code_2
                </span>
              </div>

              <div className="w-full flex justify-between items-center text-[#031635] text-[13px] font-mono">
                <span className="font-bold">{qrToken}</span>
                <span className="bg-[#a0f399] text-[#005312] px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  Refreshes in {tokenCountdown}s
                </span>
              </div>

              {/* Dynamic 5-Second Progress Bar */}
              <div className="w-full bg-[#f3f4f5] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1b6d24] h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(tokenCountdown / 5) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[12px] text-[#b6c6ef] max-w-md">
              Each QR code is temporary and expires after 5 seconds. Screenshot forwarding is blocked by real-time challenge rotation and multi-factor location attestation.
            </p>
          </div>
        </div>
      )}

      {/* STUDENT TELEMETRY VERIFICATION AUDIT MODAL */}
      <TeacherStudentVerificationModal
        student={inspectedStudent}
        isOpen={Boolean(inspectedStudent)}
        onClose={() => setInspectedStudent(null)}
        onUpdateStatus={(studentId, newStatus) =>
          onUpdateStudentStatus(studentId, newStatus, 'Faculty verification audit resolution')
        }
      />

      {/* REVIEW QUEUE & DISPUTES MODAL */}
      <TeacherReviewQueueModal
        students={students}
        correctionRequests={correctionRequests}
        isOpen={showReviewQueueModal}
        onClose={() => setShowReviewQueueModal(false)}
        onApproveStudent={(studentId) =>
          onUpdateStudentStatus(studentId, 'present', 'Approved by faculty during review')
        }
        onRejectStudent={(studentId) =>
          onUpdateStudentStatus(studentId, 'absent', 'Marked absent by faculty during review')
        }
        onApproveCorrection={handleApproveCorrection}
        onRejectCorrection={handleRejectCorrection}
      />

      {/* ATTENDANCE REPORTS MODAL */}
      <TeacherReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        subjects={MOCK_SUBJECTS}
        students={students}
      />

      {/* OFFLINE MODE MODAL */}
      <TeacherOfflineModeModal
        activeLecture={currentLecture}
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
      />

      {/* VISUAL AI CCTV VERIFICATION MODAL */}
      <VisualVerificationModal
        isOpen={showVisualAiModal}
        onClose={() => setShowVisualAiModal(false)}
      />

      {/* HELP & SUPPORT MODAL */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        userRole="teacher"
      />
    </div>
  );
};
