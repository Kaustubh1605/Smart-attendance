import React, { useState } from 'react';
import { SubjectAttendance, StudentAttendanceItem } from '../types';

interface TeacherReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectAttendance[];
  students: StudentAttendanceItem[];
}

export const TeacherReportsModal: React.FC<TeacherReportsModalProps> = ({
  isOpen,
  onClose,
  subjects,
  students,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const lowAttendanceSubjects = subjects.filter((s) => s.percentage < 75);
  const presentCount = students.filter((s) => s.status === 'present').length;
  const reviewCount = students.filter((s) => s.status === 'needs_review').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Faculty Attendance Analytics</h2>
              <p className="text-[11px] text-[#75777f]">Department Reports & CSV Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3f4f5] text-[#44474e] flex items-center justify-center hover:bg-[#e1e3e4] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {/* Export Toast Banner */}
          {downloadSuccess && (
            <div className="bg-[#a0f399] text-[#005312] p-3 rounded-2xl flex items-center gap-2 text-[12px] font-bold shadow-xs">
              <span className="material-symbols-outlined text-[18px]">download_done</span>
              <span>CSV Report Generated: SmartAttend_BCA_Sem3_Report.csv</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-3 text-center flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#75777f]">Total Students</span>
              <span className="text-[20px] font-bold text-[#031635] mt-0.5">{students.length}</span>
              <span className="text-[10px] text-[#005312] font-semibold">{presentCount} Verified Present</span>
            </div>

            <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-3 text-center flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#723600]">Needs Review</span>
              <span className="text-[20px] font-bold text-[#723600] mt-0.5">{reviewCount}</span>
              <span className="text-[10px] text-[#723600] font-semibold">Location / Latency</span>
            </div>

            <div className="bg-[#fff8f6] border border-[#ffdad6] rounded-2xl p-3 text-center flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">Below 75%</span>
              <span className="text-[20px] font-bold text-[#ba1a1a] mt-0.5">{lowAttendanceSubjects.length}</span>
              <span className="text-[10px] text-[#ba1a1a] font-semibold">Course Warning</span>
            </div>
          </div>

          {/* Subject Breakdown List */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f] px-1">
              Assigned Courses & Attendance Rates
            </span>

            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-[#e1e3e4] rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#031635]">{sub.name}</span>
                    <span className="text-[10px] font-mono bg-[#f3f4f5] px-1.5 py-0.2 rounded border border-[#e1e3e4] text-[#44474e]">
                      {sub.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#75777f] mt-0.5">
                    {sub.present} attended • {sub.totalLectures} lectures held
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-[#f3f4f5] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sub.percentage < 75 ? 'bg-[#ba1a1a]' : 'bg-[#031635]'}`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                  <span
                    className={`text-[13px] font-extrabold ${
                      sub.percentage < 75 ? 'text-[#ba1a1a]' : 'text-[#031635]'
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Export Button */}
          <button
            onClick={handleExportCSV}
            className="w-full mt-2 bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3.5 px-4 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Download Detailed Attendance CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
