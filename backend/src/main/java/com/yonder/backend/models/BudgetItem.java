package com.yonder.backend.models;

public class BudgetItem {
    private int id;
    private String name;
    private Cost cost;
    private int days;

    public BudgetItem() {
        this.cost = new Cost();
    }

    public BudgetItem(int id, String name, Cost cost, int days) {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.days = days;
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

    public Cost getCost() {
        return cost;
    }

    public void setCost(Cost cost) {
        this.cost = cost;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public Cost getTotalCost() {
        if (cost == null) {
            return new Cost(0.0, "USD");
        }

        return cost.multiply(days);
    }
}