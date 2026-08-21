import React, { useState } from 'react';
import { StudentAttendanceItem, CorrectionRequest } from '../types';

interface TeacherReviewQueueModalProps {
  students: StudentAttendanceItem[];
  correctionRequests: CorrectionRequest[];
  isOpen: boolean;
  onClose: () => void;
  onApproveStudent: (studentId: string) => void;
  onRejectStudent: (studentId: string) => void;
  onApproveCorrection: (requestId: string, teacherNote: string) => void;
  onRejectCorrection: (requestId: string, teacherNote: string) => void;
}

export const TeacherReviewQueueModal: React.FC<TeacherReviewQueueModalProps> = ({
  students,
  correctionRequests,
  isOpen,
  onClose,
  onApproveStudent,
  onRejectStudent,
  onApproveCorrection,
  onRejectCorrection,
}) => {
  const [activeTab, setActiveTab] = useState<'flagged_students' | 'disputes'>('flagged_students');
  const [teacherRemarks, setTeacherRemarks] = useState<{ [id: string]: string }>({});

  if (!isOpen) return null;

  const flaggedStudents = students.filter((s) => s.status === 'needs_review' || s.anomalyFlag);
  const pendingDisputes = correctionRequests.filter((r) => r.status === 'pending');

  const handleRemarkChange = (id: string, text: string) => {
    setTeacherRemarks((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#723600] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Attendance Review Queue</h2>
              <p className="text-[11px] text-[#75777f]">Faculty Discretion & Dispute Resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3f4f5] text-[#44474e] flex items-center justify-center hover:bg-[#e1e3e4] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e1e3e4] bg-[#f8f9fa] px-5 pt-2">
          <button
            onClick={() => setActiveTab('flagged_students')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'flagged_students'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            <span>Telemetry Flags</span>
            <span className="text-[10px] font-extrabold bg-[#ffdcc6] text-[#723600] px-1.5 py-0.2 rounded-full">
              {flaggedStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'disputes'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            <span>Student Disputes</span>
            <span className="text-[10px] font-extrabold bg-[#031635] text-white px-1.5 py-0.2 rounded-full">
              {pendingDisputes.length}
            </span>
          </button>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {activeTab === 'flagged_students' ? (
            flaggedStudents.length === 0 ? (
              <div className="py-12 text-center text-[#75777f]">
                <span className="material-symbols-outlined text-[36px] text-[#005312] mb-1">check_circle</span>
                <p className="text-[13px] font-semibold text-[#031635]">No Flagged Students in Queue</p>
                <p className="text-[11px] text-[#75777f] mt-0.5">All attendance telemetry reconciled normally.</p>
              </div>
            ) : (
              flaggedStudents.map((st) => (
                <div
                  key={st.studentId}
                  className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[14px] font-bold text-[#031635]">{st.studentName}</h4>
                          <span className="text-[10px] font-bold font-mono text-[#75777f] bg-white px-1.5 py-0.2 rounded border border-[#e1e3e4]">
                            {st.rollNo}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#75777f]">{st.studentId} • Scanned {st.time}</span>
                      </div>
                    </div>

                    <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      Needs Review
                    </span>
                  </div>

                  {/* Flag Reason */}
                  <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-xl p-2.5 text-[12px] text-[#723600] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                    <span>{st.anomalyFlag || 'Location perimeter boundary discrepancy.'}</span>
                  </div>

                  {/* Decision Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onApproveStudent(st.studentId)}
                      className="bg-[#005312] text-white hover:bg-[#00390b] py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Approve Present</span>
                    </button>

                    <button
                      onClick={() => onRejectStudent(st.studentId)}
                      className="bg-[#ba1a1a] text-white hover:bg-[#93000a] py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      <span>Mark Absent</span>
                    </button>
                  </div>
                </div>
              ))
            )
          ) : pendingDisputes.length === 0 ? (
            <div className="py-12 text-center text-[#75777f]">
              <span className="material-symbols-outlined text-[36px] text-[#031635] mb-1">done_all</span>
              <p className="text-[13px] font-semibold text-[#031635]">No Pending Dispute Requests</p>
              <p className="text-[11px] text-[#75777f] mt-0.5">All student correction requests have been addressed.</p>
            </div>
          ) : (
            pendingDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#031635] text-white flex items-center justify-center font-bold text-[12px]">
                      {dispute.rollNo}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[14px] font-bold text-[#031635]">{dispute.studentName}</h4>
                      <span className="text-[11px] text-[#75777f]">
                        {dispute.lectureCode} • {dispute.lectureDate}
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#ffdcc6] text-[#723600] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#e1e3e4] text-[12px] flex flex-col gap-1">
                  <span className="text-[#75777f] font-semibold">Student Claim:</span>
                  <p className="text-[#191c1d] font-medium">{dispute.reason}</p>
                  {dispute.note && (
                    <p className="text-[11px] text-[#75777f] italic">&ldquo;{dispute.note}&rdquo;</p>
                  )}
                </div>

                {/* Faculty Remark Input */}
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Optional faculty review note..."
                    value={teacherRemarks[dispute.id] || ''}
                    onChange={(e) => handleRemarkChange(dispute.id, e.target.value)}
                    className="w-full bg-white border border-[#e1e3e4] rounded-xl px-3 py-1.5 text-[12px] text-[#191c1d] placeholder-[#75777f] focus:outline-none focus:border-[#031635]"
                  />
                </div>

                {/* Dispute Decision Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      onApproveCorrection(
                        dispute.id,
                        teacherRemarks[dispute.id] || 'Verified against physical seating sheet.'
                      )
                    }
                    className="bg-[#005312] text-white hover:bg-[#00390b] py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Approve Dispute</span>
                  </button>

                  <button
                    onClick={() =>
                      onRejectCorrection(
                        dispute.id,
                        teacherRemarks[dispute.id] || 'Disputed claim could not be substantiated.'
                      )
                    }
                    className="bg-[#ba1a1a] text-white hover:bg-[#93000a] py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    <span>Reject Dispute</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
