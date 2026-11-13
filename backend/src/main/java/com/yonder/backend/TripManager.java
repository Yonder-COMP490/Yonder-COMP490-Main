
package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.Cost;
import com.yonder.backend.models.Description;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Location;
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

    // All trips stored in memory, indexed by their unique IDs.
    private final Map<Integer, Trip> trips = new LinkedHashMap<>();

    public TripManager() {
        trip = createSampleTrip();
        trips.put(trip.getId(), trip);
    }

    // ============================================================
    // SAMPLE TRIP
    // ============================================================

    /**
     * Creates the original Japan sample trip using the updated
     * Description, Location, and Trip models.
     *
     * @return the sample trip
     */
    private Trip createSampleTrip() {
        Trip newTrip = new Trip(
            1,
            "Japan Trip",
            LocalDate.of(2027, 4, 1),
            10,
            "USD"
        );

        newTrip.addActivity(new Activity(
            1,
            new Description(
                "Visit a Kyoto Temple",
                "Visit a temple in Kyoto.",
                "",
                null
            ),
            LocalDate.of(2027, 4, 3),
            LocalTime.of(10, 0),
            LocalTime.of(12, 0),
            new Cost(25.0, "USD"),
            new Location(
                "Kyoto, Japan",
                35.0116,
                135.7681
            )
        ));

        newTrip.addHousingBooking(new HousingBooking(
            1,
            new Description(
                "Kyoto Hotel",
                "A sample hotel booking.",
                "",
                null
            ),
            LocalDate.of(2027, 4, 1),
            LocalTime.of(15, 0),
            LocalDate.of(2027, 4, 5),
            LocalTime.of(11, 0),
            new Cost(80.0, "USD"),
            new Location(
                "Kyoto, Japan",
                35.0116,
                135.7681
            )
        ));

        return newTrip;
    }

    // ============================================================
    // LEGACY TRIP MANAGEMENT
    // ============================================================

    /**
     * Returns the original sample trip.
     *
     * @return the sample trip
     */
    public Trip getTrip() {
        return trip;
    }

    /**
     * Updates the original sample trip while preserving
     * its assigned activities, housing, and budget items.
     *
     * @param updated updated trip details
     * @return the updated sample trip
     */
    public synchronized Trip updateTrip(Trip updated) {
        trip.setName(updated.getName());
        trip.setStartDate(updated.getStartDate());
        trip.setPreferredCurrency(updated.getPreferredCurrency());

        trip.setDaysAndTripSections(
            updated.getDays(),
            updated.getTripSections()
        );

        return trip;
    }

    // ============================================================
    // MULTI-TRIP MANAGEMENT
    // ============================================================

    /**
     * Returns all trips currently stored in memory.
     *
     * @return list of trips
     */
    public synchronized List<Trip> getTrips() {
        return new ArrayList<>(trips.values());
    }

    /**
     * Retrieves a trip by its unique identifier.
     *
     * @param id trip ID
     * @return matching trip or null
     */
    public synchronized Trip getTripById(int id) {
        return trips.get(id);
    }

    /**
     * Creates a new trip and assigns its unique identifier.
     *
     * The updated Trip model uses a duration in days
     * rather than storing an end date.
     *
     * @param requested requested trip information
     * @return newly created trip
     */
    public synchronized Trip createTrip(Trip requested) {
        if (requested == null ||
            requested.getName() == null ||
            requested.getName().isBlank()) {

            throw new IllegalArgumentException(
                "Trip name is required."
            );
        }

        if (requested.getStartDate() == null) {
            throw new IllegalArgumentException(
                "Trip start date is required."
            );
        }

        if (requested.getDays() < 1) {
            throw new IllegalArgumentException(
                "Trip duration must be at least one day."
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
            requested.getDays(),
            requested.getPreferredCurrency()
        );

        trips.put(newTrip.getId(), newTrip);

        return newTrip;
    }

    // ============================================================
    // LEGACY ACTIVITY METHODS
    // ============================================================

    /**
     * Adds an activity to the original sample trip.
     */
    public Activity addActivity(Activity activity) {
        activity.setId(nextActivityId());
        trip.addActivity(activity);
        return activity;
    }

    /**
     * Updates an activity in the original sample trip.
     */
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

    /**
     * Removes an activity from the original sample trip.
     */
    public boolean removeActivity(int id) {
        int previousSize = trip.getActivities().size();

        trip.removeActivity(id);

        return trip.getActivities().size() < previousSize;
    }

    private int nextActivityId() {
        return trip.getActivities()
            .stream()
            .mapToInt(Activity::getId)
            .max()
            .orElse(0) + 1;
    }

    /**
     * Changes the scheduling mode of an activity in
     * the original sample trip.
     *
     * Preserves the scheduling feature added on main.
     */
    public Activity switchActivityScheduleType(
        int id,
        boolean useFixedDate
    ) {
        for (Activity activity : trip.getActivities()) {
            if (activity.getId() == id) {
                activity.switchScheduleType(
                    useFixedDate,
                    trip.getStartDate()
                );

                activity.attachToTrip(trip.getStartDate());

                return activity;
            }
        }

        return null;
    }

    // ============================================================
    // TRIP-SPECIFIC ACTIVITY METHODS
    // ============================================================

    /**
     * Adds an activity to the selected trip.
     */
    public synchronized Activity addActivity(
        int tripId,
        Activity activity
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getActivities()
            .stream()
            .mapToInt(Activity::getId)
            .max()
            .orElse(0) + 1;

        activity.setId(nextId);
        selectedTrip.addActivity(activity);

        return activity;
    }

    /**
     * Updates an activity belonging to the selected trip.
     */
    public synchronized Activity updateActivity(
        int tripId,
        int activityId,
        Activity updated
    ) {
        Trip selectedTrip = requireTrip(tripId);

        List<Activity> activities = selectedTrip.getActivities();

        for (int i = 0; i < activities.size(); i++) {
            if (activities.get(i).getId() == activityId) {
                updated.setId(activityId);
                updated.attachToTrip(
                    selectedTrip.getStartDate()
                );

                activities.set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Removes an activity from the selected trip.
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

    // ============================================================
    // LEGACY HOUSING METHODS
    // ============================================================

    /**
     * Adds a housing booking to the original sample trip.
     */
    public HousingBooking addHousingBooking(
        HousingBooking housing
    ) {
        housing.setId(nextHousingId());
        trip.addHousingBooking(housing);

        return housing;
    }

    /**
     * Updates a housing booking in the original sample trip.
     *
     * Calling setHousingBookings refreshes schedules
     * based on the assigned TripSection.
     */
    public HousingBooking updateHousingBooking(
        int id,
        HousingBooking updated
    ) {
        List<HousingBooking> bookings =
            trip.getHousingBookings();

        for (int i = 0; i < bookings.size(); i++) {
            if (bookings.get(i).getId() == id) {
                updated.setId(id);

                bookings.set(i, updated);

                trip.setHousingBookings(bookings);

                return updated;
            }
        }

        return null;
    }

    /**
     * Removes a housing booking from the sample trip.
     */
    public boolean removeHousingBooking(int id) {
        int previousSize =
            trip.getHousingBookings().size();

        trip.removeHousingBooking(id);

        return trip.getHousingBookings().size()
            < previousSize;
    }

    private int nextHousingId() {
        return trip.getHousingBookings()
            .stream()
            .mapToInt(HousingBooking::getId)
            .max()
            .orElse(0) + 1;
    }

    // ============================================================
    // TRIP-SPECIFIC HOUSING METHODS
    // ============================================================

    /**
     * Adds a housing booking to the selected trip.
     */
    public synchronized HousingBooking addHousingBooking(
        int tripId,
        HousingBooking housing
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getHousingBookings()
            .stream()
            .mapToInt(HousingBooking::getId)
            .max()
            .orElse(0) + 1;

        housing.setId(nextId);
        selectedTrip.addHousingBooking(housing);

        return housing;
    }

    /**
     * Updates a housing booking belonging to a selected trip.
     *
     * Uses the updated Trip model to recalculate
     * section-based check-in dates and durations.
     */
    public synchronized HousingBooking updateHousingBooking(
        int tripId,
        int housingId,
        HousingBooking updated
    ) {
        Trip selectedTrip = requireTrip(tripId);

        List<HousingBooking> bookings =
            selectedTrip.getHousingBookings();

        for (int i = 0; i < bookings.size(); i++) {
            if (bookings.get(i).getId() == housingId) {
                updated.setId(housingId);

                bookings.set(i, updated);

                selectedTrip.setHousingBookings(bookings);

                return updated;
            }
        }

        return null;
    }

    /**
     * Removes a housing booking from the selected trip.
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

    // ============================================================
    // LEGACY BUDGET METHODS
    // ============================================================

    /**
     * Adds a budget item to the original sample trip.
     */
    public BudgetItem addBudgetItem(BudgetItem item) {
        item.setId(nextBudgetItemId());
        trip.addBudgetItem(item);

        return item;
    }

    /**
     * Updates a budget item in the original sample trip.
     */
    public BudgetItem updateBudgetItem(
        int id,
        BudgetItem updated
    ) {
        for (int i = 0; i < trip.getBudgetItems().size(); i++) {
            if (trip.getBudgetItems().get(i).getId() == id) {
                updated.setId(id);

                trip.getBudgetItems().set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Removes a budget item from the original sample trip.
     */
    public boolean removeBudgetItem(int id) {
        int previousSize = trip.getBudgetItems().size();

        trip.removeBudgetItem(id);

        return trip.getBudgetItems().size() < previousSize;
    }

    private int nextBudgetItemId() {
        return trip.getBudgetItems()
            .stream()
            .mapToInt(BudgetItem::getId)
            .max()
            .orElse(0) + 1;
    }

    // ============================================================
    // TRIP-SPECIFIC BUDGET METHODS
    // ============================================================

    /**
     * Adds a budget item to the selected trip.
     */
    public synchronized BudgetItem addBudgetItem(
        int tripId,
        BudgetItem item
    ) {
        Trip selectedTrip = requireTrip(tripId);

        int nextId = selectedTrip.getBudgetItems()
            .stream()
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

        List<BudgetItem> items =
            selectedTrip.getBudgetItems();

        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).getId() == itemId) {
                updated.setId(itemId);

                items.set(i, updated);

                return updated;
            }
        }

        return null;
    }

    /**
     * Removes a budget item from the selected trip.
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

    // ============================================================
    // SHARED HELPERS
    // ============================================================

    /**
     * Returns an existing trip or throws an exception.
     *
     * @param tripId selected trip ID
     * @return matching trip
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
