
package com.yonder.backend.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * Class name: HousingBooking
 * Date: 10/11/2026
 * Programmer: Ryan Sommerhauser
 * Description: Represents a housing reservation associated with a trip.
 * Stores booking details, check-in and check-out times, location, and daily
 * cost. Supports both fixed-date scheduling and scheduling based on an
 * assigned trip section. Calculates booking dates and total costs based
 * on the selected scheduling method.
 */
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
    /**
     * Assigns the booking to a trip section and switches its scheduling
     * method from a fixed check-in date to section-based scheduling.
     * Clears any previously calculated section schedule.
     *
     * @param tripSectionId the identifier of the assigned trip section,
     * or null to remove the section assignment
     */
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
    /**
     * Assigns a fixed check-in date and switches the booking from
     * section-based scheduling to fixed-date scheduling.
     * Clears any previously calculated section schedule.
     *
     * @param fixedCheckInDate the fixed check-in date, or null if not assigned
     */
    public void setFixedCheckInDate(LocalDate fixedCheckInDate) {
        this.fixedCheckInDate = fixedCheckInDate;

        if (fixedCheckInDate != null) {
            this.tripSectionId = null;
            clearSectionSchedule();
        }
    }

    /**
     * Returns the effective check-in date based on the booking's scheduling
     * method. Uses the assigned section's calculated date when section-based
     * scheduling is active.
     *
     * @return the calculated section check-in date or fixed check-in date,
     * depending on the scheduling method
     */
    public LocalDate getCheckInDate() {
        if (tripSectionId != null) {
            return sectionCheckInDate;
        }

        return fixedCheckInDate;
    }

    public void setCheckInDate(LocalDate date) {
        setFixedCheckInDate(date);
    }

    /**
     * Calculates the check-out date by adding the booking duration to
     * its effective check-in date.
     *
     * @return the calculated check-out date, or null if no check-in date
     * is available
     */
    public LocalDate getCheckOutDate() {
        LocalDate checkInDate = getCheckInDate();

        if (checkInDate == null) {
            return null;
        }

        return checkInDate.plusDays(getNights());
    }

    /**
     * Updates the number of nights based on the difference between the
     * check-in and check-out dates. Does not modify section-based bookings,
     * since their duration is determined by the assigned trip section.
     *
     * @param checkOutDate the desired check-out date
     * @throws IllegalArgumentException if the check-out date precedes
     * the check-in date or the calculated duration exceeds the integer range
     */
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

    /**
     * Returns the booking duration based on its scheduling method.
     * Section-based bookings use the assigned section's duration, while
     * fixed-date bookings use their individually stored number of nights.
     *
     * @return the number of nights for the booking
     */
    public int getNights() {
        if (tripSectionId != null) {
            return sectionNights != null ? sectionNights : 0;
        }

        return nights;
    }

    /**
     * Updates the number of nights for a fixed-date booking.
     * Section-based bookings retain the duration of their assigned section.
     *
     * @param nights the number of nights for the booking
     * @throws IllegalArgumentException if the number of nights is negative
     */
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
     * Attaches the booking to its assigned trip section by supplying the
     * section's current check-in date and duration. Called by Trip when
     * trip section schedules are refreshed.
     *
     * @param sectionCheckInDate the calculated starting date of the section
     * @param sectionDays the duration of the section in days
     * @throws IllegalArgumentException if the section duration is negative
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

    /**
     * Clears the calculated section check-in date and duration.
     * Used when switching to fixed-date scheduling or removing a
     * section assignment.
     */
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

    /**
     * Calculates the total booking cost by multiplying the daily cost
     * by the effective number of nights.
     *
     * @return the calculated total cost, or zero USD if the daily cost
     * has not been initialized
     */
    public Cost getTotalCost() {
        if (costPerDay == null) {
            return new Cost(0.0, "USD");
        }

        return costPerDay.multiply(getNights());
    }
}
