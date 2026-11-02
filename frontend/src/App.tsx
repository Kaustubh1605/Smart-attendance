import React, { useState, useEffect } from 'react';
import {
  CURRENT_STUDENT,
  TODAY_LECTURES,
  INITIAL_ATTENDANCE_HISTORY,
  MOCK_CLASS_STUDENTS,
  INITIAL_AUDIT_LOGS,
  MOCK_STUDY_MATERIALS,
  MOCK_STUDENT_SUBJECTS,
  generateUniqueId,
  AVATAR_URL,
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
  SubjectAttendance,
} from './types';
import { Navbar } from './components/Navbar';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StudentPortal } from './pages/StudentPortal';
import { TeacherPortal } from './pages/TeacherPortal';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { CorrectionModal } from './components/CorrectionModal';
import { DeviceRecoveryModal } from './components/DeviceRecoveryModal';

const LOCAL_STORAGE_KEY_LECTURES = 'smartattend_lectures';
const LOCAL_STORAGE_KEY_ACTIVE_LEC = 'smartattend_active_lecture_id';
const LOCAL_STORAGE_KEY_ROSTER = 'smartattend_lecture_attendance_map';
const LOCAL_STORAGE_KEY_HISTORY = 'smartattend_attendance_history';
const LOCAL_STORAGE_KEY_SUBJECTS = 'smartattend_dynamic_subjects';

/**
 * Computes a completely synchronized list of subjects for students and teachers,
 * ensuring newly created subjects in Teacher Portal instantly appear in Student Portal.
 */
function computeDynamicSubjects(
  currentLectures: Lecture[],
  history: AttendanceRecord[],
  baseSubjects: SubjectAttendance[] = MOCK_STUDENT_SUBJECTS
): SubjectAttendance[] {
  const subjectMap = new Map<string, SubjectAttendance>();

  // 1. Seed with base student subjects
  baseSubjects.forEach((sub) => {
    const codeKey = sub.code.toUpperCase().trim();
    subjectMap.set(codeKey, { ...sub, code: codeKey });
  });

  // 2. Ensure every lecture (including teacher-created lectures) is in the subject map
  currentLectures.forEach((lec) => {
    const code = (lec.code || '').toUpperCase().trim();
    if (!code) return;
    const existing = subjectMap.get(code);
    if (existing) {
      subjectMap.set(code, {
        ...existing,
        name: lec.name || existing.name,
        instructor: lec.instructor || existing.instructor,
        room: lec.room || existing.room,
        schedule: lec.timeSlot || existing.schedule,
      });
    } else {
      subjectMap.set(code, {
        id: `subj-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        code: code,
        name: lec.name || `${code} Course`,
        instructor: lec.instructor || 'Prof. Faculty',
        totalLectures: 0,
        present: 0,
        absent: 0,
        needsReview: 0,
        percentage: 100,
        room: lec.room || 'Room 204',
        schedule: lec.timeSlot || 'Mon, Wed • 10:00 AM',
        isBelowThreshold: false,
      });
    }
  });

  // 3. Ensure any subjects from attendance history are in the map
  history.forEach((rec) => {
    const code = (rec.lectureCode || '').toUpperCase().trim();
    if (!code) return;
    if (!subjectMap.has(code)) {
      subjectMap.set(code, {
        id: `subj-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        code: code,
        name: rec.subjectName || `${code} Course`,
        instructor: 'Prof. Faculty',
        totalLectures: 0,
        present: 0,
        absent: 0,
        needsReview: 0,
        percentage: 100,
        room: rec.room || 'Room 204',
        schedule: '10:00 AM - 11:00 AM',
        isBelowThreshold: false,
      });
    }
  });

  // 4. Dynamically recalculate attendance stats from actual records
  const result: SubjectAttendance[] = [];
  subjectMap.forEach((sub) => {
    const code = sub.code.toUpperCase();
    const relevantRecords = history.filter(
      (r) =>
        (r.lectureCode || '').toUpperCase().trim() === code ||
        (r.subjectName && sub.name && (r.subjectName.toLowerCase().includes(sub.name.toLowerCase()) || sub.name.toLowerCase().includes(r.subjectName.toLowerCase())))
    );

    if (relevantRecords.length > 0) {
      const total = relevantRecords.length;
      const pres = relevantRecords.filter((r) => r.status === 'present' || r.status === 'probable').length;
      const abs = relevantRecords.filter((r) => r.status === 'absent').length;
      const rev = relevantRecords.filter((r) => r.status === 'needs_review').length;
      const pct = total > 0 ? Math.round((pres / total) * 1000) / 10 : 100;
      result.push({
        ...sub,
        totalLectures: total,
        present: pres,
        absent: abs,
        needsReview: rev,
        percentage: pct,
        isBelowThreshold: pct < 75,
      });
    } else {
      result.push({
        ...sub,
        totalLectures: sub.totalLectures || 0,
        present: sub.present || 0,
        absent: sub.absent || 0,
        percentage: sub.totalLectures > 0 ? sub.percentage : 100,
        isBelowThreshold: false,
      });
    }
  });

  return result;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Global View / Role State
  let currentRole: UserRole = 'student';
  if (location.pathname.startsWith('/teacher')) currentRole = 'teacher';
  if (location.pathname.startsWith('/admin')) currentRole = 'admin';
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  // Separate Role Authentication States
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState<boolean>(false);
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Student State
  const [studentTab, setStudentTab] = useState<'home' | 'history' | 'materials' | 'profile'>('home');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<StudentProfile>(CURRENT_STUDENT);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ATTENDANCE_HISTORY;
  });

  // Dynamic Subjects State (Automatically updated when teacher creates a subject or student marks attendance)
  const [dynamicSubjects, setDynamicSubjects] = useState<SubjectAttendance[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SUBJECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return computeDynamicSubjects(TODAY_LECTURES, INITIAL_ATTENDANCE_HISTORY, MOCK_STUDENT_SUBJECTS);
  });

  // Study Materials State (Shared across student and teacher workspaces)
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(MOCK_STUDY_MATERIALS);
  const [selectedMaterialSubject, setSelectedMaterialSubject] = useState<string | null>(null);

  // Modals
  const [correctionTargetRecord, setCorrectionTargetRecord] = useState<AttendanceRecord | null>(null);
  const [showDeviceRecovery, setShowDeviceRecovery] = useState<boolean>(false);

  // Teacher / Class / Lecture State with localStorage fallback
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LECTURES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return TODAY_LECTURES;
  });

  const [activeLectureId, setActiveLectureId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_LEC);
      if (saved && saved.trim()) return saved;
    } catch (e) {}
    return TODAY_LECTURES[0]?.id || 'lec-1';
  });

  // Isolated per-lecture attendance rosters: new lectures start with 0 demo students!
  const [lectureAttendanceMap, setLectureAttendanceMap] = useState<Record<string, StudentAttendanceItem[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROSTER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {
      'lec-1': MOCK_CLASS_STUDENTS,
      'lec-2': MOCK_CLASS_STUDENTS.slice(0, 5),
      'lec-3': MOCK_CLASS_STUDENTS.slice(0, 4),
    };
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Auto-sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_LECTURES, JSON.stringify(lectures));
    } catch (e) {}
  }, [lectures]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_LEC, activeLectureId);
    } catch (e) {}
  }, [activeLectureId]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ROSTER, JSON.stringify(lectureAttendanceMap));
    } catch (e) {}
  }, [lectureAttendanceMap]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(attendanceHistory));
    } catch (e) {}
  }, [attendanceHistory]);

  // Synchronize dynamic subjects whenever lectures or attendance history changes
  useEffect(() => {
    setDynamicSubjects((prev) => {
      const updated = computeDynamicSubjects(lectures, attendanceHistory, prev);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [lectures, attendanceHistory]);

  // Real-time Cross-tab synchronization via BroadcastChannel & storage events
  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('smartattend_channel') : null;

    if (channel) {
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'ATTENDANCE_RECORDED') {
          const { lectureId, attendee, newRecord } = data;
          if (attendee && lectureId) {
            setLectureAttendanceMap((prev) => {
              const currentList = prev[lectureId] || [];
              const existingIdx = currentList.findIndex(
                (s) => s.studentId === attendee.studentId || (attendee.studentName && s.studentName.toLowerCase() === attendee.studentName.toLowerCase())
              );
              let updatedList: StudentAttendanceItem[];
              if (existingIdx >= 0) {
                updatedList = currentList.map((item, idx) => (idx === existingIdx ? { ...item, ...attendee } : item));
              } else {
                updatedList = [attendee, ...currentList];
              }

              setLectures((prevLecs) =>
                prevLecs.map((l) =>
                  l.id === lectureId
                    ? { ...l, attendanceCount: updatedList.length }
                    : l
                )
              );

              return { ...prev, [lectureId]: updatedList };
            });
          }
          if (newRecord) {
            setAttendanceHistory((prev) => {
              if (prev.some((r) => r.id === newRecord.id)) return prev;
              const nextHistory = [newRecord, ...prev];
              setDynamicSubjects(computeDynamicSubjects(lectures, nextHistory));
              return nextHistory;
            });
          }
        } else if (data.type === 'LECTURE_CREATED') {
          const { newLecture } = data;
          if (newLecture) {
            setLectures((prev) => {
              if (prev.some((l) => l.id === newLecture.id)) return prev;
              const nextLecs = [{ ...newLecture, attendanceCount: 0 }, ...prev];
              setDynamicSubjects(computeDynamicSubjects(nextLecs, attendanceHistory));
              return nextLecs;
            });
            setLectureAttendanceMap((prev) => ({
              ...prev,
              [newLecture.id]: prev[newLecture.id] || [],
            }));
            setActiveLectureId(newLecture.id);
          }
        } else if (data.type === 'LECTURE_DELETED') {
          const { lectureId, lectureCode, remainingLectures, remainingSubjects, newActiveId } = data;
          if (remainingLectures) {
            setLectures(remainingLectures);
          } else {
            setLectures((prev) => prev.filter((l) => l.id !== lectureId));
          }
          if (remainingSubjects) {
            setDynamicSubjects(remainingSubjects);
          }
          if (newActiveId) {
            setActiveLectureId(newActiveId);
          }
          if (lectureCode) {
            const codeUpper = (lectureCode as string).toUpperCase().trim();
            setAttendanceHistory((prev) => prev.filter((r) => (r.lectureCode || '').toUpperCase().trim() !== codeUpper));
          }
        } else if (data.type === 'SUBJECTS_UPDATED') {
          if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            setDynamicSubjects(data.subjects);
          }
        } else if (data.type === 'ACTIVE_LECTURE_CHANGED') {
          if (data.lectureId) {
            setActiveLectureId(data.lectureId);
          }
        }
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY_ROSTER && event.newValue) {
        try {
          setLectureAttendanceMap(JSON.parse(event.newValue));
        } catch (e) {}
      }
      if (event.key === LOCAL_STORAGE_KEY_LECTURES && event.newValue) {
        try {
          setLectures(JSON.parse(event.newValue));
        } catch (e) {}
      }
      if (event.key === LOCAL_STORAGE_KEY_SUBJECTS && event.newValue) {
        try {
          setDynamicSubjects(JSON.parse(event.newValue));
        } catch (e) {}
      }
      if (event.key === LOCAL_STORAGE_KEY_ACTIVE_LEC && event.newValue) {
        setActiveLectureId(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Periodic poll of backend attendees for the currently active lecture (syncs across devices/mobile phones)
  useEffect(() => {
    if (!activeLectureId) return;

    let isMounted = true;
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/qr/attendees/${activeLectureId}`);
        if (!res.ok) return;
        const attendees: any[] = await res.json();
        if (!isMounted || !Array.isArray(attendees) || attendees.length === 0) return;

        setLectureAttendanceMap((prev) => {
          const currentList = prev[activeLectureId] || [];
          let hasChange = false;
          let updatedList = [...currentList];

          attendees.forEach((att) => {
            const idx = updatedList.findIndex(
              (s) => s.studentId === att.studentId || (att.studentName && s.studentName.toLowerCase() === att.studentName.toLowerCase())
            );
            const attendeeItem: StudentAttendanceItem = {
              studentId: att.studentId,
              studentName: att.studentName || att.studentId,
              rollNo: att.rollNo || (att.studentId ? att.studentId.split('@')[0] : 'RN-101'),
              avatarUrl: att.avatarUrl || AVATAR_URL,
              status: (att.status as AttendanceStatus) || 'present',
              confidence: att.confidence ?? 98,
              time: att.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              locationMatch: att.locationMatch ?? true,
              deviceTrusted: att.deviceTrusted ?? true,
              challengeOk: att.challengeOk ?? true,
              bleDetected: att.bleDetected ?? true,
              visualEvidence: 'available',
            };

            if (idx >= 0) {
              if (updatedList[idx].status !== attendeeItem.status) {
                updatedList[idx] = { ...updatedList[idx], ...attendeeItem };
                hasChange = true;
              }
            } else {
              updatedList = [attendeeItem, ...updatedList];
              hasChange = true;
            }
          });

          if (!hasChange) return prev;

          // Synchronously update lecture attendance count
          setLectures((prevLecs) =>
            prevLecs.map((l) => (l.id === activeLectureId ? { ...l, attendanceCount: updatedList.length } : l))
          );

          return {
            ...prev,
            [activeLectureId]: updatedList,
          };
        });
      } catch (err) {
        // network or backend starting
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeLectureId]);

  // Sync active lecture with backend so any new lecture started by teacher instantly shows on student account
  useEffect(() => {
    let isMounted = true;
    const syncActiveLectureFromBackend = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/lectures/active`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data || !data.sessionId) return;

        if (data.sessionId && data.sessionId !== activeLectureId) {
          setActiveLectureId(data.sessionId);
          setLectures((prev) => {
            const exists = prev.find((l) => l.id === data.sessionId);
            if (exists) {
              return prev.map((l) => (l.id === data.sessionId ? { ...l, status: 'active' } : l));
            }
            const newLec: Lecture = {
              id: data.sessionId,
              name: data.lectureName || `${data.lectureCode} Lecture`,
              code: data.lectureCode || 'LEC-101',
              className: 'BCA-A',
              instructor: data.instructor || 'Prof. Sharma',
              room: data.room || 'Room 204',
              timeSlot: data.timeSlot || 'Live Session',
              duration: data.duration || '60m',
              status: 'active',
              attendanceCount: 0,
              geofence: { lat: 19.9975, lng: 73.7898, radiusMeters: 35 },
              bleBeaconId: 'BEACON-HALL-LIVE',
            };
            return [newLec, ...prev];
          });
        }
      } catch (e) {
        // ignore network error
      }
    };

    syncActiveLectureFromBackend();
    const interval = setInterval(syncActiveLectureFromBackend, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeLectureId]);

  const FALLBACK_DEFAULT_LECTURE: Lecture = {
    id: 'lec-default',
    code: 'BCA 301',
    name: 'No Active Lecture',
    className: 'BCA-A',
    instructor: 'Faculty',
    room: 'Room 204',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    timeSlot: '10:00 AM – 11:00 AM',
    duration: '1h',
    status: 'upcoming',
    attendanceCount: 0,
    geofence: { lat: 19.9975, lng: 73.7898, radiusMeters: 30 },
    bleBeaconId: 'BEACON-HALL-204-UUID',
  };

  const activeLecture = (lectures && lectures.length > 0)
    ? (lectures.find((l) => l.id === activeLectureId) || lectures[0])
    : FALLBACK_DEFAULT_LECTURE;
  const currentLectureStudents = lectureAttendanceMap[activeLectureId] || [];
  const upcomingLectures = (lectures && lectures.length > 0)
    ? lectures.filter((l) => l.id !== activeLecture.id)
    : [];

  const handleSelectLecture = (lecture: Lecture) => {
    setActiveLectureId(lecture.id);

    // Notify backend so all student devices sync instantly
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/lectures/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: lecture.id,
        lectureCode: lecture.code,
        lectureName: lecture.name,
        room: lecture.room,
        instructor: lecture.instructor,
        timeSlot: lecture.timeSlot,
        duration: lecture.duration,
        status: 'active',
      }),
    }).catch(() => {});

    try {
      const channel = new BroadcastChannel('smartattend_channel');
      channel.postMessage({ type: 'ACTIVE_LECTURE_CHANGED', lectureId: lecture.id });
      channel.close();
    } catch (e) {}
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
    // Explicitly initialize with an EMPTY attendance roster: 0 demo students!
    setLectureAttendanceMap((prev) => ({
      ...prev,
      [newLecture.id]: [],
    }));
    const updatedLecs = [{ ...newLecture, attendanceCount: 0 }, ...lectures];
    setLectures(updatedLecs);
    setActiveLectureId(newLecture.id);

    // Immediately update dynamic subjects so Student Portal's Subjects tab reflects the new course
    const updatedSubjects = computeDynamicSubjects(updatedLecs, attendanceHistory, dynamicSubjects);
    setDynamicSubjects(updatedSubjects);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updatedSubjects));
      localStorage.setItem(LOCAL_STORAGE_KEY_LECTURES, JSON.stringify(updatedLecs));
    } catch (e) {}

    // Broadcast to backend so student portal sees this new lecture immediately
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/lectures/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: newLecture.id,
        lectureCode: newLecture.code,
        lectureName: newLecture.name,
        room: newLecture.room,
        instructor: newLecture.instructor,
        timeSlot: newLecture.timeSlot,
        duration: newLecture.duration,
        status: 'active',
      }),
    }).catch(() => {});

    try {
      const channel = new BroadcastChannel('smartattend_channel');
      channel.postMessage({ type: 'LECTURE_CREATED', newLecture });
      channel.postMessage({ type: 'SUBJECTS_UPDATED', subjects: updatedSubjects });
      channel.close();
    } catch (e) {}
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

    // Remaining lectures after deletion
    const updatedLecs = lectures.filter((l) => l.id !== lectureId);
    setLectures(updatedLecs);

    // If active lecture is being deleted, reassign activeLectureId to the next available lecture
    let nextActiveId = activeLectureId;
    if (activeLectureId === lectureId) {
      nextActiveId = updatedLecs.length > 0 ? updatedLecs[0].id : '';
      setActiveLectureId(nextActiveId);
    }

    // Purge roster for this lecture
    setLectureAttendanceMap((prev) => {
      const next = { ...prev };
      delete next[lectureId];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_ROSTER, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Purge attendance history records for this lecture/subject
    const targetCode = (targetLecture.code || '').toUpperCase().trim();
    const targetName = (targetLecture.name || '').toLowerCase().trim();
    let updatedHistory = attendanceHistory;
    if (deleteAttendance) {
      updatedHistory = attendanceHistory.filter((r) => {
        const rCode = (r.lectureCode || '').toUpperCase().trim();
        const rName = (r.subjectName || '').toLowerCase().trim();
        return rCode !== targetCode && rName !== targetName;
      });
      setAttendanceHistory(updatedHistory);
    }

    // Recompute dynamic subjects and remove any course that no longer exists in lectures or history
    const updatedSubjects = computeDynamicSubjects(updatedLecs, updatedHistory).filter((sub) => {
      const sCode = sub.code.toUpperCase().trim();
      return (
        updatedLecs.some((l) => (l.code || '').toUpperCase().trim() === sCode) ||
        updatedHistory.some((r) => (r.lectureCode || '').toUpperCase().trim() === sCode)
      );
    });
    setDynamicSubjects(updatedSubjects);

    // Persist all updated stores to localStorage immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_LECTURES, JSON.stringify(updatedLecs));
      localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_LEC, nextActiveId);
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updatedSubjects));
    } catch (e) {}

    // Broadcast real-time cross-tab synchronization
    try {
      const channel = new BroadcastChannel('smartattend_channel');
      channel.postMessage({
        type: 'LECTURE_DELETED',
        lectureId,
        lectureCode: targetLecture.code,
        remainingLectures: updatedLecs,
        remainingSubjects: updatedSubjects,
        newActiveId: nextActiveId,
      });
      channel.postMessage({
        type: 'SUBJECTS_UPDATED',
        subjects: updatedSubjects,
      });
      channel.close();
    } catch (e) {}

    // Delete from backend if backend is running
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/lectures/${lectureId}`, {
      method: 'DELETE',
    }).catch(() => {});

    // Audit Log Entry
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
      reason: `Faculty permanently deleted lecture ${targetLecture.name} (${targetLecture.code}) from all portal rosters`,
      ipAddress: '10.0.1.15',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
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
    localStorage.removeItem('token');
  };

  const handleStudentLoginSuccess = (name: string, email: string, token: string) => {
    localStorage.setItem('token', token);
    setStudentData(prev => ({
      ...prev,
      name: name,
      email: email,
      studentId: email.split('@')[0], // derived from email
    }));
    setIsStudentLoggedIn(true);
  };

  const handleTeacherLoginSuccess = (name: string, email: string, token: string) => {
    localStorage.setItem('token', token);
    setIsTeacherLoggedIn(true);
  };

  const handleAdminLoginSuccess = (name: string, email: string, token: string) => {
    localStorage.setItem('token', token);
    setIsAdminLoggedIn(true);
  };

  // Student verification complete handler
  const handleVerificationComplete = (lecture: Lecture, result?: QRVerificationResult) => {
    setIsVerifying(false);
    const finalAttendanceStatus: AttendanceStatus = result?.attendanceStatus || 'present';
    const confidenceScore = result?.confidenceScore ?? 98;

    // Exact local device clock time and date format
    const now = new Date();
    const deviceTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const year = now.getFullYear();
    const monthNum = String(now.getMonth() + 1).padStart(2, '0');
    const dayNum = String(now.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${monthNum}-${dayNum}`;
    const localDay = String(now.getDate()).padStart(2, '0');
    const localMonthShort = now.toLocaleString('en-US', { month: 'short' });

    // Add record to history if not already present
    const newRecord: AttendanceRecord = {
      id: generateUniqueId('rec'),
      date: localDateStr,
      day: localDay,
      month: localMonthShort,
      lectureCode: lecture.code.toUpperCase().trim(),
      subjectName: lecture.name,
      lectureType: `Lecture - ${lecture.room}`,
      room: lecture.room,
      status: finalAttendanceStatus,
      evidence: {
        ...(result?.evidence || {}),
        timestamp: deviceTimeStr,
        locationStatus: result?.evidence?.locationStatus || 'verified',
        locationDistanceMeters: result?.evidence?.locationDistanceMeters || 3.8,
        deviceStatus: result?.evidence?.deviceStatus || 'trusted',
        dynamicChallengeVerified: true,
        challengeLatencyMs: result?.evidence?.challengeLatencyMs || 220,
        bleDetected: result?.evidence?.bleDetected ?? true,
        confidenceScore: confidenceScore,
        notes: `Multi-factor attendance confirmed at device time ${deviceTimeStr}.`,
      },
    };

    setAttendanceHistory((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (e) {}
      const updatedSubs = computeDynamicSubjects(lectures, updated, dynamicSubjects);
      setDynamicSubjects(updatedSubs);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updatedSubs));
      } catch (e) {}
      return updated;
    });

    // Also update in teacher roster for this specific lecture with device timestamp
    const scannedAttendee: StudentAttendanceItem = {
      studentId: studentData.studentId || 'STU-' + Math.floor(1000 + Math.random() * 9000),
      studentName: studentData.name,
      rollNo: studentData.rollNo || (studentData.email ? studentData.email.split('@')[0] : 'RN-101'),
      avatarUrl: studentData.avatarUrl || AVATAR_URL,
      status: finalAttendanceStatus,
      confidence: confidenceScore,
      time: deviceTimeStr,
      locationMatch: result?.evidence?.locationStatus === 'verified',
      deviceTrusted: result?.evidence?.deviceStatus === 'trusted',
      challengeOk: true,
      bleDetected: result?.evidence?.bleDetected ?? true,
      visualEvidence: 'available',
    };

    setLectureAttendanceMap((prev) => {
      const currentList = prev[lecture.id] || [];
      const existingIdx = currentList.findIndex(
        (s) => s.studentId === scannedAttendee.studentId || (scannedAttendee.studentName && s.studentName.toLowerCase() === scannedAttendee.studentName.toLowerCase())
      );
      let updatedList: StudentAttendanceItem[];
      if (existingIdx >= 0) {
        updatedList = currentList.map((item, idx) =>
          idx === existingIdx
            ? { ...item, status: finalAttendanceStatus, confidence: confidenceScore, time: deviceTimeStr }
            : item
        );
      } else {
        updatedList = [scannedAttendee, ...currentList];
      }

      // Synchronously update lectures list attendance count
      setLectures((prevLecs) =>
        prevLecs.map((l) =>
          l.id === lecture.id
            ? { ...l, attendanceCount: updatedList.length }
            : l
        )
      );

      return {
        ...prev,
        [lecture.id]: updatedList,
      };
    });

    setActiveLectureId(lecture.id);

    try {
      const channel = new BroadcastChannel('smartattend_channel');
      channel.postMessage({
        type: 'ATTENDANCE_RECORDED',
        lectureId: lecture.id,
        attendee: scannedAttendee,
        newRecord: newRecord,
      });
      channel.close();
    } catch (e) {}

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
    const student = currentLectureStudents.find((s) => s.studentId === studentId);
    if (!student) return;

    const prevStatus = student.status;
    setLectureAttendanceMap((prev) => {
      const currentList = prev[activeLectureId] || [];
      return {
        ...prev,
        [activeLectureId]: currentList.map((s) =>
          s.studentId === studentId
            ? {
                ...s,
                status: newStatus,
                confidence: newStatus === 'present' ? 100 : newStatus === 'probable' ? 75 : 0
              }
            : s
        ),
      };
    });

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
    <div className="flex flex-col min-h-screen bg-[#f3f4f5] text-[#191c1d] w-full max-w-full">
      {/* Top Navbar Switcher */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={(role) => navigate(`/${role}`)}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        isStudentLoggedIn={isStudentLoggedIn}
        isTeacherLoggedIn={isTeacherLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-full">
                <Routes>
          <Route path="/" element={<Navigate to="/student" replace />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/student/*" element={
            <StudentPortal
              isPhoneFrame={isPhoneFrame}
              isStudentLoggedIn={isStudentLoggedIn}
              setIsStudentLoggedIn={setIsStudentLoggedIn}
              onLoginSuccess={handleStudentLoginSuccess}
              studentData={studentData}
              activeLecture={activeLecture}
              upcomingLectures={upcomingLectures}
              lectures={lectures}
              subjects={dynamicSubjects}
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
              isPhoneFrame={isPhoneFrame}
              isTeacherLoggedIn={isTeacherLoggedIn}
              setIsTeacherLoggedIn={setIsTeacherLoggedIn}
              onLoginSuccess={handleTeacherLoginSuccess}
              lectures={lectures}
              activeLecture={activeLecture}
              handleSelectLecture={handleSelectLecture}
              handleCreateLecture={handleCreateLecture}
              handleUpdateLecture={handleUpdateLecture}
              handleDeleteLecture={handleDeleteLecture}
              handleEndAttendance={handleEndAttendance}
              classStudents={currentLectureStudents}
              handleTeacherOverride={handleTeacherOverride}
              studyMaterials={studyMaterials}
              handleAddStudyMaterial={handleAddStudyMaterial}
              handleUpdateStudyMaterial={handleUpdateStudyMaterial}
              handleDeleteStudyMaterial={handleDeleteStudyMaterial}
            />
          } />
          <Route path="/admin/*" element={
            <AdminPortalPage
              isPhoneFrame={isPhoneFrame}
              isAdminLoggedIn={isAdminLoggedIn}
              setIsAdminLoggedIn={setIsAdminLoggedIn}
              onLoginSuccess={handleAdminLoginSuccess}
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
