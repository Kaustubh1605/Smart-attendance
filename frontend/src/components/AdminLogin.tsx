import React, { useState } from 'react';
import { LOGO_URL } from '../data/mockData';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onSwitchToStudent?: () => void;
  onSwitchToTeacher?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onSwitchToStudent,
  onSwitchToTeacher,
}) => {
  const [tenantId, setTenantId] = useState('springfield-01');
  const [adminEmail, setAdminEmail] = useState('admin.ops@springfield.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('849201');
  const [authMethod, setAuthMethod] = useState<'totp' | 'yubikey' | 'sso'>('totp');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !password) {
      setErrorMsg('Please provide valid administrative credentials.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 650);
  };

  const handleQuickFill = () => {
    setTenantId('springfield-01');
    setAdminEmail('admin.ops@springfield.edu');
    setPassword('AdminMasterSecure#2024');
    setMfaCode('849201');
  };

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center px-4 bg-[#f3f4f5] py-12 text-[#191c1d] font-sans">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        {/* Institutional Admin Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <img alt="SmartAttend" className="h-12 w-auto mb-1 drop-shadow-sm" src={LOGO_URL} />
            <span className="absolute -bottom-1 -right-2 bg-[#031635] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-white">
              Admin
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#031635] tracking-tight">
            Institutional Administration
          </h1>
          <p className="text-[13px] text-[#75777f] max-w-sm">
            Springfield University • Central IT & Security Operations Clearance
          </p>
        </div>

        {/* Admin Login Card */}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] p-7 md:p-8 flex flex-col gap-5 shadow-lg relative overflow-hidden">
          {/* Top clearance ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f5]">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#031635] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px] text-[#1b6d24]">shield_locked</span>
              <span>IAM & Audit Clearance Level 3</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Admin
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-2xl text-[12px] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Multi-Tenant Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]" htmlFor="tenantId">
                University Tenant Schema
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  domain
                </span>
                <select
                  id="tenantId"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d] appearance-none font-medium cursor-pointer"
                >
                  <option value="springfield-01">Springfield University (springfield-01)</option>
                  <option value="mit-tenant-02">MIT Campus Engineering (mit-tenant-02)</option>
                  <option value="stanford-cs-04">Stanford CS Labs (stanford-cs-04)</option>
                  <option value="oxford-edu-09">Oxford Academic Cluster (oxford-edu-09)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777f] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Admin IAM Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#44474e]" htmlFor="adminEmail">
                Security Officer / Admin Identity (SSO)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  admin_panel_settings
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d] placeholder:text-[#75777f]"
                  id="adminEmail"
                  name="adminEmail"
                  placeholder="admin.ops@springfield.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Admin Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-[#44474e]" htmlFor="adminPassword">
                  Master Administrative Password
                </label>
                <span className="text-[11px] text-[#75777f] font-mono">TLS 1.3 Encrypted</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] text-[#191c1d]"
                  id="adminPassword"
                  name="adminPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777f] hover:text-[#191c1d] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* 2FA MFA Token */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-[#44474e]" htmlFor="mfaCode">
                  Hardware 2FA / TOTP Security Code
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('totp')}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                      authMethod === 'totp' ? 'bg-[#031635] text-white' : 'text-[#75777f]'
                    }`}
                  >
                    TOTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('yubikey')}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                      authMethod === 'yubikey' ? 'bg-[#031635] text-white' : 'text-[#75777f]'
                    }`}
                  >
                    FIDO2 / YubiKey
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777f] text-[20px]">
                  key
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl focus:border-[#031635] focus:bg-white focus:outline-none transition-all text-[13px] font-mono tracking-widest text-[#191c1d]"
                  id="mfaCode"
                  name="mfaCode"
                  placeholder="6-digit Authenticator OTP"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={8}
                  type="text"
                />
              </div>
            </div>

            {/* Audit compliance notice */}
            <div className="p-3 bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl flex items-start gap-2.5 text-[11px] text-[#44474e]">
              <span className="material-symbols-outlined text-[16px] text-[#031635] shrink-0 mt-0.5">
                verified
              </span>
              <span>
                Administrative sessions are cryptographically logged to the immutable audit trail with actor IP, hardware signature, and timestamp.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#031635] hover:bg-[#1a2b4b] text-white py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Verifying Institutional Clearance...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Authorize & Enter Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Portal Switch Footer */}
          <div className="border-t border-[#f3f4f5] pt-4 flex items-center justify-between text-[12px] text-[#75777f]">
            <span>Need a different portal?</span>
            <div className="flex items-center gap-3">
              {onSwitchToStudent && (
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="font-bold text-[#031635] hover:underline cursor-pointer"
                >
                  Student Portal
                </button>
              )}
              {onSwitchToTeacher && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onSwitchToTeacher}
                    className="font-bold text-[#031635] hover:underline cursor-pointer"
                  >
                    Teacher Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
