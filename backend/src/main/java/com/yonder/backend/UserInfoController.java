package com.yonder.backend;

import com.yonder.backend.models.User;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/userinfo")
@CrossOrigin(origins = "http://localhost:5173")
public class UserInfoController {
    private User latestUser;

    @PostMapping
    public User receiveUserInfo(@RequestBody User user) {
        latestUser = user;

        System.out.println("Received Email: " + user.getEmail());

        return user;
    }

    @GetMapping
    public User getUserInfo() {
        return latestUser;
    }
}