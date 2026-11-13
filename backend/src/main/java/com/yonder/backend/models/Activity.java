package com.yonder.backend.models;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * Class name: Activity
 * Date: 10/11/2026
 * Programmer: Ryan Sommerhauser
 * Description: Represents an activity associated with a trip. Stores
 * descriptive information, location, cost, and start and end times.
 * Supports both fixed-date scheduling and scheduling based on a specific
 * trip day. Also tracks whether the activity is active in the itinerary.
 */
public class Activity {
    private int id;

    private boolean active = false;
    private Integer tripDay;
    private LocalDate fixedDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private Description description;
    private Location location;
    private Cost cost;

    private transient LocalDate tripStartDate;

    public Activity() {
        this.description = new Description();
        this.location = new Location();
        this.cost = new Cost();
    }

    public Activity(
        int id,
        Description description,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Cost cost,
        Location location
    ) {
        this();

        this.id = id;
        this.description = description != null ? description : new Description();
        this.fixedDate = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.cost = cost != null ? cost : new Cost();
        this.location = location != null ? location : new Location();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Description getDescription() {
        return description;
    }

    public void setDescription(Description description) {
        this.description = description != null ? description : new Description();
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location != null ? location : new Location();
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getTripDay() {
        return tripDay;
    }

    public void setTripDay(Integer tripDay) {
        this.tripDay = tripDay;

        if (tripDay != null) {
            this.fixedDate = null;
        }
    }

    /**
     * Switches the activity between fixed-date scheduling and trip-day
     * scheduling while preserving its current effective date. Calculates
     * the corresponding trip day when switching to trip-day scheduling.
     *
     * @param useFixedDate true to switch to fixed-date scheduling,
     * false to switch to trip-day scheduling
     * @param tripStartDate the starting date of the trip, required when
     * converting to trip-day scheduling
     * @throws IllegalStateException if the activity does not have an
     * existing effective date to preserve
     * @throws IllegalArgumentException if the trip start date is missing
     * when switching to trip-day scheduling
     */
    public void switchScheduleType(boolean useFixedDate, LocalDate tripStartDate) {
        // Already using the requested scheduling type.
        if (useFixedDate && fixedDate != null) {
            return;
        }

        if (!useFixedDate && tripDay != null) {
            return;
        }

        // Get the current effective date before clearing either field.
        LocalDate currentDate = fixedDate;

        if (currentDate == null && tripDay != null && tripStartDate != null) {
            currentDate = tripStartDate.plusDays(tripDay - 1L);
        }

        if (currentDate == null) {
            throw new IllegalStateException(
                "Cannot switch scheduling type without a date."
            );
        }

        if (useFixedDate) {
            this.fixedDate = currentDate;
            this.tripDay = null;
        } else {
            if (tripStartDate == null) {
                throw new IllegalArgumentException(
                    "Trip start date is required."
                );
            }

            this.tripDay = (int) ChronoUnit.DAYS.between(
                tripStartDate,
                currentDate
            ) + 1;

            this.fixedDate = null;
        }
    }

    public LocalDate getFixedDate() {
        return fixedDate;
    }

    public void setFixedDate(LocalDate fixedDate) {
        this.fixedDate = fixedDate;

        if (fixedDate != null) {
            this.tripDay = null;
        }
    }

    /**
     * Returns the activity's effective scheduled date. Uses the fixed date
     * when fixed-date scheduling is active, or calculates the date using
     * the trip start date and assigned trip day.
     *
     * @return the effective scheduled date, or null if the date cannot
     * be determined
     */
    public LocalDate getDate() {
        if (fixedDate != null) {
            return fixedDate;
        }

        if (tripDay != null && tripStartDate != null) {
            return tripStartDate.plusDays(tripDay - 1L);
        }

        return null;
    }

    /**
     * Sets the activity's scheduled date using fixed-date scheduling.
     *
     * @param date the fixed scheduled date
     */
    public void setDate(LocalDate date) {
        setFixedDate(date);
    }

    /**
     * Attaches the activity to its parent trip by supplying the trip's
     * starting date. This date is used to calculate the activity's
     * effective scheduled date when trip-day scheduling is active.
     *
     * @param tripStartDate the starting date of the trip
     */
    public void attachToTrip(LocalDate tripStartDate) {
        this.tripStartDate = tripStartDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    /**
     * Calculates the duration of the activity using its start and end times.
     * If the end time occurs before the start time, the activity is assumed
     * to continue into the following day.
     *
     * @return the activity duration, or null if either time is missing
     */
    public Duration getDuration() {
        if (startTime == null || endTime == null) {
            return null;
        }

        Duration duration = Duration.between(startTime, endTime);

        if (duration.isNegative()) {
            duration = duration.plusDays(1);
        }

        return duration;
    }

    public Cost getCost() {
        return cost;
    }

    public void setCost(Cost cost) {
        this.cost = cost != null ? cost : new Cost();
    }
}