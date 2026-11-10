
package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.Cost;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class TripManager {

    // Original sample trip, retained for existing API compatibility.
    private final Trip trip;

    // Stores all trips in memory, indexed by their unique IDs.
    private final Map<Integer, Trip> trips = new LinkedHashMap<>();

    public TripManager() {
        trip = createSampleTrip();
        trips.put(trip.getId(), trip);
    }

    /**
     * Creates the sample trip used by the existing application.
     *
     * @return the sample Japan trip
     */
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

    /**
     * Returns the original sample trip.
     * Retained for compatibility with /api/trip.
     *
     * @return the original trip
     */
    public Trip getTrip() {
        return trip;
    }

    // ---------- Multiple-trip management ----------

    /**
     * Returns all trips stored in memory.
     *
     * @return a list of trips
     */
    public synchronized List<Trip> getTrips() {
        return new ArrayList<>(trips.values());
    }

    /**
     * Retrieves a trip by its ID.
     *
     * @param id the trip ID
     * @return the matching trip, or null if not found
     */
    public synchronized Trip getTripById(int id) {
        return trips.get(id);
    }

    /**
     * Creates a new trip and assigns a unique ID.
     *
     * @param requested the requested trip information
     * @return the newly created trip
     * @throws IllegalArgumentException if trip details are invalid
     */
    public synchronized Trip createTrip(Trip requested) {
        if (requested == null ||
            requested.getName() == null ||
            requested.getName().isBlank()) {
            throw new IllegalArgumentException(
                "Trip name is required."
            );
        }

        if (requested.getStartDate() == null ||
            requested.getEndDate() == null) {
            throw new IllegalArgumentException(
                "Trip start and end dates are required."
            );
        }

        if (requested.getEndDate().isBefore(
                requested.getStartDate())) {
            throw new IllegalArgumentException(
                "End date cannot be before start date."
            );
        }

        int nextId = trips.keySet()
            .stream()
            .mapToInt(Integer::intValue)
            .max()
            .orElse(0) + 1;

        Trip newTrip = new Trip(
            nextId,
            requested.getName().trim(),
            requested.getStartDate(),
            requested.getEndDate(),
            requested.getPreferredCurrency()
        );

        trips.put(newTrip.getId(), newTrip);

        return newTrip;
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
                updated.attachToTrip(trip.getStartDate());
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
                updated.attachToTrip(trip.getStartDate());
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
