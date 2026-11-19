package com.yonder.backend.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Class name: HealthController
 * Date: 11/18/2026
 * Programmer: Alejandro Rivera
 * Based on Andrew Garcia's health check from the old yonder-backend project.
 *
 * Description: A quick way to check that the backend is running.
 * GET /api/health sends back a small JSON message.
 *
 * Functions:
 * - health(): No input; returns {"status":"ok","service":"yonder-backend"}
 *   as JSON. Only GET is allowed (other methods get 405).
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HealthController {

    // runs when someone goes to /api/health
    @GetMapping("/api/health")
    public Map<String, String> health() {
        // same message the old health check sent
        return Map.of("status", "ok", "service", "yonder-backend");
    }
}
