package com.yonder.backend.dto;

import java.time.LocalDateTime;

/**
 * Class name: AuthResponse
 * Date: 10/21/2026
 * Programmer: Christian Bartle
 *
 * Description: Data transfer object (DTO) containing the result information
 * returned by the backend after a successful login or registration. Once the 
 * Authservice.java has processed the login or registration request, it creates an 
 * AuthResponse object with a message, the user's ID, and the account creation 
 * timestamp(for testing). This object is converted to a JSON response prior to 
 * sending it to the front end.
 *
 * Important functions:
 * - AuthResponse(String, Long, LocalDateTime) creates a response containing
 *   a message, the user's ID, and the account creation timestamp.
 * - getMessage(), getUserId(), and getCreatedAt() return those values.
 *
 * Data structures: 
 *  - String message, Long userId, and LocalDateTime createdAt.
 * 
 * 
 * Note, this folder(DTO) which this file is under is simply used to store java 
 * classes that create objects that convert JSON data to objects for the 
 * java backend (Requests), and then convert objects to JSON data to send back to 
 * the front end(Responses). hence, the name, DTO for Data Transfer Object. 
 * It is NOT used to store data in the database, that is what the models folder is for.
 */

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
