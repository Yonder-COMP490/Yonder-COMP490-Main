package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.BudgetSummary;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;
import com.yonder.backend.services.BudgetService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Provides REST endpoints for the original sample trip and for multiple
 * independently managed trips, including their activities, housing, and budgets.
 * Delegates changes to TripManager and summaries to BudgetService.
 *
 * @author R. Sommerhauser
 * @author A. Garcia
 * @version 1.0
 */
@RestController
@CrossOrigin(
    origins = "http://localhost:5173",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.PATCH,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class TripController {

    private final TripManager tripManager;
    private final BudgetService budgetService;

    public TripController(
        TripManager tripManager,
        BudgetService budgetService
    ) {
        this.tripManager = tripManager;
        this.budgetService = budgetService;
    }

    // ============================================================
    // LEGACY TRIP ENDPOINTS
    // Preserved for compatibility with the existing application.
    // These endpoints operate on the original sample trip.
    // ============================================================

    /**
     * Retrieves the original sample trip.
     *
     * @return sample trip
     */
    @GetMapping("/api/trip")
    public Trip getTrip() {
        return tripManager.getTrip();
    }

    /**
     * Updates the current trip using the provided trip information.
     * Validates the trip duration and starting date before applying changes.
     *
     * @param trip the trip containing the updated information
     * @return the updated trip
     * @throws ResponseStatusException with BAD_REQUEST if the trip duration
     * is less than one day or the starting date is missing
     */
    @PutMapping("/api/trip")
    public Trip updateTrip(@RequestBody Trip trip) {
        if (trip.getDays() < 1) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Trip must be at least one day long"
            );
        }

        if (trip.getStartDate() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Trip start date is required"
            );
        }

        return tripManager.updateTrip(trip);
    }

    // ============================================================
    // LEGACY ACTIVITY ENDPOINTS
    // ============================================================

    /**
     * Creates a new activity and adds it to the current trip.
     *
     * @param activity the activity to add
     * @return the newly created activity
     */
    @PostMapping("/api/trip/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Activity addActivity(
        @RequestBody Activity activity
    ) {
        return tripManager.addActivity(activity);
    }

    /**
     * Updates an existing activity using the provided activity information.
     *
     * @param id the identifier of the activity to update
     * @param activity the updated activity information
     * @return the updated activity
     * @throws ResponseStatusException with NOT_FOUND if the activity
     * does not exist
     */
    @PutMapping("/api/trip/activities/{id}")
    public Activity updateActivity(
        @PathVariable int id,
        @RequestBody Activity activity
    ) {
        Activity updated = tripManager.updateActivity(
            id,
            activity
        );

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }

        return updated;
    }

    /**
     * Removes an activity from the current trip.
     *
     * @param id the identifier of the activity to remove
     * @throws ResponseStatusException with NOT_FOUND if the activity
     * does not exist
     */
    @DeleteMapping("/api/trip/activities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeActivity(@PathVariable int id) {
        if (!tripManager.removeActivity(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }
    }

    /**
     * Switches an activity between fixed-date scheduling and trip-day scheduling.
     *
     * @param id the identifier of the activity to update
     * @param useFixedDate true to use fixed-date scheduling,
     * false to use trip-day scheduling
     * @return the updated activity
     * @throws ResponseStatusException with NOT_FOUND if the activity
     * does not exist
     */
    @PatchMapping("/api/trip/activities/{id}/schedule")
    public Activity switchActivityScheduleType(
        @PathVariable int id,
        @RequestParam boolean useFixedDate
    ) {
        Activity result = tripManager.switchActivityScheduleType(
            id,
            useFixedDate
        );

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }

        return result;
    }

    // ============================================================
    // LEGACY HOUSING ENDPOINTS
    // ============================================================

    /**
     * Creates a new housing booking and adds it to the current trip.
     *
     * @param housing the housing booking to add
     * @return the newly created housing booking
     */
    @PostMapping("/api/trip/housing")
    @ResponseStatus(HttpStatus.CREATED)
    public HousingBooking addHousingBooking(
        @RequestBody HousingBooking housing
    ) {
        return tripManager.addHousingBooking(housing);
    }

    /**
     * Updates an existing housing booking using the provided booking information.
     *
     * @param id the identifier of the housing booking to update
     * @param housing the updated housing booking information
     * @return the updated housing booking
     * @throws ResponseStatusException with NOT_FOUND if the housing booking
     * does not exist
     */
    @PutMapping("/api/trip/housing/{id}")
    public HousingBooking updateHousingBooking(
        @PathVariable int id,
        @RequestBody HousingBooking housing
    ) {
        HousingBooking updated =
            tripManager.updateHousingBooking(id, housing);

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Housing booking not found"
            );
        }

        return updated;
    }

    /**
     * Removes a housing booking from the current trip.
     *
     * @param id the identifier of the housing booking to remove
     * @throws ResponseStatusException with NOT_FOUND if the housing booking
     * does not exist
     */
    @DeleteMapping("/api/trip/housing/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeHousingBooking(@PathVariable int id) {
        if (!tripManager.removeHousingBooking(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Housing booking not found"
            );
        }
    }

    // ============================================================
    // LEGACY BUDGET ENDPOINTS
    // ============================================================

    /**
     * Generates and retrieves a budget summary for the current trip.
     * Delegates the calculation of expense totals and budget entries
     * to the BudgetService.
     *
     * @return the calculated budget summary
     */
    @GetMapping("/api/trip/budget")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary(
            tripManager.getTrip()
        );
    }

    /**
     * Creates a new budget item and adds it to the current trip.
     *
     * @param item the budget item to add
     * @return the newly created budget item
    */
    @PostMapping("/api/trip/budget-items")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetItem addBudgetItem(
        @RequestBody BudgetItem item
    ) {
        return tripManager.addBudgetItem(item);
    }

    /**
     * Updates an existing budget item using the provided item information.
     *
     * @param id the identifier of the budget item to update
     * @param item the updated budget item information
     * @return the updated budget item
     * @throws ResponseStatusException with NOT_FOUND if the budget item
     * does not exist
     */
    @PutMapping("/api/trip/budget-items/{id}")
    public BudgetItem updateBudgetItem(
        @PathVariable int id,
        @RequestBody BudgetItem item
    ) {
        BudgetItem updated = tripManager.updateBudgetItem(
            id,
            item
        );

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget item not found"
            );
        }

        return updated;
    }

    /**
     * Removes a budget item from the current trip.
     *
     * @param id the identifier of the budget item to remove
     * @throws ResponseStatusException with NOT_FOUND if the budget item
     * does not exist
     */
    @DeleteMapping("/api/trip/budget-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBudgetItem(@PathVariable int id) {
        if (!tripManager.removeBudgetItem(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget item not found"
            );
        }
    }

    // ============================================================
    // MULTI-TRIP ENDPOINTS
    // ============================================================

    /**
     * Returns all trips currently held by the trip manager.
     *
     * This collection includes the original sample trip and trips created
     * through the multi-trip API.
     *
     * @return the available trips in insertion order
     */
    @GetMapping("/api/trips")
    public List<Trip> getTrips() {
        return tripManager.getTrips();
    }

    /**
     * Retrieves one trip using its unique identifier.
     *
     * @param tripId the ID of the requested trip
     * @return the matching trip
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    @GetMapping("/api/trips/{tripId}")
    public Trip getTripById(
        @PathVariable int tripId
    ) {
        return requireExistingTrip(tripId);
    }

    /**
     * Creates a trip from the submitted name, dates, and currency.
     *
     * Converts the inclusive start/end date range to a duration in days,
     * validates the range, and delegates ID assignment and storage to
     * {@link TripManager#createTrip(Trip)}.
     *
     * @param request the requested trip details
     * @return the newly created trip
     * @throws ResponseStatusException if required information is missing,
     *         the date range is invalid, or trip validation fails (HTTP 400)
     */
    @PostMapping("/api/trips")
    @ResponseStatus(HttpStatus.CREATED)
    public Trip createTrip(
        @RequestBody CreateTripRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Trip information is required"
            );
        }

        if (request.startDate() == null ||
            request.endDate() == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Trip start and end dates are required"
            );
        }

        if (request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "End date cannot be before start date"
            );
        }

        // Include both the start and end dates in the trip.
        long duration = ChronoUnit.DAYS.between(
            request.startDate(),
            request.endDate()
        ) + 1;

        if (duration < 1 || duration > Integer.MAX_VALUE) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid trip duration"
            );
        }

        Trip newTrip = new Trip();

        newTrip.setId(0);
        newTrip.setName(request.name());
        newTrip.setStartDate(request.startDate());
        newTrip.setDays((int) duration);
        newTrip.setPreferredCurrency(
            request.preferredCurrency()
        );

        try {
            return tripManager.createTrip(newTrip);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                ex
            );
        }
    }

    // ============================================================
    // TRIP-SPECIFIC ACTIVITY ENDPOINTS
    // ============================================================

    /**
     * Adds an activity to the specified trip.
     *
     * The trip manager assigns an activity ID within that trip's collection.
     *
     * @param tripId the ID of the trip to modify
     * @param activity the activity to add
     * @return the created activity
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    @PostMapping("/api/trips/{tripId}/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Activity addTripActivity(
        @PathVariable int tripId,
        @RequestBody Activity activity
    ) {
        requireExistingTrip(tripId);

        return tripManager.addActivity(
            tripId,
            activity
        );
    }

    /**
     * Replaces an activity in the specified trip.
     *
     * The manager retains the activity ID and updates its trip-relative
     * scheduling against the selected trip's start date.
     *
     * @param tripId the ID of the trip containing the activity
     * @param activityId the ID of the activity to update
     * @param activity the replacement activity information
     * @return the updated activity
     * @throws ResponseStatusException if the trip or activity is not found
     *         (HTTP 404)
     */
    @PutMapping("/api/trips/{tripId}/activities/{activityId}")
    public Activity updateTripActivity(
        @PathVariable int tripId,
        @PathVariable int activityId,
        @RequestBody Activity activity
    ) {
        requireExistingTrip(tripId);

        Activity updated = tripManager.updateActivity(
            tripId,
            activityId,
            activity
        );

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }

        return updated;
    }

    /**
     * Deletes an activity from the specified trip.
     *
     * Returns HTTP 204 when removal succeeds.
     *
     * @param tripId the ID of the trip containing the activity
     * @param activityId the ID of the activity to delete
     * @throws ResponseStatusException if the trip or activity is not found
     *         (HTTP 404)
     */
    @DeleteMapping("/api/trips/{tripId}/activities/{activityId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTripActivity(
        @PathVariable int tripId,
        @PathVariable int activityId
    ) {
        requireExistingTrip(tripId);

        if (!tripManager.removeActivity(
            tripId,
            activityId
        )) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }
    }

    // ============================================================
    // TRIP-SPECIFIC HOUSING ENDPOINTS
    // ============================================================

    /**
     * Adds a housing booking to the specified trip.
     *
     * The trip manager assigns a booking ID within that trip's collection.
     *
     * @param tripId the ID of the trip to modify
     * @param housing the housing booking to add
     * @return the created housing booking
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    @PostMapping("/api/trips/{tripId}/housing")
    @ResponseStatus(HttpStatus.CREATED)
    public HousingBooking addTripHousingBooking(
        @PathVariable int tripId,
        @RequestBody HousingBooking housing
    ) {
        requireExistingTrip(tripId);

        return tripManager.addHousingBooking(
            tripId,
            housing
        );
    }

    /**
     * Updates a housing booking within the specified trip.
     *
     * Preserves the booking ID and delegates refreshing the trip's housing
     * collection and section-based schedule to the trip manager.
     *
     * @param tripId the ID of the trip containing the booking
     * @param housingId the ID of the booking to update
     * @param housing the replacement booking information
     * @return the updated housing booking
     * @throws ResponseStatusException if the trip or booking is not found
     *         (HTTP 404)
     */
    @PutMapping("/api/trips/{tripId}/housing/{housingId}")
    public HousingBooking updateTripHousingBooking(
        @PathVariable int tripId,
        @PathVariable int housingId,
        @RequestBody HousingBooking housing
    ) {
        requireExistingTrip(tripId);

        HousingBooking updated =
            tripManager.updateHousingBooking(
                tripId,
                housingId,
                housing
            );

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Housing booking not found"
            );
        }

        return updated;
    }

    /**
     * Deletes a housing booking from the specified trip.
     *
     * Returns HTTP 204 when removal succeeds.
     *
     * @param tripId the ID of the trip containing the booking
     * @param housingId the ID of the booking to delete
     * @throws ResponseStatusException if the trip or booking is not found
     *         (HTTP 404)
     */
    @DeleteMapping("/api/trips/{tripId}/housing/{housingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTripHousingBooking(
        @PathVariable int tripId,
        @PathVariable int housingId
    ) {
        requireExistingTrip(tripId);

        if (!tripManager.removeHousingBooking(
            tripId,
            housingId
        )) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Housing booking not found"
            );
        }
    }

    // ============================================================
    // TRIP-SPECIFIC BUDGET ENDPOINTS
    // ============================================================

    /**
     * Retrieves the calculated budget summary for the selected trip.
     *
     * Passes the selected trip to {@link BudgetService} so that expenses
     * from another trip are not included in its totals.
     *
     * @param tripId the ID of the trip whose budget is requested
     * @return the selected trip's calculated budget summary
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    @GetMapping("/api/trips/{tripId}/budget")
    public BudgetSummary getTripBudgetSummary(
        @PathVariable int tripId
    ) {
        Trip selectedTrip = requireExistingTrip(tripId);

        return budgetService.getBudgetSummary(
            selectedTrip
        );
    }

    /**
     * Adds a daily budget item to the specified trip.
     *
     * The trip manager generates an item ID within that trip's budget.
     *
     * @param tripId the ID of the trip to modify
     * @param item the budget item to add
     * @return the created budget item
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    @PostMapping("/api/trips/{tripId}/budget-items")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetItem addTripBudgetItem(
        @PathVariable int tripId,
        @RequestBody BudgetItem item
    ) {
        requireExistingTrip(tripId);

        return tripManager.addBudgetItem(
            tripId,
            item
        );
    }

    /**
     * Replaces a budget item within the specified trip.
     *
     * Preserves the existing item ID and leaves other trips' budgets unchanged.
     *
     * @param tripId the ID of the trip containing the item
     * @param itemId the ID of the item to update
     * @param item the replacement budget item
     * @return the updated budget item
     * @throws ResponseStatusException if the trip or item is not found
     *         (HTTP 404)
     */
    @PutMapping("/api/trips/{tripId}/budget-items/{itemId}")
    public BudgetItem updateTripBudgetItem(
        @PathVariable int tripId,
        @PathVariable int itemId,
        @RequestBody BudgetItem item
    ) {
        requireExistingTrip(tripId);

        BudgetItem updated = tripManager.updateBudgetItem(
            tripId,
            itemId,
            item
        );

        if (updated == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget item not found"
            );
        }

        return updated;
    }

    /**
     * Deletes a budget item from the specified trip.
     *
     * Returns HTTP 204 when removal succeeds.
     *
     * @param tripId the ID of the trip containing the item
     * @param itemId the ID of the item to delete
     * @throws ResponseStatusException if the trip or item is not found
     *         (HTTP 404)
     */
    @DeleteMapping("/api/trips/{tripId}/budget-items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTripBudgetItem(
        @PathVariable int tripId,
        @PathVariable int itemId
    ) {
        requireExistingTrip(tripId);

        if (!tripManager.removeBudgetItem(
            tripId,
            itemId
        )) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget item not found"
            );
        }
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    /**
     * Resolves a trip ID to an existing trip for use by multi-trip endpoints.
     *
     * Centralizes the HTTP 404 response when the requested trip is missing.
     *
     * @param tripId the ID of the requested trip
     * @return the matching trip
     * @throws ResponseStatusException if the trip does not exist (HTTP 404)
     */
    private Trip requireExistingTrip(int tripId) {
        Trip selectedTrip = tripManager.getTripById(tripId);

        if (selectedTrip == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Trip not found: " + tripId
            );
        }

        return selectedTrip;
    }
}
