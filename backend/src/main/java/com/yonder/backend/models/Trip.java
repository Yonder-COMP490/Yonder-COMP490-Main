
package com.yonder.backend.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Trip {
    private int id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String preferredCurrency;

    private List<Activity> activities;
    private List<HousingBooking> housingBookings;
    private Budget budget;

    public Trip() {
        this.preferredCurrency = "USD";
        this.activities = new ArrayList<>();
        this.housingBookings = new ArrayList<>();
        this.budget = new Budget();
    }

    public Trip(
        int id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String preferredCurrency
    ) {
        this();

        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.preferredCurrency = preferredCurrency;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    public List<HousingBooking> getHousingBookings() {
        return housingBookings;
    }

    public void setHousingBookings(List<HousingBooking> housingBookings) {
        this.housingBookings = housingBookings;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public void addActivity(Activity activity) {
        activities.add(activity);
    }

    public void removeActivity(int activityId) {
        activities.removeIf(activity -> activity.getId() == activityId);
    }

    public void addHousingBooking(HousingBooking housing) {
        housingBookings.add(housing);
    }

    public void removeHousingBooking(int housingId) {
        housingBookings.removeIf(housing -> housing.getId() == housingId);
    }
}
