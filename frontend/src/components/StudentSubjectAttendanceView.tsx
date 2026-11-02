import React, { useState, useMemo } from 'react';
import { LOGO_URL, MOCK_SUBJECTS } from '../data/mockData';
import { SubjectAttendance, AttendanceRecord, StudentProfile } from '../types';

interface MonthlyGroup {
  monthName: string;
  monthKey: string;
  records: AttendanceRecord[];
  totalLectures: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  percentage: number;
}

interface StudentSubjectAttendanceViewProps {
  student: StudentProfile;
  subjects?: SubjectAttendance[];
  attendanceHistory: AttendanceRecord[];
  onRequestCorrection?: (record: AttendanceRecord) => void;
  onNavigateHome?: () => void;
  onNavigateMaterials?: (subjectCode?: string) => void;
}

export const StudentSubjectAttendanceView: React.FC<StudentSubjectAttendanceViewProps> = ({
  student,
  subjects = MOCK_SUBJECTS,
  attendanceHistory,
  onRequestCorrection,
  onNavigateHome,
  onNavigateMaterials,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(subjects[0]?.code || 'BCA 301');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Filter subjects matching search query
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q) ||
        (s.room || '').toLowerCase().includes(q)
    );
  }, [subjects, searchQuery]);

  // Selected subject object
  const currentSubject = useMemo(() => {
    return (
      subjects.find((s) => s.code.toLowerCase() === selectedSubjectCode.toLowerCase()) ||
      filteredSubjects[0] ||
      subjects[0]
    );
  }, [subjects, filteredSubjects, selectedSubjectCode]);

  // All attendance records for this specific subject
  const subjectRecords = useMemo(() => {
    if (!currentSubject) return [];
    return attendanceHistory.filter(
      (r) =>
        r.lectureCode.toLowerCase() === currentSubject.code.toLowerCase() ||
        r.subjectName.toLowerCase().includes(currentSubject.name.toLowerCase()) ||
        currentSubject.name.toLowerCase().includes(r.subjectName.toLowerCase())
    );
  }, [attendanceHistory, currentSubject]);

  // Group records by Month (e.g., "October 2026", "September 2026", etc.)
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, MonthlyGroup> = {};

    subjectRecords.forEach((record) => {
      // Determine month key from record date or month field
      let monthKey = record.month ? `${record.month} 2026` : 'Recent';
      if (record.date) {
        const d = new Date(record.date);
        if (!isNaN(d.getTime())) {
          monthKey = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
      }

      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthName: monthKey,
          monthKey,
          records: [],
          totalLectures: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          percentage: 0,
        };
      }

      groups[monthKey].records.push(record);
      groups[monthKey].totalLectures += 1;
      if (record.status === 'present') {
        groups[monthKey].presentCount += 1;
      } else if (record.status === 'absent') {
        groups[monthKey].absentCount += 1;
      } else {
        // needs_review or probable
        groups[monthKey].lateCount += 1;
        // Count probable as present credit
        if (record.status === 'probable') {
          groups[monthKey].presentCount += 1;
        }
      }
    });

    // Calculate percentage per month
    Object.values(groups).forEach((g) => {
      g.percentage = g.totalLectures > 0 ? Math.round((g.presentCount / g.totalLectures) * 100) : 0;
    });

    return groups;
  }, [subjectRecords]);

  // Available month tabs
  const availableMonths = useMemo(() => {
    return Object.keys(monthlyGroups);
  }, [monthlyGroups]);

  // Overall stats for this subject
  const subjectTotal = subjectRecords.length > 0 ? subjectRecords.length : currentSubject?.totalLectures || 0;
  const subjectPresent =
    subjectRecords.length > 0
      ? subjectRecords.filter((r) => r.status === 'present' || r.status === 'probable').length
      : currentSubject?.present || 0;
  const subjectAbsent =
    subjectRecords.length > 0
      ? subjectRecords.filter((r) => r.status === 'absent').length
      : currentSubject?.absent || 0;
  const subjectPercentage =
    subjectTotal > 0 ? Math.round((subjectPresent / subjectTotal) * 100) : currentSubject?.percentage || 0;

  const isLowAttendance = subjectPercentage < 75;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 text-slate-900 pb-28 font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 w-full z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="Back to Home"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-indigo-600">analytics</span>
                Academic Intelligence
              </span>
              <h1 className="text-[16px] sm:text-[18px] font-extrabold text-slate-900 tracking-tight">
                Subject-Wise Monthly Attendance
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {student.name} • {student.studentId}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 flex flex-col gap-5">
        {/* Search Bar & Filter Controls */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-[20px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search subject by title, course code (e.g. BCA 301), instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="text-[11px] font-bold text-slate-500 self-center sm:self-auto shrink-0">
              Found <span className="text-slate-900 font-extrabold">{filteredSubjects.length}</span> Course{filteredSubjects.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Quick Subject Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredSubjects.map((sub) => {
              const isSelected = currentSubject?.code.toLowerCase() === sub.code.toLowerCase();
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectCode(sub.code)}
                  className={`px-3.5 py-2 rounded-2xl text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 active:scale-95 shrink-0 ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-80">{sub.code}</span>
                  <span>{sub.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : sub.percentage >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Subject Showcase Card */}
        {currentSubject && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col gap-5">
            {/* Background Decorative Gradient Wave */}
            <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-indigo-500/10 via-blue-500/5 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-extrabold text-[11px] rounded-xl border border-indigo-200/70">
                    {currentSubject.code}
                  </span>
                  <span className="text-[12px] text-slate-400 font-medium">•</span>
                  <span className="text-[12px] text-slate-500 font-semibold">{currentSubject.room || 'Classroom 402'}</span>
                  <span className="text-[12px] text-slate-400 font-medium">•</span>
                  <span className="text-[12px] text-slate-500 font-medium">{currentSubject.schedule || 'Scheduled Classes'}</span>
                </div>
                <h2 className="text-[22px] sm:text-[24px] font-extrabold text-slate-900 mt-1.5 tracking-tight">
                  {currentSubject.name}
                </h2>
                <p className="text-[13px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">person</span>
                  <span className="font-semibold text-slate-800">{currentSubject.instructor}</span>
                  <span className="text-slate-400">•</span>
                  <span>BCA Dept</span>
                </p>
              </div>

              {/* Attendance Rate Circle / Gauge */}
              <div className="flex items-center gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 shrink-0">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Course Standing
                  </span>
                  <span
                    className={`text-[28px] font-black tracking-tight leading-none mt-1 ${
                      isLowAttendance ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {subjectPercentage}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {isLowAttendance ? 'Below 75% Target' : 'Compliant Standing'}
                  </span>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    isLowAttendance
                      ? 'bg-gradient-to-tr from-rose-600 to-amber-600 shadow-rose-500/20'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isLowAttendance ? 'warning' : 'verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Alert if Below Minimum Threshold */}
            {isLowAttendance && (
              <div className="p-4 bg-rose-50/80 border border-rose-200 text-rose-900 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined text-[22px] text-rose-600 shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex flex-col text-[12px]">
                  <span className="font-extrabold text-rose-800">
                    Low Attendance Warning (Below 75% Minimum Required)
                  </span>
                  <p className="text-rose-700/90 mt-0.5 leading-relaxed">
                    You have attended {subjectPresent} out of {subjectTotal} lectures. Attend the next consecutive lectures to restore eligible semester exam status.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Delivered</span>
                <span className="text-[22px] font-black text-slate-900 mt-1">{subjectTotal}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Curriculum Lectures</span>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Present</span>
                <span className="text-[22px] font-black text-emerald-700 mt-1">{subjectPresent}</span>
                <span className="text-[10px] text-emerald-600 mt-0.5">Lectures Verified</span>
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl flex flex-col">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Absent</span>
                <span className="text-[22px] font-black text-rose-700 mt-1">{subjectAbsent}</span>
                <span className="text-[10px] text-rose-600 mt-0.5">Missed Sessions</span>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Attendance %</span>
                <span className="text-[22px] font-black text-indigo-700 mt-1">{subjectPercentage}%</span>
                <span className="text-[10px] text-indigo-600 mt-0.5">Subject Ratio</span>
              </div>
            </div>

            {/* Materials Quick Action */}
            {onNavigateMaterials && (
              <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/60">
                <div className="flex items-center gap-2 text-[12px] text-indigo-900 font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-indigo-600">menu_book</span>
                  <span>Looking for lecture notes & syllabus for {currentSubject.code}?</span>
                </div>
                <button
                  onClick={() => onNavigateMaterials(currentSubject.code)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  View Study Materials →
                </button>
              </div>
            )}
          </div>
        )}

        {/* MONTH-WISE ATTENDANCE BREAKDOWN SECTION */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-600">calendar_month</span>
                Monthly Attendance Breakdown
              </h3>
              <p className="text-[12px] text-slate-500">
                Detailed lecture presence and absence counts grouped per academic month for <strong className="text-slate-800">{currentSubject?.name}</strong>
              </p>
            </div>

            {/* Month Filter Selector */}
            {availableMonths.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto max-w-full">
                <button
                  onClick={() => setSelectedMonth('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedMonth === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Months ({availableMonths.length})
                </button>
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedMonth === m
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Cards List */}
          {Object.keys(monthlyGroups).length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                <span className="material-symbols-outlined text-[32px]">event_busy</span>
              </div>
              <h4 className="text-[16px] font-bold text-slate-900">No Historical Records Found</h4>
              <p className="text-[12px] text-slate-500 max-w-sm mt-1">
                Attendance logs for {currentSubject?.name} will populate as daily lectures are conducted.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {(Object.entries(monthlyGroups) as [string, MonthlyGroup][])
                .filter(([m]) => selectedMonth === 'ALL' || selectedMonth === m)
                .map(([monthKey, group]) => (
                  <div
                    key={monthKey}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col"
                  >
                    {/* Month Header Banner */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center font-extrabold text-slate-800 text-[14px] shadow-xs">
                          {monthKey.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-extrabold text-slate-900">{monthKey}</h4>
                          <span className="text-[11px] text-slate-500">
                            {group.totalLectures} Class{group.totalLectures !== 1 ? 'es' : ''} Conducted
                          </span>
                        </div>
                      </div>

                      {/* Month Quick Metric Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {group.presentCount} Present
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {group.absentCount} Absent
                        </span>
                        {group.lateCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                            {group.lateCount} Under Review
                          </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-[12px] font-black bg-slate-900 text-white shadow-xs">
                          {group.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Day-by-Day Detailed Table for this Month */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                            <th className="py-2.5 px-4 sm:px-5">Date & Day</th>
                            <th className="py-2.5 px-4">Time Slot</th>
                            <th className="py-2.5 px-4">Classroom</th>
                            <th className="py-2.5 px-4">Verification Integrity</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                            <th className="py-2.5 px-4 sm:px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.records.map((rec) => {
                            const isPresent = rec.status === 'present' || rec.status === 'probable';
                            const isAbsent = rec.status === 'absent';
                            return (
                              <tr
                                key={rec.id}
                                className="hover:bg-slate-50/70 transition-colors group"
                              >
                                <td className="py-3 px-4 sm:px-5">
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`w-8 h-8 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border ${
                                        isPresent
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : isAbsent
                                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                                          : 'bg-amber-50 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      <span>{rec.day || rec.date.slice(-2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-900">
                                        {rec.date}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {rec.month} • {rec.lectureType || 'Regular Lecture'}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-slate-600 font-medium">
                                  {rec.evidence?.timestamp || '10:00 AM – 11:00 AM'}
                                </td>

                                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                                  {rec.room || 'Room 402'}
                                </td>

                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    {isPresent ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                        <span className="material-symbols-outlined text-[15px] text-emerald-600">
                                          verified
                                        </span>
                                        <span>QR + Beacon Verified ({rec.evidence?.confidenceScore || 96}%)</span>
                                      </span>
                                    ) : isAbsent ? (
                                      <span className="inline-flex items-center gap-1 text-rose-700 font-medium text-[11px]">
                                        <span className="material-symbols-outlined text-[15px] text-rose-500">
                                          cancel
                                        </span>
                                        <span>Unrecorded / Session Concluded</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                                        <span className="material-symbols-outlined text-[15px] text-amber-500">
                                          help
                                        </span>
                                        <span>Disputed Location Handover</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-center">
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
                                        isPresent
                                          ? 'bg-emerald-500'
                                          : isAbsent
                                          ? 'bg-rose-500'
                                          : 'bg-amber-500'
                                      }`}
                                    />
                                    {rec.status.replace('_', ' ')}
                                  </span>
                                </td>

                                <td className="py-3 px-4 sm:px-5 text-right">
                                  {(isAbsent || rec.status === 'needs_review') && onRequestCorrection ? (
                                    <button
                                      onClick={() => onRequestCorrection(rec)}
                                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                                    >
                                      Dispute / Fix
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      #OK-{rec.id.slice(-4)}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
