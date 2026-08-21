package com.smartattend.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "correction_requests")
public class CorrectionRequest {
    
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
    private AttendanceStatus currentStatus;
    
    @Column(nullable = false)
    private String reason;
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    private String status = "pending"; // pending, approved, rejected
    
    @Column(columnDefinition = "TEXT")
    private String teacherNote;
    
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    
    private LocalDateTime submittedAt = LocalDateTime.now();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }

    public Lecture getLecture() { return lecture; }
    public void setLecture(Lecture lecture) { this.lecture = lecture; }

    public AttendanceStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(AttendanceStatus currentStatus) { this.currentStatus = currentStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTeacherNote() { return teacherNote; }
    public void setTeacherNote(String teacherNote) { this.teacherNote = teacherNote; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
