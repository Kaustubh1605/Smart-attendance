import React, { useState } from 'react';
import { Lecture } from '../types';

interface TeacherOfflineModeModalProps {
  activeLecture: Lecture;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherOfflineModeModal: React.FC<TeacherOfflineModeModalProps> = ({
  activeLecture,
  isOpen,
  onClose,
}) => {
  const [sessionActive, setSessionActive] = useState(true);
  const [studentConnectedCount, setStudentConnectedCount] = useState(38);
  const [offlineRecordsStored, setOfflineRecordsStored] = useState(38);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncCompleted(true);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#723600] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cloud_off</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] font-bold text-[#031635]">Offline Lecture Mode</h2>
                <span className="bg-[#ffdcc6] text-[#723600] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                  Mesh Active
                </span>
              </div>
              <p className="text-[11px] text-[#75777f]">Faculty Classroom Hub</p>
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
          {/* Offline Warning Banner */}
          <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#723600] text-[22px] shrink-0 mt-0.5">
              wifi_off
            </span>
            <div className="flex flex-col text-[12px]">
              <span className="font-bold text-[#723600]">Campus Internet Disconnected</span>
              <p className="text-[#75777f] mt-0.5 leading-relaxed">
                SmartAttend is operating via local peer-to-peer classroom mesh. All student attendance hashes are cryptographically attested and saved locally.
              </p>
            </div>
          </div>

          {/* Local Node Stats */}
          <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                Local Classroom Mesh
              </span>
              <span className="text-[11px] font-mono font-bold text-[#031635]">SmartAttend-Local-402</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#e1e3e4] flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Students Connected</span>
                <span className="text-[20px] font-bold text-[#031635] mt-0.5">{studentConnectedCount}</span>
                <span className="text-[10px] text-[#005312] font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse" />
                  Live Mesh Node
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#e1e3e4] flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#75777f]">Records Stored Locally</span>
                <span className="text-[20px] font-bold text-[#723600] mt-0.5">{offlineRecordsStored}</span>
                <span className="text-[10px] text-[#723600] font-semibold">Pending Cloud Sync</span>
              </div>
            </div>
          </div>

          {/* Lecture Information */}
          <div className="bg-white border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#75777f]">Active Lecture:</span>
              <span className="font-bold text-[#031635]">{activeLecture.name} ({activeLecture.code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75777f]">Venue / Room:</span>
              <span className="font-semibold text-[#191c1d]">{activeLecture.room}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#75777f]">Dynamic Token Interval:</span>
              <span className="font-mono font-semibold text-[#191c1d]">10s Local Nonce Rotation</span>
            </div>
          </div>

          {/* Sync status toast */}
          {syncCompleted && (
            <div className="bg-[#a0f399] text-[#005312] p-3 rounded-xl text-[12px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">cloud_done</span>
              <span>All 38 attendance records synchronized to cloud successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleSimulateSync}
              disabled={isSyncing}
              className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] py-3.5 px-4 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Synchronizing Attendance...' : 'Simulate Internet Restored (Sync Records)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
