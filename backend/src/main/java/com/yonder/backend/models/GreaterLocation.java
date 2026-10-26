
package com.yonder.backend.models;

public class GreaterLocation {
    private int id;
    private String name;
    private String hexColor;
    private Double latitude;
    private Double longitude;

    public GreaterLocation() {
    }

    public GreaterLocation(
        int id,
        String name,
        String hexColor,
        Double latitude,
        Double longitude
    ) {
        this.id = id;
        this.name = name;
        this.hexColor = hexColor;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHexColor() { return hexColor; }
    public void setHexColor(String hexColor) { this.hexColor = hexColor; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
