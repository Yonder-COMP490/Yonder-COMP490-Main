package com.yonder.backend.dto;

import java.time.LocalDateTime;

public class AuthResponse {
    private String message;
    private Long userId;
    private LocalDateTime createdAt;

    public AuthResponse(String message, Long userId, LocalDateTime createdAt) {
        this.message = message;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
