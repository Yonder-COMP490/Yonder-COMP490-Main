package com.yonder.backend.models;

public class Categorie {
    private Long userId;
    private int museums;
    private int restaurants;
    private int beaches;
    private int parks;
    private int malls; 

    public Categorie() {
    }

    public Categorie(Long userId, int museums, int restaurants, int beaches,int parks, int malls ) {
        this.userId = userId;
        this.museums = museums;
        this.restaurants = restaurants;
        this.beaches = beaches;
        this.parks = parks;
        this.malls = malls;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getMuseums() {
        return museums;
    }

    public void setMuseums(int museums) {
        this.museums = museums;
    }

    public int getRestaurants(){
        return restaurants;
    }

    public void setRestaurants(int restaurants){
        this.restaurants = restaurants;
    }
    
    public int getBeaches(){
        return beaches;
    }

    public void setBeaches(int beaches){
        this.beaches = beaches;
    }

    public int getParks(){
        return parks;
    }

    public void setParks(int parks){
        this.parks = parks;
    }
    
    public int getMalls(){
        return malls;
    }

    public void setMalls(int malls) {
        this.malls = malls;
    }
}
