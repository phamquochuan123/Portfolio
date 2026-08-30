package com.example.Portfolio.dto;

import java.time.LocalDateTime;

import com.example.Portfolio.entity.ContactMessage;

public record ContactResponse(

        Long id,
        String name,
        String email,
        String subject,
        String message,
        boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt) {
    public static ContactResponse from(ContactMessage e) {
        return new ContactResponse(
                e.getId(), e.getName(), e.getEmail(), e.getSubject(), e.getMessage(),
                e.isRead(), e.getReadAt(), e.getCreatedAt());
    }
}
