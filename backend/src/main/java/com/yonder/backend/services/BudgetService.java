package com.yonder.backend.services;

import com.yonder.backend.models.Activity;
import com.yonder.backend.models.BudgetEntry;
import com.yonder.backend.models.BudgetItem;
import com.yonder.backend.models.BudgetSummary;
import com.yonder.backend.models.Cost;
import com.yonder.backend.models.HousingBooking;
import com.yonder.backend.models.Trip;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetService {

    /**
     * Builds a complete budget summary from the current state of a trip.
     *
     * This method does not modify the trip or store the summary.
     * A new summary is generated each time this method is called.
     */
    public BudgetSummary getBudgetSummary(Trip trip) {
        String currency = getTripCurrency(trip);

        BudgetSummary summary = new BudgetSummary();

        // Calculate category totals.
        Cost activityTotal = getActivityTotal(trip);
        Cost housingTotal = getHousingTotal(trip);
        Cost dailyTotal = getDailyTotal(trip);

        // Transportation is not implemented yet.
        Cost travelTotal = zeroCost(currency);

        // Set category totals.
        summary.setActivityTotal(activityTotal);
        summary.setHousingTotal(housingTotal);
        summary.setTravelTotal(travelTotal);
        summary.setDailyTotal(dailyTotal);

        // Calculate overall total.
        Cost total = activityTotal
            .add(housingTotal)
            .add(travelTotal)
            .add(dailyTotal);

        summary.setTotalCost(total);

        // Build the individual entries displayed in the UI.
        summary.setEntries(getBudgetEntries(trip));

        return summary;
    }

    /**
     * Calculates the total cost of all activities.
     */
    public Cost getActivityTotal(Trip trip) {
        Cost total = zeroCost(getTripCurrency(trip));

        for (Activity activity : trip.getActivities()) {
            if (activity == null || activity.getCost() == null) {
                continue;
            }

            total = total.add(activity.getCost());
        }

        return total;
    }

    /**
     * Calculates the total cost of all housing bookings.
     */
    public Cost getHousingTotal(Trip trip) {
        Cost total = zeroCost(getTripCurrency(trip));

        for (HousingBooking housing : trip.getHousingBookings()) {
            if (housing == null) {
                continue;
            }

            total = total.add(housing.getTotalCost());
        }

        return total;
    }

    /**
     * Calculates the total cost of all daily budget items.
     */
    public Cost getDailyTotal(Trip trip) {
        Cost total = zeroCost(getTripCurrency(trip));

        for (BudgetItem item : trip.getBudgetItems()) {
            if (item == null) {
                continue;
            }

            total = total.add(item.getTotalCost());
        }

        return total;
    }

    /**
     * Creates a list of budget entries representing the original trip objects.
     *
     * Each entry includes the source type and ID so the frontend can
     * identify which original object the expense belongs to.
     */
    public List<BudgetEntry> getBudgetEntries(Trip trip) {
        List<BudgetEntry> entries = new ArrayList<>();

        // Activities
        for (Activity activity : trip.getActivities()) {
            if (activity == null || activity.getCost() == null) {
                continue;
            }

            Cost unitCost = copyCost(activity.getCost());
            Cost totalCost = copyCost(activity.getCost());

            entries.add(new BudgetEntry(
                "Activities",
                "Activity",
                activity.getId(),
                activity.getName(),
                unitCost,
                1,
                "occurrences",
                totalCost
            ));
        }

        // Housing bookings
        for (HousingBooking housing : trip.getHousingBookings()) {
            if (housing == null) {
                continue;
            }

            Cost unitCost = housing.getCostPerDay();

            if (unitCost == null) {
                unitCost = zeroCost(getTripCurrency(trip));
            } else {
                unitCost = copyCost(unitCost);
            }

            int nights = housing.getNumberOfNights();

            entries.add(new BudgetEntry(
                "Housing",
                "HousingBooking",
                housing.getId(),
                housing.getName(),
                unitCost,
                nights,
                "nights",
                copyCost(housing.getTotalCost())
            ));
        }

        // Daily budget items
        for (BudgetItem item : trip.getBudgetItems()) {
            if (item == null) {
                continue;
            }

            Cost unitCost = item.getCost();

            if (unitCost == null) {
                unitCost = zeroCost(getTripCurrency(trip));
            } else {
                unitCost = copyCost(unitCost);
            }

            entries.add(new BudgetEntry(
                "Daily",
                "BudgetItem",
                item.getId(),
                item.getName(),
                unitCost,
                item.getDays(),
                "days",
                copyCost(item.getTotalCost())
            ));
        }

        return entries;
    }

    /**
     * Returns the trip's preferred currency, defaulting to USD if missing.
     */
    private String getTripCurrency(Trip trip) {
        if (trip.getPreferredCurrency() == null
                || trip.getPreferredCurrency().isBlank()) {
            return "USD";
        }

        return trip.getPreferredCurrency();
    }

    /**
     * Creates a zero-valued cost in the specified currency.
     */
    private Cost zeroCost(String currency) {
        return new Cost(0.0, currency);
    }

    /**
     * Copies a Cost so summary entries don't share mutable Cost objects
     * with the original trip objects.
     */
    private Cost copyCost(Cost cost) {
        return new Cost(
            cost.getLowerEnd(),
            cost.getUpperEnd(),
            cost.getCurrency()
        );
    }
}