import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherLogin } from '../components/TeacherLogin';
import { TeacherDashboard } from '../components/TeacherDashboard';

export const TeacherPortal = (props: any) => {
  const navigate = useNavigate();

  return (
    <>
      {!props.isTeacherLoggedIn ? (
        <TeacherLogin
          onLoginSuccess={() => props.setIsTeacherLoggedIn(true)}
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
    </>
  );
};
