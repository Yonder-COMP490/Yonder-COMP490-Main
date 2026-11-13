
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
import java.util.List;


/**
 * Class name: TripManager
 * Date: 10/12/2026
 * Programmer: Ryan Sommerhauser
 * Description: Manages the trip and its associated data, including activities,
 * housing bookings, and budget items. Handles creating, updating, and removing
 * trip objects, as well as generating unique identifiers for newly added
 * objects. Acts as the primary interface between the trip data and controller.
 */
@Component
public class TripManager {

    private final Trip trip;

    public TripManager() {
        trip = createSampleTrip();
    }
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
    public Trip updateTrip(Trip updated) {
        trip.setName(updated.getName());
        trip.setStartDate(updated.getStartDate());
        trip.setPreferredCurrency(updated.getPreferredCurrency());

        trip.setDaysAndTripSections(
            updated.getDays(),
            updated.getTripSections()
        );

        return trip;
    }

    // ---------- Activities ----------
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

    /**
     * Determines the next available activity identifier based on the
     * highest identifier currently assigned to an activity.
     *
     * @return the next available activity identifier
     */
    private int nextActivityId() {
        return trip.getActivities().stream()
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

    // ---------- Housing bookings ----------
    /**
     * Assigns a unique identifier to a housing booking and adds it to the trip.
     *
     * @param housing the housing booking to add
     * @return the newly added housing booking
     */
    public HousingBooking addHousingBooking(HousingBooking housing) {
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
        List<HousingBooking> housingBookings =
            trip.getHousingBookings();

        for (int i = 0; i < housingBookings.size(); i++) {
            if (housingBookings.get(i).getId() == id) {
                updated.setId(id);

                housingBookings.set(i, updated);

                // Refresh the calculated dates and nights using
                // the booking's assigned TripSection.
                trip.setHousingBookings(housingBookings);

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
        int previousSize = trip.getHousingBookings().size();

        trip.removeHousingBooking(id);

        return trip.getHousingBookings().size() < previousSize;
    }

    /**
     * Determines the next available housing booking identifier based on
     * the highest identifier currently assigned to a booking.
     *
     * @return the next available housing booking identifier
     */
    private int nextHousingId() {
        return trip.getHousingBookings().stream()
            .mapToInt(HousingBooking::getId)
            .max()
            .orElse(0) + 1;
    }

    // ---------- Budget items ----------
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

    /**
     * Determines the next available budget item identifier based on
     * the highest identifier currently assigned to a budget item.
     *
     * @return the next available budget item identifier
     */
    private int nextBudgetItemId() {
        return trip.getBudgetItems().stream()
            .mapToInt(BudgetItem::getId)
            .max()
            .orElse(0) + 1;
    }
}
