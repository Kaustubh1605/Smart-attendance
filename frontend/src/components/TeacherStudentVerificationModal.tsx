import React from 'react';
import { StudentAttendanceItem } from '../types';

interface TeacherStudentVerificationModalProps {
  student: StudentAttendanceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (studentId: string, newStatus: 'present' | 'absent' | 'needs_review') => void;
}

export const TeacherStudentVerificationModal: React.FC<TeacherStudentVerificationModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Student Verification Evidence</h2>
              <p className="text-[11px] text-[#75777f]">Multi-Factor Telemetry Audit</p>
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
          {/* Student Profile Card */}
          <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex items-center gap-3.5">
            <img
              src={student.avatarUrl}
              alt={student.studentName}
              className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[#031635] truncate">{student.studentName}</h3>
                <span className="text-[11px] font-mono font-bold bg-[#eef2ff] text-[#031635] px-2 py-0.5 rounded-md border border-[#d8e2ff]">
                  {student.rollNo}
                </span>
              </div>
              <span className="text-[12px] text-[#75777f]">{student.studentId} • BCA Sem 3</span>
              <span className="text-[11px] text-[#44474e] mt-0.5">Scanned at: {student.time}</span>
            </div>
          </div>

          {/* Anomaly Notice if flagged */}
          {student.anomalyFlag && (
            <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-3.5 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#723600] text-[20px] shrink-0 mt-0.5">warning</span>
              <div className="flex flex-col text-[12px]">
                <span className="font-bold text-[#723600]">Telemetry Variance Flag</span>
                <span className="text-[#75777f] mt-0.5">{student.anomalyFlag}</span>
              </div>
            </div>
          )}

          {/* Detailed Multi-Factor Evidence Grid */}
          <div className="bg-white rounded-2xl border border-[#e1e3e4] p-4 flex flex-col gap-2.5 text-[12px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
              Verification Factors Audit
            </span>

            <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
              <span className="text-[#75777f]">Hardware Device Binding:</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.2 rounded-full text-[11px]">
                Verified (Bound Phone)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
              <span className="text-[#75777f]">10s Dynamic QR Challenge:</span>
              <span className="font-bold text-[#005312] bg-[#a0f399] px-2 py-0.2 rounded-full text-[11px]">
                Verified (Nonce Valid)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
              <span className="text-[#75777f]">Classroom Geofence / Location:</span>
              <span
                className={`font-bold px-2 py-0.2 rounded-full text-[11px] ${
                  student.locationMatch ? 'bg-[#a0f399] text-[#005312]' : 'bg-[#ffdcc6] text-[#723600]'
                }`}
              >
                {student.locationMatch ? 'Verified (Within 30m)' : 'Uncertain (Variance)'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
              <span className="text-[#75777f]">BLE Proximity Beacon:</span>
              <span
                className={`font-bold px-2 py-0.2 rounded-full text-[11px] ${
                  student.bleDetected ? 'bg-[#a0f399] text-[#005312]' : 'bg-[#f3f4f5] text-[#75777f]'
                }`}
              >
                {student.bleDetected ? 'Detected (-64 dBm)' : 'Unavailable'}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-[#75777f]">Visual Supporting Evidence:</span>
              <span
                className={`font-bold px-2 py-0.2 rounded-full text-[11px] ${
                  student.visualEvidence === 'available'
                    ? 'bg-[#a0f399] text-[#005312]'
                    : 'bg-[#f3f4f5] text-[#75777f]'
                }`}
              >
                {student.visualEvidence === 'available' ? 'Available (CCTV Stream)' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* AI Non-Punitive Notice */}
          <div className="p-3 bg-[#eef2ff] border border-[#d8e2ff] rounded-xl text-[11px] text-[#001d36] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#031635] shrink-0">info</span>
            <span>Final attendance authority rests with faculty. No automated penalties are enforced.</span>
          </div>

          {/* Faculty Decision Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(student.studentId, 'present');
                  onClose();
                }}
                className="bg-[#005312] text-white hover:bg-[#00390b] py-2.5 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Approve (Present)</span>
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(student.studentId, 'absent');
                  onClose();
                }}
                className="bg-[#ba1a1a] text-white hover:bg-[#93000a] py-2.5 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Mark Absent</span>
              </button>
            </div>

            <button
              onClick={() => {
                onUpdateStatus(student.studentId, 'needs_review');
                onClose();
              }}
              className="w-full bg-white border border-[#e1e3e4] text-[#723600] hover:bg-[#fffaf0] py-2 px-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
              <span>Keep for Review Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
