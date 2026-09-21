package com.smartattend.backend.services;

import com.smartattend.backend.models.AttendanceRecord;
import com.smartattend.backend.models.AttendanceStatus;
import com.smartattend.backend.repositories.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final NotificationService notificationService;

    public AttendanceService(AttendanceRepository attendanceRepository, NotificationService notificationService) {
        this.attendanceRepository = attendanceRepository;
        this.notificationService = notificationService;
    }

    public List<AttendanceRecord> getAttendanceForLecture(String lectureId) {
        return attendanceRepository.findByLectureId(lectureId);
    }

    public AttendanceRecord markAttendance(AttendanceRecord record) {
        // Here we would normally compute geofence distance (record.getLocationDistance())
        // and verify BLE/Device binding before determining the final status.
        
        if (record.getLocationDistance() != null && record.getLocationDistance() < 50.0) {
            record.setStatus(AttendanceStatus.PRESENT);
            record.setLocationStatus("verified");
        } else {
            record.setStatus(AttendanceStatus.PROBABLE);
            record.setLocationStatus("mismatch");
        }
        
        record.setTimestamp(LocalDateTime.now());
        
        // Trigger notification if absent
        if (record.getStatus() == AttendanceStatus.ABSENT) {
            String studentEmail = (record.getStudent() != null && record.getStudent().getUser() != null) ? record.getStudent().getUser().getEmail() : "student@example.com";
            String studentName = (record.getStudent() != null && record.getStudent().getUser() != null) ? record.getStudent().getUser().getName() : "Student";
            String lectureCode = record.getLecture() != null ? record.getLecture().getCode() : "Lecture";
            notificationService.sendAbsenceNotification(studentEmail, studentName, lectureCode, record.getTimestamp().toLocalDate().toString());
        }
        
        return attendanceRepository.save(record);
    }

    public String exportAllAttendanceToCsv() {
        List<AttendanceRecord> records = attendanceRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Record ID,Student ID,Student Name,Lecture Code,Lecture Name,Class,Room,Status,Verification Time,Confidence Score\n");

        for (AttendanceRecord record : records) {
            String recordId = record.getId() != null ? record.getId() : "";
            String studentId = record.getStudent() != null ? record.getStudent().getStudentId() : "";
            String studentName = (record.getStudent() != null && record.getStudent().getUser() != null) ? record.getStudent().getUser().getName() : "";
            String lectureCode = record.getLecture() != null ? record.getLecture().getCode() : "";
            String lectureName = record.getLecture() != null ? record.getLecture().getName() : "";
            String className = record.getLecture() != null ? record.getLecture().getClassName() : "";
            String room = (record.getLecture() != null && record.getLecture().getClassroom() != null) ? record.getLecture().getClassroom().getName() : "";
            String status = record.getStatus() != null ? record.getStatus().name() : "";
            String verificationTime = record.getTimestamp() != null ? record.getTimestamp().toString() : "";
            String confidenceScore = record.getConfidenceScore() != null ? String.valueOf(record.getConfidenceScore()) : "";

            csv.append(String.format("%s,%s,\"%s\",%s,\"%s\",%s,\"%s\",%s,%s,%s\n",
                    recordId, studentId, studentName, lectureCode, lectureName, className, room, status, verificationTime, confidenceScore));
        }
        return csv.toString();
    }
}
