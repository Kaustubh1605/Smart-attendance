package com.smartattend.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;
    
    @Column(unique = true, nullable = false)
    private String studentId;
    
    @Column(nullable = false)
    private String program;
    
    @Column(nullable = false)
    private String batch;
    
    private String deviceName;
    
    @Column(unique = true)
    private String deviceId;
    
    private String deviceModel;
    
    private boolean isDeviceTrusted = false;
    
    private LocalDateTime deviceRegisteredAt;
    private LocalDateTime deviceLastVerifiedAt;
    private String deviceFingerprintHash;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getDeviceModel() { return deviceModel; }
    public void setDeviceModel(String deviceModel) { this.deviceModel = deviceModel; }

    public boolean isDeviceTrusted() { return isDeviceTrusted; }
    public void setDeviceTrusted(boolean deviceTrusted) { isDeviceTrusted = deviceTrusted; }

    public LocalDateTime getDeviceRegisteredAt() { return deviceRegisteredAt; }
    public void setDeviceRegisteredAt(LocalDateTime deviceRegisteredAt) { this.deviceRegisteredAt = deviceRegisteredAt; }

    public LocalDateTime getDeviceLastVerifiedAt() { return deviceLastVerifiedAt; }
    public void setDeviceLastVerifiedAt(LocalDateTime deviceLastVerifiedAt) { this.deviceLastVerifiedAt = deviceLastVerifiedAt; }

    public String getDeviceFingerprintHash() { return deviceFingerprintHash; }
    public void setDeviceFingerprintHash(String deviceFingerprintHash) { this.deviceFingerprintHash = deviceFingerprintHash; }
}
