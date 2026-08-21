package com.smartattend.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lectures")
public class Lecture {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String className;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private String startTime;
    
    @Column(nullable = false)
    private String endTime;
    
    private String duration;
    
    private String status = "upcoming";
    
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private TeacherProfile teacher;
    
    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;
    
    @Column(unique = true)
    private String activeSessionId;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public TeacherProfile getTeacher() { return teacher; }
    public void setTeacher(TeacherProfile teacher) { this.teacher = teacher; }

    public Classroom getClassroom() { return classroom; }
    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public String getActiveSessionId() { return activeSessionId; }
    public void setActiveSessionId(String activeSessionId) { this.activeSessionId = activeSessionId; }
}
