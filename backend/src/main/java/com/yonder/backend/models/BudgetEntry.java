package com.yonder.backend.models;

// Temporary Object. Built when needed to be displayed then discarded
public class BudgetEntry {
    private String category;

    // Identifies the type of object that owns this expense.
    private String sourceType;

    // Identifies the specific source object.
    private int sourceId;

    private String name;
    private Cost unitCost;
    private int quantity;
    private String unit;
    private Cost totalCost;

    public BudgetEntry() {
    }

    public BudgetEntry(
        String category,
        String sourceType,
        int sourceId,
        String name,
        Cost unitCost,
        int quantity,
        String unit,
        Cost totalCost
    ) {
        this.category = category;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.name = name;
        this.unitCost = unitCost;
        this.quantity = quantity;
        this.unit = unit;
        this.totalCost = totalCost;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public int getSourceId() {
        return sourceId;
    }

    public void setSourceId(int sourceId) {
        this.sourceId = sourceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Cost getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(Cost unitCost) {
        this.unitCost = unitCost;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Cost getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Cost totalCost) {
        this.totalCost = totalCost;
    }
}