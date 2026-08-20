import React, { useState } from 'react';
import {
  CURRENT_STUDENT,
  TODAY_LECTURES,
  INITIAL_ATTENDANCE_HISTORY,
  MOCK_CLASS_STUDENTS,
  INITIAL_AUDIT_LOGS,
  generateUniqueId,
} from './data/mockData';
import {
  UserRole,
  StudentProfile,
  Lecture,
  AttendanceRecord,
  StudentAttendanceItem,
  AuditLogEntry,
  AttendanceStatus,
} from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { StudentHome } from './components/StudentHome';
import { StudentLogin } from './components/StudentLogin';
import { TeacherLogin } from './components/TeacherLogin';
import { AdminLogin } from './components/AdminLogin';
import { StudentVerification } from './components/StudentVerification';
import { StudentHistory } from './components/StudentHistory';
import { StudentProfileView } from './components/StudentProfile';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminPortal } from './components/AdminPortal';
import { CorrectionModal } from './components/CorrectionModal';
import { DeviceRecoveryModal } from './components/DeviceRecoveryModal';

export default function App() {
  // Global View / Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  // Separate Role Authentication States
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState<boolean>(true);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Student State
  const [studentTab, setStudentTab] = useState<'home' | 'history' | 'profile'>('home');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<StudentProfile>(CURRENT_STUDENT);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_HISTORY);

  // Modals
  const [correctionTargetRecord, setCorrectionTargetRecord] = useState<AttendanceRecord | null>(null);
  const [showDeviceRecovery, setShowDeviceRecovery] = useState<boolean>(false);

  // Teacher / Class / Lecture State
  const [lectures, setLectures] = useState<Lecture[]>(TODAY_LECTURES);
  const [activeLectureId, setActiveLectureId] = useState<string>(TODAY_LECTURES[0].id);
  const [classStudents, setClassStudents] = useState<StudentAttendanceItem[]>(MOCK_CLASS_STUDENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const activeLecture = lectures.find((l) => l.id === activeLectureId) || lectures[0];
  const upcomingLectures = lectures.filter((l) => l.id !== activeLecture.id);

  const handleSelectLecture = (lecture: Lecture) => {
    setActiveLectureId(lecture.id);
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'LECTURE_SESSION_STARTED',
      entity: 'Lecture',
      entityId: lecture.id,
      newState: `ACTIVE (${lecture.code} - ${lecture.room})`,
      reason: 'Faculty initiated live 10s QR attendance capture window',
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleCreateLecture = (newLecture: Lecture) => {
    setLectures((prev) => [newLecture, ...prev]);
    setActiveLectureId(newLecture.id);
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'EVENT_CREATED_AND_INITIALIZED',
      entity: 'Lecture',
      entityId: newLecture.id,
      newState: `ACTIVE (${newLecture.code} - ${newLecture.room})`,
      reason: `New event scheduled with ${newLecture.geofence.radiusMeters}m geofence & 10s dynamic QR challenge`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleUpdateLecture = (updatedLecture: Lecture) => {
    const oldLecture = lectures.find((l) => l.id === updatedLecture.id);
    setLectures((prev) => prev.map((l) => (l.id === updatedLecture.id ? updatedLecture : l)));

    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'LECTURE_DETAILS_UPDATED',
      entity: 'Lecture',
      entityId: updatedLecture.id,
      previousState: oldLecture ? `${oldLecture.timeSlot} (${oldLecture.room})` : 'ORIGINAL_SCHEDULE',
      newState: `${updatedLecture.timeSlot} (${updatedLecture.room})`,
      reason: `Faculty updated timing & venue details for ${updatedLecture.name}`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleDeleteLecture = (lectureId: string, isArchive = false) => {
    const targetLecture = lectures.find((l) => l.id === lectureId);
    if (!targetLecture) return;

    if (isArchive) {
      setLectures((prev) =>
        prev.map((l) => (l.id === lectureId ? { ...l, isArchived: true, status: 'completed' } : l))
      );
      const auditEntry: AuditLogEntry = {
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'prof.sharma@springfield.edu',
        role: 'TEACHER',
        action: 'LECTURE_ARCHIVED',
        entity: 'Lecture',
        entityId: lectureId,
        previousState: 'COMPLETED_SCHEDULE',
        newState: 'ARCHIVED (Attendance Preserved)',
        reason: `Faculty archived completed lecture ${targetLecture.name}; records preserved`,
        ipAddress: '10.0.1.15'
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    } else {
      setLectures((prev) => prev.filter((l) => l.id !== lectureId));
      if (activeLectureId === lectureId) {
        const remaining = lectures.filter((l) => l.id !== lectureId);
        if (remaining.length > 0) {
          setActiveLectureId(remaining[0].id);
        }
      }
      const auditEntry: AuditLogEntry = {
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'prof.sharma@springfield.edu',
        role: 'TEACHER',
        action: 'LECTURE_DELETED',
        entity: 'Lecture',
        entityId: lectureId,
        previousState: 'UPCOMING_SCHEDULED',
        newState: 'DELETED',
        reason: `Faculty deleted scheduled lecture ${targetLecture.name}`,
        ipAddress: '10.0.1.15'
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    }
  };

  const handleEndAttendance = (lectureId: string) => {
    const targetLecture = lectures.find((l) => l.id === lectureId);
    setLectures((prev) =>
      prev.map((l) => (l.id === lectureId ? { ...l, status: 'completed' } : l))
    );
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'ATTENDANCE_SESSION_FINALIZED',
      entity: 'Lecture',
      entityId: lectureId,
      previousState: 'ACTIVE_INGEST',
      newState: 'FINALIZED',
      reason: `Faculty closed live attendance window for ${targetLecture?.name || lectureId}`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleLogoutRole = (role: UserRole) => {
    if (role === 'student') setIsStudentLoggedIn(false);
    if (role === 'teacher') setIsTeacherLoggedIn(false);
    if (role === 'admin') setIsAdminLoggedIn(false);
  };

  // Student verification complete handler
  const handleVerificationComplete = (lecture: Lecture) => {
    setIsVerifying(false);
    // Add record to history if not already present
    const newRecord: AttendanceRecord = {
      id: generateUniqueId('rec'),
      date: '2023-10-24',
      day: '24',
      month: 'Oct',
      lectureCode: lecture.code,
      subjectName: lecture.name,
      lectureType: `Lecture - ${lecture.room}`,
      room: lecture.room,
      status: 'present',
      evidence: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationStatus: 'verified',
        locationDistanceMeters: 4.8,
        deviceStatus: 'trusted',
        dynamicChallengeVerified: true,
        challengeLatencyMs: 380,
        bleDetected: true,
        confidenceScore: 100,
        notes: 'Verified via live classroom camera scan & GPS geofence match.'
      }
    };

    setAttendanceHistory((prev) => [newRecord, ...prev]);

    // Also update in teacher roster
    setClassStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentData.studentId
          ? { ...s, status: 'present', confidence: 100, time: newRecord.evidence.timestamp }
          : s
      )
    );

    // Append to audit trail
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: studentData.email,
      role: 'STUDENT',
      action: 'ATTENDANCE_SELF_VERIFIED',
      entity: 'AttendanceRecord',
      entityId: newRecord.id,
      newState: 'PRESENT (100% Multi-Factor Conf)',
      reason: `QR Challenge + GPS (${lecture.geofence.radiusMeters}m geofence) + Bound Device`,
      ipAddress: '10.0.4.22'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    setStudentTab('history');
  };

  // Submit correction request
  const handleSubmitCorrection = (recordId: string, reason: string) => {
    setAttendanceHistory((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              hasCorrectionRequest: true,
              correctionStatus: 'pending',
              correctionReason: reason
            }
          : r
      )
    );

    // Audit log
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: studentData.email,
      role: 'STUDENT',
      action: 'CORRECTION_REQUESTED',
      entity: 'AttendanceRecord',
      entityId: recordId,
      newState: 'PENDING_FACULTY_REVIEW',
      reason: reason,
      ipAddress: '10.0.4.22'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Teacher manual override / approval handler
  const handleTeacherOverride = (studentId: string, newStatus: AttendanceStatus, reason: string) => {
    const student = classStudents.find((s) => s.studentId === studentId);
    if (!student) return;

    const prevStatus = student.status;
    setClassStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              status: newStatus,
              confidence: newStatus === 'present' ? 100 : newStatus === 'probable' ? 75 : 0
            }
          : s
      )
    );

    // Audit log entry
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'ATTENDANCE_OVERRIDDEN',
      entity: 'AttendanceRecord',
      entityId: studentId,
      previousState: prevStatus.toUpperCase(),
      newState: newStatus.toUpperCase(),
      reason: reason,
      ipAddress: '172.16.20.104'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Device recovery confirmation handler
  const handleConfirmNewDevice = (deviceName: string, model: string) => {
    const updatedDevice = {
      ...studentData.registeredDevice,
      deviceName,
      model,
      lastVerifiedAt: 'Just now (OTP Verified)',
      deviceId: `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-BOUND`
    };

    setStudentData((prev) => ({
      ...prev,
      registeredDevice: updatedDevice
    }));

    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: studentData.email,
      role: 'STUDENT',
      action: 'DEVICE_RE_REGISTERED',
      entity: 'StudentDevice',
      entityId: updatedDevice.deviceId,
      previousState: 'REVOKED',
      newState: 'TRUSTED_BOUND',
      reason: 'Student completed 2FA Device Recovery challenge',
      ipAddress: '10.0.12.90'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f5] text-[#191c1d] w-full max-w-full overflow-x-hidden">
      {/* Top Navbar Switcher */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        isStudentLoggedIn={isStudentLoggedIn}
        isTeacherLoggedIn={isTeacherLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-full overflow-x-hidden">
        {/* VIEW 1: STUDENT MOBILE APP */}
        {currentRole === 'student' && (
          <div
            className={`w-full transition-all duration-300 ${
              isPhoneFrame
                ? 'max-w-[430px] my-6 border-8 border-[#191c1d] rounded-[48px] shadow-2xl overflow-hidden min-h-[880px] bg-[#f3f4f5] relative ring-1 ring-black/10'
                : 'w-full'
            }`}
          >
            {/* If Student is Logged Out -> Show Student Login Screen */}
            {!isStudentLoggedIn ? (
              <StudentLogin
                onLoginSuccess={() => setIsStudentLoggedIn(true)}
                onOpenRecovery={() => setShowDeviceRecovery(true)}
                onSwitchToAdmin={() => setCurrentRole('admin')}
                onSwitchToTeacher={() => setCurrentRole('teacher')}
              />
            ) : isVerifying ? (
              /* If Student is in Active Verification mode */
              <StudentVerification
                student={studentData}
                lecture={activeLecture}
                onAbort={() => setIsVerifying(false)}
                onVerificationComplete={handleVerificationComplete}
              />
            ) : (
              /* If Student is navigating standard tabs */
              <>
                {studentTab === 'home' && (
                  <StudentHome
                    student={studentData}
                    activeLecture={activeLecture}
                    upcomingLectures={upcomingLectures}
                    attendanceHistory={attendanceHistory}
                    onStartVerification={() => setIsVerifying(true)}
                    onNavigateHistory={() => setStudentTab('history')}
                    onNavigateProfile={() => setStudentTab('profile')}
                    onRequestCorrection={(rec) => setCorrectionTargetRecord(rec)}
                  />
                )}

                {studentTab === 'history' && (
                  <StudentHistory
                    student={studentData}
                    records={attendanceHistory}
                    onRequestCorrection={(rec) => setCorrectionTargetRecord(rec)}
                    onNavigateHome={() => setStudentTab('home')}
                    onNavigateProfile={() => setStudentTab('profile')}
                  />
                )}

                {studentTab === 'profile' && (
                  <StudentProfileView
                    student={studentData}
                    onLogout={() => setIsStudentLoggedIn(false)}
                    onOpenDeviceRecovery={() => setShowDeviceRecovery(true)}
                  />
                )}

                {/* Mobile Bottom Navigation Bar */}
                <BottomNav
                  currentTab={studentTab}
                  onSelectTab={(tab) => setStudentTab(tab)}
                />
              </>
            )}
          </div>
        )}

        {/* VIEW 2: TEACHER LIVE DASHBOARD / LOGIN */}
        {currentRole === 'teacher' && (
          !isTeacherLoggedIn ? (
            <TeacherLogin
              onLoginSuccess={() => setIsTeacherLoggedIn(true)}
              onSwitchToStudent={() => setCurrentRole('student')}
              onSwitchToAdmin={() => setCurrentRole('admin')}
            />
          ) : (
            <TeacherDashboard
              lectures={lectures}
              currentLecture={activeLecture}
              onSelectLecture={handleSelectLecture}
              onCreateLecture={handleCreateLecture}
              onUpdateLecture={handleUpdateLecture}
              onDeleteLecture={handleDeleteLecture}
              onEndAttendance={handleEndAttendance}
              students={classStudents}
              onUpdateStudentStatus={handleTeacherOverride}
              onNavigateHome={() => setCurrentRole('student')}
              onLogout={() => setIsTeacherLoggedIn(false)}
            />
          )
        )}

        {/* VIEW 3: INSTITUTIONAL OPERATIONS & AUDIT / ADMIN LOGIN */}
        {currentRole === 'admin' && (
          !isAdminLoggedIn ? (
            <AdminLogin
              onLoginSuccess={() => setIsAdminLoggedIn(true)}
              onSwitchToStudent={() => setCurrentRole('student')}
              onSwitchToTeacher={() => setCurrentRole('teacher')}
            />
          ) : (
            <AdminPortal
              auditLogs={auditLogs}
              lectures={lectures}
              onAddAuditLog={(log) => setAuditLogs((prev) => [log, ...prev])}
              onLogout={() => setIsAdminLoggedIn(false)}
            />
          )
        )}
      </div>

      {/* Global Modals */}
      {correctionTargetRecord && (
        <CorrectionModal
          record={correctionTargetRecord}
          onClose={() => setCorrectionTargetRecord(null)}
          onSubmitCorrection={handleSubmitCorrection}
        />
      )}

      {showDeviceRecovery && (
        <DeviceRecoveryModal
          student={studentData}
          onClose={() => setShowDeviceRecovery(false)}
          onConfirmNewDevice={handleConfirmNewDevice}
        />
      )}
    </div>
  );
}
