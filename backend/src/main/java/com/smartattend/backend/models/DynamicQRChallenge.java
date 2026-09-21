package com.smartattend.backend.models;

public class DynamicQRChallenge {
    private String challengeId;
    private String token;
    private String sessionId;
    private String lectureCode;
    private long createdAt;
    private long expiresAt;
    private int rotationIntervalSeconds;
    private String signature;

    // Getters and Setters
    public String getChallengeId() { return challengeId; }
    public void setChallengeId(String challengeId) { this.challengeId = challengeId; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getLectureCode() { return lectureCode; }
    public void setLectureCode(String lectureCode) { this.lectureCode = lectureCode; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }

    public int getRotationIntervalSeconds() { return rotationIntervalSeconds; }
    public void setRotationIntervalSeconds(int rotationIntervalSeconds) { this.rotationIntervalSeconds = rotationIntervalSeconds; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
}
