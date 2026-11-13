
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

    // Original sample trip, retained for backward compatibility.
    private final Trip trip;

    // All trips stored in memory, indexed by trip ID.
    private final Map<Integer, Trip> trips = new LinkedHashMap<>();

    public TripManager() {
        trip = createSampleTrip();
        trips.put(trip.getId(), trip);
    }

    // ---------- Sample trip ----------

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
     * Original single-trip endpoint support.
     */
    public Trip getTrip() {
        return trip;
    }

    // ---------- Multiple-trip management ----------

    /**
     * Returns all trips currently stored in memory.
     */
    public synchronized List<Trip> getTrips() {
        return new ArrayList<>(trips.values());
    }

    /**
     * Returns a trip by ID, or null if it does not exist.
     */
    public synchronized Trip getTripById(int id) {
        return trips.get(id);
    }

    /**
     * Creates a trip and automatically assigns a unique ID.
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

    // ---------- Original activities (backward compatibility) ----------

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

    // ---------- Original housing (backward compatibility) ----------

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

    // ---------- Original budget (backward compatibility) ----------

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

    // ---------- Trip-specific activities ----------

    /**
     * Adds an activity to a specific trip.
     */
    public synchronized Activity addActivity(
        int tripId,
        Activity activity
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getActivities().stream()
            .mapToInt(Activity::getId)
            .max()
            .orElse(0) + 1;

        activity.setId(nextId);
        selectedTrip.addActivity(activity);

        return activity;
    }

    /**
     * Updates an activity belonging to a specific trip.
     */
    public synchronized Activity updateActivity(
        int tripId,
        int activityId,
        Activity updated
    ) {
        Trip selectedTrip = requireTrip(tripId);

        for (int i = 0; i < selectedTrip.getActivities().size(); i++) {
            Activity existing =
                selectedTrip.getActivities().get(i);

            if (existing.getId() == activityId) {
                updated.setId(activityId);
                updated.attachToTrip(selectedTrip.getStartDate());

                selectedTrip.getActivities().set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Deletes an activity from a specific trip.
     */
    public synchronized boolean removeActivity(
        int tripId,
        int activityId
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int previousSize =
            selectedTrip.getActivities().size();

        selectedTrip.removeActivity(activityId);

        return selectedTrip.getActivities().size()
            < previousSize;
    }

    // ---------- Trip-specific housing ----------

    /**
     * Adds a housing booking to a specific trip.
     */
    public synchronized HousingBooking addHousingBooking(
        int tripId,
        HousingBooking housing
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getHousingBookings().stream()
            .mapToInt(HousingBooking::getId)
            .max()
            .orElse(0) + 1;

        housing.setId(nextId);
        selectedTrip.addHousingBooking(housing);

        return housing;
    }

    /**
     * Updates a housing booking belonging to a specific trip.
     */
    public synchronized HousingBooking updateHousingBooking(
        int tripId,
        int housingId,
        HousingBooking updated
    ) {
        Trip selectedTrip = requireTrip(tripId);

        for (int i = 0; i < selectedTrip.getHousingBookings().size(); i++) {
            HousingBooking existing =
                selectedTrip.getHousingBookings().get(i);

            if (existing.getId() == housingId) {
                updated.setId(housingId);
                updated.attachToTrip(selectedTrip.getStartDate());

                selectedTrip.getHousingBookings().set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Deletes a housing booking from a specific trip.
     */
    public synchronized boolean removeHousingBooking(
        int tripId,
        int housingId
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int previousSize =
            selectedTrip.getHousingBookings().size();

        selectedTrip.removeHousingBooking(housingId);

        return selectedTrip.getHousingBookings().size()
            < previousSize;
    }

    // ---------- Trip-specific budget items ----------

    /**
     * Adds a budget item to the selected trip.
     */
    public synchronized BudgetItem addBudgetItem(
        int tripId,
        BudgetItem item
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getBudgetItems().stream()
            .mapToInt(BudgetItem::getId)
            .max()
            .orElse(0) + 1;

        item.setId(nextId);
        selectedTrip.addBudgetItem(item);

        return item;
    }

    /**
     * Updates a budget item belonging to the selected trip.
     */
    public synchronized BudgetItem updateBudgetItem(
        int tripId,
        int itemId,
        BudgetItem updated
    ) {
        Trip selectedTrip = requireTrip(tripId);

        for (int i = 0; i < selectedTrip.getBudgetItems().size(); i++) {
            BudgetItem existing =
                selectedTrip.getBudgetItems().get(i);

            if (existing.getId() == itemId) {
                updated.setId(itemId);

                selectedTrip.getBudgetItems().set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Deletes a budget item from the selected trip.
     */
    public synchronized boolean removeBudgetItem(
        int tripId,
        int itemId
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int previousSize =
            selectedTrip.getBudgetItems().size();

        selectedTrip.removeBudgetItem(itemId);

        return selectedTrip.getBudgetItems().size()
            < previousSize;
    }

    // ---------- Shared trip lookup ----------

    /**
     * Returns the requested trip or throws an exception
     * if the trip does not exist.
     */
    private Trip requireTrip(int tripId) {
        Trip selectedTrip = trips.get(tripId);

        if (selectedTrip == null) {
            throw new IllegalArgumentException(
                "Trip not found: " + tripId
            );
        }

        return selectedTrip;
    }
}
