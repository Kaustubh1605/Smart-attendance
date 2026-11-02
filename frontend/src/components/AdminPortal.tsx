import React, { useState, useEffect } from 'react';
import {
  LOGO_URL,
  MOCK_ADMIN_STUDENTS,
  MOCK_ADMIN_TEACHERS,
  MOCK_CLASSROOMS,
  MOCK_TIMETABLE,
  MOCK_INSTITUTION_SETTINGS,
  MOCK_SUBJECTS,
  generateUniqueId,
} from '../data/mockData';
import {
  AuditLogEntry,
  Lecture,
  AdminStudent,
  AdminTeacher,
  ClassroomItem,
  TimetableSlot,
  InstitutionSettings,
} from '../types';
import { HelpSupportModal } from './HelpSupportModal';
import { AttendanceTrendsChart } from './AttendanceTrendsChart';

const MOCK_TREND_DATA = [
  { date: 'Mon', attendanceRate: 85 },
  { date: 'Tue', attendanceRate: 88 },
  { date: 'Wed', attendanceRate: 82 },
  { date: 'Thu', attendanceRate: 86 },
  { date: 'Fri', attendanceRate: 89 },
];

const MOCK_AT_RISK_STUDENTS = [
  { name: 'Alice Smith', studentId: 'S-1042', missedClasses: 12 },
  { name: 'Bob Johnson', studentId: 'S-1043', missedClasses: 10 },
  { name: 'Charlie Brown', studentId: 'S-1044', missedClasses: 8 },
  { name: 'Diana Ross', studentId: 'S-1045', missedClasses: 7 },
  { name: 'Eve Adams', studentId: 'S-1046', missedClasses: 6 },
];

interface AdminPortalProps {
  auditLogs: AuditLogEntry[];
  lectures: Lecture[];
  onAddAuditLog: (log: AuditLogEntry) => void;
  onLogout?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  auditLogs,
  lectures,
  onAddAuditLog,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'registrations' | 'students' | 'teachers' | 'classes' | 'classrooms' | 'timetable' | 'devices' | 'analytics' | 'audit' | 'settings'
  >('dashboard');

  // State for data management (with localStorage persistence)
  const [students, setStudents] = useState<AdminStudent[]>(() => {
    try {
      const saved = localStorage.getItem('smartattend_admin_students');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_ADMIN_STUDENTS;
  });

  const [teachers, setTeachers] = useState<AdminTeacher[]>(() => {
    try {
      const saved = localStorage.getItem('smartattend_admin_teachers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_ADMIN_TEACHERS;
  });

  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(MOCK_CLASSROOMS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(MOCK_TIMETABLE);
  const [settings, setSettings] = useState<InstitutionSettings>(MOCK_INSTITUTION_SETTINGS);

  const [pendingUsers, setPendingUsers] = useState<
    Array<{ id: string; name: string; email: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN'; status: string; createdAt: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('smartattend_pending_registrations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'Alice Smith', email: 'alice.smith@university.edu', role: 'STUDENT', status: 'PENDING', createdAt: '2026-08-21T10:00:00Z' },
      { id: '2', name: 'Bob Johnson', email: 'bob.j@university.edu', role: 'TEACHER', status: 'PENDING', createdAt: '2026-08-21T11:30:00Z' }
    ];
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartattend_admin_students', JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('smartattend_admin_teachers', JSON.stringify(teachers));
    } catch {}
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem('smartattend_pending_registrations', JSON.stringify(pendingUsers));
    } catch {}
  }, [pendingUsers]);

  // Real-time cross-tab sync for pending registrations from self-service registration
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartattend_pending_registrations' && e.newValue) {
        try {
          setPendingUsers(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Manual User Addition Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [enrollmentMode, setEnrollmentMode] = useState<'DIRECT' | 'PENDING'>('DIRECT');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('StudentKey2024#');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  // Student-specific fields
  const [newUserStudentId, setNewUserStudentId] = useState('');
  const [newUserRollNo, setNewUserRollNo] = useState('');
  const [newUserProgram, setNewUserProgram] = useState('BCA (3rd Sem)');
  const [newUserBatch, setNewUserBatch] = useState('2024-2027');
  const [newUserClassName, setNewUserClassName] = useState('BCA Sem 3 - Div A');
  // Teacher-specific fields
  const [newUserTeacherId, setNewUserTeacherId] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('Computer Science');
  const [newUserAssignedClasses, setNewUserAssignedClasses] = useState('BCA Sem 3 - Div A');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Filters & Searches
  const [searchStudent, setSearchStudent] = useState('');
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'active' | 'suspended' | 'low_attendance'>('ALL');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchLog, setSearchLog] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState('Monday');

  // Modals & Action States
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New States for Highlights & Photo Upload
  const [selectedHighlight, setSelectedHighlight] = useState<{ title: string; desc: string; icon: string; color: string; actionText: string } | null>(null);
  const [studentForPhotoUpload, setStudentForPhotoUpload] = useState<AdminStudent | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Selected Item for Inspect/Edit
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<AdminStudent | null>(null);
  const [showAddTimetableModal, setShowAddTimetableModal] = useState(false);
  const [newSlotSubject, setNewSlotSubject] = useState('');
  const [newSlotCode, setNewSlotCode] = useState('');
  const [newSlotTeacher, setNewSlotTeacher] = useState('Prof. Sharma');
  const [newSlotRoom, setNewSlotRoom] = useState('Room 402');
  const [newSlotClass, setNewSlotClass] = useState('BCA Sem 3 - Div A');
  const [newSlotTime, setNewSlotTime] = useState('11:30 AM - 1:00 PM');
  const [newSlotDay, setNewSlotDay] = useState('Monday');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/attendance/export', { method: 'GET' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendance_semester_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast('CSV Exported Successfully');
      } else {
        showToast('Failed to export CSV');
      }
    } catch (error) {
      showToast('Error exporting CSV');
    }
  };

  // Student Actions
  const handleToggleStudentStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextStatus = s.accountStatus === 'active' ? 'suspended' : 'active';
          onAddAuditLog({
            id: generateUniqueId('aud'),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            actor: 'admin@springfield.edu',
            role: 'ADMIN',
            action: nextStatus === 'suspended' ? 'STUDENT_SUSPENDED' : 'STUDENT_ACTIVATED',
            entity: 'StudentAccount',
            entityId: s.studentId,
            previousState: s.accountStatus.toUpperCase(),
            newState: nextStatus.toUpperCase(),
            reason: `Institutional administrative account status changed to ${nextStatus}`,
            ipAddress: '192.168.1.10',
          });
          return { ...s, accountStatus: nextStatus };
        }
        return s;
      })
    );
    showToast('Student account status updated');
  };

  const handleResetStudentDevice = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          onAddAuditLog({
            id: generateUniqueId('aud'),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            actor: 'admin@springfield.edu',
            role: 'ADMIN',
            action: 'DEVICE_BINDING_RESET',
            entity: 'StudentDevice',
            entityId: s.studentId,
            previousState: s.deviceStatus.toUpperCase(),
            newState: 'UNREGISTERED',
            reason: 'Administrative device keystore reset requested by student helpdesk',
            ipAddress: '192.168.1.10',
          });
          return { ...s, deviceStatus: 'unregistered', registeredDeviceModel: 'None' };
        }
        return s;
      })
    );
    showToast('Hardware device binding reset. Student can bind new device on next login.');
  };

  // Teacher Actions
  const handleToggleTeacherStatus = (teacherId: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === teacherId) {
          const nextStatus = t.accountStatus === 'active' ? 'inactive' : 'active';
          onAddAuditLog({
            id: generateUniqueId('aud'),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            actor: 'admin@springfield.edu',
            role: 'ADMIN',
            action: nextStatus === 'inactive' ? 'FACULTY_DEACTIVATED' : 'FACULTY_ACTIVATED',
            entity: 'FacultyAccount',
            entityId: t.teacherId,
            previousState: t.accountStatus.toUpperCase(),
            newState: nextStatus.toUpperCase(),
            reason: `Faculty portal access modified by department head`,
            ipAddress: '192.168.1.10',
          });
          return { ...t, accountStatus: nextStatus };
        }
        return t;
      })
    );
    showToast('Faculty status updated');
  };

  const handleOpenAddUserModal = (
    defaultRole: 'STUDENT' | 'TEACHER' = 'STUDENT',
    defaultMode: 'DIRECT' | 'PENDING' = 'DIRECT'
  ) => {
    setNewUserRole(defaultRole);
    setEnrollmentMode(defaultMode);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword(defaultRole === 'STUDENT' ? 'StudentKey2024#' : 'FacultyPass2024!');
    setShowNewUserPassword(false);
    setNewUserStudentId(`STU-2024-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewUserRollNo(`BCA-${Math.floor(10 + Math.random() * 90)}`);
    setNewUserProgram('BCA (3rd Sem)');
    setNewUserBatch('2024-2027');
    setNewUserClassName('BCA Sem 3 - Div A');
    setNewUserTeacherId(`TCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewUserDepartment('Computer Science');
    setNewUserAssignedClasses('BCA Sem 3 - Div A');
    setShowAddUserModal(true);
  };

  const handleRoleChange = (role: 'STUDENT' | 'TEACHER') => {
    setNewUserRole(role);
    if (role === 'STUDENT') {
      if (!newUserPassword || newUserPassword === 'FacultyPass2024!') {
        setNewUserPassword('StudentKey2024#');
      }
      if (!newUserStudentId) {
        setNewUserStudentId(`STU-2024-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } else {
      if (!newUserPassword || newUserPassword === 'StudentKey2024#') {
        setNewUserPassword('FacultyPass2024!');
      }
      if (!newUserTeacherId) {
        setNewUserTeacherId(`TCH-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please enter both name and email.');
      return;
    }

    setIsSubmittingUser(true);
    let backendSyncOk = false;

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword || (newUserRole === 'STUDENT' ? 'StudentKey2024#' : 'FacultyPass2024!'),
          role: newUserRole,
        }),
      });
      if (response.ok) {
        backendSyncOk = true;
      }
    } catch {
      backendSyncOk = false;
    }

    if (enrollmentMode === 'PENDING') {
      // Add to pending approvals queue so admin can review/approve on the Registrations tab
      const newPending = {
        id: `reg-${Date.now()}`,
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };

      setPendingUsers((prev) => [newPending, ...prev]);
      setActiveTab('registrations');
      setHighlightedId(newPending.id);
      setTimeout(() => setHighlightedId(null), 6000);

      onAddAuditLog({
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'admin@springfield.edu',
        role: 'ADMIN',
        action: 'MANUAL_PENDING_REGISTRATION',
        entity: 'PendingRegistration',
        entityId: newPending.id,
        newState: `Candidate ${newPending.name} (${newPending.email}) queued for verification by administrator${backendSyncOk ? ' [Backend Synced]' : ''}`,
        ipAddress: '192.168.1.10',
      });
      showToast(`${newUserRole === 'STUDENT' ? 'Student' : 'Faculty'} candidate queued in Registrations tab for approval!`);
    } else {
      // DIRECT ACTIVE ENROLLMENT: Instantly add to directory and navigate view
      if (newUserRole === 'STUDENT') {
        const studentId = newUserStudentId.trim() || `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`;
        const rollNo = newUserRollNo.trim() || `BCA-${Math.floor(10 + Math.random() * 90)}`;
        const newStudent: AdminStudent = {
          id: `ast-${Date.now()}`,
          studentId,
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          program: newUserProgram.trim() || 'BCA (3rd Sem)',
          batch: newUserBatch.trim() || '2024-2027',
          rollNo,
          className: newUserClassName.trim() || 'BCA Sem 3 - Div A',
          deviceStatus: 'bound',
          registeredDeviceModel: 'Standard Verified Hardware',
          accountStatus: 'active',
          attendancePercentage: 100,
        };

        setStudents((prev) => [newStudent, ...prev]);
        setActiveTab('students');
        setHighlightedId(newStudent.id);
        setTimeout(() => setHighlightedId(null), 6000);

        onAddAuditLog({
          id: generateUniqueId('aud'),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          actor: 'admin@springfield.edu',
          role: 'ADMIN',
          action: 'MANUAL_STUDENT_ENROLL',
          entity: 'StudentProfile',
          entityId: newStudent.studentId,
          newState: `Directly enrolled Student ${newStudent.name} (${newStudent.studentId}) in ${newStudent.className}${backendSyncOk ? ' [Backend Synced]' : ''}`,
          ipAddress: '192.168.1.10',
        });
        showToast(`Student ${newStudent.name} directly enrolled and activated!`);
      } else {
        const teacherId = newUserTeacherId.trim() || `TCH-${Math.floor(1000 + Math.random() * 9000)}`;
        const assigned = newUserAssignedClasses
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);

        const newTeacher: AdminTeacher = {
          id: `tch-${Date.now()}`,
          teacherId,
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          department: newUserDepartment.trim() || 'Computer Science',
          assignedClasses: assigned.length > 0 ? assigned : ['BCA Sem 3 - Div A'],
          accountStatus: 'active',
        };

        setTeachers((prev) => [newTeacher, ...prev]);
        setActiveTab('teachers');
        setHighlightedId(newTeacher.id);
        setTimeout(() => setHighlightedId(null), 6000);

        onAddAuditLog({
          id: generateUniqueId('aud'),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
          actor: 'admin@springfield.edu',
          role: 'ADMIN',
          action: 'MANUAL_FACULTY_ENROLL',
          entity: 'TeacherProfile',
          entityId: newTeacher.teacherId,
          newState: `Directly appointed Faculty ${newTeacher.name} to ${newTeacher.department}${backendSyncOk ? ' [Backend Synced]' : ''}`,
          ipAddress: '192.168.1.10',
        });
        showToast(`Faculty ${newTeacher.name} directly enrolled and activated!`);
      }
    }

    setIsSubmittingUser(false);
    setShowAddUserModal(false);
  };

  const handleApproveUser = (id: string) => {
    const user = pendingUsers.find((u) => u.id === id);
    if (!user) return;

    if (user.role === 'STUDENT') {
      const studentId = `STU-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const rollNo = `BCA-${Math.floor(10 + Math.random() * 90)}`;
      const newStudent: AdminStudent = {
        id: `ast-${Date.now()}`,
        studentId,
        name: user.name,
        email: user.email,
        program: 'BCA (3rd Sem)',
        batch: '2024-2027',
        rollNo,
        className: 'BCA Sem 3 - Div A',
        deviceStatus: 'bound',
        registeredDeviceModel: 'Android Device (Auto-bound)',
        accountStatus: 'active',
        attendancePercentage: 100,
      };

      setStudents((prev) => [newStudent, ...prev]);
      onAddAuditLog({
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'admin@springfield.edu',
        role: 'ADMIN',
        action: 'REGISTRATION_APPROVED',
        entity: 'StudentProfile',
        entityId: newStudent.studentId,
        newState: `Approved registration for student ${user.name} (${user.email})`,
        ipAddress: '192.168.1.10',
      });
      showToast(`Student ${user.name} approved & added to Student Directory!`);
    } else {
      const teacherId = `TCH-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTeacher: AdminTeacher = {
        id: `tch-${Date.now()}`,
        teacherId,
        name: user.name,
        email: user.email,
        department: 'Computer Science',
        assignedClasses: ['BCA Sem 3 - Div A'],
        accountStatus: 'active',
      };

      setTeachers((prev) => [newTeacher, ...prev]);
      onAddAuditLog({
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'admin@springfield.edu',
        role: 'ADMIN',
        action: 'REGISTRATION_APPROVED',
        entity: 'TeacherProfile',
        entityId: newTeacher.teacherId,
        newState: `Approved registration for faculty ${user.name} (${user.email})`,
        ipAddress: '192.168.1.10',
      });
      showToast(`Faculty ${user.name} approved & added to Faculty Directory!`);
    }

    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleRejectUser = (id: string) => {
    const user = pendingUsers.find((u) => u.id === id);
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    if (user) {
      onAddAuditLog({
        id: generateUniqueId('aud'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        actor: 'admin@springfield.edu',
        role: 'ADMIN',
        action: 'REGISTRATION_REJECTED',
        entity: 'RegistrationQueue',
        entityId: id,
        newState: `Rejected pending registration for ${user.name} (${user.email})`,
        ipAddress: '192.168.1.10',
      });
      showToast(`Registration request for ${user.name} was rejected.`);
    }
  };

  // Device Queue Actions
  const handleApproveDeviceChange = (studentId: string, deviceModel: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return { ...s, deviceStatus: 'bound', registeredDeviceModel: deviceModel };
        }
        return s;
      })
    );
    onAddAuditLog({
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'admin@springfield.edu',
      role: 'ADMIN',
      action: 'DEVICE_CHANGE_APPROVED',
      entity: 'StudentDevice',
      entityId: studentId,
      newState: 'TRUSTED_BOUND',
      reason: 'Admin verified student physical identity & 2FA hardware authorization token',
      ipAddress: '192.168.1.10',
    });
    showToast(`Device change approved for ${studentId}`);
  };

  const handleRejectDeviceChange = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return { ...s, deviceStatus: 'bound' };
        }
        return s;
      })
    );
    onAddAuditLog({
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'admin@springfield.edu',
      role: 'ADMIN',
      action: 'DEVICE_CHANGE_REJECTED',
      entity: 'StudentDevice',
      entityId: studentId,
      newState: 'PREVIOUS_DEVICE_RETAINED',
      reason: 'Device transfer request unverified or flagged suspicious',
      ipAddress: '192.168.1.10',
    });
    showToast(`Device change request rejected for ${studentId}`);
  };

  // Timetable Add
  const handleAddTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotSubject || !newSlotCode) return;
    const newSlot: TimetableSlot = {
      id: generateUniqueId('tt'),
      day: newSlotDay,
      time: newSlotTime,
      subject: newSlotSubject,
      code: newSlotCode.toUpperCase(),
      teacher: newSlotTeacher,
      className: newSlotClass,
      classroom: newSlotRoom,
    };
    setTimetable((prev) => [...prev, newSlot]);
    setShowAddTimetableModal(false);
    setNewSlotSubject('');
    setNewSlotCode('');
    onAddAuditLog({
      id: generateUniqueId('aud'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      actor: 'admin@springfield.edu',
      role: 'ADMIN',
      action: 'TIMETABLE_SLOT_ADDED',
      entity: 'Timetable',
      entityId: newSlot.id,
      newState: `${newSlot.code} - ${newSlot.day} ${newSlot.time}`,
      reason: 'New lecture timetable slot created by academic registrar',
      ipAddress: '192.168.1.10',
    });
    showToast('Lecture added to institutional timetable');
  };

  const handleDeleteTimetableSlot = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
    showToast('Lecture removed from timetable');
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.rollNo || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.className || '').toLowerCase().includes(searchStudent.toLowerCase());
    if (!matchesSearch) return false;
    if (studentFilter === 'active') return s.accountStatus === 'active';
    if (studentFilter === 'suspended') return s.accountStatus === 'suspended';
    if (studentFilter === 'low_attendance') return s.attendancePercentage < settings.minimumAttendanceThreshold;
    return true;
  });

  // Filtered Teachers
  const filteredTeachers = teachers.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTeacher.toLowerCase())
    );
  });

  // Filtered Logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.id.toLowerCase().includes(searchLog.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedActionFilter !== 'ALL' && !log.action.includes(selectedActionFilter)) {
      return false;
    }
    if (selectedRoleFilter !== 'ALL' && log.role !== selectedRoleFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Admin Top Command Header */}
      <header className="sticky top-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 min-h-16 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center shadow-sm text-white shrink-0">
              <span className="material-symbols-outlined text-[20px] text-indigo-300">shield</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  Institutional Command Center
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Ops
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Springfield University • Tenant: springfield-01
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
              title="Download Full Attendance CSV Report"
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-300">download</span>
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">help_center</span>
              <span className="hidden sm:inline">Docs & Help</span>
            </button>

            <div className="hidden lg:inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-transparent hover:border-rose-200 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Sign out of administrative session"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 text-[13px] font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 w-full flex flex-col gap-5 md:gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-sm overflow-x-auto no-scrollbar shadow-inner">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'registrations', label: 'Registrations', icon: 'how_to_reg', count: pendingUsers.length },
            { id: 'students', label: 'Students', icon: 'school', count: students.length },
            { id: 'teachers', label: 'Faculty', icon: 'badge', count: teachers.length },
            { id: 'classes', label: 'Classes & Courses', icon: 'menu_book' },
            { id: 'classrooms', label: 'Classrooms & Beacons', icon: 'meeting_room' },
            { id: 'timetable', label: 'Timetable', icon: 'calendar_month' },
            { id: 'devices', label: 'Device Management', icon: 'devices' },
            { id: 'analytics', label: 'Analytics', icon: 'bar_chart' },
            { id: 'audit', label: 'Audit Trail', icon: 'verified_user' },
            { id: 'settings', label: 'System Settings', icon: 'settings' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md font-bold scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    tab.id === 'registrations'
                      ? isActive
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30'
                        : 'bg-amber-100 text-amber-800'
                      : isActive
                      ? 'bg-slate-800 text-indigo-300'
                      : 'bg-slate-300/60 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: ADMIN DASHBOARD
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Students</span>
                <span className="text-[20px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors my-0.5">{students.length}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block w-fit">1,218 Bound</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Faculty</span>
                <span className="text-[20px] font-black text-slate-900 group-hover:text-purple-600 transition-colors my-0.5">{teachers.length}</span>
                <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md inline-block w-fit">6 Depts</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Classes</span>
                <span className="text-[20px] font-black text-slate-900 group-hover:text-blue-600 transition-colors my-0.5">18</span>
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block w-fit">Sem 1 - Sem 6</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Today's Lectures</span>
                <span className="text-[20px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors my-0.5">42</span>
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block w-fit">12 Active</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attendance Rate</span>
                <span className="text-[20px] font-black text-emerald-600 my-0.5">88.4%</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block w-fit">+1.2% trend</span>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Review Queue</span>
                <span className="text-[20px] font-black text-amber-900 my-0.5">14</span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md inline-block w-fit">GPS/Latency</span>
              </div>

              <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/70 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">Suspicious</span>
                <span className="text-[20px] font-black text-rose-700 my-0.5">3</span>
                <span className="text-[10px] text-rose-800 font-bold bg-rose-100/80 px-1.5 py-0.5 rounded-md inline-block w-fit">Off-Campus</span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Mesh Status</span>
                <span className="text-[15px] font-black text-emerald-700 my-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Optimal
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded-md inline-block w-fit">100% online</span>
              </div>
            </div>

            {/* Quick Actions & High Priority Operational Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Urgent Alerts */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-[#031635]">Operational Highlights</h3>
                  <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Action Needed
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-[12px]">
                  <button onClick={() => setSelectedHighlight({ title: '2 Device Transfer Requests Pending', desc: 'Students submitted 2FA hardware reassignment for review.', icon: 'sync_problem', color: '#723600', actionText: 'Review Transfer Requests' })} className="w-full p-3 bg-[#fffaf0] hover:bg-[#ffdcc6]/50 border border-[#ffdcc6] rounded-xl flex items-start gap-2.5 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[#723600] text-[18px] shrink-0 mt-0.5">
                      sync_problem
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#723600]">2 Device Transfer Requests Pending</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Students submitted 2FA hardware reassignment for review.
                      </span>
                    </div>
                  </button>

                  <button onClick={() => setSelectedHighlight({ title: 'Room 301 BLE Beacon Signal Weak', desc: 'Battery telemetry at 14%. Maintenance ticket auto-dispatched.', icon: 'wifi_off', color: '#031635', actionText: 'View Maintenance Ticket' })} className="w-full p-3 bg-[#f8f9fc] hover:bg-[#e1e3e4]/50 border border-[#e1e3e4] rounded-xl flex items-start gap-2.5 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[#031635] text-[18px] shrink-0 mt-0.5">
                      wifi_off
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#031635]">Room 301 BLE Beacon Signal Weak</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Battery telemetry at 14%. Maintenance ticket auto-dispatched.
                      </span>
                    </div>
                  </button>

                  <button onClick={() => setSelectedHighlight({ title: '8 Students Below 75% Threshold', desc: 'Automated attendance warning notices sent via campus portal.', icon: 'warning', color: '#ba1a1a', actionText: 'View At-Risk Students' })} className="w-full p-3 bg-[#fff8f6] hover:bg-[#ffdad6]/50 border border-[#ffdad6] rounded-xl flex items-start gap-2.5 transition-colors text-left cursor-pointer">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#ba1a1a]">8 Students Below 75% Threshold</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Automated attendance warning notices sent via campus portal.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Middle Column: Active Lecture Monitor */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-[#031635]">Live Campus Lectures</h3>
                  <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Live Stream
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-[#f3f4f5] text-[12px]">
                  {lectures.map((lec) => (
                    <div key={lec.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#031635]">{lec.name}</span>
                        <span className="text-[11px] text-[#75777f]">
                          {lec.code} • {lec.room} • {lec.instructor}
                        </span>
                      </div>
                      <span className="bg-[#eef2ff] text-[#031635] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#d8e2ff]">
                        {lec.geofence.radiusMeters}m Geofence
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Tenant Multi-Instance Health */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-[#031635]">Security & Tenant Isolation</h3>
                  <span className="bg-[#eef2ff] text-[#031635] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Isolated
                  </span>
                </div>

                <div className="bg-[#f8f9fc] p-3.5 rounded-2xl border border-[#e1e3e4] flex flex-col gap-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">Tenant ID:</span>
                    <span className="font-mono font-bold text-[#031635]">springfield-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">PostgreSQL Schema:</span>
                    <span className="font-mono text-[11px] text-[#191c1d]">tenant_springfield_univ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">Encryption At Rest:</span>
                    <span className="font-bold text-[#005312]">AES-256-GCM Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">Attestation HSM:</span>
                    <span className="font-bold text-[#005312]">Hardware Validated</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  Configure Institutional Policies
                </button>
              </div>
            </div>

            {/* Offline Synchronization Operations Section */}
            <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#fffaf0] border border-[#ffdcc6] text-[#723600] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#031635]">Offline Synchronization & Mesh Telemetry</h3>
                    <p className="text-[12px] text-[#75777f]">Classroom local signed packet ingestion queue</p>
                  </div>
                </div>
                <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Ingest Gateway Online
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                <div className="p-3.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#75777f]">Pending Sessions</span>
                  <span className="text-[20px] font-extrabold text-[#723600] mt-0.5">3</span>
                  <span className="text-[10px] text-[#75777f]">Rooms: 204, 301, 402</span>
                </div>

                <div className="p-3.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#75777f]">Records Pending</span>
                  <span className="text-[20px] font-extrabold text-[#031635] mt-0.5">127</span>
                  <span className="text-[10px] text-[#005312] font-semibold">Teacher RSA Signed</span>
                </div>

                <div className="p-3.5 bg-[#fff8f6] border border-[#ffdad6] rounded-2xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">Failed Syncs</span>
                  <span className="text-[20px] font-extrabold text-[#ba1a1a] mt-0.5">2</span>
                  <span className="text-[10px] text-[#ba1a1a]">SSL Timeout / Retrying</span>
                </div>

                <div className="p-3.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#75777f]">Last Synchronization</span>
                  <span className="text-[14px] font-extrabold text-[#005312] mt-1.5">Today, 11:42 AM</span>
                  <span className="text-[10px] text-[#75777f]">Batch #84920 (48 synced)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => showToast('Displaying 3 pending offline sessions awaiting cloud push')}
                  className="px-3.5 py-2 bg-[#031635] hover:bg-[#1a2b4b] text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  <span>View Pending Sessions</span>
                </button>
                <button
                  onClick={() => showToast('Displaying 2 failed sync logs: SSL handshake timeout on Campus Subnet B')}
                  className="px-3.5 py-2 bg-[#fffaf0] hover:bg-[#ffdcc6] text-[#723600] border border-[#ffdcc6] rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">error_outline</span>
                  <span>View Failed Syncs</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: REGISTRATIONS APPROVAL PIPELINE
           ======================================================== */}
        {activeTab === 'registrations' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Pending Review</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingUsers.length}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Student Sign-ups</p>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">
                    {pendingUsers.filter(u => u.role === 'STUDENT').length}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Faculty Sign-ups</p>
                  <p className="text-2xl font-black text-purple-600 mt-0.5">
                    {pendingUsers.filter(u => u.role === 'TEACHER').length}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
              </div>
            </div>

            {/* Main Pending Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Pending Registrations Queue</h2>
                    {pendingUsers.length > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                        {pendingUsers.length} Action Needed
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Review self-service student and faculty requests or directly enroll verified credentials.
                  </p>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Student Sign-ups</p>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">
                    {pendingUsers.filter(u => u.role === 'STUDENT').length}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Faculty Sign-ups</p>
                  <p className="text-2xl font-black text-purple-600 mt-0.5">
                    {pendingUsers.filter(u => u.role === 'TEACHER').length}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
              </div>
            </div>

            {/* Main Pending Table Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Pending Registrations Queue</h2>
                    {pendingUsers.length > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                        {pendingUsers.length} Action Needed
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Review self-service student and faculty requests or directly enroll verified credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={() => handleOpenAddUserModal('STUDENT', 'PENDING')}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-[12px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Add applicant to this pending approval queue"
                  >
                    <span className="material-symbols-outlined text-[17px] text-amber-600">queue</span>
                    <span>Add to Pending Queue</span>
                  </button>

                  <button 
                    onClick={() => handleOpenAddUserModal('STUDENT', 'DIRECT')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                    title="Directly activate and enroll candidate into institution directory"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Directly Enroll User</span>
                  </button>
                </div>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                    <span className="material-symbols-outlined text-[32px]">task_alt</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-800">Queue is Clear!</h3>
                  <p className="text-[13px] text-slate-500 max-w-sm mt-1 mb-5">
                    All student and teacher account registration requests have been approved or processed.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => handleOpenAddUserModal('STUDENT', 'PENDING')}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-600">queue</span>
                      <span>Queue Candidate for Review</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddUserModal('STUDENT', 'DIRECT')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      <span>Directly Enroll Active User</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500">
                        <th className="py-3.5 px-5 font-bold uppercase text-[10px] tracking-wider">Candidate Name</th>
                        <th className="py-3.5 px-5 font-bold uppercase text-[10px] tracking-wider">Email Address</th>
                        <th className="py-3.5 px-5 font-bold uppercase text-[10px] tracking-wider">Role Requested</th>
                        <th className="py-3.5 px-5 font-bold uppercase text-[10px] tracking-wider">Applied Date</th>
                        <th className="py-3.5 px-5 font-bold uppercase text-[10px] tracking-wider text-right">Decision Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingUsers.map(user => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-slate-50/70 transition-all group ${
                            highlightedId === user.id ? 'bg-amber-50/80 ring-2 ring-amber-400' : ''
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-300/80 flex items-center justify-center font-bold text-slate-700 text-xs shadow-xs">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{user.name}</span>
                                {highlightedId === user.id && (
                                  <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                    Just Queued
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono text-[12px]">{user.email}</td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide border ${
                              user.role === 'STUDENT'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              <span className="material-symbols-outlined text-[13px]">
                                {user.role === 'STUDENT' ? 'school' : 'badge'}
                              </span>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-500 text-[12px]">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border border-emerald-200 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-slate-200/80 hover:border-rose-200 flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Enrolled & Active Records Roster (Live Feed) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Enrolled & Active User Roster</h3>
                    <p className="text-[11px] text-slate-500">
                      Recently approved and directly enrolled institutional members ({students.length} students, {teachers.length} faculty)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View All Students ({students.length}) →
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setActiveTab('teachers')}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View All Faculty ({teachers.length}) →
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/40 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-5">Member Name</th>
                      <th className="py-2.5 px-5">Institutional ID</th>
                      <th className="py-2.5 px-5">Role</th>
                      <th className="py-2.5 px-5">Academic / Dept Unit</th>
                      <th className="py-2.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.slice(0, 4).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold flex items-center justify-center">
                            {s.name.charAt(0)}
                          </span>
                          <span>{s.name}</span>
                        </td>
                        <td className="py-3 px-5 font-mono text-slate-600">{s.studentId}</td>
                        <td className="py-3 px-5">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                            Student
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-600">{s.className || s.program}</td>
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Enrolled
                          </span>
                        </td>
                      </tr>
                    ))}
                    {teachers.slice(0, 3).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center justify-center">
                            {t.name.charAt(0)}
                          </span>
                          <span>{t.name}</span>
                        </td>
                        <td className="py-3 px-5 font-mono text-slate-600">{t.teacherId}</td>
                        <td className="py-3 px-5">
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                            Faculty
                          </span>
                        </td>
                        <td className="py-3 px-5 text-slate-600">{t.department}</td>
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Enrolled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: STUDENT MANAGEMENT DIRECTORY
           ======================================================== */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Student Directory & Credentials</h2>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                    {students.length} Enrolled
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Institutional enrollment roster, hardware keystore status, and academic standing
                </p>
              </div>

              {/* Search, Filters, and Add Student */}
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search student, roll, ID, class..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>

                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value as any)}
                  className="px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="ALL">All Students ({students.length})</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Accounts</option>
                  <option value="low_attendance">Below 75% Attendance</option>
                </select>

                <button
                  onClick={() => handleOpenAddUserModal('STUDENT')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Student ID & Roll</th>
                    <th className="py-3.5 px-5">Student Candidate</th>
                    <th className="py-3.5 px-5">Course / Division</th>
                    <th className="py-3.5 px-5">Hardware Keystore</th>
                    <th className="py-3.5 px-5">Attendance Rate</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr 
                      key={st.id} 
                      className={`hover:bg-slate-50/70 transition-all group ${
                        highlightedId === st.id ? 'bg-emerald-50/80 ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px]">
                          {st.studentId}
                        </span>
                        <span className="block text-[11px] font-sans text-slate-500 mt-0.5">
                          Roll: {st.rollNo || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {st.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[11px] text-slate-500">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-block bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-md text-[11px] border border-slate-200/60">
                          {st.className || st.program || 'BCA Division'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            st.deviceStatus === 'bound'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : st.deviceStatus === 'pending_transfer'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            st.deviceStatus === 'bound'
                              ? 'bg-emerald-500 animate-pulse'
                              : st.deviceStatus === 'pending_transfer'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} />
                          {st.deviceStatus === 'bound'
                            ? `Bound (${st.registeredDeviceModel || 'Hardware 2FA'})`
                            : st.deviceStatus === 'pending_transfer'
                            ? 'Transfer Pending'
                            : 'Unregistered'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-[13px] ${
                              st.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {st.attendancePercentage}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                st.attendancePercentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(st.attendancePercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            st.accountStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {st.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setStudentForPhotoUpload(st)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs flex items-center justify-center gap-1 transition-colors active:scale-95"
                            title="Update Biometric Photo"
                          >
                            <span className="material-symbols-outlined text-[13px]">add_a_photo</span>
                            <span>Photo</span>
                          </button>

                          <button
                            onClick={() => handleResetStudentDevice(st.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs transition-colors active:scale-95"
                            title="Reset Hardware Key Binding"
                          >
                            Reset Key
                          </button>

                          <button
                            onClick={() => handleToggleStudentStatus(st.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs border transition-colors active:scale-95 ${
                              st.accountStatus === 'active'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {st.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: FACULTY DIRECTORY & APPOINTMENTS
           ======================================================== */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-b from-slate-50/50 to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Faculty Directory & Assignments</h2>
                  <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                    {teachers.length} Instructors
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Academic instructors, department affiliations, and authorized session permissions
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search faculty name or dept..."
                    value={searchTeacher}
                    onChange={(e) => setSearchTeacher(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>

                <button
                  onClick={() => handleOpenAddUserModal('TEACHER')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 hover:shadow cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Add Faculty</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3.5 px-5">Faculty ID</th>
                    <th className="py-3.5 px-5">Instructor Name</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5">Assigned Classes</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((tch) => (
                    <tr 
                      key={tch.id} 
                      className={`hover:bg-slate-50/70 transition-all group ${
                        highlightedId === tch.id ? 'bg-purple-50/80 ring-2 ring-purple-400' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px]">
                          {tch.teacherId}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {tch.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tch.name}</p>
                            <p className="text-[11px] text-slate-500">{tch.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-block bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-md text-[11px] border border-slate-200/60">
                          {tch.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex gap-1.5 flex-wrap">
                          {tch.assignedClasses.map((cls, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-200/60"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            tch.accountStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tch.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {tch.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleTeacherStatus(tch.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs border transition-colors active:scale-95 ${
                            tch.accountStatus === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {tch.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CLASS & SUBJECT MANAGEMENT
           ======================================================== */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {MOCK_SUBJECTS.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between gap-5 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 w-fit">
                      {sub.code}
                    </span>
                    <h3 className="text-[17px] font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-[12px] text-slate-500 font-medium">{sub.instructor} • BCA Sem 3</p>
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-200">
                    60 Enrolled
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cohort Attendance Rate:</span>
                    <span className="font-extrabold text-slate-900">{sub.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sub.percentage >= 80 ? 'bg-emerald-500' : sub.percentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Delivered Classes:</span>
                    <span className="font-bold text-slate-700">{sub.totalLectures} Classes</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Course settings opened for ${sub.code}`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Manage Syllabus & Batches</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 5: CLASSROOMS & BEACONS
           ======================================================== */}
        {activeTab === 'classrooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {classrooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between gap-5 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {room.building}
                    </span>
                    <h3 className="text-[19px] font-extrabold text-slate-900 mt-0.5 tracking-tight group-hover:text-blue-600 transition-colors">
                      {room.roomNumber}
                    </h3>
                    <p className="text-[12px] text-slate-500 font-medium">{room.name} (Capacity: {room.capacity})</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Calibrated
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      Offline: {room.offlineAttendanceEnabled !== false ? '🟢 Ready' : '🔴 Disabled'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Hardware Location:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span> Configured
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Geofence Radius:</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                      {room.radiusMeters} meters
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">BLE Beacon ID:</span>
                    <span className="font-mono text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {room.bleBeaconId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Classroom Mesh SSID:</span>
                    <span className="font-mono text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {room.localNetworkSsid || `SmartAttend-${room.roomNumber.replace(/\s+/g, '')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Local Gateway Subnet:</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {room.localNetworkIp || '192.168.4.1:8080'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => showToast(`Opening configuration for ${room.roomNumber}`)}
                    className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => showToast(`Testing BLE Beacon in ${room.roomNumber}: 🟢 RSSI -58 dBm (Strong)`)}
                    className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test BLE
                  </button>
                  <button
                    onClick={() => showToast(`GPS validation passed for ${room.roomNumber} (lat: ${room.lat})`)}
                    className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test GPS
                  </button>
                  <button
                    onClick={() => showToast(`Offline readiness test PASSED for ${room.roomNumber}. Keypair & SSID ready.`)}
                    className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test Mesh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 6: TIMETABLE MANAGEMENT
           ======================================================== */}
        {activeTab === 'timetable' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Institutional Timetable Matrix</h2>
                <p className="text-[12px] text-[#75777f]">
                  Course schedule, classroom allocations, and faculty slots
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="px-3 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635]"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>

                <button
                  onClick={() => setShowAddTimetableModal(true)}
                  className="px-3.5 py-1.5 bg-[#031635] text-white hover:bg-[#1a2b4b] text-[12px] font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Lecture Slot</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                    <th className="py-3 px-5">Time Slot</th>
                    <th className="py-3 px-5">Subject Code & Name</th>
                    <th className="py-3 px-5">Class / Batch</th>
                    <th className="py-3 px-5">Faculty</th>
                    <th className="py-3 px-5">Room</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5]">
                  {timetable
                    .filter((t) => t.day === selectedDayFilter)
                    .map((slot) => (
                      <tr key={slot.id} className="hover:bg-[#f8f9fa]/80 transition-colors">
                        <td className="py-3 px-5 font-bold text-[#031635] whitespace-nowrap">{slot.time}</td>
                        <td className="py-3 px-5">
                          <span className="font-bold text-[#191c1d]">{slot.subject}</span>
                          <span className="text-[10px] font-mono text-[#75777f] block">{slot.code}</span>
                        </td>
                        <td className="py-3 px-5 text-[#44474e]">{slot.className}</td>
                        <td className="py-3 px-5 font-medium text-[#191c1d]">{slot.teacher}</td>
                        <td className="py-3 px-5 font-mono text-[#031635] font-semibold">{slot.classroom}</td>
                        <td className="py-3 px-5 text-right">
                          <button
                            onClick={() => handleDeleteTimetableSlot(slot.id)}
                            className="px-2 py-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: DEVICE MANAGEMENT & HARDWARE RECOVERY QUEUE
           ======================================================== */}
        {activeTab === 'devices' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Device Policy Overview */}
            <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-[17px] font-bold text-[#031635]">Hardware Attestation & Keystore Integrity</h3>
                <p className="text-[12px] text-[#75777f] mt-0.5">
                  Anti-proxy enforcement: Each student profile is strictly bound to a single physical device hardware key.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="bg-[#a0f399] text-[#005312] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase">
                  1,218 Bound Devices
                </span>
                <span className="bg-[#ffdcc6] text-[#723600] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase">
                  2 Pending Queue
                </span>
              </div>
            </div>

            {/* Pending Device Change Requests Queue */}
            <div className="bg-white rounded-3xl border border-[#ffdcc6] shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 bg-[#fffaf0] border-b border-[#ffdcc6] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#723600]">sync_lock</span>
                  <h4 className="text-[14px] font-bold text-[#723600]">Pending Device Reassignment Requests</h4>
                </div>
                <span className="text-[11px] font-semibold text-[#723600]">
                  Requires Physical or 2FA Authorization
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="p-4 bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#031635] text-white flex items-center justify-center font-bold text-[13px]">
                      KN
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#031635]">Kaustubh Nikam</span>
                        <span className="text-[11px] font-mono text-[#75777f]">STU-8821-BCA</span>
                      </div>
                      <span className="text-[11px] text-[#44474e]">
                        Requested change to: <strong>Pixel 8 Pro</strong> • Reason: Phone upgrade
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveDeviceChange('STU-8821-BCA', 'Pixel 8 Pro')}
                      className="px-3 py-1.5 bg-[#005312] text-white hover:bg-[#00390b] rounded-xl text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Approve Transfer
                    </button>
                    <button
                      onClick={() => handleRejectDeviceChange('STU-8821-BCA')}
                      className="px-3 py-1.5 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffcdd2] rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#75777f] text-white flex items-center justify-center font-bold text-[13px]">
                      RM
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#031635]">Rahul Mehta</span>
                        <span className="text-[11px] font-mono text-[#75777f]">STU-8824-BCA</span>
                      </div>
                      <span className="text-[11px] text-[#44474e]">
                        Requested change to: <strong>Samsung S24 Ultra</strong> • Reason: Lost previous device
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveDeviceChange('STU-8824-BCA', 'Samsung S24 Ultra')}
                      className="px-3 py-1.5 bg-[#005312] text-white hover:bg-[#00390b] rounded-xl text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Approve Transfer
                    </button>
                    <button
                      onClick={() => handleRejectDeviceChange('STU-8824-BCA')}
                      className="px-3 py-1.5 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffcdd2] rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: ATTENDANCE ANALYTICS
           ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Analytics Card 1 */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Institutional Average
                </span>
                <span className="text-[32px] font-extrabold text-[#031635]">88.4%</span>
                <p className="text-[12px] text-[#005312] font-semibold">
                  Compliant with UGC / AICTE standard regulations (&gt;75%).
                </p>
              </div>

              {/* Analytics Card 2 */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Verification Accuracy Rate
                </span>
                <span className="text-[32px] font-extrabold text-[#005312]">99.2%</span>
                <p className="text-[12px] text-[#44474e]">
                  Multi-factor telemetry prevents false positives & proxy logins.
                </p>
              </div>

              {/* Analytics Card 3 */}
              <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Offline Records Ingested
                </span>
                <span className="text-[32px] font-extrabold text-[#723600]">128</span>
                <p className="text-[12px] text-[#44474e]">
                  All cryptographic signatures verified post-reconnection.
                </p>
              </div>
            </div>

            {/* Low Attendance Warning Table */}
            <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#f3f4f5] flex justify-between items-center">
                <h3 className="text-[15px] font-bold text-[#ba1a1a]">Students at Risk of Attendance Shortage</h3>
                <span className="text-[11px] text-[#75777f]">Threshold: &lt;75% Attendance</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase border-b border-[#e1e3e4]">
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-5">Class</th>
                      <th className="py-3 px-5">Attendance %</th>
                      <th className="py-3 px-5">Lectures Needed for 75%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f4f5]">
                    {students
                      .filter((s) => s.attendancePercentage < 75)
                      .map((st) => (
                        <tr key={st.id}>
                          <td className="py-3 px-5 font-bold text-[#191c1d]">
                            {st.name} ({st.rollNo})
                          </td>
                          <td className="py-3 px-5 text-[#44474e]">{st.className}</td>
                          <td className="py-3 px-5 font-bold text-[#ba1a1a]">{st.attendancePercentage}%</td>
                          <td className="py-3 px-5 font-medium text-[#723600]">Must attend next 6 consecutive classes</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 9: AUDIT TRAIL
           ======================================================== */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Immutable Institutional Audit Ledger</h2>
                <p className="text-[12px] text-[#75777f]">
                  SHA-256 cryptographic proof for all attendance verifications, overrides, and device registrations
                </p>
              </div>

              {/* Filter and Search */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <input
                  type="text"
                  placeholder="Search by actor, student, reason..."
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className="px-3 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635] w-full sm:w-60"
                />

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student Actions</option>
                  <option value="TEACHER">Faculty Overrides</option>
                  <option value="ADMIN">Admin Events</option>
                </select>

                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="px-3 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635]"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="VERIFY">Self Verifications</option>
                  <option value="OVERRIDE">Teacher Overrides</option>
                  <option value="DEVICE">Device Migrations</option>
                  <option value="TIMETABLE">Timetable Changes</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                    <th className="py-3 px-5">Event ID</th>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Actor / Origin</th>
                    <th className="py-3 px-5">Action Type</th>
                    <th className="py-3 px-5">Target Entity</th>
                    <th className="py-3 px-5">Cryptographic Hash</th>
                    <th className="py-3 px-5">Context / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5]">
                  {filteredLogs.map((log, idx) => (
                    <tr key={`${log.id}-${idx}`} className="hover:bg-[#f8f9fa]/80 transition-colors">
                      <td className="py-3 px-5 font-mono text-[#031635] font-bold">{log.id}</td>
                      <td className="py-3 px-5 text-[#75777f] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-5">
                        <span className="font-semibold text-[#191c1d]">{log.actor}</span>
                        <span className="text-[10px] text-[#75777f] block uppercase">{log.role}</span>
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            log.action.includes('OVERRIDE') || log.action.includes('SUSPEND')
                              ? 'bg-[#ffdcc6] text-[#723600]'
                              : log.action.includes('DEVICE')
                              ? 'bg-[#d8e2ff] text-[#031635]'
                              : 'bg-[#a0f399] text-[#005312]'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-medium text-[#191c1d]">{log.entity}</td>
                      <td className="py-3 px-5 font-mono text-[10px] text-[#75777f] max-w-[140px] truncate" title={log.hash}>
                        {log.hash}
                      </td>
                      <td className="py-3 px-5 text-[#44474e] italic max-w-xs">{log.reason || 'Standard verification pass.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 10: SYSTEM SETTINGS
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] shadow-xs flex flex-col gap-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-[18px] font-bold text-[#031635]">Institutional Verification Policies</h2>
              <p className="text-[13px] text-[#75777f] mt-0.5">
                Configure biometric, spatial geofence, rotating token TTL, and multi-factor rules
              </p>
            </div>

            {/* Verification Methods Toggles */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                Active Verification Methods
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[13px]">
                <label className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#031635]">10s Dynamic QR Nonce</span>
                    <span className="text-[11px] text-[#75777f]">Time-bound rotating cryptographic token</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dynamicQrEnabled}
                    onChange={(e) => setSettings({ ...settings, dynamicQrEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#031635] rounded"
                  />
                </label>

                <label className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#031635]">Device Keystore Binding</span>
                    <span className="text-[11px] text-[#75777f]">Single device anti-proxy enforcement</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.deviceVerificationEnabled}
                    onChange={(e) => setSettings({ ...settings, deviceVerificationEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#031635] rounded"
                  />
                </label>

                <label className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#031635]">Classroom Geofencing</span>
                    <span className="text-[11px] text-[#75777f]">GPS perimeter boundary match</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.locationVerificationEnabled}
                    onChange={(e) => setSettings({ ...settings, locationVerificationEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#031635] rounded"
                  />
                </label>

                <label className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#031635]">BLE Proximity Beacons</span>
                    <span className="text-[11px] text-[#75777f]">Classroom Bluetooth Low Energy sensor</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.bleEnabled}
                    onChange={(e) => setSettings({ ...settings, bleEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#031635] rounded"
                  />
                </label>

                <label className="p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#031635]">Visual AI Supporting Stream</span>
                    <span className="text-[11px] text-[#75777f]">Non-punitive facial confirmation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.visualVerificationEnabled}
                    onChange={(e) => setSettings({ ...settings, visualVerificationEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#031635] rounded"
                  />
                </label>

                <label className="p-4 bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#723600]">Emergency Offline Mode</span>
                    <span className="text-[11px] text-[#75777f]">Instant classroom local fallback</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emergencyOfflineModeEnabled !== false}
                    onChange={(e) => setSettings({ ...settings, emergencyOfflineModeEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#723600] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Offline Attendance Configuration Section */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#f3f4f5]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[15px] font-bold text-[#031635] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#723600]">cloud_off</span>
                    Offline Attendance Configuration
                  </h3>
                  <p className="text-[12px] text-[#75777f]">
                    Campus network fallback rules, cryptographic rotation limits, and sync policies
                  </p>
                </div>
                <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  Policy v2.4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">1. Offline Attendance System</label>
                  <select
                    value={settings.offlineModeEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setSettings({ ...settings, offlineModeEnabled: e.target.value === 'enabled' })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="enabled">🟢 Enabled (Campus-Wide)</option>
                    <option value="disabled">🔴 Disabled</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">2. Max Offline Session Duration</label>
                  <select
                    value={settings.maxOfflineDurationHours || 2}
                    onChange={(e) => setSettings({ ...settings, maxOfflineDurationHours: Number(e.target.value) })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours (Standard Lecture)</option>
                    <option value={4}>4 Hours (Lab Session)</option>
                    <option value={8}>8 Hours (Full Day Event)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">3. Offline Data Synchronization</label>
                  <select
                    value={settings.offlineSyncMode || 'auto_preferred'}
                    onChange={(e) => setSettings({ ...settings, offlineSyncMode: e.target.value as any })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="auto_preferred">Automatic on Reconnection</option>
                    <option value="manual_only">Manual Faculty Trigger Only</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">4. QR Refresh Interval</label>
                  <select
                    value={settings.qrExpirySeconds || 10}
                    onChange={(e) => setSettings({ ...settings, qrExpirySeconds: Number(e.target.value) })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value={10}>10 Seconds (SmartAttend Standard)</option>
                    <option value={15}>15 Seconds</option>
                    <option value={30}>30 Seconds</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">5. Offline Location Verification</label>
                  <select
                    value={settings.locationVerificationEnabled ? 'on' : 'off'}
                    onChange={(e) => setSettings({ ...settings, locationVerificationEnabled: e.target.value === 'on' })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="on">🟢 ON (Device GPS Check)</option>
                    <option value="off">⚪ OFF (Exempt Offline)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">6. Offline BLE Verification</label>
                  <select
                    value={settings.bleEnabled ? 'on' : 'off'}
                    onChange={(e) => setSettings({ ...settings, bleEnabled: e.target.value === 'on' })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="on">🟢 ON (Local Room Beacon Required)</option>
                    <option value="off">⚪ OFF</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">7. Emergency Offline Mode</label>
                  <select
                    value={settings.emergencyOfflineModeEnabled !== false ? 'on' : 'off'}
                    onChange={(e) => setSettings({ ...settings, emergencyOfflineModeEnabled: e.target.value === 'on' })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="on">🟢 ON (Direct Hotspot Fallback)</option>
                    <option value="off">🔴 OFF</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">8. Max Pending Sync Period</label>
                  <select
                    value={settings.maxPendingSyncHours || 24}
                    onChange={(e) => setSettings({ ...settings, maxPendingSyncHours: Number(e.target.value) })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value={12}>12 Hours</option>
                    <option value={24}>24 Hours (Recommended)</option>
                    <option value={48}>48 Hours (Weekend Grace)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#031635]">9. Offline Session Approval</label>
                  <select
                    value={settings.offlineApprovalMode || 'teacher_signed'}
                    onChange={(e) => setSettings({ ...settings, offlineApprovalMode: e.target.value as any })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value="teacher_signed">Teacher Cryptographically Signed</option>
                    <option value="auto_trusted">Automatic Trusted Key Validation</option>
                    <option value="admin_audit">Requires Admin Manual Audit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Threshold Configurations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#f3f4f5] text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#031635]">QR Refresh Nonce Expiry (seconds)</label>
                <select
                  value={settings.qrExpirySeconds}
                  onChange={(e) => setSettings({ ...settings, qrExpirySeconds: Number(e.target.value) })}
                  className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                >
                  <option value={10}>10 Seconds (Recommended / High Security)</option>
                  <option value={15}>15 Seconds</option>
                  <option value={30}>30 Seconds</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#031635]">Indoor Geofence Tolerance (meters)</label>
                <select
                  value={settings.locationToleranceMeters}
                  onChange={(e) => setSettings({ ...settings, locationToleranceMeters: Number(e.target.value) })}
                  className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                >
                  <option value={25}>25 Meters (Strict)</option>
                  <option value={30}>30 Meters (Standard)</option>
                  <option value={50}>50 Meters (Large Auditorium)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#031635]">Minimum Attendance Threshold (%)</label>
                <select
                  value={settings.minimumAttendanceThreshold}
                  onChange={(e) => setSettings({ ...settings, minimumAttendanceThreshold: Number(e.target.value) })}
                  className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                >
                  <option value={75}>75% (Standard University Compliance)</option>
                  <option value={80}>80% (Honors Requirement)</option>
                  <option value={70}>70% (Relaxed)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => showToast('Institutional system settings updated')}
              className="mt-2 w-full max-w-xs bg-[#031635] text-white hover:bg-[#1a2b4b] py-3 px-4 rounded-xl font-bold text-[13px] transition-all cursor-pointer shadow-md"
            >
              Save Configuration
            </button>
          </div>
        )}

        {/* ========================================================
            TAB: ANALYTICS
           ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-[#e1e3e4] shadow-xs">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Institutional Analytics</h2>
                <p className="text-[12px] text-[#75777f]">Visualize attendance trends and identify at-risk students</p>
              </div>
            </div>
            
            <AttendanceTrendsChart 
              trendData={MOCK_TREND_DATA} 
              atRiskStudents={MOCK_AT_RISK_STUDENTS} 
            />
          </div>
        )}
      </main>

      {/* MODAL: ADD TIMETABLE SLOT */}
      {showAddTimetableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e1e3e4] text-[#191c1d] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
              <h3 className="text-[17px] font-bold text-[#031635]">Add Timetable Lecture Slot</h3>
              <button
                onClick={() => setShowAddTimetableModal(false)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTimetableSlot} className="flex flex-col gap-3 text-[12px]">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#44474e]">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newSlotSubject}
                  onChange={(e) => setNewSlotSubject(e.target.value)}
                  className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none focus:border-[#031635]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#44474e]">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BCA 303"
                    value={newSlotCode}
                    onChange={(e) => setNewSlotCode(e.target.value)}
                    className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none focus:border-[#031635]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#44474e]">Day</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value)}
                    className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#44474e]">Room</label>
                  <input
                    type="text"
                    value={newSlotRoom}
                    onChange={(e) => setNewSlotRoom(e.target.value)}
                    className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#44474e]">Time Slot</label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f3f4f5]">
                <button
                  type="button"
                  onClick={() => setShowAddTimetableModal(false)}
                  className="px-4 py-2 text-[#75777f] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#031635] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Highlight Details Modal */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031635]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e1e3e4]">
            <div className="p-5 border-b border-[#f3f4f5] flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-[#031635] flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: selectedHighlight.color }}>{selectedHighlight.icon}</span>
                Highlight Details
              </h2>
              <button
                onClick={() => setSelectedHighlight(null)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center text-[#44474e] hover:bg-[#e1e3e4] cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <h3 className="text-[16px] font-bold" style={{ color: selectedHighlight.color }}>{selectedHighlight.title}</h3>
              <p className="text-[14px] text-[#44474e]">{selectedHighlight.desc}</p>
              <div className="mt-4 p-4 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl flex items-center justify-between">
                 <span className="text-[12px] font-bold text-[#75777f]">Further Action Required:</span>
                 <button onClick={() => { showToast('Action initiated: ' + selectedHighlight.actionText); setSelectedHighlight(null); }} className="px-4 py-2 bg-[#031635] text-white text-[12px] font-bold rounded-xl shadow-xs cursor-pointer hover:bg-[#1a2b4b]">
                    {selectedHighlight.actionText}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {studentForPhotoUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#031635]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#e1e3e4]">
            <div className="p-5 border-b border-[#f3f4f5] flex justify-between items-center">
              <h2 className="text-[16px] font-bold text-[#031635]">Update Profile Photo</h2>
              <button
                onClick={() => setStudentForPhotoUpload(null)}
                className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center text-[#44474e] hover:bg-[#e1e3e4] cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#eef2ff] border-2 border-dashed border-[#a8bcf9] flex flex-col items-center justify-center text-[#031635] cursor-pointer hover:bg-[#d8e2ff] transition-colors shadow-sm" onClick={() => fileInputRef.current?.click()}>
                 <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                 <span className="text-[10px] font-bold mt-1">Select File</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                      showToast(`Profile photo updated for ${studentForPhotoUpload.name}`);
                      setStudentForPhotoUpload(null);
                  }
              }} />
              <div className="text-center">
                 <p className="text-[15px] font-bold text-[#031635]">{studentForPhotoUpload.name}</p>
                 <p className="text-[12px] font-mono text-[#75777f] mt-0.5">{studentForPhotoUpload.studentId}</p>
              </div>
              <div className="w-full mt-2 text-[11px] text-[#75777f] text-center bg-[#f8f9fa] border border-[#e1e3e4] p-2.5 rounded-xl">
                 <span className="font-bold">Formats:</span> JPG, PNG files only. <span className="font-bold">Max size:</span> 2MB.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manually Add User Modal (Student or Teacher) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 text-slate-900 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-indigo-900/30 flex justify-between items-center bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold tracking-tight text-white">Enroll New Candidate</h3>
                  <p className="text-[11px] text-indigo-200/80">Directly provision verified student or faculty credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto flex flex-col gap-4 text-[12px]">
              {/* Enrollment Workflow Mode */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                  Enrollment Workflow Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setEnrollmentMode('DIRECT')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      enrollmentMode === 'DIRECT'
                        ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200 font-extrabold ring-1 ring-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">bolt</span>
                    <span>Direct Active Enrollment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnrollmentMode('PENDING')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      enrollmentMode === 'PENDING'
                        ? 'bg-white text-amber-700 shadow-sm border border-amber-200 font-extrabold ring-1 ring-amber-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">hourglass_top</span>
                    <span>Add to Pending Queue</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {enrollmentMode === 'DIRECT'
                    ? '⚡ Instantly provisions active record and displays in institutional directory.'
                    : '📋 Places candidate into Pending Registrations table for administrative sign-off.'}
                </p>
              </div>

              {/* Role Selector Tabs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                  Select Candidate Role
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('STUDENT')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      newUserRole === 'STUDENT'
                        ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200 font-extrabold ring-1 ring-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    <span>Student Candidate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('TEACHER')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                      newUserRole === 'TEACHER'
                        ? 'bg-white text-purple-700 shadow-sm border border-purple-200 font-extrabold ring-1 ring-purple-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    <span>Faculty / Teacher</span>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 text-[11px]">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={newUserRole === 'STUDENT' ? 'e.g. Aditi Sharma' : 'e.g. Dr. Rajesh Kumar'}
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700 text-[11px]">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder={newUserRole === 'STUDENT' ? 'student@springfield.edu' : 'faculty@springfield.edu'}
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 text-[11px]">Initial Temporary Password *</label>
                  <button
                    type="button"
                    onClick={() => setNewUserPassword(newUserRole === 'STUDENT' ? 'StudentKey2024#' : 'FacultyPass2024!')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    Use standard default
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-mono text-[12px] text-slate-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewUserPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Standard preset: {newUserRole === 'STUDENT' ? 'StudentKey2024#' : 'FacultyPass2024!'} (User can change on first login)
                </p>
              </div>

              {/* Role-Specific Fields: Student */}
              {newUserRole === 'STUDENT' && (
                <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-col gap-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <span className="font-bold text-[11px] text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-indigo-600">school</span>
                      Academic Enrollment Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewUserStudentId(`STU-2024-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      Regenerate ID
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Student ID *</label>
                      <input
                        type="text"
                        required
                        value={newUserStudentId}
                        onChange={(e) => setNewUserStudentId(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-mono text-[11px] font-bold focus:border-indigo-600"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Roll Number</label>
                      <input
                        type="text"
                        placeholder="e.g. BCA-048"
                        value={newUserRollNo}
                        onChange={(e) => setNewUserRollNo(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-[11px] focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Program</label>
                      <select
                        value={newUserProgram}
                        onChange={(e) => setNewUserProgram(e.target.value)}
                        className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="BCA (3rd Sem)">BCA</option>
                        <option value="MCA (1st Sem)">MCA</option>
                        <option value="B.Tech CS">B.Tech CS</option>
                        <option value="BBA">BBA</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Batch</label>
                      <input
                        type="text"
                        value={newUserBatch}
                        onChange={(e) => setNewUserBatch(e.target.value)}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:border-indigo-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Class / Div</label>
                      <input
                        type="text"
                        value={newUserClassName}
                        onChange={(e) => setNewUserClassName(e.target.value)}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-Specific Fields: Teacher */}
              {newUserRole === 'TEACHER' && (
                <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl flex flex-col gap-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="font-bold text-[11px] text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-purple-600">badge</span>
                      Faculty Assignment Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewUserTeacherId(`TCH-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[10px] text-purple-600 hover:text-purple-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      Regenerate ID
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Faculty ID *</label>
                      <input
                        type="text"
                        required
                        value={newUserTeacherId}
                        onChange={(e) => setNewUserTeacherId(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-mono text-[11px] font-bold focus:border-purple-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 text-[11px]">Department *</label>
                      <select
                        value={newUserDepartment}
                        onChange={(e) => setNewUserDepartment(e.target.value)}
                        className="px-2 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium focus:border-purple-600 cursor-pointer"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Comm.">Electronics & Comm.</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Management Studies">Management Studies</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700 text-[11px]">Assigned Classes (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. BCA Sem 3 - Div A, MCA Sem 1"
                      value={newUserAssignedClasses}
                      onChange={(e) => setNewUserAssignedClasses(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-[11px] focus:border-purple-600"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/25 cursor-pointer transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmittingUser ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span>Processing Enrollment...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">
                        {enrollmentMode === 'DIRECT' ? 'how_to_reg' : 'queue'}
                      </span>
                      <span>
                        {enrollmentMode === 'DIRECT'
                          ? `Directly Enroll & Activate ${newUserRole === 'STUDENT' ? 'Student' : 'Faculty'}`
                          : `Queue ${newUserRole === 'STUDENT' ? 'Student' : 'Faculty'} for Approval`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        userRole="admin"
      />
    </div>
  );
};
