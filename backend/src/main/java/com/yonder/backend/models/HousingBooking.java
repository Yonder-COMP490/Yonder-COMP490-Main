
package com.yonder.backend.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class HousingBooking {
    private int id;

    private boolean active = true;
    private LocalDate fixedCheckInDate;
    private Integer tripSectionId;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private int nights;

    private Description description;
    private Location location;
    private Cost costPerDay;

    // Calculated by Trip from the assigned TripSection.
    // These values are not persisted.
    private transient LocalDate sectionCheckInDate;
    private transient Integer sectionNights;

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
            long calculatedNights =
                ChronoUnit.DAYS.between(checkInDate, checkOutDate);

            if (calculatedNights < 0 || calculatedNights > Integer.MAX_VALUE) {
                throw new IllegalArgumentException(
                    "Check-out date must not precede check-in date."
                );
            }

            this.nights = (int) calculatedNights;
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

    // -------------------------
    // Scheduling
    // -------------------------

    public Integer getTripSectionId() {
        return tripSectionId;
    }

    public void setTripSectionId(Integer tripSectionId) {
        this.tripSectionId = tripSectionId;

        if (tripSectionId != null) {
            this.fixedCheckInDate = null;
            clearSectionSchedule();
        }
    }

    public LocalDate getFixedCheckInDate() {
        return fixedCheckInDate;
    }

    public void setFixedCheckInDate(LocalDate fixedCheckInDate) {
        this.fixedCheckInDate = fixedCheckInDate;

        if (fixedCheckInDate != null) {
            this.tripSectionId = null;
            clearSectionSchedule();
        }
    }

    public LocalDate getCheckInDate() {
        if (tripSectionId != null) {
            return sectionCheckInDate;
        }

        return fixedCheckInDate;
    }

    public void setCheckInDate(LocalDate date) {
        setFixedCheckInDate(date);
    }

    public LocalDate getCheckOutDate() {
        LocalDate checkInDate = getCheckInDate();

        if (checkInDate == null) {
            return null;
        }

        return checkInDate.plusDays(getNights());
    }

    // Compatibility with existing React requests.
    // Section-based bookings always use their section's duration.
    public void setCheckOutDate(LocalDate checkOutDate) {
        if (tripSectionId != null) {
            return;
        }

        LocalDate checkInDate = getCheckInDate();

        if (checkInDate != null && checkOutDate != null) {
            long calculatedNights =
                ChronoUnit.DAYS.between(checkInDate, checkOutDate);

            if (calculatedNights < 0 || calculatedNights > Integer.MAX_VALUE) {
                throw new IllegalArgumentException(
                    "Check-out date must not precede check-in date."
                );
            }

            this.nights = (int) calculatedNights;
        }
    }

    public int getNights() {
        if (tripSectionId != null) {
            return sectionNights != null ? sectionNights : 0;
        }

        return nights;
    }

    public void setNights(int nights) {
        if (nights < 0) {
            throw new IllegalArgumentException(
                "Number of nights cannot be negative."
            );
        }

        // Only fixed-date bookings store their own nights.
        if (tripSectionId == null) {
            this.nights = nights;
        }
    }

    /**
     * Called by Trip to provide the current schedule of this booking's section.
     */
    public void attachToTrip(LocalDate sectionCheckInDate, int sectionDays) {
        if (tripSectionId == null) {
            clearSectionSchedule();
            return;
        }

        if (sectionDays < 0) {
            throw new IllegalArgumentException(
                "Section duration cannot be negative."
            );
        }

        this.sectionCheckInDate = sectionCheckInDate;
        this.sectionNights = sectionDays;
    }

    private void clearSectionSchedule() {
        this.sectionCheckInDate = null;
        this.sectionNights = null;
    }

    // -------------------------
    // Times
    // -------------------------

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    // -------------------------
    // Cost
    // -------------------------

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

        return costPerDay.multiply(getNights());
    }
}
