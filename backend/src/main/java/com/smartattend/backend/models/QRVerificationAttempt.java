package com.smartattend.backend.models;

public class QRVerificationAttempt {
    private String studentId;
    private String studentName;
    private String deviceId;
    private String sessionId;
    private String lectureCode;
    private DynamicQRChallenge challenge;
    private long attemptStartTime;
    private Long completionTime;
    private String locationStatus;
    private Double distanceMeters;
    private Boolean bleDetected;
    private Integer bleRssi;

    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getLectureCode() { return lectureCode; }
    public void setLectureCode(String lectureCode) { this.lectureCode = lectureCode; }

    public DynamicQRChallenge getChallenge() { return challenge; }
    public void setChallenge(DynamicQRChallenge challenge) { this.challenge = challenge; }

    public long getAttemptStartTime() { return attemptStartTime; }
    public void setAttemptStartTime(long attemptStartTime) { this.attemptStartTime = attemptStartTime; }

    public Long getCompletionTime() { return completionTime; }
    public void setCompletionTime(Long completionTime) { this.completionTime = completionTime; }

    public String getLocationStatus() { return locationStatus; }
    public void setLocationStatus(String locationStatus) { this.locationStatus = locationStatus; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Boolean getBleDetected() { return bleDetected; }
    public void setBleDetected(Boolean bleDetected) { this.bleDetected = bleDetected; }

    public Integer getBleRssi() { return bleRssi; }
    public void setBleRssi(Integer bleRssi) { this.bleRssi = bleRssi; }
}
