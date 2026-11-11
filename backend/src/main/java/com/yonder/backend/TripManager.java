
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

@Component
public class TripManager {

    private final Trip trip;

    public TripManager() {
        trip = createSampleTrip();
    }

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

    public HousingBooking addHousingBooking(HousingBooking housing) {
        housing.setId(nextHousingId());
        trip.addHousingBooking(housing);

        return housing;
    }

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

    // ---------- Budget items ----------

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
}
