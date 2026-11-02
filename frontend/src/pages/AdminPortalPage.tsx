import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '../components/AdminLogin';
import { AdminPortal } from '../components/AdminPortal';

export const AdminPortalPage = (props: any) => {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full transition-all duration-300 ${
        props.isPhoneFrame
          ? 'max-w-[430px] my-6 border-8 border-slate-900 rounded-[48px] shadow-2xl overflow-hidden min-h-[880px] bg-white relative ring-1 ring-slate-800'
          : 'w-full'
      }`}
    >
      {!props.isAdminLoggedIn ? (
        <AdminLogin
          onLoginSuccess={(name, email, token) => {
            if (props.onLoginSuccess) {
              props.onLoginSuccess(name, email, token);
            }
            props.setIsAdminLoggedIn(true);
          }}
          onSwitchToStudent={() => navigate('/student')}
          onSwitchToTeacher={() => navigate('/teacher')}
        />
      ) : (
        <AdminPortal
          auditLogs={props.auditLogs}
          lectures={props.lectures}
          onAddAuditLog={(log: any) => props.setAuditLogs((prev: any) => [log, ...prev])}
          onLogout={() => props.setIsAdminLoggedIn(false)}
        />
      )}
    </div>
  );
};
