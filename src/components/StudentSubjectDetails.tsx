import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';
import { SubjectAttendance, AttendanceRecord, StudentProfile } from '../types';

interface StudentSubjectDetailsProps {
  subject: SubjectAttendance;
  student: StudentProfile;
  records: AttendanceRecord[];
  onBack: () => void;
  onRequestCorrection: (record: AttendanceRecord) => void;
}

export const StudentSubjectDetails: React.FC<StudentSubjectDetailsProps> = ({
  subject,
  student,
  records,
  onBack,
  onRequestCorrection,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'present' | 'absent' | 'needs_review'>('all');

  // Filter records matching this subject
  const subjectRecords = records.filter(
    (r) =>
      r.lectureCode.toLowerCase() === subject.code.toLowerCase() ||
      r.subjectName.toLowerCase().includes(subject.name.toLowerCase())
  );

  const displayedRecords = subjectRecords.filter((rec) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'present') return rec.status === 'present' || rec.status === 'probable';
    if (selectedFilter === 'absent') return rec.status === 'absent';
    if (selectedFilter === 'needs_review') return rec.status === 'needs_review';
    return true;
  });

  const isLowAttendance = subject.percentage < 75;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#f8f9fa] border border-[#e1e3e4] flex items-center justify-center text-[#191c1d] hover:bg-[#eef2ff] transition-colors cursor-pointer"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Subject Analytics</span>
              <span className="text-base font-bold text-[#031635] truncate max-w-[200px]">{subject.name}</span>
            </div>
          </div>
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-[#eef2ff] text-[#031635] border border-[#d8e2ff]">
            {subject.code}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 pt-4">
        {/* Low Attendance Warning Threshold Banner */}
        {isLowAttendance && (
          <div className="bg-[#fff8f6] border border-[#ffdad6] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[22px] shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex flex-col">
              <h2 className="text-[13px] font-bold text-[#ba1a1a]">
                Attendance Below Institutional Minimum (75%)
              </h2>
              <p className="text-[12px] text-[#75777f] mt-0.5 leading-relaxed">
                Your attendance for {subject.name} is currently {subject.percentage}%. You must attend at least 3 upcoming consecutive lectures to regain eligible examination status.
              </p>
            </div>
          </div>
        )}

        {/* Subject Overview Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#e1e3e4] shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                {subject.code} • {subject.room}
              </span>
              <h1 className="text-[20px] font-bold text-[#031635] mt-0.5 leading-tight">
                {subject.name}
              </h1>
              <p className="text-[13px] text-[#44474e] mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#75777f]">person</span>
                <span>{subject.instructor}</span>
              </p>
              <p className="text-[12px] text-[#75777f] mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#75777f]">schedule</span>
                <span>{subject.schedule}</span>
              </p>
            </div>

            {/* Percentage Badge */}
            <div className="flex flex-col items-center bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl px-4 py-3 shrink-0">
              <span className={`text-[26px] font-black leading-none ${isLowAttendance ? 'text-[#ba1a1a]' : 'text-[#031635]'}`}>
                {subject.percentage}%
              </span>
              <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                isLowAttendance ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#a0f399] text-[#005312]'
              }`}>
                {isLowAttendance ? 'Low Standing' : 'On Track'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-[#75777f]">
              <span>Progress vs 75% Requirement</span>
              <span>{subject.present} / {subject.totalLectures} Lectures Attended</span>
            </div>
            <div className="w-full h-3 bg-[#f3f4f5] rounded-full overflow-hidden relative">
              {/* 75% threshold marker line */}
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-black/40 z-10" title="75% Minimum Threshold" />
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLowAttendance ? 'bg-[#ba1a1a]' : 'bg-[#031635]'
                }`}
                style={{ width: `${Math.min(100, subject.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#75777f]">
              <span>0%</span>
              <span className="font-bold text-[#ba1a1a]">75% Minimum Req.</span>
              <span>100%</span>
            </div>
          </div>

          {/* 4 Stat Metric Tiles */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#f3f4f5]">
            <div className="bg-[#f8f9fa] p-2.5 rounded-xl text-center flex flex-col">
              <span className="text-[10px] text-[#75777f] font-semibold">Total</span>
              <span className="text-[16px] font-bold text-[#191c1d]">{subject.totalLectures}</span>
            </div>
            <div className="bg-[#eefcf0] p-2.5 rounded-xl text-center flex flex-col border border-[#a0f399]/40">
              <span className="text-[10px] text-[#005312] font-semibold">Present</span>
              <span className="text-[16px] font-bold text-[#005312]">{subject.present}</span>
            </div>
            <div className="bg-[#fff8f6] p-2.5 rounded-xl text-center flex flex-col border border-[#ffdad6]">
              <span className="text-[10px] text-[#ba1a1a] font-semibold">Absent</span>
              <span className="text-[16px] font-bold text-[#ba1a1a]">{subject.absent}</span>
            </div>
            <div className="bg-[#fffaf0] p-2.5 rounded-xl text-center flex flex-col border border-[#ffdcc6]">
              <span className="text-[10px] text-[#723600] font-semibold">Review</span>
              <span className="text-[16px] font-bold text-[#723600]">{subject.needsReview}</span>
            </div>
          </div>
        </div>

        {/* Attendance Records for this Subject */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#75777f]">
              Subject Lecture History
            </h3>
            <span className="text-[12px] font-semibold text-[#75777f]">
              {subjectRecords.length} Sessions Logged
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'present', 'absent', 'needs_review'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setSelectedFilter(filterKey)}
                className={`px-3 py-1 rounded-xl text-[12px] font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === filterKey
                    ? 'bg-[#031635] text-white shadow-xs'
                    : 'bg-white text-[#44474e] border border-[#e1e3e4]'
                }`}
              >
                {filterKey === 'needs_review' ? 'Needs Review' : filterKey}
              </button>
            ))}
          </div>

          {displayedRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-[#75777f] border border-[#e1e3e4]">
              <p className="text-[13px] font-semibold">No lectures found for this filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {displayedRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-4 border border-[#e1e3e4] shadow-xs flex items-center justify-between hover:border-[#c5c6cf] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#eef2ff] border border-[#d8e2ff] text-[#031635] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[14px] font-extrabold leading-none">{rec.day}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#75777f]">{rec.month}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#191c1d]">{rec.lectureType}</span>
                      <span className="text-[11px] text-[#75777f]">{rec.room} • {rec.evidence.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.status === 'present' && (
                      <span className="bg-[#a0f399] text-[#005312] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
                        Present
                      </span>
                    )}
                    {rec.status === 'probable' && (
                      <span className="bg-[#d8e2ff] text-[#001d36] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
                        Probable
                      </span>
                    )}
                    {rec.status === 'needs_review' && (
                      <span className="bg-[#ffdcc6] text-[#723600] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
                        Review
                      </span>
                    )}
                    {rec.status === 'absent' && (
                      <span className="bg-[#ffdad6] text-[#ba1a1a] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
                        Absent
                      </span>
                    )}

                    {(rec.status === 'needs_review' || rec.status === 'absent') && (
                      <button
                        onClick={() => onRequestCorrection(rec)}
                        title="Submit Attendance Correction"
                        className="w-8 h-8 rounded-lg bg-[#f8f9fa] border border-[#e1e3e4] text-[#ba1a1a] hover:bg-[#ffdad6] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_document</span>
                      </button>
                    )}
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
