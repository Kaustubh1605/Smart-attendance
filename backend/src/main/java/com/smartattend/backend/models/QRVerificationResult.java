package com.smartattend.backend.models;

public class QRVerificationResult {
    private boolean success;
    private String status;
    private String attendanceStatus;
    private int confidenceScore;
    private String challengeStatus;
    private String rejectionReason;
    private boolean isGraceProcessed;
    private VerificationEvidence evidence;

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public int getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(int confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getChallengeStatus() { return challengeStatus; }
    public void setChallengeStatus(String challengeStatus) { this.challengeStatus = challengeStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public boolean isGraceProcessed() { return isGraceProcessed; }
    public void setGraceProcessed(boolean graceProcessed) { isGraceProcessed = graceProcessed; }

    public VerificationEvidence getEvidence() { return evidence; }
    public void setEvidence(VerificationEvidence evidence) { this.evidence = evidence; }
}
