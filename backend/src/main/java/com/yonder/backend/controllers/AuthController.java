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