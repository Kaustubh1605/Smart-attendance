import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AVATAR_URL, CLASSROOM_BG_URL } from '../data/mockData';
import { Lecture, StudentProfile } from '../types';

interface StudentVerificationProps {
  student: StudentProfile;
  lecture: Lecture;
  onAbort: () => void;
  onVerificationComplete: (lecture: Lecture) => void;
}

export const StudentVerification: React.FC<StudentVerificationProps> = ({
  student,
  lecture,
  onAbort,
  onVerificationComplete,
}) => {
  const [locationVerified, setLocationVerified] = useState(false);
  const [scanState, setScanState] = useState<'scanning' | 'processing' | 'success' | 'expired'>('scanning');
  const [dynamicChallengeCode, setDynamicChallengeCode] = useState('SA-5S-8924');
  const [tokenCountdown, setTokenCountdown] = useState(5);

  useEffect(() => {
    // Simulate location lock after 1 second
    const locTimer = setTimeout(() => {
      setLocationVerified(true);
    }, 1000);

    // 5-Second QR Challenge Nonce Rotation
    const tokenInterval = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          setDynamicChallengeCode(`SA-5S-${rand}`);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(locTimer);
      clearInterval(tokenInterval);
    };
  }, []);

  const triggerScanSuccess = () => {
    if (scanState !== 'scanning') return;
    setScanState('processing');

    setTimeout(() => {
      setScanState('success');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1b6d24', '#a0f399', '#031635', '#d8e2ff']
      });

      setTimeout(() => {
        onVerificationComplete(lecture);
      }, 2000);
    }, 1000);
  };

  const triggerExpiredScan = () => {
    if (scanState !== 'scanning') return;
    setScanState('processing');

    setTimeout(() => {
      setScanState('expired');
    }, 800);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] font-sans">
      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4]">
        <div className="h-16 px-5 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onAbort}
              className="w-9 h-9 rounded-full bg-[#f8f9fa] border border-[#e1e3e4] flex items-center justify-center text-[#191c1d] hover:bg-[#eef2ff] transition-colors cursor-pointer"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Multi-Factor Engine</span>
              <span className="text-base font-bold text-[#031635]">Scan & Verify</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full border border-[#d8e2ff] overflow-hidden shadow-xs">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={student.avatarUrl || AVATAR_URL}
            />
          </div>
        </div>
      </header>

      {/* Main Verification View */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between pt-4 pb-8 px-4">
        {scanState === 'expired' ? (
          /* Expired QR Error Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[44px]">timer_off</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#ba1a1a] uppercase tracking-wider bg-[#ffdad6]/60 px-3 py-1 rounded-full w-fit mx-auto">
                Security Challenge Timeout
              </span>
              <h2 className="text-[22px] font-extrabold text-[#ba1a1a] mt-1 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <span>QR Code Expired</span>
              </h2>
              <p className="text-[13px] text-[#44474e] max-w-xs leading-relaxed">
                This QR code is no longer valid. Please scan the current QR displayed by your teacher.
              </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-4 border border-[#ffdad6] text-left text-[12px] flex flex-col gap-2 mt-2 shadow-xs">
              <div className="flex justify-between text-[#44474e]">
                <span>Expired Token Nonce:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">SA-5S-EXPIRED</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Rotation Policy:</span>
                <span className="font-bold text-[#031635]">5-Second Real-Time Expiry</span>
              </div>
              <div className="text-[11px] text-[#75777f] border-t border-[#f3f4f5] pt-2">
                Screenshots or forwarding are blocked to maintain attendance integrity.
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5 mt-4">
              <button
                onClick={() => setScanState('scanning')}
                className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                <span>Scan Current QR</span>
              </button>
              <button
                onClick={onAbort}
                className="w-full bg-white border border-[#e1e3e4] text-[#75777f] hover:bg-[#f8f9fa] py-3 px-4 rounded-2xl font-bold text-[13px] transition-all cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        ) : scanState === 'success' ? (
          /* Success Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-[#a0f399] text-[#005312] flex items-center justify-center shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-[44px]">verified</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-bold text-[#1b6d24] uppercase tracking-wider bg-[#d8e2ff]/50 px-3 py-1 rounded-full w-fit mx-auto">
                ✓ QR Verified
              </span>
              <h2 className="text-[24px] font-extrabold text-[#031635] mt-1">
                Attendance Recorded!
              </h2>
              <p className="text-[13px] text-[#44474e] max-w-xs">
                Your presence for <strong className="text-[#031635]">{lecture.name}</strong> ({lecture.code}) has been verified and logged.
              </p>
            </div>

            {/* Evidence details card */}
            <div className="w-full bg-white rounded-2xl p-4 border border-[#e1e3e4] text-left text-[12px] flex flex-col gap-2 mt-2 shadow-xs">
              <div className="flex justify-between text-[#44474e]">
                <span>Timestamp:</span>
                <span className="font-bold text-[#191c1d]">Just now (10:02 AM)</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Dynamic Challenge:</span>
                <span className="font-bold text-[#1b6d24]">Valid (5s Window)</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Location Distance:</span>
                <span className="font-bold text-[#1b6d24]">6.2m from Instructor Pod</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Bound Device:</span>
                <span className="font-bold text-[#191c1d]">Pixel 8 Pro (Verified)</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Confidence Score:</span>
                <span className="font-extrabold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                  98% High Trust
                </span>
              </div>
            </div>

            <button
              onClick={() => onVerificationComplete(lecture)}
              className="w-full mt-4 bg-[#031635] text-white py-3.5 px-4 rounded-2xl font-bold text-[14px] hover:bg-[#1a2b4b] transition-all cursor-pointer shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Live Scanner & Factor Checkpoints */
          <div className="flex flex-col gap-4">
            {/* Lecture summary banner */}
            <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-[#75777f] uppercase">{lecture.code} • Room {lecture.room}</span>
                <h2 className="text-[16px] font-bold text-[#031635]">{lecture.name}</h2>
              </div>
              <span className="text-[11px] font-bold bg-[#eef2ff] text-[#031635] px-2.5 py-1 rounded-xl border border-[#d8e2ff]">
                {lecture.timeSlot}
              </span>
            </div>

            {/* Viewfinder Camera Area */}
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-[#031635] shadow-xl flex items-center justify-center">
              {/* Background camera feed simulation */}
              <img
                alt="Classroom Preview"
                src={CLASSROOM_BG_URL}
                className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-90"
              />

              {/* Viewfinder Overlay */}
              <div className="absolute inset-0 border-36 border-black/50 pointer-events-none" />

              {/* Scanner Corner Reticles */}
              <div className="relative w-52 h-52 border-2 border-white/40 rounded-2xl flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#a0f399] rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#a0f399] rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#a0f399] rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#a0f399] rounded-br-lg" />

                {/* Laser animation bar */}
                <div className="absolute left-2 right-2 h-1 bg-[#a0f399] shadow-[0_0_12px_#a0f399] animate-scan rounded-full" />

                {/* Center token instruction */}
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[11px] font-bold tracking-wide shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a0f399] animate-pulse" />
                  <span>Align Dynamic QR</span>
                </div>
              </div>

              {/* Dynamic rotating challenge token watermark */}
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] text-white/80 font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
                <span>DYNAMIC CHALLENGE: {dynamicChallengeCode}</span>
                <span className="text-[#a0f399] font-bold">Expires in {tokenCountdown}s</span>
              </div>
            </div>

            {/* Multi-Factor Verification Checklist */}
            <div className="bg-white rounded-2xl p-4 border border-[#e1e3e4] shadow-xs flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Security Factor Attestation
                </span>
                <span className="text-[11px] font-bold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full">
                  5s Dynamic Challenge
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {/* 1. Location Factor */}
                <div className="flex items-center justify-between text-[12px] p-2 bg-[#f8f9fa] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`material-symbols-outlined text-[18px] ${locationVerified ? 'text-[#1b6d24]' : 'text-[#75777f] animate-spin'}`}>
                      {locationVerified ? 'check_circle' : 'progress_activity'}
                    </span>
                    <span className="font-semibold text-[#191c1d]">GPS Geofence</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    locationVerified ? 'bg-[#a0f399] text-[#005312]' : 'bg-[#e1e3e4] text-[#75777f]'
                  }`}>
                    {locationVerified ? 'Verified (6.2m)' : 'Locating...'}
                  </span>
                </div>

                {/* 2. Device Binding Factor */}
                <div className="flex items-center justify-between text-[12px] p-2 bg-[#f8f9fa] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#1b6d24]">
                      check_circle
                    </span>
                    <span className="font-semibold text-[#191c1d]">Hardware Keystore</span>
                  </div>
                  <span className="text-[11px] font-bold bg-[#a0f399] text-[#005312] px-2 py-0.5 rounded-full">
                    Pixel 8 Pro (Bound)
                  </span>
                </div>

                {/* 3. BLE Beacon Detection */}
                <div className="flex items-center justify-between text-[12px] p-2 bg-[#f8f9fa] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#1b6d24]">
                      check_circle
                    </span>
                    <span className="font-semibold text-[#191c1d]">Bluetooth Beacon</span>
                  </div>
                  <span className="text-[11px] font-bold bg-[#a0f399] text-[#005312] px-2 py-0.5 rounded-full">
                    -64 dBm (In Room)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons to test scan scenarios */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={triggerScanSuccess}
                disabled={scanState === 'processing'}
                className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {scanState === 'processing' ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>Verifying 5s Dynamic Nonce...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                    <span>Scan Live Dynamic QR</span>
                  </>
                )}
              </button>

              <button
                onClick={triggerExpiredScan}
                disabled={scanState === 'processing'}
                className="w-full bg-[#fff8f6] border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/60 py-2.5 px-4 rounded-2xl font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                title="Simulate scanning a stale or screenshot QR code"
              >
                <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
                <span>Simulate Expired QR Scan (Test Expiry Guard)</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
