package com.smartattend.backend.controllers;

import com.smartattend.backend.models.Lecture;
import com.smartattend.backend.services.LectureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Lecture>> getLecturesByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(lectureService.getLecturesByTeacher(teacherId));
    }

    @PostMapping
    public ResponseEntity<Lecture> createLecture(@RequestBody Lecture lecture) {
        return ResponseEntity.ok(lectureService.createLecture(lecture));
    }
}
