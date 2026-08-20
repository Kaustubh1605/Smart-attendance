import React, { useState } from 'react';
import { StudentProfile } from '../types';

interface DeviceRecoveryModalProps {
  student: StudentProfile;
  onClose: () => void;
  onConfirmNewDevice: (deviceName: string, model: string) => void;
}

export const DeviceRecoveryModal: React.FC<DeviceRecoveryModalProps> = ({
  student,
  onClose,
  onConfirmNewDevice,
}) => {
  const [step, setStep] = useState<'request' | 'otp' | 'success'>('request');
  const [newDeviceName, setNewDeviceName] = useState('Samsung Galaxy S24 Ultra');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onConfirmNewDevice(newDeviceName, 'Galaxy S24 (Snapdragon 8 Gen 3)');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[#e1e3e4] text-[#191c1d]">
        <div className="flex justify-between items-center border-b border-[#f3f4f5] pb-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">Device Management</span>
            <h3 className="text-[18px] font-bold text-[#031635]">Hardware Migration</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9fa] text-[#75777f] hover:text-[#191c1d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {step === 'request' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-[#44474e]">
              Attendance authentication is bound to a single trusted device. Migrating to a new phone requires two-factor email verification.
            </p>

            <div className="p-3.5 bg-[#f8f9fa] rounded-2xl border border-[#e1e3e4] text-[12px] flex flex-col gap-1">
              <span className="text-[#75777f]">Currently Registered Device:</span>
              <span className="font-bold text-[#031635] text-[14px]">{student.registeredDevice.model}</span>
              <span className="text-[11px] text-[#75777f] font-mono">{student.registeredDevice.deviceId}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]">New Device Name / Model</label>
              <input
                className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] focus:border-[#031635] focus:bg-white outline-none"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro / Pixel 8"
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#031635] text-white font-bold text-[13px] rounded-2xl hover:bg-[#1a2b4b] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isProcessing ? (
                <span>Generating Security Challenge...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  <span>Send Verification Code to Email</span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="p-3 bg-[#eef2ff] border border-[#d8e2ff] text-[#031635] rounded-2xl text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#031635]">mail</span>
              <span>6-digit OTP sent to <strong>{student.email}</strong></span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]">Enter 6-Digit OTP Code</label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[0.5em] text-[20px] font-bold py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl focus:border-[#031635] focus:bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-[#031635] text-white font-bold text-[13px] rounded-2xl hover:bg-[#1a2b4b] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isProcessing ? 'Verifying Hardware Identity...' : 'Confirm & Bind New Device'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-[#a0f399] text-[#005312] flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h4 className="text-[18px] font-bold text-[#031635]">Hardware Migration Complete</h4>
            <p className="text-[12px] text-[#44474e]">
              Your session is now cryptographically bound to <strong className="text-[#031635]">{newDeviceName}</strong>. Previous device credentials have been revoked.
            </p>
            <button
              onClick={onClose}
              className="w-full mt-2 py-3 bg-[#031635] text-white font-bold text-[13px] rounded-2xl cursor-pointer hover:bg-[#1a2b4b] shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
