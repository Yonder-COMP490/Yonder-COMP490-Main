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

/**
 * Manages the original sample trip and a collection of independently
 * identified trips, including their activities, housing, and budget items.
 * Stores trips in a LinkedHashMap for keyed lookup and insertion order.
 *
 * @author R. Sommerhauser
 * @author A. Garcia
 * @version 1.0
 * @since 2026-10-12
 */
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
     * Creates and initializes a sample trip with example activities and
     * housing bookings for development and testing purposes.
     *
     * @return the newly created sample trip
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
     * Updates the current trip's basic information, duration, and trip sections.
     * Preserves the existing trip object and its associated activities,
     * housing bookings, and budget items.
     *
     * @param updated the trip containing the updated information
     * @return the updated trip
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
     * @throws IllegalArgumentException if the trip name, start date, or duration is invalid
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
     * Assigns a unique identifier to an activity and adds it to the trip.
     *
     * @param activity the activity to add
     * @return the newly added activity
     */
    public Activity addActivity(Activity activity) {
        activity.setId(nextActivityId());
        trip.addActivity(activity);
        return activity;
    }

    /**
     * Finds and replaces an existing activity with the updated activity.
     * Preserves the original identifier and attaches the updated activity
     * to the current trip's starting date.
     *
     * @param id the identifier of the activity to update
     * @param updated the activity containing the updated information
     * @return the updated activity, or null if no matching activity exists
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
     * Removes the activity with the specified identifier from the trip.
     *
     * @param id the identifier of the activity to remove
     * @return true if an activity was removed, false if no matching activity exists
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
     * Finds an activity and switches its scheduling method between
     * fixed-date scheduling and trip-day scheduling. Uses the current
     * trip's starting date when converting between scheduling methods.
     *
     * @param id the identifier of the activity to update
     * @param useFixedDate true to use fixed-date scheduling,
     * false to use trip-day scheduling
     * @return the updated activity, or null if no matching activity exists
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
     * Adds an activity to the specified trip.
     * Assigns an identifier unique within that trip's activity collection.
     *
     * @param tripId the identifier of the trip
     * @param activity the activity to add
     * @return the newly added activity
     * @throws IllegalArgumentException if the trip does not exist
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
     * Replaces an activity in the specified trip while preserving its identifier.
     * Reattaches the updated activity to the selected trip's starting date.
     *
     * @param tripId the identifier of the trip
     * @param activityId the identifier of the activity to update
     * @param updated the replacement activity
     * @return the updated activity, or null if the activity does not exist
     * @throws IllegalArgumentException if the trip does not exist
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
     * Removes an activity from the specified trip without affecting other trips.
     *
     * @param tripId the identifier of the trip
     * @param activityId the identifier of the activity to remove
     * @return true if an activity was removed, otherwise false
     * @throws IllegalArgumentException if the trip does not exist
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
     * Assigns a unique identifier to a housing booking and adds it to the trip.
     *
     * @param housing the housing booking to add
     * @return the newly added housing booking
     */
    public HousingBooking addHousingBooking(
        HousingBooking housing
    ) {
        housing.setId(nextHousingId());
        trip.addHousingBooking(housing);

        return housing;
    }

    /**
     * Finds and replaces an existing housing booking with the updated booking.
     * Preserves the original identifier and refreshes its calculated schedule
     * using the booking's assigned trip section.
     *
     * @param id the identifier of the housing booking to update
     * @param updated the housing booking containing the updated information
     * @return the updated housing booking, or null if no matching booking exists
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
     * Removes the housing booking with the specified identifier from the trip.
     *
     * @param id the identifier of the housing booking to remove
     * @return true if a booking was removed, false if no matching booking exists
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
     * Adds a housing booking to the specified trip.
     * Assigns an identifier unique within that trip's housing collection.
     *
     * @param tripId the identifier of the trip
     * @param housing the housing booking to add
     * @return the newly added housing booking
     * @throws IllegalArgumentException if the trip does not exist
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
     * Replaces a housing booking in the specified trip while retaining its ID.
     * Updates the trip's housing collection through the Trip model, which
     * recalculates section-based booking dates and durations as applicable.
     *
     * @param tripId the identifier of the trip
     * @param housingId the identifier of the booking to update
     * @param updated the replacement housing booking
     * @return the updated booking, or null if the booking does not exist
     * @throws IllegalArgumentException if the trip does not exist
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
     * Removes a housing booking from the specified trip.
     *
     * @param tripId the identifier of the trip
     * @param housingId the identifier of the booking to remove
     * @return true if a booking was removed, otherwise false
     * @throws IllegalArgumentException if the trip does not exist
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
     * Assigns a unique identifier to a budget item and adds it to the trip.
     *
     * @param item the budget item to add
     * @return the newly added budget item
     */
    public BudgetItem addBudgetItem(BudgetItem item) {
        item.setId(nextBudgetItemId());
        trip.addBudgetItem(item);

        return item;
    }

    /**
     * Finds and replaces an existing budget item with the updated item.
     * Preserves the original identifier.
     *
     * @param id the identifier of the budget item to update
     * @param updated the budget item containing the updated information
     * @return the updated budget item, or null if no matching item exists
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
     * Removes the budget item with the specified identifier from the trip.
     *
     * @param id the identifier of the budget item to remove
     * @return true if a budget item was removed, false if no matching item exists
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
     * Adds a budget item to the specified trip.
     * Assigns an identifier unique within that trip's budget collection.
     *
     * @param tripId the identifier of the trip
     * @param item the budget item to add
     * @return the newly added budget item
     * @throws IllegalArgumentException if the trip does not exist
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
     * Replaces a budget item in the specified trip while preserving its ID.
     *
     * @param tripId the identifier of the trip
     * @param itemId the identifier of the budget item to update
     * @param updated the replacement budget item
     * @return the updated item, or null if the budget item does not exist
     * @throws IllegalArgumentException if the trip does not exist
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
     * Removes a budget item from the specified trip.
     *
     * @param tripId the identifier of the trip
     * @param itemId the identifier of the budget item to remove
     * @return true if the item was removed, otherwise false
     * @throws IllegalArgumentException if the trip does not exist
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
     * @throws IllegalArgumentException if the trip does not exist
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
