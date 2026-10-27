
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

    //private List<Transportation> transportation; 
    private List<Activity> activities;
    private List<HousingBooking> housingBookings;
    private List<BudgetItem> budgetItems;
    private List<PointOfInterest> pointsOfInterest;

    public Trip() {
        preferredCurrency = "USD";
        activities = new ArrayList<>();
        housingBookings = new ArrayList<>();
        budgetItems = new ArrayList<>();
        pointsOfInterest = new ArrayList<>();
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

        if (preferredCurrency != null) {
            this.preferredCurrency = preferredCurrency;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
        refreshScheduledDates();
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
        this.activities = activities != null
            ? activities : new ArrayList<>();
        refreshScheduledDates();
    }

    public void addActivity(Activity activity) {
        if (activity != null) {
            activities.add(activity);
            activity.attachToTrip(startDate);
        }
    }

    public void removeActivity(int activityId) {
        activities.removeIf(activity -> activity.getId() == activityId);
    }

    public List<HousingBooking> getHousingBookings() {
        return housingBookings;
    }

    public void setHousingBookings(List<HousingBooking> housingBookings) {
        this.housingBookings = housingBookings != null
            ? housingBookings : new ArrayList<>();
        refreshScheduledDates();
    }

    public void addHousingBooking(HousingBooking housing) {
        if (housing != null) {
            housingBookings.add(housing);
            housing.attachToTrip(startDate);
        }
    }

    public void removeHousingBooking(int housingId) {
        housingBookings.removeIf(housing -> housing.getId() == housingId);
    }

    public List<BudgetItem> getBudgetItems() {
        return budgetItems;
    }

    public void setBudgetItems(List<BudgetItem> budgetItems) {
        this.budgetItems = budgetItems != null
            ? budgetItems : new ArrayList<>();
    }

    public void addBudgetItem(BudgetItem item) {
        if (item != null) {
            budgetItems.add(item);
        }
    }

    public void removeBudgetItem(int budgetItemId) {
        budgetItems.removeIf(item -> item.getId() == budgetItemId);
    }

    public List<PointOfInterest> getPointsOfInterest() {
        return pointsOfInterest;
    }

    public void setPointsOfInterest(List<PointOfInterest> pointsOfInterest) {
        this.pointsOfInterest = pointsOfInterest != null
            ? pointsOfInterest : new ArrayList<>();
    }

    public void addPointOfInterest(PointOfInterest point) {
        if (point != null) {
            pointsOfInterest.add(point);
        }
    }

    public void removePointOfInterest(int pointId) {
        pointsOfInterest.removeIf(point -> point.getId() == pointId);
    }

    private void refreshScheduledDates() {
        if (activities != null) {
            activities.forEach(
                activity -> activity.attachToTrip(startDate)
            );
        }

        if (housingBookings != null) {
            housingBookings.forEach(
                housing -> housing.attachToTrip(startDate)
            );
        }
    }
}
