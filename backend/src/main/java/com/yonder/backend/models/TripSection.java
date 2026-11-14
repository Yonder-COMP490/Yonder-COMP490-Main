
package com.yonder.backend.models;

/**
 * Class name: TripSection
 * Date: 11/8/2026
 * Programmer: Ryan Sommerhauser
 * Description: Represents a section of a trip with a name, duration, display
 * color, and optional geographic coordinates. Used to organize a trip into
 * separate sections based on location or itinerary.
 */
public class TripSection {
    private int id;
    private String name;
    private int days;
    private String hexColor;
    private Double latitude;
    private Double longitude;

    public TripSection() {
    }

    public TripSection(
        int id,
        String name,
        int days,
        String hexColor,
        Double latitude,
        Double longitude
    ) {
        this.id = id;
        this.name = name;
        this.days = days;
        this.hexColor = hexColor;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public String getHexColor() { return hexColor; }
    public void setHexColor(String hexColor) { this.hexColor = hexColor; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
