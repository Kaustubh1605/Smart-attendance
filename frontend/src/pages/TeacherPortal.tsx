import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherLogin } from '../components/TeacherLogin';
import { TeacherDashboard } from '../components/TeacherDashboard';

export const TeacherPortal = (props: any) => {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full transition-all duration-300 ${
        props.isPhoneFrame
          ? 'max-w-[430px] my-6 border-8 border-slate-900 rounded-[48px] shadow-2xl overflow-hidden min-h-[880px] bg-[#f8f9fa] relative ring-1 ring-slate-800'
          : 'w-full'
      }`}
    >
      {!props.isTeacherLoggedIn ? (
        <TeacherLogin
          onLoginSuccess={(name, email, token) => {
            props.setIsTeacherLoggedIn(true);
            if (props.onLoginSuccess) {
              props.onLoginSuccess(name, email, token);
            }
          }}
          onSwitchToStudent={() => navigate('/student')}
          onSwitchToAdmin={() => navigate('/admin')}
        />
      ) : (
        <TeacherDashboard
          lectures={props.lectures}
          currentLecture={props.activeLecture}
          onSelectLecture={props.handleSelectLecture}
          onCreateLecture={props.handleCreateLecture}
          onUpdateLecture={props.handleUpdateLecture}
          onDeleteLecture={props.handleDeleteLecture}
          onEndAttendance={props.handleEndAttendance}
          students={props.classStudents}
          onUpdateStudentStatus={props.handleTeacherOverride}
          onNavigateHome={() => navigate('/student')}
          onLogout={() => props.setIsTeacherLoggedIn(false)}
          studyMaterials={props.studyMaterials}
          onAddStudyMaterial={props.handleAddStudyMaterial}
          onUpdateStudyMaterial={props.handleUpdateStudyMaterial}
          onDeleteStudyMaterial={props.handleDeleteStudyMaterial}
        />
      )}
    </div>
  );
};
