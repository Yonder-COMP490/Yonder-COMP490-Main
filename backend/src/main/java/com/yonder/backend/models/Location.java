package com.yonder.backend.models;

public class Location {
    private String readableAddress;
    private Double latitude;
    private Double longitude;

    public Location() {
    }

    public Location(String readableAddress, Double latitude, Double longitude) {
        this.readableAddress = readableAddress;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getReadableAddress() {
        return readableAddress;
    }

    public void setReadableAddress(String readableAddress) {
        this.readableAddress = readableAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}