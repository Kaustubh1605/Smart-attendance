package com.smartattend.backend.controllers;

import com.smartattend.backend.models.DynamicQRChallenge;
import com.smartattend.backend.models.QRVerificationAttempt;
import com.smartattend.backend.models.QRVerificationResult;
import com.smartattend.backend.services.QRVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/validate")
    public ResponseEntity<QRVerificationResult> validateAttempt(@RequestBody QRVerificationAttempt attempt) {
        QRVerificationResult result = qrVerificationService.validateAttendanceAttempt(attempt);
        return ResponseEntity.ok(result);
    }
}
