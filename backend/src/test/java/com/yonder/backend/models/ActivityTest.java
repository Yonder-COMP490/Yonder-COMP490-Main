
package com.yonder.backend.models;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;

class ActivityTest {

    // ==========================================
    // getDuration() TESTS
    // ==========================================

    // Tests that an activity starting at 10:00 and ending at 12:30
    // returns the correct duration of 150 minutes.
    @Test
    void getDuration_NormalActivity_ReturnsCorrectDuration() {
        // Arrange
        Activity activity = new Activity();

        activity.setStartTime(LocalTime.of(10, 0));
        activity.setEndTime(LocalTime.of(12, 30));

        Duration expected = Duration.ofMinutes(150);

        // Act
        Duration actual = activity.getDuration();

        // Assert
        assertEquals(expected, actual);
    }

    // Tests that an activity starting at 22:00 and ending at 02:00
    // correctly handles an overnight schedule and returns 4 hours.
    @Test
    void getDuration_OvernightActivity_ReturnsCorrectDuration() {
        // Arrange
        Activity activity = new Activity();

        activity.setStartTime(LocalTime.of(22, 0));
        activity.setEndTime(LocalTime.of(2, 0));

        Duration expected = Duration.ofHours(4);

        // Act
        Duration actual = activity.getDuration();

        // Assert
        assertEquals(expected, actual);
    }

    // Tests that getDuration() returns null when the start time
    // is missing but the end time is set to 12:00.
    @Test
    void getDuration_MissingStartTime_ReturnsNull() {
        // Arrange
        Activity activity = new Activity();

        activity.setEndTime(LocalTime.of(12, 0));

        // Act
        Duration actual = activity.getDuration();

        // Assert
        assertNull(actual);
    }

    // Tests that getDuration() returns null when the end time
    // is missing but the start time is set to 10:00.
    @Test
    void getDuration_MissingEndTime_ReturnsNull() {
        // Arrange
        Activity activity = new Activity();

        activity.setStartTime(LocalTime.of(10, 0));

        // Act
        Duration actual = activity.getDuration();

        // Assert
        assertNull(actual);
    }

    // Tests that getDuration() returns null when both the start
    // and end times are missing.
    @Test
    void getDuration_MissingBothTimes_ReturnsNull() {
        // Arrange
        Activity activity = new Activity();

        // Act
        Duration actual = activity.getDuration();

        // Assert
        assertNull(actual);
    }


    // ==========================================
    // switchScheduleType() TESTS
    // ==========================================

    // Tests converting an activity with fixed date April 5, 2027
    // into trip-day scheduling for a trip starting April 1, 2027.
    // The expected result is trip day 5 with the fixed date cleared.
    @Test
    void switchScheduleType_FixedDateToTripDay_ConvertsCorrectly() {
        // Arrange
        Activity activity = new Activity();

        LocalDate tripStart = LocalDate.of(2027, 4, 1);
        LocalDate activityDate = LocalDate.of(2027, 4, 5);

        activity.setFixedDate(activityDate);

        // Act
        activity.switchScheduleType(false, tripStart);

        // Assert
        assertEquals(5, activity.getTripDay());
        assertNull(activity.getFixedDate());
    }

    // Tests converting an activity assigned to trip day 5
    // into fixed-date scheduling for a trip starting April 1, 2027.
    // The expected fixed date is April 5, 2027, with trip day cleared.
    @Test
    void switchScheduleType_TripDayToFixedDate_ConvertsCorrectly() {
        // Arrange
        Activity activity = new Activity();

        LocalDate tripStart = LocalDate.of(2027, 4, 1);

        activity.setTripDay(5);

        // Act
        activity.switchScheduleType(true, tripStart);

        // Assert
        assertEquals(
            LocalDate.of(2027, 4, 5),
            activity.getFixedDate()
        );

        assertNull(activity.getTripDay());
    }

    // Tests that an activity already using fixed-date scheduling
    // with date April 5, 2027 remains unchanged when asked to
    // switch to fixed-date scheduling again, even with a null trip start.
    @Test
    void switchScheduleType_AlreadyFixedDate_DoesNotChange() {
        // Arrange
        Activity activity = new Activity();

        LocalDate activityDate = LocalDate.of(2027, 4, 5);

        activity.setFixedDate(activityDate);

        // Act
        activity.switchScheduleType(true, null);

        // Assert
        assertEquals(activityDate, activity.getFixedDate());
        assertNull(activity.getTripDay());
    }

    // Tests that an activity already assigned to trip day 5
    // remains unchanged when asked to switch to trip-day scheduling
    // again, even with a null trip start date.
    @Test
    void switchScheduleType_AlreadyTripDay_DoesNotChange() {
        // Arrange
        Activity activity = new Activity();

        activity.setTripDay(5);

        // Act
        activity.switchScheduleType(false, null);

        // Assert
        assertEquals(5, activity.getTripDay());
        assertNull(activity.getFixedDate());
    }

    // Tests that attempting to switch scheduling type when the activity
    // has neither a fixed date nor a trip day throws an IllegalStateException.
    @Test
    void switchScheduleType_NoExistingDate_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        // Act and Assert
        assertThrows(
            IllegalStateException.class,
            () -> activity.switchScheduleType(true, null)
        );
    }

    // Tests that converting a fixed-date activity dated April 5, 2027
    // to trip-day scheduling without providing a trip start date
    // throws an IllegalArgumentException.
    @Test
    void switchScheduleType_MissingTripStartDate_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        activity.setFixedDate(LocalDate.of(2027, 4, 5));

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> activity.switchScheduleType(false, null)
        );
    }

    // Tests that converting an activity assigned to trip day 5
    // to fixed-date scheduling without a trip start date throws
    // an IllegalStateException because its effective date cannot be calculated.
    @Test
    void switchScheduleType_TripDayWithoutTripStartDate_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        activity.setTripDay(5);

        // Act and Assert
        assertThrows(
            IllegalStateException.class,
            () -> activity.switchScheduleType(true, null)
        );
    }


    // ==========================================
    // moveDateTime() TESTS
    // ==========================================

    // Tests moving an activity using fixed-date scheduling from
    // April 5 to April 7, 2027, and changing its time from the
    // existing values to 14:00–16:00 while preserving fixed-date mode.
    @Test
    void moveDateTime_FixedDateActivity_MovesCorrectly() {
        // Arrange
        Activity activity = new Activity();

        LocalDate tripStart = LocalDate.of(2027, 4, 1);
        LocalDate newDate = LocalDate.of(2027, 4, 7);

        activity.setFixedDate(LocalDate.of(2027, 4, 5));

        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(16, 0);

        // Act
        activity.moveDateTime(
            newDate, newStart, newEnd, tripStart
        );

        // Assert
        assertEquals(newDate, activity.getFixedDate());
        assertNull(activity.getTripDay());
        assertEquals(newStart, activity.getStartTime());
        assertEquals(newEnd, activity.getEndTime());
        assertEquals(newDate, activity.getDate());
    }

    // Tests moving an activity using trip-day scheduling to
    // April 7, 2027, for a trip starting April 1, 2027.
    // The expected result is trip day 7 with times set to 14:00–16:00.
    @Test
    void moveDateTime_TripDayActivity_MovesCorrectly() {
        // Arrange
        Activity activity = new Activity();

        LocalDate tripStart = LocalDate.of(2027, 4, 1);
        LocalDate newDate = LocalDate.of(2027, 4, 7);

        activity.setTripDay(5);

        LocalTime newStart = LocalTime.of(14, 0);
        LocalTime newEnd = LocalTime.of(16, 0);

        // Act
        activity.moveDateTime(
            newDate, newStart, newEnd, tripStart
        );

        // Assert
        assertEquals(7, activity.getTripDay());
        assertNull(activity.getFixedDate());
        assertEquals(newStart, activity.getStartTime());
        assertEquals(newEnd, activity.getEndTime());
        assertEquals(newDate, activity.getDate());
    }

    // Tests that moving an activity with a null new date,
    // start time 10:00, end time 12:00, and trip start date
    // April 1, 2027 throws an IllegalArgumentException.
    @Test
    void moveDateTime_MissingDate_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> activity.moveDateTime(
                null,
                LocalTime.of(10, 0),
                LocalTime.of(12, 0),
                LocalDate.of(2027, 4, 1)
            )
        );
    }

    // Tests that moving an activity with a new date of April 5, 2027,
    // a null start time, and an end time of 12:00 throws
    // an IllegalArgumentException.
    @Test
    void moveDateTime_MissingStartTime_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> activity.moveDateTime(
                LocalDate.of(2027, 4, 5),
                null,
                LocalTime.of(12, 0),
                LocalDate.of(2027, 4, 1)
            )
        );
    }

    // Tests that moving an activity to April 5, 2027 with times
    // 10:00–12:00 but without providing a trip start date
    // throws an IllegalArgumentException.
    @Test
    void moveDateTime_MissingTripStartDate_ThrowsException() {
        // Arrange
        Activity activity = new Activity();

        // Act and Assert
        assertThrows(
            IllegalArgumentException.class,
            () -> activity.moveDateTime(
                LocalDate.of(2027, 4, 5),
                LocalTime.of(10, 0),
                LocalTime.of(12, 0),
                null
            )
        );
    }
}
