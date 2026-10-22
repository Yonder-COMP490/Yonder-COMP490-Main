package com.yonder.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yonder.backend.dto.AuthResponse;
import com.yonder.backend.dto.LoginRequest;
import com.yonder.backend.dto.RegisterRequest;
import com.yonder.backend.models.User;
import com.yonder.backend.repositories.UserRepository;


@Service 
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder encryptPassword;

    public AuthService(UserRepository userRepository, PasswordEncoder encryptPassword) {
        this.userRepository = userRepository;
        this.encryptPassword = encryptPassword;
    }

    public AuthResponse register(RegisterRequest request){
        if(request.getEmail() == null || request.getEmail().isBlank()){
            throw new IllegalArgumentException("Email is requiered");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new IllegalArgumentException("Email already in use.");
        }

        //if the email isnt empty nor its on use, then the user gets created. Perhaps later we add a add a verification code to be sent to the email in question to complete registration.

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(encryptPassword.encode(request.getPassword()));
        user = userRepository.save(user);

        return new AuthResponse("User Successfully registered", user.getUserId(), user.getCreatedAt());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new IllegalArgumentException("Invalid password and/or username"));

        if(!encryptPassword.matches(request.getPassword(), user.getPasswordHash())){
            throw new IllegalArgumentException("Invalid password and/or username");
        }
        return new AuthResponse("Login successfull", user.getUserId(), user.getCreatedAt());

    }
}