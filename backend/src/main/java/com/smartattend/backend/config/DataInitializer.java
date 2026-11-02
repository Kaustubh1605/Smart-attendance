package com.smartattend.backend.config;

import com.smartattend.backend.models.User;
import com.smartattend.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin
            userRepository.findByEmail("admin.ops@springfield.edu").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(passwordEncoder.encode("AdminMasterSecure#2024"));
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User();
                    admin.setName("Institutional Administrator");
                    admin.setEmail("admin.ops@springfield.edu");
                    admin.setPasswordHash(passwordEncoder.encode("AdminMasterSecure#2024"));
                    admin.setRole(User.Role.ADMIN);
                    userRepository.save(admin);
                    System.out.println("[DataInitializer] Seeded Admin: admin.ops@springfield.edu");
                }
            );

            // Seed Teacher
            userRepository.findByEmail("prof.sharma@springfield.edu").ifPresentOrElse(
                teacher -> {
                    teacher.setPasswordHash(passwordEncoder.encode("FacultyPass2024!"));
                    userRepository.save(teacher);
                },
                () -> {
                    User teacher = new User();
                    teacher.setName("Prof. Rajesh Sharma");
                    teacher.setEmail("prof.sharma@springfield.edu");
                    teacher.setPasswordHash(passwordEncoder.encode("FacultyPass2024!"));
                    teacher.setRole(User.Role.TEACHER);
                    userRepository.save(teacher);
                    System.out.println("[DataInitializer] Seeded Teacher: prof.sharma@springfield.edu");
                }
            );

            // Seed Student (sync password with StudentLogin quick-fill "StudentKey2024#")
            userRepository.findByEmail("aarav.sharma@springfield.edu").ifPresentOrElse(
                student -> {
                    student.setPasswordHash(passwordEncoder.encode("StudentKey2024#"));
                    userRepository.save(student);
                    System.out.println("[DataInitializer] Synced Student password for: aarav.sharma@springfield.edu");
                },
                () -> {
                    User student = new User();
                    student.setName("Aarav Sharma");
                    student.setEmail("aarav.sharma@springfield.edu");
                    student.setPasswordHash(passwordEncoder.encode("StudentKey2024#"));
                    student.setRole(User.Role.STUDENT);
                    userRepository.save(student);
                    System.out.println("[DataInitializer] Seeded Student: aarav.sharma@springfield.edu");
                }
            );
        };
    }
}
