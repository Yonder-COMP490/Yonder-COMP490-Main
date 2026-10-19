package com.yonder.backend.controllers;

@RestController
@RequestMapping("/api/auth") 

public class AuthController {
    private final Authservice authService;

    public AuthControler(AuthService authService) {
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