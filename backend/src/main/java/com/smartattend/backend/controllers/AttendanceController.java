package com.smartattend.backend.controllers;

import com.smartattend.backend.models.AttendanceRecord;
import com.smartattend.backend.services.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/lecture/{lectureId}")
    public ResponseEntity<List<AttendanceRecord>> getAttendanceForLecture(@PathVariable String lectureId) {
        return ResponseEntity.ok(attendanceService.getAttendanceForLecture(lectureId));
    }

    @PostMapping("/mark")
    public ResponseEntity<AttendanceRecord> markAttendance(@RequestBody AttendanceRecord record) {
        return ResponseEntity.ok(attendanceService.markAttendance(record));
    }
}
