package com.yonder.backend.controllers;

import com.yonder.backend.dto.AuthResponse;
import com.yonder.backend.dto.LoginRequest;
import com.yonder.backend.dto.RegisterRequest;
import com.yonder.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Class name: AuthController
 * Date: 10/26/2026
 * Programmer: Christian Bartle
 *
 * Description: Provides REST API endpoints for user login/registration.
 * This "controller" handles HTTP requests and responses. Authentication operations are
 * not done here but in AuthService.java instead.
 *
 * Functions:
 * - loginUser(LoginRequest): Accepts a request containing an email and
 *   password; returns an HTTP response containing the authentication result.
 * - register(RegisterRequest): Accepts a request containing registration
 *   details; returns an HTTP response containing the registration result.
 *
 * Data structures: Uses LoginRequest, RegisterRequest, and AuthResponse objects(DTOs) to
 * encapsulate request and response data.
 * The controller uses these DTOs to transfer authentication data.
 *
 * Note: Rather than having a single model/route, User is divided on controller,
 * model, DTO, repository and services. I did this in order to not have a pages-long route/
 * model class, like in my previous Comp 380 project.
 * (Better coding practice, learned from the refactoring part of the 380 course)
 */


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") //needed or it wont accept the front end.

public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")//this endpoint will handle user login
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));

    }

    @PostMapping("/register")//this endpoint will handle user registration
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}