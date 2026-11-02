import React, { useState, useMemo } from 'react';
import {
  MOCK_CLASS_STUDENTS,
  MOCK_ADMIN_STUDENTS,
  MOCK_SUBJECTS,
  INITIAL_ATTENDANCE_HISTORY,
  AVATAR_URL,
} from '../data/mockData';
import { AttendanceRecord, StudentAttendanceItem } from '../types';

interface TeacherStudentDailyAttendanceViewProps {
  onShowToast?: (message: string) => void;
}

export const TeacherStudentDailyAttendanceView: React.FC<TeacherStudentDailyAttendanceViewProps> = ({
  onShowToast,
}) => {
  // Combine mock students from mock data
  const allStudents = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      studentId: string;
      rollNo: string;
      email: string;
      program: string;
      avatarUrl?: string;
      attendancePercentage: number;
    }> = [
      {
        id: 'stu-1',
        name: 'Kaustubh Nikam',
        studentId: 'STU-2023-8842',
        rollNo: 'BCA-01',
        email: 'kaustubh.nikam@springfield.edu',
        program: 'BCA Sem 3 - Div A',
        avatarUrl: AVATAR_URL,
        attendancePercentage: 91,
      },
      {
        id: 'stu-2',
        name: 'Priya Patel',
        studentId: 'STU-2023-8843',
        rollNo: 'BCA-02',
        email: 'priya.patel@springfield.edu',
        program: 'BCA Sem 3 - Div A',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        attendancePercentage: 96,
      },
      {
        id: 'stu-3',
        name: 'Rohan Gupta',
        studentId: 'STU-2023-8844',
        rollNo: 'BCA-03',
        email: 'rohan.gupta@springfield.edu',
        program: 'BCA Sem 3 - Div A',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
        attendancePercentage: 72,
      },
      {
        id: 'stu-4',
        name: 'Ananya Verma',
        studentId: 'STU-2023-8845',
        rollNo: 'BCA-04',
        email: 'ananya.verma@springfield.edu',
        program: 'BCA Sem 3 - Div A',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        attendancePercentage: 88,
      },
      {
        id: 'stu-5',
        name: 'Vikramaditya Rao',
        studentId: 'STU-2023-8846',
        rollNo: 'BCA-05',
        email: 'vikram.rao@springfield.edu',
        program: 'BCA Sem 3 - Div A',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        attendancePercentage: 68,
      },
    ];

    // Check for saved students in localStorage
    try {
      const saved = localStorage.getItem('smartattend_admin_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            if (!list.some((existing) => existing.studentId === s.studentId)) {
              list.push({
                id: s.id || `stu-${Date.now()}`,
                name: s.name,
                studentId: s.studentId,
                rollNo: s.rollNo || `BCA-${Math.floor(10 + Math.random() * 80)}`,
                email: s.email,
                program: s.className || s.program || 'BCA Sem 3',
                avatarUrl: undefined,
                attendancePercentage: s.attendancePercentage || 95,
              });
            }
          });
        }
      }
    } catch {}

    return list;
  }, []);

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(allStudents[0]?.studentId || 'STU-2023-8842');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Dynamic state for day-by-day records with localStorage persistence and teacher override support
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smartattend_attendance_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ATTENDANCE_HISTORY;
  });

  // Dynamically derive all subjects (including newly teacher-created courses and history)
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();

    // Seed from base subjects
    MOCK_SUBJECTS.forEach((s) => {
      map.set(s.code.toUpperCase().trim(), { code: s.code.toUpperCase().trim(), name: s.name });
    });

    // Read dynamic subjects saved in localStorage
    try {
      const savedSubs = localStorage.getItem('smartattend_dynamic_subjects');
      if (savedSubs) {
        const parsed = JSON.parse(savedSubs);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            if (s.code) map.set(s.code.toUpperCase().trim(), { code: s.code.toUpperCase().trim(), name: s.name || s.code });
          });
        }
      }
    } catch {}

    // Read lectures saved in localStorage
    try {
      const savedLecs = localStorage.getItem('smartattend_lectures');
      if (savedLecs) {
        const parsed = JSON.parse(savedLecs);
        if (Array.isArray(parsed)) {
          parsed.forEach((l: any) => {
            if (l.code) map.set(l.code.toUpperCase().trim(), { code: l.code.toUpperCase().trim(), name: l.name || l.code });
          });
        }
      }
    } catch {}

    // Read from records history
    records.forEach((r) => {
      if (r.lectureCode) {
        const code = r.lectureCode.toUpperCase().trim();
        if (!map.has(code)) {
          map.set(code, { code, name: r.subjectName || code });
        }
      }
    });

    return Array.from(map.values());
  }, [records]);

  // Real-time synchronization when attendance is recorded or overridden
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'smartattend_attendance_history' && e.newValue) {
        try {
          setRecords(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return allStudents;
    return allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [allStudents, studentSearch]);

  // Current selected student
  const currentStudent = useMemo(() => {
    return (
      allStudents.find((s) => s.studentId === selectedStudentId) ||
      filteredStudents[0] ||
      allStudents[0]
    );
  }, [allStudents, filteredStudents, selectedStudentId]);

  // Filter day-by-day records for this student, subject, and month
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Subject filter
      if (
        selectedSubjectCode !== 'ALL' &&
        rec.lectureCode.toLowerCase() !== selectedSubjectCode.toLowerCase()
      ) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        let recMonth = rec.month ? `${rec.month} 2026` : '';
        if (rec.date) {
          const d = new Date(rec.date);
          if (!isNaN(d.getTime())) {
            recMonth = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          }
        }
        if (!recMonth.toLowerCase().includes(selectedMonth.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedSubjectCode, selectedMonth]);

  // Metrics for current selection
  const totalClasses = filteredRecords.length;
  const presentCount = filteredRecords.filter(
    (r) => r.status === 'present' || r.status === 'probable'
  ).length;
  const absentCount = filteredRecords.filter((r) => r.status === 'absent').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'needs_review').length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Handle Teacher Status Override
  const handleUpdateStatus = (recordId: string, newStatus: 'present' | 'absent' | 'needs_review') => {
    const now = new Date();
    const deviceTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    setRecords((prev) => {
      const updated = prev.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: newStatus,
            evidence: {
              ...r.evidence,
              timestamp: deviceTimeStr,
              notes: `Manually verified & overridden to ${newStatus.toUpperCase()} by Instructor Prof. Sharma at device time ${deviceTimeStr}.`,
              confidenceScore: newStatus === 'present' ? 100 : newStatus === 'absent' ? 0 : 50,
            },
          };
        }
        return r;
      });

      try {
        localStorage.setItem('smartattend_attendance_history', JSON.stringify(updated));
        const channel = new BroadcastChannel('smartattend_channel');
        channel.postMessage({ type: 'ATTENDANCE_OVERRIDDEN', recordId, newStatus, timestamp: deviceTimeStr });
        channel.close();
      } catch {}

      return updated;
    });

    const msg = `Updated ${currentStudent.name}'s status to ${newStatus.toUpperCase()}`;
    if (onShowToast) onShowToast(msg);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Subject Code', 'Subject Name', 'Classroom', 'Time', 'Status', 'Verification Score'];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.day || '',
      r.lectureCode,
      r.subjectName,
      r.room || 'Room 402',
      r.evidence?.timestamp || '',
      r.status,
      `${r.evidence?.confidenceScore || 0}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${currentStudent.name.replace(/\s+/g, '_')}_${selectedSubjectCode}_Attendance.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('Attendance report exported to CSV!');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Search Header Command Bar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">person_search</span>
              </span>
              <h2 className="text-[18px] md:text-[20px] font-extrabold text-slate-900 tracking-tight">
                Student & Subject Daily Attendance Inspector
              </h2>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Search any enrolled student, choose course subject, and inspect or edit complete day-by-day attendance history
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Student CSV</span>
          </button>
        </div>

        {/* Live Student Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined text-[20px] text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search student by Name (e.g. Kaustubh, Priya), Roll No (e.g. BCA-01), or ID (e.g. STU-2023-8842)..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
          />
          {studentSearch && (
            <button
              onClick={() => setStudentSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Student Cards Carousel / Quick Switcher */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {filteredStudents.map((st) => {
            const isSelected = currentStudent.studentId === st.studentId;
            return (
              <button
                key={st.studentId}
                onClick={() => setSelectedStudentId(st.studentId)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {st.avatarUrl ? (
                    <img src={st.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    st.name.charAt(0)
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-[12px] leading-tight truncate max-w-[120px]">
                    {st.name}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {st.rollNo} • {st.studentId}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : st.attendancePercentage >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {st.attendancePercentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Student Profile Banner */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-[20px] shadow-md shadow-indigo-500/20">
            {currentStudent.avatarUrl ? (
              <img src={currentStudent.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              currentStudent.name.charAt(0)
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
                {currentStudent.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold border border-slate-200">
                {currentStudent.studentId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                {currentStudent.rollNo}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {currentStudent.program} • {currentStudent.email}
            </p>
          </div>
        </div>

        {/* Filters for Subject & Month */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Subject Filter */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Subject
            </span>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
            >
              <option value="ALL">All Enrolled Subjects ({availableSubjects.length})</option>
              {availableSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter by Month
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
            >
              <option value="ALL">All Academic Months</option>
              <option value="November">November 2026</option>
              <option value="October">October 2026</option>
              <option value="September">September 2026</option>
              <option value="August">August 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded</span>
          <span className="text-[24px] font-black text-slate-900 mt-1">{totalClasses}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Lectures in Scope</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Present</span>
          <span className="text-[24px] font-black text-emerald-700 mt-1">{presentCount}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5">Verified Attendances</span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Absent</span>
          <span className="text-[24px] font-black text-rose-700 mt-1">{absentCount}</span>
          <span className="text-[11px] text-rose-600 mt-0.5">Missed / Unexcused</span>
        </div>

        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 shadow-xs flex flex-col">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Subject Attendance</span>
          <span className="text-[24px] font-black text-indigo-700 mt-1">{attendanceRate}%</span>
          <span className="text-[11px] text-indigo-600 mt-0.5">
            {attendanceRate >= 75 ? '✓ Compliant' : '⚠ Below 75% Target'}
          </span>
        </div>
      </div>

      {/* Day-by-Day Detailed Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">
              Day-by-Day Lecture Attendance Timeline
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredRecords.length} sessions for {currentStudent.name} (
              {selectedSubjectCode === 'ALL' ? 'All Subjects' : selectedSubjectCode} •{' '}
              {selectedMonth === 'ALL' ? 'All Months' : selectedMonth})
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">event_busy</span>
            <h4 className="text-[15px] font-bold text-slate-800">No Attendance Records Matching Filter</h4>
            <p className="text-[12px] text-slate-500 mt-1">Try switching the subject or month filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-5">Date & Day</th>
                  <th className="py-3 px-5">Subject Code & Name</th>
                  <th className="py-3 px-5">Time Slot</th>
                  <th className="py-3 px-5">Classroom</th>
                  <th className="py-3 px-5">Verification Integrity</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Teacher Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const isPresent = rec.status === 'present' || rec.status === 'probable';
                  const isAbsent = rec.status === 'absent';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                            {rec.date}
                          </span>
                          <span className="text-slate-500 font-medium">{rec.month}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{rec.subjectName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{rec.lectureCode}</span>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600 font-medium">
                        {rec.evidence?.timestamp || '10:00 AM – 11:00 AM'}
                      </td>

                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-700">
                        {rec.room || 'Room 402'}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          {isPresent ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                              QR + Beacon ({rec.evidence?.confidenceScore || 96}%)
                            </span>
                          ) : isAbsent ? (
                            <span className="text-rose-700 font-medium text-[11px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-rose-500">cancel</span>
                              Unrecorded Session
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium text-[11px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-amber-500">help</span>
                              Disputed Distance
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isAbsent
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPresent ? 'bg-emerald-500' : isAbsent ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status !== 'present' && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'present')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Mark this session Present"
                            >
                              Mark Present
                            </button>
                          )}
                          {rec.status !== 'absent' && (
                            <button
                              onClick={() => handleUpdateStatus(rec.id, 'absent')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                              title="Mark this session Absent"
                            >
                              Mark Absent
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
        )}
      </div>
    </div>
  );
};

