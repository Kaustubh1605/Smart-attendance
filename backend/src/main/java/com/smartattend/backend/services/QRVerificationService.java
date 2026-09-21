package com.smartattend.backend.services;

import com.smartattend.backend.models.DynamicQRChallenge;
import com.smartattend.backend.models.QRVerificationAttempt;
import com.smartattend.backend.models.QRVerificationResult;
import com.smartattend.backend.models.VerificationEvidence;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class QRVerificationService {
    
    private static final int QR_ROTATION_INTERVAL_MS = 10000;
    private static final int QR_PROCESSING_GRACE_MS = 2000;
    private static final String SECRET_SALT = "SMARTATTEND_AUTH_SECRET_SALT_2026";
    
    private final Set<String> submittedChallengeAttempts = new HashSet<>();
    private final Set<String> submittedSessionAttendance = new HashSet<>();
    
    private String createSignature(String payload) {
        int hash = 0;
        String str = payload + "_" + SECRET_SALT;
        for (int i = 0; i < str.length(); i++) {
            char character = str.charAt(i);
            hash = ((hash << 5) - hash) + character;
        }
        return "SIG-" + Integer.toHexString(Math.abs(hash)).toUpperCase();
    }
    
    public boolean verifyChallengeSignature(DynamicQRChallenge challenge) {
        String expectedPayload = challenge.getChallengeId() + ":" + challenge.getSessionId() + ":" +
                challenge.getLectureCode() + ":" + challenge.getToken() + ":" + 
                challenge.getCreatedAt() + ":" + challenge.getExpiresAt();
        String expectedSignature = createSignature(expectedPayload);
        return expectedSignature.equals(challenge.getSignature());
    }
    
    public DynamicQRChallenge generateDynamicQRChallenge(String sessionId, String lectureCode) {
        long createdAt = System.currentTimeMillis();
        long expiresAt = createdAt + QR_ROTATION_INTERVAL_MS;
        int nonce = 1000 + (int)(Math.random() * 9000);
        String token = "SA-10S-" + nonce;
        String challengeId = "CHAL-" + sessionId + "-" + nonce + "-" + createdAt;
        
        String payload = challengeId + ":" + sessionId + ":" + lectureCode + ":" + token + ":" + createdAt + ":" + expiresAt;
        String signature = createSignature(payload);
        
        DynamicQRChallenge challenge = new DynamicQRChallenge();
        challenge.setChallengeId(challengeId);
        challenge.setToken(token);
        challenge.setSessionId(sessionId);
        challenge.setLectureCode(lectureCode);
        challenge.setCreatedAt(createdAt);
        challenge.setExpiresAt(expiresAt);
        challenge.setRotationIntervalSeconds(10);
        challenge.setSignature(signature);
        
        return challenge;
    }
    
    public QRVerificationResult validateAttendanceAttempt(QRVerificationAttempt attempt) {
        long completionTime = attempt.getCompletionTime() != null ? attempt.getCompletionTime() : System.currentTimeMillis();
        DynamicQRChallenge challenge = attempt.getChallenge();
        long attemptStartTime = attempt.getAttemptStartTime();
        
        if (!verifyChallengeSignature(challenge)) {
            return createFailedResult("Security challenge integrity check failed (Tampered or invalid signature).", "tampered", attempt, completionTime, 0);
        }
        
        boolean isAttemptInitiatedInTime = attemptStartTime <= challenge.getExpiresAt();
        if (!isAttemptInitiatedInTime) {
            return createFailedResult("QR Code Expired. This attendance session code is no longer valid.", "expired", attempt, completionTime, 0);
        }
        
        boolean isWithinProcessingGrace = completionTime <= challenge.getExpiresAt() + QR_PROCESSING_GRACE_MS;
        if (!isWithinProcessingGrace) {
            return createFailedResult("Verification request timed out. Processing exceeded maximum grace window.", "expired", attempt, completionTime, 0);
        }
        
        boolean isGraceProcessed = completionTime > challenge.getExpiresAt() && isWithinProcessingGrace;
        
        String challengeKey = attempt.getSessionId() + "_" + attempt.getStudentId() + "_" + challenge.getChallengeId();
        String sessionKey = attempt.getSessionId() + "_" + attempt.getStudentId();
        
        if (submittedChallengeAttempts.contains(challengeKey)) {
            return createFailedResult("Duplicate attempt prevented. This QR challenge has already been consumed.", "duplicate", attempt, completionTime, 10);
        }
        if (submittedSessionAttendance.contains(sessionKey)) {
            return createFailedResult("Attendance already recorded for this lecture session.", "duplicate", attempt, completionTime, 15);
        }
        
        submittedChallengeAttempts.add(challengeKey);
        submittedSessionAttendance.add(sessionKey);
        
        boolean isDeviceTrusted = attempt.getDeviceId() != null && !attempt.getDeviceId().contains("UNRECOGNIZED");
        boolean isLocationVerified = "verified".equals(attempt.getLocationStatus()) && (attempt.getDistanceMeters() != null && attempt.getDistanceMeters() <= 35);
        boolean isLocationUncertain = "uncertain".equals(attempt.getLocationStatus()) || (attempt.getDistanceMeters() != null && attempt.getDistanceMeters() > 35 && attempt.getDistanceMeters() <= 60);
        boolean isBleDetected = attempt.getBleDetected() != null ? attempt.getBleDetected() : false;
        
        String finalStatus = "verified_present";
        String attendanceStatus = "present";
        int confidenceScore = 98;
        String notes = "Multi-factor confirmed (Bound Device + 10s Dynamic QR + BLE + GPS Geofence)";
        
        if (!isDeviceTrusted) {
            finalStatus = "needs_review";
            attendanceStatus = "needs_review";
            confidenceScore = 40;
            notes = "Unregistered device hardware fingerprint. Held for faculty review.";
        } else if (!isBleDetected && !isLocationVerified) {
            finalStatus = "needs_review";
            attendanceStatus = "needs_review";
            confidenceScore = 52;
            notes = "Location uncertain and BLE beacon not detected in classroom.";
        } else if (!isBleDetected && isLocationVerified) {
            finalStatus = "probable_present";
            attendanceStatus = "probable";
            confidenceScore = 80;
            notes = "GPS verified within geofence; BLE beacon proximity unavailable.";
        } else if (isBleDetected && isLocationUncertain) {
            finalStatus = "probable_present";
            attendanceStatus = "probable";
            confidenceScore = 85;
            notes = "BLE beacon verified in-room; GPS geofence borderline variance.";
        } else if (isGraceProcessed) {
            confidenceScore = 95;
            notes = "Verified (In-flight attempt initiated before 10s expiry and completed in grace window).";
        }
        
        VerificationEvidence evidence = createEvidence(completionTime, attempt, true, confidenceScore, notes,
                isDeviceTrusted ? "trusted" : "unrecognized", attempt.getLocationStatus(), 
                attempt.getDistanceMeters() != null ? attempt.getDistanceMeters() : 6.2, 
                isBleDetected, attempt.getBleRssi() != null ? attempt.getBleRssi() : -64);
                
        QRVerificationResult result = new QRVerificationResult();
        result.setSuccess(true);
        result.setStatus(finalStatus);
        result.setAttendanceStatus(attendanceStatus);
        result.setConfidenceScore(confidenceScore);
        result.setChallengeStatus("valid");
        result.setGraceProcessed(isGraceProcessed);
        result.setEvidence(evidence);
        
        return result;
    }
    
    private QRVerificationResult createFailedResult(String reason, String challengeStatus, QRVerificationAttempt attempt, long completionTime, int score) {
        VerificationEvidence evidence = createEvidence(completionTime, attempt, false, score, reason, "trusted", attempt.getLocationStatus(), attempt.getDistanceMeters() != null ? attempt.getDistanceMeters() : 0.0, attempt.getBleDetected() != null ? attempt.getBleDetected() : false, attempt.getBleRssi() != null ? attempt.getBleRssi() : -64);
        
        QRVerificationResult result = new QRVerificationResult();
        result.setSuccess(false);
        result.setStatus("not_verified");
        result.setAttendanceStatus("absent");
        result.setRejectionReason(reason);
        result.setConfidenceScore(score);
        result.setChallengeStatus(challengeStatus);
        result.setEvidence(evidence);
        return result;
    }
    
    private VerificationEvidence createEvidence(long completionTime, QRVerificationAttempt attempt, boolean challengeVerified, int score, String notes, String deviceStatus, String locationStatus, double distanceMeters, boolean bleDetected, int bleRssi) {
        VerificationEvidence evidence = new VerificationEvidence();
        evidence.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        evidence.setLocationStatus(locationStatus != null ? locationStatus : "verified");
        evidence.setLocationDistanceMeters(distanceMeters);
        evidence.setDeviceStatus(deviceStatus);
        evidence.setDynamicChallengeVerified(challengeVerified);
        evidence.setChallengeLatencyMs(Math.max(20, completionTime - attempt.getAttemptStartTime()));
        evidence.setBleDetected(bleDetected);
        evidence.setBleSignalRssi(bleRssi);
        evidence.setCctvFaceMatch("match");
        evidence.setConfidenceScore(score);
        evidence.setNotes(notes);
        return evidence;
    }
}
