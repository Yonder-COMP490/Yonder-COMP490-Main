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
    private List<BudgetItem> budgetItems;

    public Trip() {
        this.preferredCurrency = "USD";
        this.activities = new ArrayList<>();
        this.housingBookings = new ArrayList<>();
        this.budgetItems = new ArrayList<>();
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

    // ID

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    // Name

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Trip dates

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

    // Preferred currency

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }

    // Activities

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    public void addActivity(Activity activity) {
        activities.add(activity);
    }

    public void removeActivity(int activityId) {
        activities.removeIf(activity -> activity.getId() == activityId);
    }

    // Housing bookings

    public List<HousingBooking> getHousingBookings() {
        return housingBookings;
    }

    public void setHousingBookings(List<HousingBooking> housingBookings) {
        this.housingBookings = housingBookings;
    }

    public void addHousingBooking(HousingBooking housing) {
        housingBookings.add(housing);
    }

    public void removeHousingBooking(int housingId) {
        housingBookings.removeIf(housing -> housing.getId() == housingId);
    }

    // Budget items
    // These are created, edited, and deleted through the Budget page.

    public List<BudgetItem> getBudgetItems() {
        return budgetItems;
    }

    public void setBudgetItems(List<BudgetItem> budgetItems) {
        this.budgetItems = budgetItems;
    }

    public void addBudgetItem(BudgetItem item) {
        budgetItems.add(item);
    }

    public void removeBudgetItem(int budgetItemId) {
        budgetItems.removeIf(item -> item.getId() == budgetItemId);
    }
}