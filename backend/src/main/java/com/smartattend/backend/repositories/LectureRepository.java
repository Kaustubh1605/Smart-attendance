package com.smartattend.backend.repositories;

import com.smartattend.backend.models.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, String> {
    List<Lecture> findByTeacherId(String teacherId);
    List<Lecture> findByClassroomId(String classroomId);
}
