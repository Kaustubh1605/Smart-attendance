package com.smartattend.backend.controllers;

import com.smartattend.backend.models.Lecture;
import com.smartattend.backend.services.LectureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lectures")
public class LectureController {

    private final LectureService lectureService;

    public LectureController(LectureService lectureService) {
        this.lectureService = lectureService;
    }

    @GetMapping
    public ResponseEntity<List<Lecture>> getAllLectures() {
        return ResponseEntity.ok(lectureService.getAllLectures());
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveLecture() {
        return ResponseEntity.ok(lectureService.getActiveLectureSession());
    }

    @PostMapping("/active")
    public ResponseEntity<Map<String, Object>> setActiveLecture(@RequestBody Map<String, Object> sessionData) {
        return ResponseEntity.ok(lectureService.setActiveLectureSession(sessionData));
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Lecture>> getLecturesByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(lectureService.getLecturesByTeacher(teacherId));
    }

    @PostMapping
    public ResponseEntity<Lecture> createLecture(@RequestBody Lecture lecture) {
        return ResponseEntity.ok(lectureService.createLecture(lecture));
    }
}
