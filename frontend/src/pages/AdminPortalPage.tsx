import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLogin } from '../components/AdminLogin';
import { AdminPortal } from '../components/AdminPortal';

export const AdminPortalPage = (props: any) => {
  const navigate = useNavigate();

  return (
    <>
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
    </>
  );
};
