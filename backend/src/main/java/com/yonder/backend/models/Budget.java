
package com.yonder.backend.models;

import java.util.List;

public class Budget {

    public Cost getActivityTotal(Trip trip) {
        Cost total = new Cost(0.0, trip.getPreferredCurrency());

        for (Activity activity : trip.getActivities()) {
            if (activity.getCost() != null) {
                total = total.add(activity.getCost());
            }
        }

        return total;
    }

    public Cost getHousingTotal(Trip trip) {
        Cost total = new Cost(0.0, trip.getPreferredCurrency());

        for (HousingBooking housing : trip.getHousingBookings()) {
            if (housing.getCostPerDay() != null) {
                total = total.add(housing.getTotalCost());
            }
        }

        return total;
    }

    public Cost getTotalCost(Trip trip) {
        return getActivityTotal(trip).add(getHousingTotal(trip));
    }
}
