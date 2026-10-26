
package com.yonder.backend.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public class HousingBooking {
    private int id;
    private String name;
    private LocalDate checkInDate;
    private LocalTime checkInTime;
    private LocalDate checkOutDate;
    private LocalTime checkOutTime;
    private Cost costPerDay;
    private String notes;

    // private int id;
    // private String name;
    // private String picture;
    // private GreaterLocation greaterLocation;
    // private bool active; <- this means it is placed into the trip
    // private int tripDay; <- relative to trip start date. If not null checkInDate should be
    // private LocalDate checkInDate; <- if not null tripDay should be
    // The above 2 should use the same getter
    // public bool booked() => checkInDate != null;
    // private LocalTime checkInTime;
    // private LocalTime checkOutTime;
    // private int days; <- should store days and compute end date now
    // public LocalDate checkOutDate() => checkInDate + days;
    // private Cost costPerDay;
    // private String notes;
    
    // Optional geographic coordinates for map markers
    // private String readableAddress;
    // private Double latitude;
    // private Double longitude;

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
        this.id = id;
        this.name = name;
        this.checkInDate = checkInDate;
        this.checkInTime = checkInTime;
        this.checkOutDate = checkOutDate;
        this.checkOutTime = checkOutTime;
        this.costPerDay = costPerDay;
        this.notes = notes;
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

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
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

    public int getNumberOfNights() {
        if (checkInDate == null || checkOutDate == null) {
            return 0;
        }

        return (int) ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    }

    public Cost getTotalCost() {
        if (costPerDay == null) {
            return new Cost(0.0, "USD");
        }

        return costPerDay.multiply(getNumberOfNights());
    }
}
    