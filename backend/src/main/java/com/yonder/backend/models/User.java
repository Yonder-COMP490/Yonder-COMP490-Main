package com.yonder.backend.models;

import java.time.LocalDateTime;

/**
 * Class name: User
 * Date: 10/21/2026
 * Programmer: Christian Bartle
 * Description: Represents a user account and corresponds to a row in the
 * database's users table. User objects are used by the UserRepository.java to map the
 * database User table to User objects and to save User objects to the datatabase User
 * table.
 *
 * Functions:
 * - User(): Creates an empty User object.
 * - User(long, String, String, LocalDateTime): Creates a User using the
 *   provided ID, email, password hash, and creation timestamp.
 * - "Getters" return each field's value; "setters" accept a value and update
 *   the corresponding field.
 *
 * Data structures: Stores the user ID as Long, email and password hash as
 * String, and creation timestamp as LocalDateTime. Should be pretty self-explanatory.
 * 
 * This class is used to create simple objects to act as data containers for user account 
 * information.
 */

public class User {
    private Long userId;
    private String email;
    private String passwordHash;
    private LocalDateTime createdAt;

    public User() {//Needed for the UserRepository to create a new user object when retrieving from the database, as it uses the default constructor to create an empty object and then sets the fields using the setters.
    }

    public User(long userId, String email, String passwordHash, LocalDateTime createdAt) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
