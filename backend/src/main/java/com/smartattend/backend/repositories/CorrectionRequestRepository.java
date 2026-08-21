package com.smartattend.backend.repositories;

import com.smartattend.backend.models.CorrectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CorrectionRequestRepository extends JpaRepository<CorrectionRequest, String> {
    List<CorrectionRequest> findByStudentId(String studentId);
    List<CorrectionRequest> findByLectureId(String lectureId);
}
