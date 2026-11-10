
package com.yonder.backend.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Trip {
    private int id;
    private String name;
    private LocalDate startDate;
    private int days;
    private String preferredCurrency;

    //private List<Transportation> transportation; (future)
    // TripSection is a new addition
    private List<TripSection> tripSections;
    private List<Activity> activities;
    private List<HousingBooking> housingBookings;
    private List<BudgetItem> budgetItems;
    private List<PointOfInterest> pointsOfInterest;

    public Trip() {
        preferredCurrency = "USD";
        days = 1;

        tripSections = new ArrayList<>();
        activities = new ArrayList<>();
        housingBookings = new ArrayList<>();
        budgetItems = new ArrayList<>();
        pointsOfInterest = new ArrayList<>();

        tripSections.add(createDefaultSection(1));
    }

    public Trip(
        int id,
        String name,
        LocalDate startDate,
        int days,
        String preferredCurrency
    ) {
        this();
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        setDays(days);

        if (preferredCurrency != null) {
            this.preferredCurrency = preferredCurrency;
        }
    }

    // ---------- Basic trip fields ----------

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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
        refreshScheduledDates();
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        if (days < 1) {
            throw new IllegalArgumentException(
                "A trip must be at least one day long."
            );
        }

        this.days = days;
        normalizeTripSections();
    }

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        if (preferredCurrency != null) {
            this.preferredCurrency = preferredCurrency;
        }
    }

    // ---------- Trip sections ----------

    public List<TripSection> getTripSections() {
        return tripSections;
    }

    public void setTripSections(List<TripSection> tripSections) {
        this.tripSections = tripSections != null
            ? new ArrayList<>(tripSections)
            : new ArrayList<>();

        normalizeTripSections();
    }

    /**
     * Splits the section with the most days into two sections.
     * The new section is inserted immediately after the section
     * that was split.
     */
    public TripSection addTripSection() {
        if (tripSections.size() >= days) {
            throw new IllegalStateException(
                "There must be at least one day per section."
            );
        }

        int longestIndex = 0;

        for (int i = 1; i < tripSections.size(); i++) {
            if (tripSections.get(i).getDays()
                > tripSections.get(longestIndex).getDays()) {
                longestIndex = i;
            }
        }

        TripSection original = tripSections.get(longestIndex);

        if (original.getDays() < 2) {
            throw new IllegalStateException(
                "There are no sections with enough days to split."
            );
        }

        int firstHalf = original.getDays() / 2;
        int secondHalf = original.getDays() - firstHalf;

        original.setDays(firstHalf);

        TripSection newSection = new TripSection(
            nextTripSectionId(),
            "Section " + (tripSections.size() + 1),
            secondHalf,
            "#6C8EBF",
            null,
            null
        );

        tripSections.add(longestIndex + 1, newSection);

        return newSection;
    }

    /**
     * Removes a section and transfers its days to an adjacent section.
     * The previous section is preferred; if this is the first section,
     * its days are transferred to the next section.
     */
    public void removeTripSection(int tripSectionId) {
        if (tripSections.size() <= 1) {
            return;
        }

        for (int i = 0; i < tripSections.size(); i++) {
            TripSection section = tripSections.get(i);

            if (section.getId() == tripSectionId) {
                int recipientIndex = i > 0 ? i - 1 : i + 1;

                TripSection recipient = tripSections.get(recipientIndex);
                recipient.setDays(
                    recipient.getDays() + section.getDays()
                );

                tripSections.remove(i);
                return;
            }
        }
    }

    /**
     * Keeps the section day counts equal to the trip duration.
     * Extra days are added to the last section. If days are removed,
     * they are taken from the last sections first.
     */
    private void normalizeTripSections() {
        if (tripSections == null) {
            tripSections = new ArrayList<>();
        }

        tripSections.removeIf(section -> section == null);

        if (tripSections.isEmpty()) {
            tripSections.add(createDefaultSection(days));
            return;
        }

        if (tripSections.size() > days) {
            throw new IllegalArgumentException(
                "A trip cannot have more sections than days."
            );
        }

        for (TripSection section : tripSections) {
            if (section.getDays() < 1) {
                section.setDays(1);
            }
        }

        int totalSectionDays = tripSections.stream()
            .mapToInt(TripSection::getDays)
            .sum();

        int difference = days - totalSectionDays;

        if (difference > 0) {
            TripSection lastSection =
                tripSections.get(tripSections.size() - 1);

            lastSection.setDays(lastSection.getDays() + difference);
        } else if (difference < 0) {
            int daysToRemove = -difference;

            for (int i = tripSections.size() - 1; i >= 0; i--) {
                TripSection section = tripSections.get(i);

                int removableDays = section.getDays() - 1;
                int removal = Math.min(removableDays, daysToRemove);

                section.setDays(section.getDays() - removal);
                daysToRemove -= removal;

                if (daysToRemove == 0) {
                    break;
                }
            }
        }
    }

    private TripSection createDefaultSection(int sectionDays) {
        return new TripSection(
            1,
            "Section 1",
            sectionDays,
            "#6C8EBF",
            null,
            null
        );
    }

    private int nextTripSectionId() {
        return tripSections.stream()
            .mapToInt(TripSection::getId)
            .max()
            .orElse(0) + 1;
    }

    public void setDaysAndTripSections(int days, List<TripSection> tripSections) {
        if (days < 1) {
            throw new IllegalArgumentException(
                "A trip must be at least one day long."
            );
        }

        this.days = days;
        this.tripSections = tripSections != null
            ? new ArrayList<>(tripSections)
            : new ArrayList<>();

        normalizeTripSections();
    }
    // ---------- Activities ----------

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities != null
            ? activities : new ArrayList<>();
        refreshScheduledDates();
    }

    public void addActivity(Activity activity) {
        if (activity != null) {
            activities.add(activity);
            activity.attachToTrip(startDate);
        }
    }

    public void removeActivity(int activityId) {
        activities.removeIf(activity -> activity.getId() == activityId);
    }

    // ---------- Housing bookings ----------

    public List<HousingBooking> getHousingBookings() {
        return housingBookings;
    }

    public void setHousingBookings(List<HousingBooking> housingBookings) {
        this.housingBookings = housingBookings != null
            ? housingBookings : new ArrayList<>();
        refreshScheduledDates();
    }

    public void addHousingBooking(HousingBooking housing) {
        if (housing != null) {
            housingBookings.add(housing);
            housing.attachToTrip(startDate);
        }
    }

    public void removeHousingBooking(int housingId) {
        housingBookings.removeIf(housing -> housing.getId() == housingId);
    }

    // ---------- Budget items ----------

    public List<BudgetItem> getBudgetItems() {
        return budgetItems;
    }

    public void setBudgetItems(List<BudgetItem> budgetItems) {
        this.budgetItems = budgetItems != null
            ? budgetItems : new ArrayList<>();
    }

    public void addBudgetItem(BudgetItem item) {
        if (item != null) {
            budgetItems.add(item);
        }
    }

    public void removeBudgetItem(int budgetItemId) {
        budgetItems.removeIf(item -> item.getId() == budgetItemId);
    }

    // ---------- Points of interest ----------

    public List<PointOfInterest> getPointsOfInterest() {
        return pointsOfInterest;
    }

    public void setPointsOfInterest(List<PointOfInterest> pointsOfInterest) {
        this.pointsOfInterest = pointsOfInterest != null
            ? pointsOfInterest : new ArrayList<>();
    }

    public void addPointOfInterest(PointOfInterest point) {
        if (point != null) {
            pointsOfInterest.add(point);
        }
    }

    public void removePointOfInterest(int pointId) {
        pointsOfInterest.removeIf(point -> point.getId() == pointId);
    }

    // ---------- Date synchronization ----------

    private void refreshScheduledDates() {
        if (activities != null) {
            activities.forEach(
                activity -> activity.attachToTrip(startDate)
            );
        }

        if (housingBookings != null) {
            housingBookings.forEach(
                housing -> housing.attachToTrip(startDate)
            );
        }
    }
}
