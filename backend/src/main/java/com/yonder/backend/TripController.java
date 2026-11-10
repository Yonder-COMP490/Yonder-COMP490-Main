
package com.yonder.backend;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;
import com.yonder.backend.models.BudgetSummary;
import com.yonder.backend.services.BudgetService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final BudgetService budgetService;
    private final TripManager tripManager;

    public TripController(
        TripManager tripManager,
        BudgetService budgetService
    ) {
        this.tripManager = tripManager;
        this.budgetService = budgetService;
    }

    // ---------- Original trip endpoint ----------

    /**
     * Returns the original sample trip.
     * Retained for backward compatibility.
     *
     * @return the original trip
     */
    @GetMapping("/api/trip")
    public Trip getTrip() {
        return tripManager.getTrip();
    }

    // ---------- Multiple-trip management ----------

    /**
     * Returns all available trips.
     *
     * @return the list of trips
     */
    @GetMapping("/api/trips")
    public List<Trip> getTrips() {
        return tripManager.getTrips();
    }

    /**
     * Returns a specific trip by its ID.
     *
     * @param id the trip ID
     * @return the requested trip
     */
    @GetMapping("/api/trips/{id}")
    public Trip getTripById(@PathVariable int id) {
        Trip trip = tripManager.getTripById(id);

        if (trip == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Trip not found"
            );
        }

        return trip;
    }

    /**
     * Creates a new trip.
     *
     * @param requested the trip details
     * @return the newly created trip
     */
    @PostMapping("/api/trips")
    @ResponseStatus(HttpStatus.CREATED)
    public Trip createTrip(@RequestBody Trip requested) {
        try {
            return tripManager.createTrip(requested);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                exception.getMessage()
            );
        }
    }

    // ---------- Activities ----------

    @PostMapping("/api/trip/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public Activity addActivity(@RequestBody Activity activity) {
        return tripManager.addActivity(activity);
    }

    @PutMapping("/api/trip/activities/{id}")
    public Activity updateActivity(
        @PathVariable int id,
        @RequestBody Activity activity
    ) {
        Activity result = tripManager.updateActivity(id, activity);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Activity not found"
            );
        }

        return result;
    }

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

    // ---------- Housing bookings ----------

    @PostMapping("/api/trip/housing")
    @ResponseStatus(HttpStatus.CREATED)
    public HousingBooking addHousingBooking(
        @RequestBody HousingBooking housing
    ) {
        return tripManager.addHousingBooking(housing);
    }

    @PutMapping("/api/trip/housing/{id}")
    public HousingBooking updateHousingBooking(
        @PathVariable int id,
        @RequestBody HousingBooking housing
    ) {
        HousingBooking result =
            tripManager.updateHousingBooking(id, housing);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Housing booking not found"
            );
        }

        return result;
    }

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

    // ---------- Budget items ----------

    @PostMapping("/api/trip/budget-items")
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetItem addBudgetItem(@RequestBody BudgetItem item) {
        return tripManager.addBudgetItem(item);
    }

    @PutMapping("/api/trip/budget-items/{id}")
    public BudgetItem updateBudgetItem(
        @PathVariable int id,
        @RequestBody BudgetItem item
    ) {
        BudgetItem result = tripManager.updateBudgetItem(id, item);

        if (result == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Budget item not found"
            );
        }

        return result;
    }

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

    // ---------- Budget summary ----------

    @GetMapping("/api/trip/budget")
    public BudgetSummary getBudgetSummary() {
        return budgetService.getBudgetSummary(
            tripManager.getTrip()
        );
    }
}
