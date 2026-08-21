import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AVATAR_URL, CLASSROOM_BG_URL } from '../data/mockData';
import { Lecture, StudentProfile, DynamicQRChallenge, QRVerificationResult } from '../types';
import {
  generateDynamicQRChallenge,
  validateAttendanceAttempt,
  QR_ROTATION_INTERVAL_SECONDS,
} from '../services/qrVerificationService';

interface StudentVerificationProps {
  student: StudentProfile;
  lecture: Lecture;
  onAbort: () => void;
  onVerificationComplete: (lecture: Lecture, result?: QRVerificationResult) => void;
}

export const StudentVerification: React.FC<StudentVerificationProps> = ({
  student,
  lecture,
  onAbort,
  onVerificationComplete,
}) => {
  const [locationVerified, setLocationVerified] = useState(false);
  const [scanState, setScanState] = useState<'scanning' | 'processing' | 'success' | 'expired'>('scanning');
  const [activeChallenge, setActiveChallenge] = useState<DynamicQRChallenge>(() =>
    generateDynamicQRChallenge(lecture.id, lecture.code)
  );
  const [tokenCountdown, setTokenCountdown] = useState<number>(QR_ROTATION_INTERVAL_SECONDS);
  const [expiredErrorMessage, setExpiredErrorMessage] = useState<string>(
    'This QR code is no longer valid. Please scan the current QR displayed by your teacher.'
  );
  const [expiredTokenCode, setExpiredTokenCode] = useState<string>('SA-10S-EXPIRED');
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);
  const [processingNote, setProcessingNote] = useState<string>('Verifying 10s Dynamic Nonce & Telemetry...');

  const activeChallengeRef = useRef<DynamicQRChallenge>(activeChallenge);
  activeChallengeRef.current = activeChallenge;

  useEffect(() => {
    // Simulate location lock after 1 second
    const locTimer = setTimeout(() => {
      setLocationVerified(true);
    }, 1000);

    // 10-Second Dynamic QR Challenge Rotation
    const tokenInterval = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          const newChallenge = generateDynamicQRChallenge(lecture.id, lecture.code);
          setActiveChallenge(newChallenge);
          return QR_ROTATION_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(locTimer);
      clearInterval(tokenInterval);
    };
  }, [lecture.id, lecture.code]);

  // Execute verification attempt through authoritative QR & Multi-Factor Engine
  const executeScan = (
    challengeToUse: DynamicQRChallenge,
    attemptStartTime: number,
    processingDelayMs = 700,
    options?: { bleDetected?: boolean; distanceMeters?: number }
  ) => {
    if (scanState !== 'scanning') return;
    setScanState('processing');
    setProcessingNote('Verifying 10s Dynamic Nonce & Multi-Factor Evidence...');

    setTimeout(() => {
      const completionTime = Date.now();
      const result = validateAttendanceAttempt({
        studentId: student.studentId,
        studentName: student.name,
        deviceId: student.registeredDevice?.deviceId || 'DEV-BOUND-PIXEL8',
        sessionId: lecture.id,
        lectureCode: lecture.code,
        challenge: challengeToUse,
        attemptStartTime,
        completionTime,
        bleDetected: options?.bleDetected ?? true,
        locationStatus: locationVerified ? 'verified' : 'uncertain',
        distanceMeters: options?.distanceMeters ?? 6.2,
      });

      setVerificationResult(result);

      if (result.success && result.challengeStatus === 'valid') {
        setScanState('success');
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1b6d24', '#a0f399', '#031635', '#d8e2ff'],
        });

        setTimeout(() => {
          onVerificationComplete(lecture, result);
        }, 2200);
      } else {
        setExpiredTokenCode(challengeToUse.token);
        setExpiredErrorMessage(
          result.rejectionReason ||
            'This QR code is no longer valid. Please scan the current QR displayed by your teacher.'
        );
        setScanState('expired');
      }
    }, processingDelayMs);
  };

  // Standard Live QR Scan (Attempt started at current timestamp)
  const triggerStandardScan = () => {
    const attemptStartTime = Date.now();
    executeScan(activeChallengeRef.current, attemptStartTime, 800);
  };

  // Near-Expiry Scan (Started at 9.8s while QR was valid, completing in grace window after rotation)
  const triggerNearExpiryScan = () => {
    // Simulate attempt started 200ms before expiry of current challenge
    const attemptStartTime = activeChallengeRef.current.expiresAt - 200;
    setProcessingNote('In-flight scan started before 10s rotation (Grace evaluation)...');
    executeScan(activeChallengeRef.current, attemptStartTime, 900);
  };

  // Expired Scan (Started 200ms AFTER challenge expired -> Should be rejected immediately)
  const triggerExpiredScan = () => {
    // Generate an expired challenge from 15 seconds ago
    const oldChallenge = generateDynamicQRChallenge(
      lecture.id,
      lecture.code,
      Date.now() - 15000
    );
    const attemptStartTime = Date.now(); // Started after expiry
    executeScan(oldChallenge, attemptStartTime, 600);
  };

  // Reset to live scanning state and capture current active QR
  const handleScanCurrentQR = () => {
    const currentActive = generateDynamicQRChallenge(lecture.id, lecture.code);
    setActiveChallenge(currentActive);
    setTokenCountdown(QR_ROTATION_INTERVAL_SECONDS);
    setScanState('scanning');
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
                {expiredErrorMessage}
              </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-4 border border-[#ffdad6] text-left text-[12px] flex flex-col gap-2 mt-2 shadow-xs">
              <div className="flex justify-between text-[#44474e]">
                <span>Expired Token Nonce:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">{expiredTokenCode}</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Rotation Policy:</span>
                <span className="font-bold text-[#031635]">10-Second Real-Time Expiry</span>
              </div>
              <div className="text-[11px] text-[#75777f] border-t border-[#f3f4f5] pt-2">
                Screenshots or forwarding are blocked to maintain attendance integrity. New scans started after 10s are rejected.
              </div>
            </div>

            <div className="w-full flex flex-col gap-2.5 mt-4">
              <button
                onClick={handleScanCurrentQR}
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
                <span className="font-bold text-[#191c1d]">{verificationResult?.evidence.timestamp || 'Just now'}</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Dynamic Challenge:</span>
                <span className="font-bold text-[#1b6d24]">
                  {verificationResult?.isGraceProcessed ? 'Valid (Grace Window Handled)' : 'Valid (10s Window)'}
                </span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Location Distance:</span>
                <span className="font-bold text-[#1b6d24]">
                  {verificationResult?.evidence.locationDistanceMeters || 6.2}m from Instructor Pod
                </span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Bound Device:</span>
                <span className="font-bold text-[#191c1d]">Pixel 8 Pro (Verified)</span>
              </div>
              <div className="flex justify-between text-[#44474e]">
                <span>Confidence Score:</span>
                <span className="font-extrabold text-[#005312] bg-[#a0f399] px-2 py-0.5 rounded-full text-[11px]">
                  {verificationResult?.confidenceScore || 98}% High Trust
                </span>
              </div>
            </div>

            <button
              onClick={() => onVerificationComplete(lecture, verificationResult || undefined)}
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
                <span>DYNAMIC CHALLENGE: {activeChallenge.token}</span>
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
                  10s Dynamic Challenge
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
                onClick={triggerStandardScan}
                disabled={scanState === 'processing'}
                className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] active:scale-[0.98] py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {scanState === 'processing' ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>{processingNote}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                    <span>Scan Live Dynamic QR</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={triggerNearExpiryScan}
                  disabled={scanState === 'processing'}
                  className="bg-[#f0f9ff] border border-[#bae6fd] text-[#0369a1] hover:bg-[#e0f2fe] py-2.5 px-2.5 rounded-2xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Simulate scan started at 9.8s and completing during 2s grace after QR rotates"
                >
                  <span className="material-symbols-outlined text-[15px]">hourglass_top</span>
                  <span>Test Near-Expiry Scan</span>
                </button>

                <button
                  onClick={triggerExpiredScan}
                  disabled={scanState === 'processing'}
                  className="bg-[#fff8f6] border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/60 py-2.5 px-2.5 rounded-2xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Simulate scanning an expired challenge started after 10s expiry"
                >
                  <span className="material-symbols-outlined text-[15px]">history_toggle_off</span>
                  <span>Test Expired QR Scan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
