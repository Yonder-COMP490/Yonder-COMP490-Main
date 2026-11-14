package com.yonder.backend.models;

/**
 * Class name: PointOfInterest
 * Date: 10/28/2026
 * Programmer: Ryan Sommerhauser
 * Description: Represents a point of interest associated with a trip section.
 * Stores descriptive information, geographic location, and estimated cost for a place
 * the user may want to visit during their trip but is not a core part of the plan.
 */
public class PointOfInterest {
    private int id;
    private TripSection tripSection;

    private Description description;
    private Location location;
    private Cost cost;

    public PointOfInterest() {
        this.description = new Description();
        this.cost = new Cost();
        this.location = new Location();
    }

    public PointOfInterest(
        int id,
        Description description,
        TripSection tripSection,
        Cost cost,
        Location location
    ) {
        this.id = id;
        this.description = description != null ? description : new Description();
        this.tripSection = tripSection;
        this.cost = cost != null ? cost : new Cost();
        this.location = location != null ? location : new Location();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Description getDescription() {
        return description;
    }

    public void setDescription(Description description) {
        this.description = description != null ? description : new Description();
    }

    public TripSection getTripSection() {
        return tripSection;
    }

    public void setTripSection(TripSection tripSection) {
        this.tripSection = tripSection;
    }

    public Cost getCost() {
        return cost;
    }

    public void setCost(Cost cost) {
        this.cost = cost != null ? cost : new Cost();
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location != null ? location : new Location();
    }
}