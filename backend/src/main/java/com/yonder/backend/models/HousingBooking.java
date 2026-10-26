
package com.yonder.backend.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class HousingBooking {
    private int id;
    private String name;
    private String picture;

    private boolean active = true;
    private Integer tripDay;
    private LocalDate fixedCheckInDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private int nights;

    private Cost costPerDay;
    private String notes;

    private String readableAddress;
    private Double latitude;
    private Double longitude;

    private transient LocalDate tripStartDate;

    public HousingBooking() {
        this.costPerDay = new Cost();
    }

    public HousingBooking(
        int id,
        String name,
        LocalDate checkInDate,
        LocalTime checkInTime,
        LocalDate checkOutDate,
        LocalTime checkOutTime,
        Cost costPerDay,
        String notes
    ) {
        this();
        this.id = id;
        this.name = name;
        this.fixedCheckInDate = checkInDate;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.costPerDay = costPerDay != null ? costPerDay : new Cost();
        this.notes = notes;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
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
        this.costPerDay = costPerDay;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReadableAddress() {
        return readableAddress;
    }

    public void setReadableAddress(String readableAddress) {
        this.readableAddress = readableAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Cost getTotalCost() {
        if (costPerDay == null) {
            return new Cost(0.0, "USD");
        }

        return costPerDay.multiply(nights);
    }
}
