import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { StudentLogin } from '../components/StudentLogin';
import { StudentVerification } from '../components/StudentVerification';
import { StudentHome } from '../components/StudentHome';
import { StudentHistory } from '../components/StudentHistory';
import { StudentStudyMaterials } from '../components/StudentStudyMaterials';
import { StudentProfileView } from '../components/StudentProfile';
import { BottomNav } from '../components/BottomNav';
import { CorrectionModal } from '../components/CorrectionModal';
import { DeviceRecoveryModal } from '../components/DeviceRecoveryModal';

export const StudentPortal = (props: any) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to tabs for BottomNav
  const currentTab = location.pathname.includes('history') ? 'history' : 
                     location.pathname.includes('materials') ? 'materials' : 
                     location.pathname.includes('profile') ? 'profile' : 'home';

  const handleSelectTab = (tab: string) => {
    props.setSelectedMaterialSubject(null);
    navigate(`/student/${tab === 'home' ? '' : tab}`);
  };

  return (
    <div
      className={`w-full transition-all duration-300 ${
        props.isPhoneFrame
          ? 'max-w-[430px] my-6 border-8 border-[#191c1d] rounded-[48px] shadow-2xl overflow-hidden min-h-[880px] bg-[#f3f4f5] relative ring-1 ring-black/10'
          : 'w-full'
      }`}
    >
      {!props.isStudentLoggedIn ? (
        <StudentLogin
          onLoginSuccess={() => props.setIsStudentLoggedIn(true)}
          onOpenRecovery={() => props.setShowDeviceRecovery(true)}
          onSwitchToAdmin={() => navigate('/admin')}
          onSwitchToTeacher={() => navigate('/teacher')}
        />
      ) : props.isVerifying ? (
        <StudentVerification
          student={props.studentData}
          lecture={props.activeLecture}
          onAbort={() => props.setIsVerifying(false)}
          onVerificationComplete={props.handleVerificationComplete}
        />
      ) : (
        <>
          <Routes>
            <Route path="" element={
              <StudentHome
                student={props.studentData}
                activeLecture={props.activeLecture}
                upcomingLectures={props.upcomingLectures}
                attendanceHistory={props.attendanceHistory}
                onStartVerification={() => props.setIsVerifying(true)}
                onNavigateHistory={() => handleSelectTab('history')}
                onNavigateMaterials={(subjectCode?: string) => {
                  props.setSelectedMaterialSubject(subjectCode || null);
                  handleSelectTab('materials');
                }}
                onNavigateProfile={() => handleSelectTab('profile')}
                onRequestCorrection={(rec: any) => props.setCorrectionTargetRecord(rec)}
              />
            } />
            <Route path="history" element={
              <StudentHistory
                student={props.studentData}
                records={props.attendanceHistory}
                onRequestCorrection={(rec: any) => props.setCorrectionTargetRecord(rec)}
                onNavigateHome={() => handleSelectTab('home')}
                onNavigateProfile={() => handleSelectTab('profile')}
              />
            } />
            <Route path="materials" element={
              <StudentStudyMaterials
                student={props.studentData}
                materials={props.studyMaterials}
                initialSubjectCode={props.selectedMaterialSubject || undefined}
                onNavigateHome={() => handleSelectTab('home')}
                onNavigateHistory={() => handleSelectTab('history')}
                onNavigateProfile={() => handleSelectTab('profile')}
                onBack={() => handleSelectTab('home')}
              />
            } />
            <Route path="profile" element={
              <StudentProfileView
                student={props.studentData}
                onLogout={() => props.setIsStudentLoggedIn(false)}
                onOpenDeviceRecovery={() => props.setShowDeviceRecovery(true)}
              />
            } />
            <Route path="*" element={<Navigate to="/student" />} />
          </Routes>

          <BottomNav currentTab={currentTab as any} onSelectTab={handleSelectTab} />
        </>
      )}

      {props.correctionTargetRecord && (
        <CorrectionModal
          record={props.correctionTargetRecord}
          onClose={() => props.setCorrectionTargetRecord(null)}
          onSubmitCorrection={props.handleSubmitCorrection}
        />
      )}

      {props.showDeviceRecovery && (
        <DeviceRecoveryModal
          student={props.studentData}
          onClose={() => props.setShowDeviceRecovery(false)}
          onConfirmNewDevice={props.handleConfirmNewDevice}
        />
      )}
    </div>
  );
};
