package com.smartattend.backend.services;

import com.smartattend.backend.models.Lecture;
import com.smartattend.backend.repositories.LectureRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LectureService {
    
    private final LectureRepository lectureRepository;
    private final Map<String, Object> activeLectureSession = new ConcurrentHashMap<>();

    public LectureService(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
        // Default initial lecture
        activeLectureSession.put("sessionId", "lec-1");
        activeLectureSession.put("lectureCode", "CS301");
        activeLectureSession.put("lectureName", "Operating Systems");
        activeLectureSession.put("room", "Room 204");
        activeLectureSession.put("status", "active");
    }

    public List<Lecture> getAllLectures() {
        return lectureRepository.findAll();
    }

    public Lecture getLectureById(String id) {
        return lectureRepository.findById(id).orElse(null);
    }
    
    public List<Lecture> getLecturesByTeacher(String teacherId) {
        return lectureRepository.findByTeacherId(teacherId);
    }

    public Lecture createLecture(Lecture lecture) {
        return lectureRepository.save(lecture);
    }

    public Map<String, Object> getActiveLectureSession() {
        return activeLectureSession;
    }

    public Map<String, Object> setActiveLectureSession(Map<String, Object> sessionData) {
        if (sessionData != null) {
            activeLectureSession.putAll(sessionData);
        }
        return activeLectureSession;
    }
}
