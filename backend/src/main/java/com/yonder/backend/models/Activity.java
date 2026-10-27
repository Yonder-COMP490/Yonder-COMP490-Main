
package com.yonder.backend.models;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

public class Activity {
    private int id;
    private String name;
    private String picture;

    private boolean active = true;
    private Integer tripDay;
    private LocalDate fixedDate;

    private LocalTime startTime;
    private LocalTime endTime;
    private Cost cost;
    private String notes;
    private String readableAddress;
    private Double latitude;
    private Double longitude;

    private transient LocalDate tripStartDate;

    public Activity() {
        this.cost = new Cost();
    }

    public Activity(
        int id,
        String name,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Cost cost,
        String notes
    ) {
        this();
        this.id = id;
        this.name = name;
        this.fixedDate = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.cost = cost != null ? cost : new Cost();
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
        this.cost = cost;
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
}
