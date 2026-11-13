package com.yonder.backend.dto;

/**
 * Class name: LoginRequest
 * Date: 10/19/2026
 * Programmer: Christian Bartle
 * 
 * Description: Data transfer object(DTO) contains the email 
 * and password submitted in the front-end as JSON to the backend in order to log in.
 * To be specific, the front end sends a POST request to the backend with a JSON 
 * body containing the email and password, which is then mapped to this LoginRequest
 * object. It is used by Authcontroller and AuthService to handle user login.
 * 
 * Functions: 
 * They are pretty much self-explanatory. 
 *  - GetEmail returns the email, SetEmail sets the email, 
 *  - GetPassword returns the password, and SetPassword sets the password.
 * 
 * Data structures: 
 * - Two String fields: email and password.
 */

public class LoginRequest {
    private String email;
    private String password;

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

}
