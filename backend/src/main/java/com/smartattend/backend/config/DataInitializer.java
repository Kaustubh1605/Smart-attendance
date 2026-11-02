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
            if (userRepository.findByEmail("admin.ops@springfield.edu").isEmpty()) {
                User admin = new User();
                admin.setName("Institutional Administrator");
                admin.setEmail("admin.ops@springfield.edu");
                admin.setPasswordHash(passwordEncoder.encode("AdminMasterSecure#2024"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("[DataInitializer] Seeded default Admin: admin.ops@springfield.edu");
            }

            // Seed Teacher
            if (userRepository.findByEmail("prof.sharma@springfield.edu").isEmpty()) {
                User teacher = new User();
                teacher.setName("Prof. Rajesh Sharma");
                teacher.setEmail("prof.sharma@springfield.edu");
                teacher.setPasswordHash(passwordEncoder.encode("FacultyPass2024!"));
                teacher.setRole(User.Role.TEACHER);
                userRepository.save(teacher);
                System.out.println("[DataInitializer] Seeded default Teacher: prof.sharma@springfield.edu");
            }

            // Seed Student
            if (userRepository.findByEmail("aarav.sharma@springfield.edu").isEmpty()) {
                User student = new User();
                student.setName("Aarav Sharma");
                student.setEmail("aarav.sharma@springfield.edu");
                student.setPasswordHash(passwordEncoder.encode("StudentKey2024#"));
                student.setRole(User.Role.STUDENT);
                userRepository.save(student);
                System.out.println("[DataInitializer] Seeded default Student: aarav.sharma@springfield.edu");
            }
        };
    }
}
