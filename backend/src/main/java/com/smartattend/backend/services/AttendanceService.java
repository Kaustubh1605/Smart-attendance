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

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
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
        return attendanceRepository.save(record);
    }
}
