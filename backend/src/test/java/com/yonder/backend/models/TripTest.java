
package com.yonder.backend.models;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class TripTest {

    // ==========================================
    // CONSTRUCTOR TESTS
    // ==========================================

    // Tests that the default constructor initializes a trip with 1 day,
    // USD currency, an empty location, 1 traveler, a $0 budget,
    // and initialized lists containing one default trip section.
    @Test
    void constructor_DefaultTrip_InitializesCorrectly() {
        // Arrange and Act
        Trip trip = new Trip();

        // Assert
        assertEquals(1, trip.getDays());
        assertEquals("USD", trip.getPreferredCurrency());
        assertEquals("", trip.getLocation());
        assertEquals(1, trip.getNumberOfTravelers());
        assertEquals(0.0, trip.getTargetBudget());

        assertNotNull(trip.getTripSections());
        assertNotNull(trip.getActivities());
        assertNotNull(trip.getHousingBookings());
        assertNotNull(trip.getBudgetItems());
        assertNotNull(trip.getPointsOfInterest());

        assertEquals(1, trip.getTripSections().size());
    }

    // Tests that the parameterized constructor correctly assigns
    // ID 1, name "Japan Trip", start date April 1, 2027,
    // duration of 10 days, and preferred currency JPY.
    @Test
    void constructor_WithParameters_InitializesCorrectly() {
        // Arrange
        LocalDate startDate = LocalDate.of(2027, 4, 1);

        // Act
        Trip trip = new Trip(
            1,
            "Japan Trip",
            startDate,
            10,
            "JPY"
        );

        // Assert
        assertEquals(1, trip.getId());
        assertEquals("Japan Trip", trip.getName());
        assertEquals(startDate, trip.getStartDate());
        assertEquals(10, trip.getDays());
        assertEquals("JPY", trip.getPreferredCurrency());

        assertEquals(10, trip.getTripSections().get(0).getDays());
    }


    // ==========================================
    // BASIC FIELD TESTS
    // ==========================================

    // Tests that setting the trip start date to April 1, 2027
    // correctly updates the date returned by getStartDate().
    @Test
    void setStartDate_UpdatesStartDate() {
        // Arrange
        Trip trip = new Trip();

        LocalDate expected = LocalDate.of(2027, 4, 1);

        // Act
        trip.setStartDate(expected);

        // Assert
        assertEquals(expected, trip.getStartDate());
    }

    // Tests that changing the trip duration from 1 day to 5 days
    // also updates the duration of the default trip section to 5 days.
    @Test
    void setDays_UpdatesTripDuration() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setDays(5);

        // Assert
        assertEquals(5, trip.getDays());
        assertEquals(5, trip.getTripSections().get(0).getDays());
    }

    // Tests that setting the trip duration to 0 is rejected
    // because a trip must have at least 1 day.
    @Test
    void setDays_InvalidDuration_ThrowsException() {
        // Arrange
        Trip trip = new Trip();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setDays(0)
        );
    }

    // Tests that changing the preferred currency from USD to EUR
    // correctly updates the trip's preferred currency.
    @Test
    void setPreferredCurrency_UpdatesCurrency() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setPreferredCurrency("EUR");

        // Assert
        assertEquals("EUR", trip.getPreferredCurrency());
    }

    // Tests that assigning null as the preferred currency
    // does not overwrite the existing default currency of USD.
    @Test
    void setPreferredCurrency_NullValue_KeepsExistingCurrency() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setPreferredCurrency(null);

        // Assert
        assertEquals("USD", trip.getPreferredCurrency());
    }

    // Tests that leading and trailing whitespace are removed
    // when setting the trip location to "  Japan  ".
    @Test
    void setLocation_TrimsWhitespace() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setLocation("  Japan  ");

        // Assert
        assertEquals("Japan", trip.getLocation());
    }

    // Tests that assigning null as the trip location
    // replaces the location with an empty string.
    @Test
    void setLocation_NullValue_SetsEmptyString() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setLocation(null);

        // Assert
        assertEquals("", trip.getLocation());
    }

    // Tests that setting the number of travelers to 4
    // correctly updates the trip's traveler count.
    @Test
    void setNumberOfTravelers_ValidValue_UpdatesTravelers() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setNumberOfTravelers(4);

        // Assert
        assertEquals(4, trip.getNumberOfTravelers());
    }

    // Tests that setting the number of travelers to 0 is rejected
    // because a trip must have at least 1 traveler.
    @Test
    void setNumberOfTravelers_InvalidValue_ThrowsException() {
        // Arrange
        Trip trip = new Trip();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setNumberOfTravelers(0)
        );
    }

    // Tests that setting the target budget to 2500.50
    // correctly updates the trip's target budget.
    @Test
    void setTargetBudget_ValidValue_UpdatesBudget() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setTargetBudget(2500.50);

        // Assert
        assertEquals(2500.50, trip.getTargetBudget());
    }

    // Tests that setting a negative target budget of -100
    // is rejected because the target budget cannot be negative.
    @Test
    void setTargetBudget_NegativeValue_ThrowsException() {
        // Arrange
        Trip trip = new Trip();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setTargetBudget(-100)
        );
    }

    // Tests that non-finite target budgets, including NaN
    // and positive infinity, are rejected.
    @Test
    void setTargetBudget_NonFiniteValue_ThrowsException() {
        // Arrange
        Trip trip = new Trip();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setTargetBudget(Double.NaN)
        );

        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setTargetBudget(Double.POSITIVE_INFINITY)
        );
    }


    // ==========================================
    // TRIP SECTION TESTS
    // ==========================================

    // Tests that adding a section to a 5-day trip splits its longest
    // section into 2 and 3 days, creating 2 sections while preserving
    // the total trip duration of 5 days.
    @Test
    void addTripSection_SplitsLongestSection() {
        // Arrange
        Trip trip = new Trip();
        trip.setDays(5);

        // Act
        TripSection newSection = trip.addTripSection();

        // Assert
        assertEquals(2, trip.getTripSections().size());
        assertEquals(2, trip.getTripSections().get(0).getDays());
        assertEquals(3, newSection.getDays());
        assertEquals(5, totalSectionDays(trip));
    }

    // Tests that adding another section to a 2-day trip is rejected
    // after it already has 2 sections, since each section must
    // contain at least 1 day.
    @Test
    void addTripSection_OneSectionPerDay_ThrowsException() {
        // Arrange
        Trip trip = new Trip();
        trip.setDays(2);

        trip.addTripSection();

        // Act and Assert
        assertThrows(
            IllegalStateException.class,
            () -> trip.addTripSection()
        );
    }

    // Tests that removing the first section from a 5-day trip
    // transfers its days to the adjacent section, leaving one section
    // that still accounts for all 5 trip days.
    @Test
    void removeTripSection_RemovesSectionAndTransfersDays() {
        // Arrange
        Trip trip = new Trip();
        trip.setDays(5);

        TripSection removedSection = trip.getTripSections().get(0);
        trip.addTripSection();

        int expectedTotalDays = 5;

        // Act
        trip.removeTripSection(removedSection.getId());

        // Assert
        assertEquals(1, trip.getTripSections().size());
        assertEquals(expectedTotalDays, totalSectionDays(trip));
    }

    // Tests that attempting to remove the only section from a trip
    // leaves that section in place because a trip must have at least
    // one section.
    @Test
    void removeTripSection_LastRemainingSection_KeepsSection() {
        // Arrange
        Trip trip = new Trip();

        int sectionId = trip.getTripSections().get(0).getId();

        // Act
        trip.removeTripSection(sectionId);

        // Assert
        assertEquals(1, trip.getTripSections().size());
    }

    // Tests that assigning null to the section list of a 4-day trip
    // creates one default section containing all 4 days.
    @Test
    void setTripSections_NullValue_CreatesDefaultSection() {
        // Arrange
        Trip trip = new Trip();
        trip.setDays(4);

        // Act
        trip.setTripSections(null);

        // Assert
        assertEquals(1, trip.getTripSections().size());
        assertEquals(4, trip.getTripSections().get(0).getDays());
    }

    // Tests that setting a 5-day trip with two sections containing
    // 2 and 3 days correctly stores both sections and preserves
    // the total duration of 5 days.
    @Test
    void setDaysAndTripSections_UpdatesBothValues() {
        // Arrange
        Trip trip = new Trip();

        List<TripSection> sections = new ArrayList<>();
        sections.add(new TripSection(
            1, "Section 1", 2, "#6C8EBF", null, null
        ));
        sections.add(new TripSection(
            2, "Section 2", 3, "#6C8EBF", null, null
        ));

        // Act
        trip.setDaysAndTripSections(5, sections);

        // Assert
        assertEquals(5, trip.getDays());
        assertEquals(2, trip.getTripSections().size());
        assertEquals(5, totalSectionDays(trip));
    }

    // Tests that attempting to set a trip duration of 0 through
    // setDaysAndTripSections() throws an exception because
    // a trip must contain at least 1 day.
    @Test
    void setDaysAndTripSections_InvalidDuration_ThrowsException() {
        // Arrange
        Trip trip = new Trip();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> trip.setDaysAndTripSections(0, null)
        );
    }


    // ==========================================
    // ACTIVITY TESTS
    // ==========================================

    // Tests that adding an activity assigned to trip day 3
    // on a trip starting April 1, 2027, adds the activity
    // and calculates its effective date as April 3, 2027.
    @Test
    void addActivity_ValidActivity_AddsAndAttachesToTrip() {
        // Arrange
        LocalDate startDate = LocalDate.of(2027, 4, 1);

        Trip trip = new Trip();
        trip.setStartDate(startDate);

        Activity activity = new Activity();
        activity.setId(1);
        activity.setTripDay(3);

        // Act
        trip.addActivity(activity);

        // Assert
        assertEquals(1, trip.getActivities().size());
        assertSame(activity, trip.getActivities().get(0));
        assertEquals(
            LocalDate.of(2027, 4, 3),
            activity.getDate()
        );
    }

    // Tests that attempting to add a null activity to a trip
    // does not add anything to the activity list.
    @Test
    void addActivity_NullValue_DoesNotAddActivity() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.addActivity(null);

        // Assert
        assertTrue(trip.getActivities().isEmpty());
    }

    // Tests that changing the trip start date to April 1, 2027
    // refreshes the effective date of an attached activity assigned
    // to trip day 3, making its date April 3, 2027.
    @Test
    void setStartDate_RefreshesActivityDates() {
        // Arrange
        Trip trip = new Trip();

        Activity activity = new Activity();
        activity.setTripDay(3);

        trip.addActivity(activity);

        // Act
        trip.setStartDate(LocalDate.of(2027, 4, 1));

        // Assert
        assertEquals(
            LocalDate.of(2027, 4, 3),
            activity.getDate()
        );
    }

    // Tests that removing the activity with ID 1 from the trip
    // successfully removes it from the activity list.
    @Test
    void removeActivity_ExistingId_RemovesActivity() {
        // Arrange
        Trip trip = new Trip();

        Activity activity = new Activity();
        activity.setId(1);

        trip.addActivity(activity);

        // Act
        trip.removeActivity(1);

        // Assert
        assertTrue(trip.getActivities().isEmpty());
    }

    // Tests that attempting to remove activity ID 2 when the list
    // only contains activity ID 1 leaves the existing activity unchanged.
    @Test
    void removeActivity_NonexistentId_KeepsActivities() {
        // Arrange
        Trip trip = new Trip();

        Activity activity = new Activity();
        activity.setId(1);

        trip.addActivity(activity);

        // Act
        trip.removeActivity(2);

        // Assert
        assertEquals(1, trip.getActivities().size());
    }


    // ==========================================
    // LIST MANAGEMENT TESTS
    // ==========================================

    // Tests that assigning null to the activity list replaces it
    // with an initialized but empty list.
    @Test
    void setActivities_NullValue_CreatesEmptyList() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setActivities(null);

        // Assert
        assertNotNull(trip.getActivities());
        assertTrue(trip.getActivities().isEmpty());
    }

    // Tests that assigning null to the budget item list replaces it
    // with an initialized but empty list.
    @Test
    void setBudgetItems_NullValue_CreatesEmptyList() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setBudgetItems(null);

        // Assert
        assertNotNull(trip.getBudgetItems());
        assertTrue(trip.getBudgetItems().isEmpty());
    }

    // Tests that attempting to add a null budget item
    // does not add anything to the budget item list.
    @Test
    void addBudgetItem_NullValue_DoesNotAddItem() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.addBudgetItem(null);

        // Assert
        assertTrue(trip.getBudgetItems().isEmpty());
    }

    // Tests that assigning null to the points of interest list
    // replaces it with an initialized but empty list.
    @Test
    void setPointsOfInterest_NullValue_CreatesEmptyList() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.setPointsOfInterest(null);

        // Assert
        assertNotNull(trip.getPointsOfInterest());
        assertTrue(trip.getPointsOfInterest().isEmpty());
    }

    // Tests that attempting to add a null point of interest
    // does not add anything to the points of interest list.
    @Test
    void addPointOfInterest_NullValue_DoesNotAddPoint() {
        // Arrange
        Trip trip = new Trip();

        // Act
        trip.addPointOfInterest(null);

        // Assert
        assertTrue(trip.getPointsOfInterest().isEmpty());
    }


    // ==========================================
    // HELPER METHODS
    // ==========================================

    // Calculates the combined number of days across all trip sections.
    private int totalSectionDays(Trip trip) {
        return trip.getTripSections().stream()
            .mapToInt(TripSection::getDays)
            .sum();
    }
}
