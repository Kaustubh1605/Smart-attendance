import React, { useState } from 'react';
import { StudentProfile } from '../types';

interface StudentRegisteredDeviceModalProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentRegisteredDeviceModal: React.FC<StudentRegisteredDeviceModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const [showRecoveryFlow, setShowRecoveryFlow] = useState(false);
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [recoveryReason, setRecoveryReason] = useState('New primary phone purchased');

  if (!isOpen) return null;

  const device = student.registeredDevice;
  // partially mask the device id
  const maskedId = device.deviceId.replace(/^DEV-([A-Z0-9]{3})[A-Z0-9]+-([A-Z0-9]+)$/, 'DEV-$1***-$2');

  const handleStartRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#e1e3e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e1e3e4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#031635] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">phonelink_lock</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#031635]">Registered Device</h2>
              <p className="text-[11px] text-[#75777f]">Hardware Token & Anti-Proxy Security</p>
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
          {!showRecoveryFlow ? (
            <>
              {/* Device Hero Box */}
              <div className="bg-[#f8f9fc] border border-[#e1e3e4] rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#031635] text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[24px]">smartphone</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#031635] truncate">{device.deviceName}</h3>
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-[12px] text-[#75777f]">{device.model}</p>
                </div>
              </div>

              {/* Hardware Details */}
              <div className="bg-white rounded-2xl border border-[#e1e3e4] p-4 flex flex-col gap-2.5 text-[12px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#75777f]">
                  Binding Credentials
                </span>

                <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
                  <span className="text-[#75777f]">Masked Device ID:</span>
                  <span className="font-mono font-bold text-[#031635]">{maskedId}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
                  <span className="text-[#75777f]">Security Binding:</span>
                  <span className="font-semibold text-[#005312] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005312]" />
                    Hardware Keystore Bound
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
                  <span className="text-[#75777f]">First Registered:</span>
                  <span className="font-medium text-[#191c1d]">{device.registeredAt}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-[#f3f4f5]">
                  <span className="text-[#75777f]">Last Lecture Attestation:</span>
                  <span className="font-medium text-[#191c1d]">{device.lastVerifiedAt}</span>
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[#75777f]">Hardware Fingerprint:</span>
                  <span className="font-mono text-[10px] bg-[#f8f9fa] p-2 rounded-lg border border-[#e1e3e4] text-[#44474e] break-all select-all">
                    {device.fingerprintHash}
                  </span>
                </div>
              </div>

              {/* Institutional Policy Notice */}
              <div className="bg-[#fffaf0] border border-[#ffdcc6] rounded-2xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#723600] text-[20px] shrink-0 mt-0.5">
                  shield_locked
                </span>
                <div className="flex flex-col text-[12px]">
                  <span className="font-bold text-[#723600]">Single-Device College Policy</span>
                  <p className="text-[#75777f] mt-0.5 leading-relaxed">
                    To prevent attendance proxy, your SmartAttend profile can only be bound to one active phone. Rebinding requires administrator attestation or student portal 2FA.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setShowRecoveryFlow(true)}
                  className="w-full bg-[#031635] text-white hover:bg-[#1a2b4b] py-3 px-4 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">device_reset</span>
                  <span>Request Device Transfer / Change</span>
                </button>
              </div>
            </>
          ) : recoverySubmitted ? (
            <div className="py-8 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#a0f399] text-[#005312] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#031635]">Transfer Request Initiated</h3>
              <p className="text-[12px] text-[#75777f] max-w-xs leading-relaxed">
                An authorization code has been sent to your Springfield university email (<span className="font-medium text-[#191c1d]">{student.email}</span>). Visit the IT Helpdesk or complete 2FA to bind your new phone.
              </p>
              <button
                onClick={() => {
                  setRecoverySubmitted(false);
                  setShowRecoveryFlow(false);
                }}
                className="mt-2 bg-[#031635] text-white px-5 py-2.5 rounded-xl font-bold text-[13px] cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleStartRecovery} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#031635]">
                <button
                  type="button"
                  onClick={() => setShowRecoveryFlow(false)}
                  className="w-7 h-7 rounded-lg bg-[#f3f4f5] flex items-center justify-center text-[#191c1d]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <span>Device Recovery Form</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#44474e]">Reason for Device Change *</label>
                <select
                  value={recoveryReason}
                  onChange={(e) => setRecoveryReason(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl px-3 py-2 text-[13px] text-[#191c1d] focus:outline-none focus:border-[#031635]"
                >
                  <option value="New primary phone purchased">New primary phone purchased</option>
                  <option value="Old phone lost / stolen">Old phone lost / stolen</option>
                  <option value="Device repaired / OS factory reset">Device repaired / OS factory reset</option>
                  <option value="Temporary backup phone for semester">Temporary backup phone for semester</option>
                </select>
              </div>

              <div className="p-3 bg-[#eef2ff] border border-[#d8e2ff] rounded-xl text-[12px] text-[#001d36]">
                <span className="font-bold">Next Step: </span>
                <span>You will need your Student ID Card (<span className="font-semibold">{student.studentId}</span>) to scan the enrollment QR on your new phone.</span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#031635] text-white hover:bg-[#1a2b4b] py-3 px-4 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Send Transfer Authorization</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
