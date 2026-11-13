package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;
import com.yonder.backend.services.BudgetService;
import com.yonder.backend.models.BudgetSummary;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Class name: TripController
 * Date: 10/12/2026
 * Programmer: Ryan Sommerhauser
 * Description: Provides REST API endpoints for managing trip information,
 * activities, housing bookings, and budget items. Receives HTTP requests
 * from the frontend, delegates operations to TripManager and BudgetService,
 * and returns the appropriate data or HTTP response.
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
    private final BudgetService budgetService;
    private final TripManager tripManager;

    public TripController(TripManager tripManager, BudgetService budgetService)
    {
        this.tripManager = tripManager;
        this.budgetService = budgetService;
    }

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
                HttpStatus.BAD_REQUEST, "Trip must be at least one day long"
            );
        }

        if (trip.getStartDate() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Trip start date is required"
            );
        }

        return tripManager.updateTrip(trip);
    }

    // ---------- Activities ----------

    /**
     * Creates a new activity and adds it to the current trip.
     *
     * @param activity the activity to add
     * @return the newly created activity
     */
    @PostMapping("/api/trip/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Activity addActivity(@RequestBody Activity activity) {
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
        Activity result = tripManager.updateActivity(id, activity);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Activity not found"
            );
        }

        return result;
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
                HttpStatus.NOT_FOUND, "Activity not found"
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
                HttpStatus.NOT_FOUND, "Activity not found"
            );
        }

        return result;
    }

    // ---------- Housing bookings ----------

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
        HousingBooking result =
            tripManager.updateHousingBooking(id, housing);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Housing booking not found"
            );
        }

        return result;
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
                HttpStatus.NOT_FOUND, "Housing booking not found"
            );
        }
    }

    // ---------- Budget items ----------

    /**
     * Creates a new budget item and adds it to the current trip.
     *
     * @param item the budget item to add
     * @return the newly created budget item
    */
    @PostMapping("/api/trip/budget-items")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetItem addBudgetItem(@RequestBody BudgetItem item) {
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
        BudgetItem result = tripManager.updateBudgetItem(id, item);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Budget item not found"
            );
        }

        return result;
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
                HttpStatus.NOT_FOUND, "Budget item not found"
            );
        }
    }

    // ---------- Budget summary ----------

    /**
     * Generates and retrieves a budget summary for the current trip.
     * Delegates the calculation of expense totals and budget entries
     * to the BudgetService.
     *
     * @return the calculated budget summary
     */
    @GetMapping("/api/trip/budget")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary(tripManager.getTrip());
    }
}
