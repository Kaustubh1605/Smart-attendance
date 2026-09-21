package com.smartattend.backend.controllers;

import com.smartattend.backend.models.AttendanceRecord;
import com.smartattend.backend.services.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportAttendance() {
        String csvData = attendanceService.exportAllAttendanceToCsv();
        byte[] bytes = csvData.getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance_semester_report.csv\"");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }
}
