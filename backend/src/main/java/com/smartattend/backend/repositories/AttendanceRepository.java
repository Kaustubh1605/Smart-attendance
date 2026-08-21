package com.smartattend.backend.repositories;

import com.smartattend.backend.models.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByLectureId(String lectureId);
    List<AttendanceRecord> findByStudentId(String studentId);
}
