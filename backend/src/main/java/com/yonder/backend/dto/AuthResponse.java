package com.yonder.backend.dto;

public class AuthResponse {
    private String message;
    private Long userId;

    public AuthResponse(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }
}
