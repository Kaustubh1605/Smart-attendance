import React, { useState } from 'react';
import { OfflineAttendanceRecord, Lecture, StudentProfile } from '../types';
import { generateUniqueId } from '../data/mockData';

interface OfflineAttendanceModalProps {
  student: StudentProfile;
  activeLecture: Lecture;
  offlineRecords: OfflineAttendanceRecord[];
  isOpen: boolean;
  onClose: () => void;
  onRecordOfflineAttendance: (newRecord: OfflineAttendanceRecord) => void;
  onSyncAll: () => void;
}

export const OfflineAttendanceModal: React.FC<OfflineAttendanceModalProps> = ({
  student,
  activeLecture,
  offlineRecords,
  isOpen,
  onClose,
  onRecordOfflineAttendance,
  onSyncAll,
}) => {
  const [activeStep, setActiveStep] = useState<'session_view' | 'scanning' | 'saved_offline' | 'sync_center'>('session_view');
  const [isSyncing, setIsSyncing] = useState(false);
  const [localConnected, setLocalConnected] = useState(true);

  if (!isOpen) return null;

  const pendingRecords = offlineRecords.filter((r) => r.status === 'pending_sync');
  const syncedRecords = offlineRecords.filter((r) => r.status === 'synced');

  const handleSimulateScan = () => {
    setActiveStep('scanning');
    setTimeout(() => {
      const newRec: OfflineAttendanceRecord = {
        id: generateUniqueId('off'),
        lectureId: activeLecture.id,
        lectureName: activeLecture.name,
        lectureCode: activeLecture.code,
        room: activeLecture.room,
        studentId: student.studentId,
        studentName: student.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending_sync',
        factors: {
          deviceBound: true,
          sessionCode: `OFFLINE-${activeLecture.room.replace(' ', '')}-${activeLecture.code.replace(' ', '')}`,
          gpsCaptured: true,
          bleDetected: true,
        },
      };
      onRecordOfflineAttendance(newRec);
      setActiveStep('saved_offline');
    }, 1500);
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onSyncAll();
      setIsSyncing(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#723600] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cloud_off</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[15px] font-bold text-[#031635]">Offline Mode</h2>
                <span className="bg-[#ffdcc6] text-[#723600] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                  Mesh Active
                </span>
              </div>
              <p className="text-[11px] text-[#75777f]">Classroom Fallback Protocol</p>
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
            onClick={() => setActiveStep('session_view')}
            className={`pb-2 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 ${
              activeStep === 'session_view' || activeStep === 'scanning' || activeStep === 'saved_offline'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            Offline Session
          </button>
          <button
            onClick={() => setActiveStep('sync_center')}
            className={`pb-2 px-3 text-[13px] font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeStep === 'sync_center'
                ? 'border-[#031635] text-[#031635]'
                : 'border-transparent text-[#75777f] hover:text-[#191c1d]'
            }`}
          >
            <span>Sync Center</span>
            {pendingRecords.length > 0 && (
              <span className="text-[10px] font-extrabold bg-[#723600] text-white px-1.5 py-0.2 rounded-full">
                {pendingRecords.length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {activeStep === 'session_view' && (
            <div className="flex flex-col gap-4">
              {/* Mesh Network Status Card */}
              <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdcc6] text-[#723600] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">wifi_tethering</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#723600]">
                      Local Mesh Network
                    </span>
                    <span className="text-[13px] font-bold text-[#191c1d]">SmartAttend-Mesh-402</span>
                    <span className="text-[11px] text-[#75777f]">Peer-to-Peer Faculty Node</span>
                  </div>
                </div>
                <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>

              {/* Offline Lecture Information */}
              <div className="bg-white border border-[#e1e3e4] rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Active Offline Session
                </span>

                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-bold text-[#031635]">{activeLecture.name}</h3>
                  <p className="text-[12px] text-[#44474e]">
                    {activeLecture.code} • {activeLecture.instructor}
                  </p>
                  <p className="text-[12px] text-[#75777f]">
                    {activeLecture.room} • {activeLecture.timeSlot}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#f3f4f5]">
                  <div className="p-2 bg-[#f8f9fa] rounded-xl flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#005312]">check</span>
                    <span>Device Keystore Cached</span>
                  </div>
                  <div className="p-2 bg-[#f8f9fa] rounded-xl flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#005312]">check</span>
                    <span>Beacon Signal Detected</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleSimulateScan}
                className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                <span>Scan Classroom Offline QR</span>
              </button>
            </div>
          )}

          {activeStep === 'scanning' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#031635]/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-[#031635] text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[32px] animate-spin">sync</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-bold text-[#031635]">Recording Offline Token...</h3>
                <p className="text-[12px] text-[#75777f] max-w-xs">
                  Capturing local dynamic challenge & hardware keystore verification factors.
                </p>
              </div>
            </div>
          )}

          {activeStep === 'saved_offline' && (
            <div className="flex flex-col items-center text-center gap-4 py-3">
              <div className="w-16 h-16 rounded-full bg-[#ffdcc6] text-[#723600] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[36px]">save_as</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="bg-[#ffdcc6] text-[#723600] text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mx-auto">
                  Attendance Saved Offline
                </span>
                <h3 className="text-[18px] font-bold text-[#031635] mt-1">
                  Local Verification Completed
                </h3>
                <p className="text-[12px] text-[#44474e] max-w-xs leading-relaxed">
                  Your attendance has been cryptographically signed with your device token and stored safely on your phone. It will automatically synchronize when campus internet connects.
                </p>
              </div>

              {/* Factors captured */}
              <div className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-3.5 text-left flex flex-col gap-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#75777f]">Lecture:</span>
                  <span className="font-bold text-[#031635]">{activeLecture.code} ({activeLecture.room})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#75777f]">Device Bound:</span>
                  <span className="font-semibold text-[#005312]">Verified (Pixel 8 Pro)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#75777f]">Session Code:</span>
                  <span className="font-mono text-[11px] text-[#191c1d]">OFFLINE-402-BCA301</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#75777f]">Status:</span>
                  <span className="font-bold text-[#723600]">Pending Server Sync</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full pt-2">
                <button
                  onClick={() => setActiveStep('sync_center')}
                  className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] py-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  <span>View in Sync Center</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-white border border-[#e1e3e4] text-[#44474e] hover:bg-[#f8f9fa] py-2.5 rounded-xl font-bold text-[13px] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {activeStep === 'sync_center' && (
            <div className="flex flex-col gap-4">
              {/* Sync Trigger Card */}
              <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                    Sync Status
                  </span>
                  <span className="text-[14px] font-bold text-[#031635]">
                    {pendingRecords.length > 0
                      ? `${pendingRecords.length} Record${pendingRecords.length > 1 ? 's' : ''} Pending Upload`
                      : 'All Records Synchronized'}
                  </span>
                </div>

                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncing || pendingRecords.length === 0}
                  className={`py-2 px-3.5 rounded-xl font-bold text-[12px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSyncing || pendingRecords.length === 0
                      ? 'bg-[#e1e3e4] text-[#75777f] cursor-not-allowed'
                      : 'bg-[#031635] text-white hover:bg-[#1a2b4b] shadow-xs'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {/* Records List */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f] px-1">
                  Offline Records Queue
                </span>

                {offlineRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white border border-[#e1e3e4] rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          rec.status === 'synced' ? 'bg-[#a0f399] text-[#005312]' : 'bg-[#ffdcc6] text-[#723600]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {rec.status === 'synced' ? 'cloud_done' : 'cloud_upload'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#191c1d]">{rec.lectureCode} - {rec.lectureName}</span>
                        <span className="text-[11px] text-[#75777f]">{rec.room} • {rec.timestamp}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        rec.status === 'synced'
                          ? 'bg-[#a0f399] text-[#005312]'
                          : 'bg-[#ffdcc6] text-[#723600]'
                      }`}
                    >
                      {rec.status === 'synced' ? 'Synced' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
