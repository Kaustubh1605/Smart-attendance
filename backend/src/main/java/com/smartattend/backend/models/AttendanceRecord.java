package com.smartattend.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;
    
    @ManyToOne
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;
    
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private String locationStatus;
    private Double locationDistance;
    private String deviceStatus;
    private Boolean challengeVerified;
    private Integer challengeLatencyMs;
    private Boolean bleDetected;
    private Integer bleSignalRssi;
    private String cctvFaceMatch;
    private Double confidenceScore;
    
    @Column(columnDefinition = "TEXT")
    private String evidenceNotes;
    
    private boolean hasCorrectionReq = false;
    private String correctionStatus;
    
    @Column(columnDefinition = "TEXT")
    private String teacherNote;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }

    public Lecture getLecture() { return lecture; }
    public void setLecture(Lecture lecture) { this.lecture = lecture; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getLocationStatus() { return locationStatus; }
    public void setLocationStatus(String locationStatus) { this.locationStatus = locationStatus; }

    public Double getLocationDistance() { return locationDistance; }
    public void setLocationDistance(Double locationDistance) { this.locationDistance = locationDistance; }

    public String getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(String deviceStatus) { this.deviceStatus = deviceStatus; }

    public Boolean getChallengeVerified() { return challengeVerified; }
    public void setChallengeVerified(Boolean challengeVerified) { this.challengeVerified = challengeVerified; }

    public Integer getChallengeLatencyMs() { return challengeLatencyMs; }
    public void setChallengeLatencyMs(Integer challengeLatencyMs) { this.challengeLatencyMs = challengeLatencyMs; }

    public Boolean getBleDetected() { return bleDetected; }
    public void setBleDetected(Boolean bleDetected) { this.bleDetected = bleDetected; }

    public Integer getBleSignalRssi() { return bleSignalRssi; }
    public void setBleSignalRssi(Integer bleSignalRssi) { this.bleSignalRssi = bleSignalRssi; }

    public String getCctvFaceMatch() { return cctvFaceMatch; }
    public void setCctvFaceMatch(String cctvFaceMatch) { this.cctvFaceMatch = cctvFaceMatch; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getEvidenceNotes() { return evidenceNotes; }
    public void setEvidenceNotes(String evidenceNotes) { this.evidenceNotes = evidenceNotes; }

    public boolean isHasCorrectionReq() { return hasCorrectionReq; }
    public void setHasCorrectionReq(boolean hasCorrectionReq) { this.hasCorrectionReq = hasCorrectionReq; }

    public String getCorrectionStatus() { return correctionStatus; }
    public void setCorrectionStatus(String correctionStatus) { this.correctionStatus = correctionStatus; }

    public String getTeacherNote() { return teacherNote; }
    public void setTeacherNote(String teacherNote) { this.teacherNote = teacherNote; }
}
