import React, { useState } from 'react';
import { CorrectionRequest, AttendanceRecord, SubjectAttendance } from '../types';
import { generateUniqueId } from '../data/mockData';

interface StudentCorrectionModalProps {
  initialRecord?: AttendanceRecord | null;
  subjects: SubjectAttendance[];
  requests: CorrectionRequest[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (newReq: CorrectionRequest) => void;
}

export const StudentCorrectionModal: React.FC<StudentCorrectionModalProps> = ({
  initialRecord,
  subjects,
  requests,
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'new_request' | 'my_history'>('new_request');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(
    initialRecord ? initialRecord.lectureCode : (subjects[0]?.code || 'BCA 301')
  );
  const [lectureDate, setLectureDate] = useState<string>(
    initialRecord ? initialRecord.date : new Date().toISOString().split('T')[0]
  );
  const [currentStatus, setCurrentStatus] = useState<string>(
    initialRecord ? initialRecord.status : 'needs_review'
  );
  const [reason, setReason] = useState<string>('Location/WiFi boundary variance while seated in room');
  const [note, setNote] = useState<string>('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedSub = subjects.find((s) => s.code === selectedSubjectCode);
    const newReq: CorrectionRequest = {
      id: generateUniqueId('cr'),
      studentId: 'STU-2023-8842',
      studentName: 'Kaustubh Nikam',
      rollNo: 'BCA-01',
      avatarUrl: '',
      lectureId: initialRecord ? initialRecord.id : 'manual-entry',
      lectureCode: selectedSubjectCode,
      subjectName: matchedSub ? matchedSub.name : 'Selected Lecture',
      lectureDate: lectureDate,
      currentStatus: currentStatus as any,
      reason: reason,
      note: note.trim() || undefined,
      submittedAt: 'Just now',
      status: 'pending',
    };

    onSubmitRequest(newReq);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setActiveTab('my_history');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#eef2ff] text-[#031635] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">edit_document</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Attendance Dispute & Correction</h2>
              <p className="text-[11px] text-[#75777f]">Official review request to faculty</p>
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
            onClick={() => setActiveTab('new_request')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'new_request'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            Submit Request
          </button>
          <button
            onClick={() => setActiveTab('my_history')}
            className={`pb-2.5 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'my_history'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            <span>Request Status</span>
            <span className="text-[10px] font-extrabold bg-[#031635] text-white px-1.5 py-0.2 rounded-full">
              {requests.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {activeTab === 'new_request' ? (
            isSubmittedSuccess ? (
              <div className="py-10 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#a0f399] text-[#005312] flex items-center justify-center shadow-md animate-bounce">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>
                <h3 className="text-[17px] font-bold text-[#031635]">Dispute Request Submitted</h3>
                <p className="text-[12px] text-[#75777f] max-w-xs">
                  Your correction request has been forwarded to the course instructor. You will be notified once reviewed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Subject Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Course / Subject *</label>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => setSelectedSubjectCode(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl px-3 py-2 text-[13px] font-medium text-[#191c1d] focus:outline-none focus:border-[#031635]"
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.code}>
                        {sub.code} - {sub.name} ({sub.instructor})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lecture Date & Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-[#44474e]">Lecture Date *</label>
                    <input
                      type="date"
                      value={lectureDate}
                      onChange={(e) => setLectureDate(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl px-3 py-2 text-[13px] font-medium text-[#191c1d] focus:outline-none focus:border-[#031635]"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-bold text-[#44474e]">Current Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl px-3 py-2 text-[13px] font-medium text-[#191c1d] focus:outline-none focus:border-[#031635]"
                    >
                      <option value="needs_review">Needs Review</option>
                      <option value="absent">Marked Absent</option>
                    </select>
                  </div>
                </div>

                {/* Reason Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">Dispute Reason *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl px-3 py-2 text-[13px] font-medium text-[#191c1d] focus:outline-none focus:border-[#031635]"
                    required
                  >
                    <option value="Location/WiFi boundary variance while seated in room">
                      Location / Campus WiFi Boundary Variance
                    </option>
                    <option value="Device Battery / Hardware Failure during QR scan">
                      Device Battery / Hardware Failure during QR scan
                    </option>
                    <option value="BLE beacon synchronization signal delay">
                      BLE Beacon synchronization delay
                    </option>
                    <option value="Late entry permitted by professor verbally">
                      Late entry permitted by professor verbally
                    </option>
                    <option value="Official College Duty / Prior Leave Approved">
                      Official College Duty / Prior Leave Approved
                    </option>
                    <option value="Other / Special Exemption">Other / Special Exemption</option>
                  </select>
                </div>

                {/* Supporting Note */}
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#44474e]">
                    Supporting Note / Bench Details
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Seated in Row 3 next to Rohan Gupta, device connected to Arya-WiFi-4"
                    className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl p-3 text-[13px] text-[#191c1d] placeholder-[#75777f] focus:outline-none focus:border-[#031635] resize-none"
                  />
                </div>

                <div className="p-3 bg-[#eef2ff] border border-[#d8e2ff] rounded-xl text-[11px] text-[#001d36] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#031635] shrink-0">info</span>
                  <span>Requests are validated against faculty attendance logs and physical seating sheets.</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3 px-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Submit Correction Request</span>
                </button>
              </form>
            )
          ) : (
            /* Requests History */
            <div className="flex flex-col gap-3">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-[#75777f]">
                  <p className="text-[13px]">No correction requests submitted yet.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                          {req.lectureCode} • {req.lectureDate}
                        </span>
                        <h4 className="text-[14px] font-bold text-[#031635]">{req.subjectName}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-[#a0f399] text-[#005312]'
                            : req.status === 'rejected'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#ffdcc6] text-[#723600]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#44474e] bg-white p-2.5 rounded-xl border border-[#e1e3e4]">
                      <span className="font-semibold text-[#191c1d]">Reason: </span>
                      {req.reason}
                    </p>

                    {req.note && (
                      <p className="text-[11px] text-[#75777f] italic">
                        Note: &ldquo;{req.note}&rdquo;
                      </p>
                    )}

                    {req.teacherNote && (
                      <div className="mt-1 p-2.5 bg-[#eef2ff] border border-[#d8e2ff] rounded-xl text-[11px] text-[#001d36]">
                        <span className="font-bold">Faculty Remark ({req.reviewedBy}): </span>
                        <span>{req.teacherNote}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-[#75777f] flex justify-between items-center pt-1 border-t border-[#e1e3e4]">
                      <span>Submitted: {req.submittedAt}</span>
                      <span className="font-mono text-[9px]">{req.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
