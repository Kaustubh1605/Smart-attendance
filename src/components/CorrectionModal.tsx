import React, { useState } from 'react';
import { AttendanceRecord } from '../types';

interface CorrectionModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onSubmitCorrection: (recordId: string, reason: string) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  record,
  onClose,
  onSubmitCorrection,
}) => {
  const [reasonCategory, setReasonCategory] = useState('gps_drift');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const fullReason = `[${reasonCategory.toUpperCase()}] ${details || 'Standard verification exception review requested.'}`;
      onSubmitCorrection(record.id, fullReason);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[#e1e3e4] text-[#191c1d]">
        <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Dispute Resolution</span>
            <h3 className="text-[18px] font-bold text-[#031635]">Request Record Correction</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] hover:text-[#191c1d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Record Context Card */}
        <div className="bg-[#f8f9fa] rounded-2xl p-3.5 text-[12px] flex flex-col gap-1 border border-[#e1e3e4]">
          <div className="flex justify-between font-bold text-[#031635]">
            <span>{record.subjectName}</span>
            <span className="bg-[#ffdcc6] text-[#723600] px-2 py-0.5 rounded-full uppercase text-[10px] tracking-wider">{record.status}</span>
          </div>
          <p className="text-[#75777f]">
            {record.lectureCode} • {record.date} • {record.room} ({record.evidence.timestamp})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#44474e]">Dispute Reason</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] focus:border-[#031635] focus:bg-white outline-none"
            >
              <option value="gps_drift">Indoor GPS Geofence Drift</option>
              <option value="hardware_glitch">Camera / Optical Scanner Glitch</option>
              <option value="network_outage">Classroom Wi-Fi / Network Latency</option>
              <option value="late_permission">Authorized Late Entry / Faculty Permission</option>
              <option value="medical">Institutional Duty / Approved Leave</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#44474e]">Detailed Explanation</label>
            <textarea
              required
              rows={3}
              placeholder="Describe your seating location or circumstances during the session..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] focus:border-[#031635] focus:bg-white outline-none resize-none"
            />
          </div>

          <p className="text-[11px] text-[#75777f]">
            Note: All dispute submissions are timestamped, bound to your device ID, and forwarded to the faculty review queue.
          </p>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[#f3f4f5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-bold text-[#75777f] hover:text-[#191c1d] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#031635] hover:bg-[#1a2b4b] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
