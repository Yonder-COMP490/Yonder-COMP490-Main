
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
     * Updates the original sample trip, including its
     * duration and trip sections.
     *
     * @param trip updated trip information
     * @return updated sample trip
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
     * Adds an activity to the original sample trip.
     *
     * @param activity activity information
     * @return created activity
     */
    @PostMapping("/api/trip/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Activity addActivity(
        @RequestBody Activity activity
    ) {
        return tripManager.addActivity(activity);
    }

    /**
     * Updates an activity in the original sample trip.
     *
     * @param id activity ID
     * @param activity updated activity data
     * @return updated activity
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
     * Removes an activity from the original sample trip.
     *
     * @param id activity ID
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
     * Switches an activity between fixed-date and
     * relative scheduling.
     *
     * Preserves the scheduling functionality from main.
     *
     * @param id activity ID
     * @param useFixedDate whether to use a fixed date
     * @return updated activity
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
     * Adds a housing booking to the original sample trip.
     *
     * @param housing housing booking information
     * @return created housing booking
     */
    @PostMapping("/api/trip/housing")
    @ResponseStatus(HttpStatus.CREATED)
    public HousingBooking addHousingBooking(
        @RequestBody HousingBooking housing
    ) {
        return tripManager.addHousingBooking(housing);
    }

    /**
     * Updates a housing booking in the original sample trip.
     *
     * @param id housing booking ID
     * @param housing updated booking information
     * @return updated housing booking
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
     * Removes a housing booking from the sample trip.
     *
     * @param id housing booking ID
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
     * Retrieves the budget summary for the sample trip.
     *
     * @return calculated budget summary
     */
    @GetMapping("/api/trip/budget")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary(
            tripManager.getTrip()
        );
    }

    /**
     * Adds a budget item to the original sample trip.
     *
     * @param item budget item
     * @return created budget item
     */
    @PostMapping("/api/trip/budget-items")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetItem addBudgetItem(
        @RequestBody BudgetItem item
    ) {
        return tripManager.addBudgetItem(item);
    }

    /**
     * Updates a budget item in the original sample trip.
     *
     * @param id budget item ID
     * @param item updated budget item
     * @return updated budget item
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
     * Removes a budget item from the original sample trip.
     *
     * @param id budget item ID
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
     * Retrieves all available trips.
     *
     * @return list of trips
     */
    @GetMapping("/api/trips")
    public List<Trip> getTrips() {
        return tripManager.getTrips();
    }

    /**
     * Retrieves a specific trip.
     *
     * @param tripId unique trip identifier
     * @return selected trip
     */
    @GetMapping("/api/trips/{tripId}")
    public Trip getTripById(
        @PathVariable int tripId
    ) {
        return requireExistingTrip(tripId);
    }

    /**
     * Creates a trip using its requested start and end dates.
     *
     * The updated Trip model stores duration in days
     * instead of an end date. Both the start and end
     * dates are included when calculating that duration.
     *
     * @param request new trip information
     * @return created trip
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
     * Adds an activity to a selected trip.
     *
     * @param tripId selected trip ID
     * @param activity activity information
     * @return created activity
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
     * Updates an activity belonging to a selected trip.
     *
     * @param tripId selected trip ID
     * @param activityId activity ID
     * @param activity updated activity information
     * @return updated activity
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
     * Removes an activity from a selected trip.
     *
     * @param tripId selected trip ID
     * @param activityId activity ID
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
     * Adds a housing booking to a selected trip.
     *
     * @param tripId selected trip ID
     * @param housing housing booking information
     * @return created housing booking
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
     * Updates a housing booking in a selected trip.
     *
     * @param tripId selected trip ID
     * @param housingId housing booking ID
     * @param housing updated booking information
     * @return updated housing booking
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
     * Removes a housing booking from a selected trip.
     *
     * @param tripId selected trip ID
     * @param housingId housing booking ID
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
     * Retrieves the budget summary for a selected trip.
     *
     * @param tripId selected trip ID
     * @return selected trip's budget summary
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
     * Adds a budget item to a selected trip.
     *
     * @param tripId selected trip ID
     * @param item budget item
     * @return created budget item
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
     * Updates a budget item belonging to a selected trip.
     *
     * @param tripId selected trip ID
     * @param itemId budget item ID
     * @param item updated budget item
     * @return updated budget item
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
     * Removes a budget item from a selected trip.
     *
     * @param tripId selected trip ID
     * @param itemId budget item ID
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
     * Retrieves a trip or returns HTTP 404 if it does not exist.
     *
     * @param tripId requested trip ID
     * @return matching trip
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
