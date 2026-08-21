import React, { useState } from 'react';
import {
  CURRENT_STUDENT,
  TODAY_LECTURES,
  INITIAL_ATTENDANCE_HISTORY,
  MOCK_CLASS_STUDENTS,
  INITIAL_AUDIT_LOGS,
  MOCK_STUDY_MATERIALS,
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
  StudyMaterial,
  QRVerificationResult,
} from './types';
import { Navbar } from './components/Navbar';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StudentPortal } from './pages/StudentPortal';
import { TeacherPortal } from './pages/TeacherPortal';
import { AdminPortalPage } from './pages/AdminPortalPage';
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
  const [studentTab, setStudentTab] = useState<'home' | 'history' | 'materials' | 'profile'>('home');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<StudentProfile>(CURRENT_STUDENT);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_HISTORY);

  // Study Materials State (Shared across student and teacher workspaces)
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(MOCK_STUDY_MATERIALS);
  const [selectedMaterialSubject, setSelectedMaterialSubject] = useState<string | null>(null);

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

  const handleDeleteLecture = (lectureId: string, isArchive = false, deleteAttendance = true) => {
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
        reason: `Faculty archived lecture ${targetLecture.name}; historical attendance records preserved`,
        ipAddress: '10.0.1.15'
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    } else {
      // Permanently remove the lecture
      setLectures((prev) => prev.filter((l) => l.id !== lectureId));

      // If deleteAttendance is true, purge the corresponding attendance history records
      if (deleteAttendance) {
        setAttendanceHistory((prev) =>
          prev.filter((r) => r.lectureId !== lectureId && r.lectureCode !== targetLecture.code)
        );
        // Also recalculate subject attendance metrics for the student profile
        setStudentData((prev) => {
          const updatedSubjects = prev.subjectBreakdown.map((sub) => {
            if (sub.code === targetLecture.code) {
              const newTotal = Math.max(0, sub.totalLectures - 1);
              const newPresent = Math.min(sub.present, newTotal);
              const newPercentage = newTotal > 0 ? Math.round((newPresent / newTotal) * 100) : 0;
              return { ...sub, totalLectures: newTotal, present: newPresent, percentage: newPercentage };
            }
            return sub;
          });
          const totalPresent = updatedSubjects.reduce((acc, s) => acc + s.present, 0);
          const totalLectures = updatedSubjects.reduce((acc, s) => acc + s.totalLectures, 0);
          const overall = totalLectures > 0 ? Math.round((totalPresent / totalLectures) * 100) : 0;
          return { ...prev, subjectBreakdown: updatedSubjects, overallAttendance: overall };
        });
      }

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
        action: 'LECTURE_PERMANENTLY_DELETED',
        entity: 'Lecture',
        entityId: lectureId,
        previousState: targetLecture.status.toUpperCase(),
        newState: 'PERMANENTLY_DELETED',
        reason: `Faculty permanently deleted lecture ${targetLecture.name} and associated attendance records`,
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
      newState: 'COMPLETED',
      reason: `Faculty ended live attendance capture for ${targetLecture?.name || 'Lecture'}`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Study Materials Handlers
  const handleAddStudyMaterial = (newMaterial: StudyMaterial) => {
    setStudyMaterials((prev) => [newMaterial, ...prev]);
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'STUDY_MATERIAL_PUBLISHED',
      entity: 'StudyMaterial',
      entityId: newMaterial.id,
      newState: `${newMaterial.subjectCode} - ${newMaterial.title}`,
      reason: `Faculty published new ${newMaterial.type.toUpperCase()} resource: ${newMaterial.title}`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleUpdateStudyMaterial = (updatedMaterial: StudyMaterial) => {
    setStudyMaterials((prev) => prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m)));
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'STUDY_MATERIAL_UPDATED',
      entity: 'StudyMaterial',
      entityId: updatedMaterial.id,
      newState: `${updatedMaterial.subjectCode} - ${updatedMaterial.title}`,
      reason: `Faculty updated study material details for ${updatedMaterial.title}`,
      ipAddress: '10.0.1.15'
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  const handleDeleteStudyMaterial = (materialId: string) => {
    const target = studyMaterials.find((m) => m.id === materialId);
    setStudyMaterials((prev) => prev.filter((m) => m.id !== materialId));
    const auditEntry: AuditLogEntry = {
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'prof.sharma@springfield.edu',
      role: 'TEACHER',
      action: 'STUDY_MATERIAL_DELETED',
      entity: 'StudyMaterial',
      entityId: materialId,
      newState: 'DELETED',
      reason: `Faculty deleted study resource: ${target?.title || materialId}`,
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
  const handleVerificationComplete = (lecture: Lecture, result?: QRVerificationResult) => {
    setIsVerifying(false);
    const finalAttendanceStatus: AttendanceStatus = result?.attendanceStatus || 'present';
    const confidenceScore = result?.confidenceScore ?? 98;
    const timeStr = result?.evidence?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add record to history if not already present
    const newRecord: AttendanceRecord = {
      id: generateUniqueId('rec'),
      date: new Date().toISOString().slice(0, 10),
      day: new Date().getDate().toString(),
      month: new Date().toLocaleString('default', { month: 'short' }),
      lectureCode: lecture.code,
      subjectName: lecture.name,
      lectureType: `Lecture - ${lecture.room}`,
      room: lecture.room,
      status: finalAttendanceStatus,
      evidence: result?.evidence || {
        timestamp: timeStr,
        locationStatus: 'verified',
        locationDistanceMeters: 4.8,
        deviceStatus: 'trusted',
        dynamicChallengeVerified: true,
        challengeLatencyMs: 380,
        bleDetected: true,
        confidenceScore: 98,
        notes: 'Verified via live classroom 10s QR challenge & GPS geofence match.'
      }
    };

    setAttendanceHistory((prev) => [newRecord, ...prev]);

    // Also update in teacher roster
    setClassStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentData.studentId
          ? { ...s, status: finalAttendanceStatus, confidence: confidenceScore, time: timeStr }
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
      newState: `${finalAttendanceStatus.toUpperCase()} (${confidenceScore}% Multi-Factor Conf)`,
      reason: `10s QR Challenge + GPS (${lecture.geofence.radiusMeters}m geofence) + Bound Device`,
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
                <Routes>
          <Route path="/" element={<Navigate to="/student" />} />
          <Route path="/student/*" element={
            <StudentPortal
              isPhoneFrame={isPhoneFrame}
              isStudentLoggedIn={isStudentLoggedIn}
              setIsStudentLoggedIn={setIsStudentLoggedIn}
              studentData={studentData}
              activeLecture={activeLecture}
              upcomingLectures={upcomingLectures}
              attendanceHistory={attendanceHistory}
              studyMaterials={studyMaterials}
              selectedMaterialSubject={selectedMaterialSubject}
              setSelectedMaterialSubject={setSelectedMaterialSubject}
              correctionTargetRecord={correctionTargetRecord}
              setCorrectionTargetRecord={setCorrectionTargetRecord}
              showDeviceRecovery={showDeviceRecovery}
              setShowDeviceRecovery={setShowDeviceRecovery}
              handleVerificationComplete={handleVerificationComplete}
              handleSubmitCorrection={handleSubmitCorrection}
              handleConfirmNewDevice={handleConfirmNewDevice}
              isVerifying={isVerifying}
              setIsVerifying={setIsVerifying}
            />
          } />
          <Route path="/teacher/*" element={
            <TeacherPortal
              isTeacherLoggedIn={isTeacherLoggedIn}
              setIsTeacherLoggedIn={setIsTeacherLoggedIn}
              lectures={lectures}
              activeLecture={activeLecture}
              handleSelectLecture={handleSelectLecture}
              handleCreateLecture={handleCreateLecture}
              handleUpdateLecture={handleUpdateLecture}
              handleDeleteLecture={handleDeleteLecture}
              handleEndAttendance={handleEndAttendance}
              classStudents={classStudents}
              handleTeacherOverride={handleTeacherOverride}
              studyMaterials={studyMaterials}
              handleAddStudyMaterial={handleAddStudyMaterial}
              handleUpdateStudyMaterial={handleUpdateStudyMaterial}
              handleDeleteStudyMaterial={handleDeleteStudyMaterial}
            />
          } />
          <Route path="/admin/*" element={
            <AdminPortalPage
              isAdminLoggedIn={isAdminLoggedIn}
              setIsAdminLoggedIn={setIsAdminLoggedIn}
              auditLogs={auditLogs}
              lectures={lectures}
              setAuditLogs={setAuditLogs}
            />
          } />
        </Routes>
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
