package com.yonder.backend.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class HousingBooking {
    private int id;

    private boolean active = true;
    private Integer tripDay;
    private LocalDate fixedCheckInDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private int nights;

    private Description description;
    private Location location;
    private Cost costPerDay;

    private transient LocalDate tripStartDate;

    public HousingBooking() {
        this.description = new Description();
        this.location = new Location();
        this.costPerDay = new Cost();
    }

    public HousingBooking(
        int id,
        Description description,
        LocalDate checkInDate,
        LocalTime checkInTime,
        LocalDate checkOutDate,
        LocalTime checkOutTime,
        Cost costPerDay,
        Location location
    ) {
        this();

        this.id = id;
        this.description = description != null ? description : new Description();
        this.fixedCheckInDate = checkInDate;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.costPerDay = costPerDay != null ? costPerDay : new Cost();
        this.location = location != null ? location : new Location();

        if (checkInDate != null && checkOutDate != null) {
            this.nights = Math.max(
                0,
                (int) ChronoUnit.DAYS.between(checkInDate, checkOutDate)
            );
        }
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
            this.fixedCheckInDate = null;
        }
    }

    public LocalDate getFixedCheckInDate() {
        return fixedCheckInDate;
    }

    public void setFixedCheckInDate(LocalDate date) {
        this.fixedCheckInDate = date;

        if (date != null) {
            this.tripDay = null;
        }
    }

    public LocalDate getCheckInDate() {
        if (fixedCheckInDate != null) {
            return fixedCheckInDate;
        }

        if (tripDay != null && tripStartDate != null) {
            return tripStartDate.plusDays(tripDay - 1L);
        }

        return null;
    }

    public void setCheckInDate(LocalDate date) {
        setFixedCheckInDate(date);
    }

    public void attachToTrip(LocalDate tripStartDate) {
        this.tripStartDate = tripStartDate;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDate getCheckOutDate() {
        LocalDate checkIn = getCheckInDate();

        if (checkIn == null) {
            return null;
        }

        return checkIn.plusDays(nights);
    }

    // Compatibility with existing React requests.
    public void setCheckOutDate(LocalDate checkOutDate) {
        LocalDate checkIn = getCheckInDate();

        if (checkIn != null && checkOutDate != null) {
            long calculatedNights =
                ChronoUnit.DAYS.between(checkIn, checkOutDate);

            if (calculatedNights < 0 || calculatedNights > Integer.MAX_VALUE) {
                throw new IllegalArgumentException(
                    "Check-out date must not precede check-in date."
                );
            }

            this.nights = (int) calculatedNights;
        }
    }

    public int getNights() {
        return nights;
    }

    public void setNights(int nights) {
        if (nights < 0) {
            throw new IllegalArgumentException(
                "Number of nights cannot be negative."
            );
        }

        this.nights = nights;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Cost getCostPerDay() {
        return costPerDay;
    }

    public void setCostPerDay(Cost costPerDay) {
        this.costPerDay = costPerDay != null ? costPerDay : new Cost();
    }

    public Cost getTotalCost() {
        if (costPerDay == null) {
            return new Cost(0.0, "USD");
        }

        return costPerDay.multiply(nights);
    }
}