package com.smartattend.backend.services;

import com.smartattend.backend.models.Lecture;
import com.smartattend.backend.repositories.LectureRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LectureService {
    
    private final LectureRepository lectureRepository;

    public LectureService(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
    }

    public List<Lecture> getAllLectures() {
        return lectureRepository.findAll();
    }

    public Lecture getLectureById(String id) {
        return lectureRepository.findById(id).orElseThrow();
    }
    
    public List<Lecture> getLecturesByTeacher(String teacherId) {
        return lectureRepository.findByTeacherId(teacherId);
    }

    public Lecture createLecture(Lecture lecture) {
        return lectureRepository.save(lecture);
    }
}
