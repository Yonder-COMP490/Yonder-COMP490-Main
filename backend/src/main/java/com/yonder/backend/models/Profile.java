package com.yonder.backend.models;

/**
 * Class name: Profile
 * Date: 11/12/2026
 * Programmer: Christian Bartle
 * Description: Represents a user's profile and corresponds to a row in the
 * database's profiles table. The user ID is the profile's primary key and
 * references the associated user. 
 *
 * Functions:
 * - Profile(): Creates an empty Profile object.
 * - Profile(Long, String, String, String, String): Creates a Profile with
 *   the provided user ID, first name, last name, bio, and avatar URL. Currently 
 *   gets created with most fields as null as there is no profile update yet.
 * - "Getters" return each field's value; "setters" update the corresponding field.
 *
 * Data structures: 
 * - Stores the user ID as Long and the profile details as String values. 
 *   This class creates objects that act as a data container for profile 
 *   information, since the java backend cant work with database rows directly.
 */
public class Profile {

    private Long userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String avatarUrl;

    public Profile() {
    }

    public Profile(Long userId, String firstName, String lastName, String bio, String avatarUrl) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
