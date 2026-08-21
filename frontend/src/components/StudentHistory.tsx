import React, { useState } from 'react';
import { AVATAR_URL, LOGO_URL } from '../data/mockData';
import { AttendanceRecord, StudentProfile } from '../types';

interface StudentHistoryProps {
  student: StudentProfile;
  records: AttendanceRecord[];
  onRequestCorrection: (record: AttendanceRecord) => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
}

export const StudentHistory: React.FC<StudentHistoryProps> = ({
  student,
  records,
  onRequestCorrection,
  onNavigateHome,
  onNavigateProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'needs_review' | 'absent' | 'CS 101' | 'CS 301'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('rec-002'); // Open Needs Review by default

  const filterOptions = [
    { label: 'All Records', key: 'all' },
    { label: 'Needs Review', key: 'needs_review' },
    { label: 'Absent', key: 'absent' },
    { label: 'CS 101', key: 'CS 101' },
    { label: 'CS 301', key: 'CS 301' },
  ];

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.lectureCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.room.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'needs_review') return rec.status === 'needs_review';
    if (selectedFilter === 'absent') return rec.status === 'absent';
    if (selectedFilter === 'CS 101') return rec.lectureCode.includes('ENG 101') || rec.lectureCode.includes('CS 101');
    if (selectedFilter === 'CS 301') return rec.lectureCode.includes('301');
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return (
          <span className="bg-[#a0f399] text-[#005312] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#005312]" />
            Present
          </span>
        );
      case 'needs_review':
        return (
          <span className="bg-[#ffdcc6] text-[#723600] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#723600]" />
            Needs Review
          </span>
        );
      case 'absent':
        return (
          <span className="bg-[#ffdad6] text-[#ba1a1a] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
            Absent
          </span>
        );
      case 'probable':
        return (
          <span className="bg-[#e1e3e4] text-[#44474e] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Probable
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="w-9 h-9 rounded-full bg-[#f8f9fa] border border-[#e1e3e4] flex items-center justify-center text-[#191c1d] hover:bg-[#eef2ff] transition-colors cursor-pointer"
              title="Go to Home"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Attendance Records</span>
              <span className="text-base font-bold text-[#031635]">Session History</span>
            </div>
          </div>
          <button
            onClick={onNavigateProfile}
            className="w-9 h-9 rounded-full border border-[#d8e2ff] overflow-hidden shadow-xs cursor-pointer"
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={student.avatarUrl || AVATAR_URL}
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-4 pt-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by course name, code, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e1e3e4] rounded-2xl pl-10 pr-4 py-2.5 text-[13px] text-[#191c1d] placeholder:text-[#75777f] focus:outline-none focus:border-[#031635] shadow-xs"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedFilter(opt.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === opt.key
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'bg-white text-[#44474e] border border-[#e1e3e4] hover:bg-[#f8f9fa]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Attendance List */}
        <div className="flex flex-col gap-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-[#75777f] border border-[#e1e3e4]">
              <span className="material-symbols-outlined text-[36px] text-[#c5c6cf] mb-2">
                event_busy
              </span>
              <p className="text-[14px] font-semibold">No attendance records found</p>
              <p className="text-[12px] mt-1">Try selecting a different filter above.</p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isExpanded = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    rec.status === 'needs_review'
                      ? 'border-[#ffdcc6] shadow-xs'
                      : rec.status === 'absent'
                      ? 'border-[#ffdad6]'
                      : 'border-[#e1e3e4] shadow-xs'
                  }`}
                >
                  {/* Summary Bar (Click to toggle) */}
                  <div
                    onClick={() => toggleExpand(rec.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f8f9fa] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Date Badge */}
                      <div className="w-12 h-12 rounded-xl bg-[#eef2ff] border border-[#d8e2ff] text-[#031635] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[15px] font-extrabold leading-none">{rec.day}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#75777f]">{rec.month}</span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-[#75777f]">{rec.lectureCode}</span>
                          <span className="text-[11px] text-[#75777f]">• {rec.room}</span>
                        </div>
                        <h3 className="text-[15px] font-bold text-[#191c1d] leading-snug">
                          {rec.subjectName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(rec.status)}
                      <span className="text-[11px] text-[#75777f]">{rec.evidence.timestamp}</span>
                    </div>
                  </div>

                  {/* Expanded Evidence Details */}
                  {isExpanded && (
                    <div className="bg-[#f8f9fa] border-t border-[#f3f4f5] p-4 flex flex-col gap-3 animate-in fade-in-50">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="font-bold text-[#031635] uppercase tracking-wider text-[11px]">
                          Cryptographic Proof Ledger
                        </span>
                        <span className="font-extrabold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[10px]">
                          Score: {rec.evidence.confidenceScore}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-white rounded-xl border border-[#e1e3e4] flex flex-col">
                          <span className="text-[#75777f] font-medium">GPS Variance</span>
                          <span className="font-bold text-[#191c1d]">
                            {rec.evidence.locationDistanceMeters}m ({rec.evidence.locationStatus})
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#e1e3e4] flex flex-col">
                          <span className="text-[#75777f] font-medium">Hardware Bound</span>
                          <span className="font-bold text-[#191c1d]">{rec.evidence.deviceStatus}</span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#e1e3e4] flex flex-col">
                          <span className="text-[#75777f] font-medium">Challenge Nonce</span>
                          <span className="font-bold text-[#191c1d]">
                            {rec.evidence.challengeLatencyMs}ms (Valid)
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#e1e3e4] flex flex-col">
                          <span className="text-[#75777f] font-medium">BLE Beacon RSSI</span>
                          <span className="font-bold text-[#191c1d]">
                            {rec.evidence.bleSignalRssi ? `${rec.evidence.bleSignalRssi} dBm` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Notes explanation */}
                      {rec.evidence.notes && (
                        <p className="text-[11px] text-[#44474e] bg-white p-2.5 rounded-xl border border-[#e1e3e4] italic">
                          "{rec.evidence.notes}"
                        </p>
                      )}

                      {/* Dispute Correction Button */}
                      {(rec.status === 'needs_review' || rec.status === 'absent') && (
                        <button
                          onClick={() => onRequestCorrection(rec)}
                          className="w-full mt-1 bg-white border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/40 py-2 px-3 rounded-xl font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_document</span>
                          <span>Submit Attendance Correction Dispute</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
