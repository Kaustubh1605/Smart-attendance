import React, { useState } from 'react';
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
    'dashboard' | 'students' | 'teachers' | 'classes' | 'classrooms' | 'timetable' | 'devices' | 'analytics' | 'audit' | 'settings'
  >('dashboard');

  // State for data management
  const [students, setStudents] = useState<AdminStudent[]>(MOCK_ADMIN_STUDENTS);
  const [teachers, setTeachers] = useState<AdminTeacher[]>(MOCK_ADMIN_TEACHERS);
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(MOCK_CLASSROOMS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(MOCK_TIMETABLE);
  const [settings, setSettings] = useState<InstitutionSettings>(MOCK_INSTITUTION_SETTINGS);

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
      s.rollNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.className.toLowerCase().includes(searchStudent.toLowerCase());
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
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] font-sans pb-16">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 min-h-16 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <img alt="SmartAttend" className="h-7 md:h-8 w-auto shrink-0" src={LOGO_URL} />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                Administration & Security
              </span>
              <span className="text-sm md:text-base font-bold text-[#031635]">Institutional Portal</span>
            </div>
            <div className="h-5 w-px bg-[#e1e3e4] mx-1 hidden sm:block" />
            <span className="text-[12px] text-[#44474e] hidden lg:inline">
              Springfield University • Tenant: springfield-01
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] px-3 py-1.5 rounded-xl border border-[#d8e2ff] transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">help_center</span>
              <span>Help & Docs</span>
            </button>

            <span className="inline-flex items-center gap-1.5 bg-[#a0f399]/40 border border-[#a0f399] text-[#005312] text-[11px] font-bold px-2.5 py-1 rounded-full hidden md:inline-flex">
              <span className="w-2 h-2 rounded-full bg-[#005312] animate-pulse" />
              All Systems Operational
            </span>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-[12px] font-bold text-[#ba1a1a] bg-[#ffdad6]/60 hover:bg-[#ffdad6] px-3 py-1.5 rounded-xl border border-[#ba1a1a]/20 transition-all cursor-pointer shadow-xs"
                title="Sign out of administrative session"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#031635] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[#a0f399] text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 w-full flex flex-col gap-5 md:gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 bg-[#f8f9fa] p-1.5 rounded-2xl border border-[#e1e3e4] overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'students', label: 'Students', icon: 'school' },
            { id: 'teachers', label: 'Faculty', icon: 'badge' },
            { id: 'classes', label: 'Classes & Courses', icon: 'menu_book' },
            { id: 'classrooms', label: 'Classrooms & Beacons', icon: 'meeting_room' },
            { id: 'timetable', label: 'Timetable', icon: 'calendar_month' },
            { id: 'devices', label: 'Device Management', icon: 'devices' },
            { id: 'analytics', label: 'Analytics', icon: 'bar_chart' },
            { id: 'audit', label: 'Audit Trail', icon: 'verified_user' },
            { id: 'settings', label: 'System Settings', icon: 'settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'text-[#75777f] hover:bg-white hover:text-[#031635]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px] shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB 1: ADMIN DASHBOARD
           ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Total Students</span>
                <span className="text-[20px] font-extrabold text-[#031635] mt-0.5">1,240</span>
                <span className="text-[10px] text-[#005312] font-semibold">1,218 Bound</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Total Faculty</span>
                <span className="text-[20px] font-extrabold text-[#031635] mt-0.5">64</span>
                <span className="text-[10px] text-[#75777f] font-semibold">6 Depts</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Active Classes</span>
                <span className="text-[20px] font-extrabold text-[#031635] mt-0.5">18</span>
                <span className="text-[10px] text-[#005312] font-semibold">Sem 1 - Sem 6</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Today&apos;s Lectures</span>
                <span className="text-[20px] font-extrabold text-[#031635] mt-0.5">42</span>
                <span className="text-[10px] text-[#031635] font-semibold">12 In Progress</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#e1e3e4] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Today Attendance</span>
                <span className="text-[20px] font-extrabold text-[#005312] mt-0.5">88.4%</span>
                <span className="text-[10px] text-[#005312] font-semibold">+1.2% vs avg</span>
              </div>

              <div className="bg-[#fffaf0] p-3.5 rounded-2xl border border-[#ffdcc6] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#723600]">Requires Review</span>
                <span className="text-[20px] font-extrabold text-[#723600] mt-0.5">14</span>
                <span className="text-[10px] text-[#723600] font-semibold">Location / Latency</span>
              </div>

              <div className="bg-[#fff8f6] p-3.5 rounded-2xl border border-[#ffdad6] shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">Suspicious Events</span>
                <span className="text-[20px] font-extrabold text-[#ba1a1a] mt-0.5">3</span>
                <span className="text-[10px] text-[#ba1a1a] font-semibold">Off-Campus Submits</span>
              </div>

              <div className="bg-[#eefcf0] p-3.5 rounded-2xl border border-[#a0f399]/50 shadow-xs flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#005312]">System Health</span>
                <span className="text-[16px] font-bold text-[#005312] mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#005312] animate-pulse" />
                  100%
                </span>
                <span className="text-[10px] text-[#005312] font-semibold">All nodes green</span>
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
                  <div className="p-3 bg-[#fffaf0] border border-[#ffdcc6] rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#723600] text-[18px] shrink-0 mt-0.5">
                      sync_problem
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#723600]">2 Device Transfer Requests Pending</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Students submitted 2FA hardware reassignment for review.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#f8f9fc] border border-[#e1e3e4] rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#031635] text-[18px] shrink-0 mt-0.5">
                      wifi_off
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#031635]">Room 301 BLE Beacon Signal Weak</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Battery telemetry at 14%. Maintenance ticket auto-dispatched.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fff8f6] border border-[#ffdad6] rounded-xl flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#ba1a1a]">8 Students Below 75% Threshold</span>
                      <span className="text-[#75777f] text-[11px] mt-0.5">
                        Automated attendance warning notices sent via campus portal.
                      </span>
                    </div>
                  </div>
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
            TAB 2: STUDENT MANAGEMENT
           ======================================================== */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Student Management Directory</h2>
                <p className="text-[12px] text-[#75777f]">
                  Enrollment, hardware keystore binding, and attendance standing
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <input
                  type="text"
                  placeholder="Search student, roll, ID, class..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="px-3.5 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635] w-full sm:w-60"
                />

                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635]"
                >
                  <option value="ALL">All Students ({students.length})</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Accounts</option>
                  <option value="low_attendance">Below 75% Attendance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                    <th className="py-3 px-4">Student ID / Roll</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class / Division</th>
                    <th className="py-3 px-4">Registered Hardware</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5]">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-[#f8f9fa]/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#031635]">
                        {st.studentId}
                        <span className="block text-[11px] font-normal text-[#75777f]">Roll: {st.rollNo}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#191c1d]">{st.name}</td>
                      <td className="py-3 px-4 text-[#44474e]">{st.className}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            st.deviceStatus === 'bound'
                              ? 'bg-[#a0f399] text-[#005312]'
                              : st.deviceStatus === 'pending_transfer'
                              ? 'bg-[#ffdcc6] text-[#723600]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {st.deviceStatus === 'bound'
                            ? `Bound (${st.registeredDeviceModel})`
                            : st.deviceStatus === 'pending_transfer'
                            ? 'Transfer Pending'
                            : 'Unregistered'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              st.attendancePercentage < 75 ? 'text-[#ba1a1a]' : 'text-[#031635]'
                            }`}
                          >
                            {st.attendancePercentage}%
                          </span>
                          <div className="w-12 h-1.5 bg-[#f3f4f5] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                st.attendancePercentage < 75 ? 'bg-[#ba1a1a]' : 'bg-[#005312]'
                              }`}
                              style={{ width: `${st.attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            st.accountStatus === 'active'
                              ? 'bg-[#a0f399] text-[#005312]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {st.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetStudentDevice(st.id)}
                            className="px-2.5 py-1 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs"
                            title="Reset Hardware Key Binding"
                          >
                            Reset Device
                          </button>

                          <button
                            onClick={() => handleToggleStudentStatus(st.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs ${
                              st.accountStatus === 'active'
                                ? 'bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6]'
                                : 'bg-[#a0f399]/60 text-[#005312] hover:bg-[#a0f399]'
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
            TAB 3: TEACHER MANAGEMENT
           ======================================================== */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-[#f3f4f5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#031635]">Faculty Directory & Assignments</h2>
                <p className="text-[12px] text-[#75777f]">
                  Course instructors, departments, and session authority
                </p>
              </div>

              <input
                type="text"
                placeholder="Search faculty name or dept..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="px-3.5 py-1.5 text-[12px] bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:outline-none focus:border-[#031635] w-full sm:w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#75777f] font-bold text-[11px] uppercase tracking-wider border-b border-[#e1e3e4]">
                    <th className="py-3 px-5">Faculty ID</th>
                    <th className="py-3 px-5">Instructor Name</th>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5">Assigned Classes</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5]">
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.id} className="hover:bg-[#f8f9fa]/80 transition-colors">
                      <td className="py-3 px-5 font-mono font-bold text-[#031635]">{tch.teacherId}</td>
                      <td className="py-3 px-5 font-bold text-[#191c1d]">{tch.name}</td>
                      <td className="py-3 px-5 text-[#44474e]">{tch.department}</td>
                      <td className="py-3 px-5">
                        <div className="flex gap-1 flex-wrap">
                          {tch.assignedClasses.map((cls, idx) => (
                            <span
                              key={idx}
                              className="bg-[#eef2ff] text-[#031635] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#d8e2ff]"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tch.accountStatus === 'active'
                              ? 'bg-[#a0f399] text-[#005312]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {tch.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => handleToggleTeacherStatus(tch.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs ${
                            tch.accountStatus === 'active'
                              ? 'bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6]'
                              : 'bg-[#a0f399]/60 text-[#005312] hover:bg-[#a0f399]'
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
                className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold bg-[#f8f9fa] text-[#031635] px-2 py-0.5 rounded-md border border-[#e1e3e4] w-fit">
                      {sub.code}
                    </span>
                    <h3 className="text-[16px] font-bold text-[#031635] mt-1">{sub.name}</h3>
                    <p className="text-[12px] text-[#75777f]">{sub.instructor} • BCA Sem 3</p>
                  </div>
                  <span className="bg-[#eef2ff] text-[#031635] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    60 Enrolled
                  </span>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-3 flex flex-col gap-1.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">Attendance Rate:</span>
                    <span className="font-bold text-[#031635]">{sub.percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777f]">Lectures Held:</span>
                    <span className="font-medium text-[#191c1d]">{sub.totalLectures} Classes</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Course settings opened for ${sub.code}`)}
                  className="w-full py-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[12px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  Manage Syllabus & Batches
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
                className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-[#75777f]">
                      {room.building}
                    </span>
                    <h3 className="text-[18px] font-bold text-[#031635] mt-0.5">{room.roomNumber}</h3>
                    <p className="text-[12px] text-[#44474e]">{room.name} (Cap: {room.capacity})</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      Calibrated
                    </span>
                    <span className="bg-[#eef2ff] text-[#031635] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#d8e2ff]">
                      Offline: {room.offlineAttendanceEnabled !== false ? '🟢 Enabled' : '🔴 Disabled'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-3.5 flex flex-col gap-2 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#75777f]">Location:</span>
                    <span className="font-bold text-[#005312] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Configured
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#75777f]">Geofence Perimeter:</span>
                    <span className="font-bold text-[#031635] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#005312]">check_circle</span> Configured ({room.radiusMeters}m)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#75777f]">BLE Beacon:</span>
                    <span className="font-mono text-[11px] text-[#031635] bg-white px-2 py-0.5 rounded border border-[#e1e3e4] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse" />
                      Active ({room.bleBeaconId})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#75777f]">Classroom Mesh SSID:</span>
                    <span className="font-mono text-[11px] text-[#723600] bg-[#fffaf0] px-2 py-0.5 rounded border border-[#ffdcc6]">
                      {room.localNetworkSsid || `SmartAttend-${room.roomNumber.replace(/\s+/g, '')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#75777f]">Local IP Subnet:</span>
                    <span className="font-mono text-[11px] text-[#44474e]">
                      {room.localNetworkIp || '192.168.4.1:8080'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => showToast(`Opening configuration for ${room.roomNumber}`)}
                    className="py-1.5 px-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => showToast(`Testing BLE Beacon in ${room.roomNumber}: 🟢 RSSI -58 dBm (Strong)`)}
                    className="py-1.5 px-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test BLE
                  </button>
                  <button
                    onClick={() => showToast(`GPS validation passed for ${room.roomNumber} (lat: ${room.lat})`)}
                    className="py-1.5 px-2 bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] border border-[#e1e3e4] rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test GPS
                  </button>
                  <button
                    onClick={() => showToast(`Offline readiness test PASSED for ${room.roomNumber}. Keypair & SSID ready.`)}
                    className="py-1.5 px-2 bg-[#fffaf0] hover:bg-[#ffdcc6] text-[#723600] border border-[#ffdcc6] rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs text-center"
                  >
                    Test Offline
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
                    value={settings.qrExpirySeconds || 15}
                    onChange={(e) => setSettings({ ...settings, qrExpirySeconds: Number(e.target.value) })}
                    className="px-3.5 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl font-semibold"
                  >
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds (Offline Standard)</option>
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

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        userRole="admin"
      />
    </div>
  );
};
