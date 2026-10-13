
package com.yonder.backend;

import com.yonder.backend.models.Trip;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final TripManager tripManager;

    public TripController(TripManager tripManager) {
        this.tripManager = tripManager;
    }

    @GetMapping("/api/trip")
    public Trip getTrip() {
        return tripManager.getTrip();
    }
}
