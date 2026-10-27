package com.yonder.backend.models;

import java.util.ArrayList;
import java.util.List;

// Temporary Object. Built when needed to be displayed then discarded
public class BudgetSummary {
    private Cost activityTotal;
    private Cost housingTotal;
    private Cost travelTotal;
    private Cost dailyTotal;
    private Cost totalCost;

    private List<BudgetEntry> entries;

    public BudgetSummary() {
        this.activityTotal = new Cost();
        this.housingTotal = new Cost();
        this.travelTotal = new Cost();
        this.dailyTotal = new Cost();
        this.totalCost = new Cost();

        this.entries = new ArrayList<>();
    }

    public Cost getActivityTotal() {
        return activityTotal;
    }

    public void setActivityTotal(Cost activityTotal) {
        this.activityTotal = activityTotal;
    }

    public Cost getHousingTotal() {
        return housingTotal;
    }

    public void setHousingTotal(Cost housingTotal) {
        this.housingTotal = housingTotal;
    }

    public Cost getTravelTotal() {
        return travelTotal;
    }

    public void setTravelTotal(Cost travelTotal) {
        this.travelTotal = travelTotal;
    }

    public Cost getDailyTotal() {
        return dailyTotal;
    }

    public void setDailyTotal(Cost dailyTotal) {
        this.dailyTotal = dailyTotal;
    }

    public Cost getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Cost totalCost) {
        this.totalCost = totalCost;
    }

    public List<BudgetEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<BudgetEntry> entries) {
        this.entries = entries;
    }
}