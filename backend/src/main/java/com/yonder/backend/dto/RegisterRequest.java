package com.yonder.backend.dto;

/**
 * Class name: RegisterRequest
 * Date: 10/19/2026
 * Programmer: Christian Bartle
 *
 * Description: Data transfer object (DTO) containing the email and password
 * submitted by the frontend as JSON to register an account. The front end sends a
 * POST request to the backend with a JSON body containing the email and password,
 * which is then mapped to this RegisterRequest object. It is used by AuthController
 * and AuthService to handle user registration.
 *
 * Important functions:
 * - getEmail() and getPassword() return the stored values.
 * - setEmail(String) and setPassword(String) accept and store those values.
 *
 * Data structures:
 * - Two String fields: email and password.
 *
*/

public class RegisterRequest {
    private String email;
    private String password;
    //Categories values
    private int museums;
    private int restaurants;
    private int beaches;
    private int parks;
    private int malls; 

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
        
    //Categories valus below:
    public int getCatMuseum() {
        return museums;
    }

    public void setCatMuseum(int museums) {
        this.museums = museums;
    }

    public int getCatRestaurants() {
        return restaurants;
    }

    public void setCatRestaurants(int restaurants) {
        this.restaurants = restaurants;
    }

    public int getCatBeaches() {
        return beaches;
    }

    public void setCatBeaches(int beaches) {
        this.beaches = beaches;
    }

    public int getCatParks() {
        return parks;
    }

    public void setCatParks(int parks) {
        this.parks = parks;
    }

    public int getCatMalls() {
        return malls;
    }

    public void setCatMalls(int malls) {
        this.malls = malls;
    }
}