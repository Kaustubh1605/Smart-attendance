package com.smartattend.backend.models;

public class VerificationEvidence {
    private String timestamp;
    private String locationStatus;
    private double locationDistanceMeters;
    private String deviceStatus;
    private boolean dynamicChallengeVerified;
    private long challengeLatencyMs;
    private boolean bleDetected;
    private int bleSignalRssi;
    private String cctvFaceMatch;
    private int confidenceScore;
    private String notes;

    // Getters and Setters
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getLocationStatus() { return locationStatus; }
    public void setLocationStatus(String locationStatus) { this.locationStatus = locationStatus; }

    public double getLocationDistanceMeters() { return locationDistanceMeters; }
    public void setLocationDistanceMeters(double locationDistanceMeters) { this.locationDistanceMeters = locationDistanceMeters; }

    public String getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(String deviceStatus) { this.deviceStatus = deviceStatus; }

    public boolean isDynamicChallengeVerified() { return dynamicChallengeVerified; }
    public void setDynamicChallengeVerified(boolean dynamicChallengeVerified) { this.dynamicChallengeVerified = dynamicChallengeVerified; }

    public long getChallengeLatencyMs() { return challengeLatencyMs; }
    public void setChallengeLatencyMs(long challengeLatencyMs) { this.challengeLatencyMs = challengeLatencyMs; }

    public boolean isBleDetected() { return bleDetected; }
    public void setBleDetected(boolean bleDetected) { this.bleDetected = bleDetected; }

    public int getBleSignalRssi() { return bleSignalRssi; }
    public void setBleSignalRssi(int bleSignalRssi) { this.bleSignalRssi = bleSignalRssi; }

    public String getCctvFaceMatch() { return cctvFaceMatch; }
    public void setCctvFaceMatch(String cctvFaceMatch) { this.cctvFaceMatch = cctvFaceMatch; }

    public int getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(int confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
