
package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
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
        Trip newTrip = new Trip(
            1,
            "Japan Trip",
            LocalDate.of(2027, 4, 1),
            LocalDate.of(2027, 4, 10),
            "USD"
        );

        newTrip.addActivity(new Activity(
            1,
            "Visit a Kyoto Temple",
            LocalDate.of(2027, 4, 3),
            LocalTime.of(10, 0),
            LocalTime.of(12, 0),
            new Cost(25.0, "USD"),
            "Visit a temple in Kyoto."
        ));

        newTrip.addHousingBooking(new HousingBooking(
            1,
            "Kyoto Hotel",
            LocalDate.of(2027, 4, 1),
            LocalTime.of(15, 0),
            LocalDate.of(2027, 4, 5),
            LocalTime.of(11, 0),
            new Cost(80.0, "USD"),
            "A sample hotel booking."
        ));

        return newTrip;
    }

    public Trip getTrip() {
        return trip;
    }

    // ---------- Activities ----------

    public Activity addActivity(Activity activity) {
        activity.setId(nextActivityId());
        trip.addActivity(activity);
        return activity;
    }

    public Activity updateActivity(int id, Activity updated) {
        for (int i = 0; i < trip.getActivities().size(); i++) {
            if (trip.getActivities().get(i).getId() == id) {
                updated.setId(id);
                trip.getActivities().set(i, updated);
                return updated;
            }
        }

        return null;
    }

    public boolean removeActivity(int id) {
        int previousSize = trip.getActivities().size();
        trip.removeActivity(id);
        return trip.getActivities().size() < previousSize;
    }

    private int nextActivityId() {
        return trip.getActivities().stream()
            .mapToInt(Activity::getId)
            .max()
            .orElse(0) + 1;
    }

    // ---------- Housing bookings ----------

    public HousingBooking addHousingBooking(HousingBooking housing) {
        housing.setId(nextHousingId());
        trip.addHousingBooking(housing);
        return housing;
    }

    public HousingBooking updateHousingBooking(
        int id,
        HousingBooking updated
    ) {
        for (int i = 0; i < trip.getHousingBookings().size(); i++) {
            if (trip.getHousingBookings().get(i).getId() == id) {
                updated.setId(id);
                trip.getHousingBookings().set(i, updated);
                return updated;
            }
        }

        return null;
    }

    public boolean removeHousingBooking(int id) {
        int previousSize = trip.getHousingBookings().size();
        trip.removeHousingBooking(id);
        return trip.getHousingBookings().size() < previousSize;
    }

    private int nextHousingId() {
        return trip.getHousingBookings().stream()
            .mapToInt(HousingBooking::getId)
            .max()
            .orElse(0) + 1;
    }

    // ---------- Budget items ----------

    public BudgetItem addBudgetItem(BudgetItem item) {
        item.setId(nextBudgetItemId());
        trip.addBudgetItem(item);
        return item;
    }

    public BudgetItem updateBudgetItem(int id, BudgetItem updated) {
        for (int i = 0; i < trip.getBudgetItems().size(); i++) {
            if (trip.getBudgetItems().get(i).getId() == id) {
                updated.setId(id);
                trip.getBudgetItems().set(i, updated);
                return updated;
            }
        }

        return null;
    }

    public boolean removeBudgetItem(int id) {
        int previousSize = trip.getBudgetItems().size();
        trip.removeBudgetItem(id);
        return trip.getBudgetItems().size() < previousSize;
    }

    private int nextBudgetItemId() {
        return trip.getBudgetItems().stream()
            .mapToInt(BudgetItem::getId)
            .max()
            .orElse(0) + 1;
    }
}
