import React from 'react';
import { MOCK_VISUAL_FEED, CLASSROOM_BG_URL } from '../data/mockData';

interface VisualVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualVerificationModal: React.FC<VisualVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const feed = MOCK_VISUAL_FEED;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">videocam</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-[#031635]">Visual Verification Stream</h2>
                <span className="bg-[#a0f399] text-[#005312] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005312] animate-pulse" />
                  Live AI Sensor
                </span>
              </div>
              <p className="text-[11px] text-[#75777f]">{feed.cameraName} • {feed.room}</p>
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
          {/* Important Non-Punitive Notice as Mandated */}
          <div className="bg-[#eef2ff] border border-[#d8e2ff] rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs">
            <span className="material-symbols-outlined text-[#031635] text-[20px] shrink-0 mt-0.5">
              verified
            </span>
            <div className="flex flex-col text-[12px] text-[#001d36]">
              <span className="font-bold">Non-Punitive Supporting AI Principle</span>
              <p className="text-[#44474e] mt-0.5 leading-relaxed">
                If a student&apos;s face is occluded, turned away, or wearing a mask, SmartAttend does <strong>never</strong> mark them absent or penalize them. Visual AI acts solely as non-punitive supporting evidence; final attendance authority always remains with the faculty.
              </p>
            </div>
          </div>

          {/* Camera Frame Preview Container */}
          <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-900 border border-[#e1e3e4]">
            <img
              src={CLASSROOM_BG_URL}
              alt="Classroom Camera"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Overlay Grid / Bounding Boxes */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-black/60 text-white">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded border border-white/20">
                  {feed.cameraName}
                </span>
                <span className="font-mono bg-red-600/80 px-2 py-0.5 rounded font-bold uppercase">
                  REC • 1080p
                </span>
              </div>

              {/* Sample Bounding Boxes overlay */}
              <div className="relative w-full h-24">
                <div className="absolute top-2 left-10 border-2 border-[#a0f399] bg-[#a0f399]/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#a0f399]">
                  Kaustubh Nikam (94%)
                </div>
                <div className="absolute top-3 right-16 border-2 border-[#a0f399] bg-[#a0f399]/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#a0f399]">
                  Priya Patel (98%)
                </div>
                <div className="absolute bottom-2 left-32 border-2 border-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300">
                  Face Turned (Disregard)
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono">
                <span>{feed.timestamp}</span>
                <span>Room 402 Geofence Coherent</span>
              </div>
            </div>
          </div>

          {/* Detection Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-2.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#75777f]">Total Detected</span>
              <span className="text-[18px] font-bold text-[#031635]">{feed.totalDetected}</span>
            </div>
            <div className="bg-[#eefcf0] border border-[#a0f399]/40 rounded-2xl p-2.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#005312]">Matched Faces</span>
              <span className="text-[18px] font-bold text-[#005312]">{feed.matchedCount}</span>
            </div>
            <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-2.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#723600]">Occluded / Turned</span>
              <span className="text-[18px] font-bold text-[#723600]">{feed.unresolvedCount}</span>
            </div>
          </div>

          {/* Student Recognition Log */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f] px-1">
              Sample Visual Attestation Records
            </span>

            <div className="flex flex-col divide-y divide-[#f3f4f5] bg-white border border-[#e1e3e4] rounded-2xl overflow-hidden text-[12px]">
              {feed.studentsList.map((st) => (
                <div key={st.studentId} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#031635] text-white flex items-center justify-center text-[10px] font-bold">
                      {st.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#191c1d]">{st.name}</span>
                      <span className="text-[10px] text-[#75777f]">{st.studentId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        st.status === 'matched'
                          ? 'bg-[#a0f399] text-[#005312]'
                          : 'bg-[#ffdcc6] text-[#723600]'
                      }`}
                    >
                      {st.status === 'matched' ? `Matched (${st.confidence}%)` : 'Face Obscured'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
