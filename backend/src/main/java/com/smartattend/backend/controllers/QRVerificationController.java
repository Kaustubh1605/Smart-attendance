package com.smartattend.backend.controllers;

import com.smartattend.backend.models.DynamicQRChallenge;
import com.smartattend.backend.models.QRVerificationAttempt;
import com.smartattend.backend.models.QRVerificationResult;
import com.smartattend.backend.services.QRVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
public class QRVerificationController {

    private final QRVerificationService qrVerificationService;

    public QRVerificationController(QRVerificationService qrVerificationService) {
        this.qrVerificationService = qrVerificationService;
    }

    @GetMapping("/generate")
    public ResponseEntity<DynamicQRChallenge> generateChallenge(
            @RequestParam String sessionId, 
            @RequestParam String lectureCode) {
        return ResponseEntity.ok(qrVerificationService.generateDynamicQRChallenge(sessionId, lectureCode));
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, String>> getActiveSession() {
        return ResponseEntity.ok(qrVerificationService.getActiveSession());
    }

    @PostMapping("/active")
    public ResponseEntity<Map<String, String>> setActiveSession(
            @RequestParam String sessionId,
            @RequestParam String lectureCode) {
        qrVerificationService.setActiveSession(sessionId, lectureCode);
        return ResponseEntity.ok(qrVerificationService.getActiveSession());
    }

    @PostMapping("/validate")
    public ResponseEntity<QRVerificationResult> validateAttempt(@RequestBody QRVerificationAttempt attempt) {
        QRVerificationResult result = qrVerificationService.validateAttendanceAttempt(attempt);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/attendees/{sessionId}")
    public ResponseEntity<List<Map<String, Object>>> getSessionAttendees(@PathVariable String sessionId) {
        return ResponseEntity.ok(qrVerificationService.getSessionAttendees(sessionId));
    }
}
