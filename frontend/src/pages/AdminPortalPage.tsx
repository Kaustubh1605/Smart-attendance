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
          onLoginSuccess={() => props.setIsAdminLoggedIn(true)}
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
