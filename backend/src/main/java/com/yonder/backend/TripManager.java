
package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.Cost;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class TripManager {

    private final Trip trip;

    public TripManager() {
        trip = createSampleTrip();
    }

    private Trip createSampleTrip() {
        Trip trip = new Trip(
            1,
            "Japan Trip",
            LocalDate.of(2027, 4, 1),
            LocalDate.of(2027, 4, 10),
            "USD"
        );

        Activity templeVisit = new Activity(
            1,
            "Visit a Kyoto Temple",
            LocalDate.of(2027, 4, 3),
            LocalTime.of(10, 0),
            LocalTime.of(12, 0),
            new Cost(25.0, "USD"),
            "Visit a temple in Kyoto."
        );

        HousingBooking hotel = new HousingBooking(
            1,
            "Kyoto Hotel",
            LocalDate.of(2027, 4, 1),
            LocalTime.of(15, 0),
            LocalDate.of(2027, 4, 5),
            LocalTime.of(11, 0),
            new Cost(80.0, "USD"),
            "A sample hotel booking."
        );

        trip.addActivity(templeVisit);
        trip.addHousingBooking(hotel);

        return trip;
    }

    public Trip getTrip() {
        return trip;
    }
}
