package com.yonder.backend.models;

public class Description {
    private String name;
    private String description;
    private String notes;
    private String picture;

    public Description() {
    }

    public Description(String name, String description, String notes, String picture) {
        this.name = name;
        this.description = description;
        this.notes = notes;
        this.picture = picture;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }
}