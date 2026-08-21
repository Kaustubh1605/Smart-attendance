package com.smartattend.backend.services;

import com.smartattend.backend.models.Classroom;
import com.smartattend.backend.repositories.ClassroomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassroomService {
    
    private final ClassroomRepository classroomRepository;

    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    public Classroom getClassroomById(String id) {
        return classroomRepository.findById(id).orElseThrow();
    }

    public Classroom createClassroom(Classroom classroom) {
        return classroomRepository.save(classroom);
    }
}
