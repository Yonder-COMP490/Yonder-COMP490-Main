package com.yonder.backend;

import com.yonder.backend.models.UserInfo;
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
    private UserInfo latestUserInfo;

    @PostMapping
    public UserInfo receiveUserInfo(@RequestBody UserInfo userInfo) {
        latestUserInfo = userInfo;

        System.out.println("Received username: " + userInfo.getUsername());
        System.out.println("Received email: " + userInfo.getEmail());

        return userInfo;
    }

    @GetMapping
    public UserInfo getUserInfo() {
        return latestUserInfo;
    }
}