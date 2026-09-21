package com.smartattend.backend.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAbsenceNotification(String studentEmail, String studentName, String lectureCode, String date) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@smartattend.edu");
            message.setTo(studentEmail);
            message.setSubject("Absence Notice: " + lectureCode);
            message.setText("Dear " + studentName + ",\n\n" +
                    "You have been marked absent for " + lectureCode + " on " + date + ".\n" +
                    "If you believe this is an error, please submit a Correction Request through the Student Portal.\n\n" +
                    "Regards,\nSmartAttend System");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + studentEmail + ": " + e.getMessage());
        }
    }
}
