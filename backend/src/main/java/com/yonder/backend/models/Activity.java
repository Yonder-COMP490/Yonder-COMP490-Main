package com.yonder.backend.models;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class Activity {
    private int id;

    private boolean active = true;
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

    // Backwards-compatible date getter for React.
    public LocalDate getDate() {
        if (fixedDate != null) {
            return fixedDate;
        }

        if (tripDay != null && tripStartDate != null) {
            return tripStartDate.plusDays(tripDay - 1L);
        }

        return null;
    }

    // Setting a date selects fixed-date scheduling.
    public void setDate(LocalDate date) {
        setFixedDate(date);
    }

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