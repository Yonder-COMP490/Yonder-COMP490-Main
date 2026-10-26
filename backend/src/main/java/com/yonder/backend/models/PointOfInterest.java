
package com.yonder.backend.models;

public class PointOfInterest {
    private int id;
    private String name;
    private String picture;
    private GreaterLocation greaterLocation;
    private Cost cost;
    private String notes;

    private String readableAddress;
    private Double latitude;
    private Double longitude;

    public PointOfInterest() {
        cost = new Cost();
    }

    public PointOfInterest(
        int id,
        String name,
        String picture,
        GreaterLocation greaterLocation,
        Cost cost,
        String notes,
        String readableAddress,
        Double latitude,
        Double longitude
    ) {
        this.id = id;
        this.name = name;
        this.picture = picture;
        this.greaterLocation = greaterLocation;
        this.cost = cost != null ? cost : new Cost();
        this.notes = notes;
        this.readableAddress = readableAddress;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }

    public GreaterLocation getGreaterLocation() {
        return greaterLocation;
    }

    public void setGreaterLocation(GreaterLocation greaterLocation) {
        this.greaterLocation = greaterLocation;
    }

    public Cost getCost() { return cost; }
    public void setCost(Cost cost) { this.cost = cost; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getReadableAddress() { return readableAddress; }

    public void setReadableAddress(String readableAddress) {
        this.readableAddress = readableAddress;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
