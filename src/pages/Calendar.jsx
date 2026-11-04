
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import "./Calendar.css";

function Calendar() {
  const { activities } = useActivities();
  const { housing } = useHousing();

  // Selected date is shared with the dashboard and itinerary sidebar.
  const { selectedDate, selectDate } = useOutletContext();

  // Track which month the calendar is displaying.
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const date = new Date(`${selectedDate}T00:00:00`);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );
  });

  // Keep the calendar month synchronized with the selected date.
  // This also handles dates changed from the itinerary sidebar.
  useEffect(() => {
    const date = new Date(`${selectedDate}T00:00:00`);

    setDisplayedMonth(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
  }, [selectedDate]);

  const currentMonth = displayedMonth.getMonth();
  const currentYear = displayedMonth.getFullYear();

  // Navigate between calendar months.
  function changeMonth(amount) {
    setDisplayedMonth(
      new Date(currentYear, currentMonth + amount, 1)
    );
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function getDateString(day) {
    return (
      `${currentYear}-` +
      `${String(currentMonth + 1).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`
    );
  }

  // Check whether an activity is scheduled for a given date.
  function hasActivity(date) {
    return activities.some(
      (activity) => activity.date === date
    );
  }

  // Check whether housing applies to a given date.
  function hasHousing(date) {
    return housing.some(
      (housingItem) =>
        housingItem.checkInDate &&
        housingItem.checkOutDate &&
        date >= housingItem.checkInDate &&
        date <= housingItem.checkOutDate
    );
  }

  const daysInMonth = getDaysInMonth(
    currentYear,
    currentMonth
  );

  const firstDay = getFirstDayOfMonth(
    currentYear,
    currentMonth
  );

  const calendarDays = [];

  // Add empty cells before the first day of the month.
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      />
    );
  }

  // Generate a button for each day of the month.
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = getDateString(day);

    const dayHasActivity = hasActivity(dateString);
    const dayHasHousing = hasHousing(dateString);

    calendarDays.push(
      <button
        key={day}
        type="button"
        className={`calendar-day ${
          dayHasActivity ? "has-activity" : ""
        } ${dayHasHousing ? "has-housing" : ""} ${
          selectedDate === dateString ? "selected" : ""
        }`}
        onClick={() => selectDate(dateString)}
        aria-label={`Select ${dateString}`}
        aria-pressed={selectedDate === dateString}
      >
        <span className="calendar-day-number">
          {day}
        </span>

        {dayHasHousing && (
          <div className="housing-line" />
        )}
      </button>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-section">
        {/* Month navigation */}
        <div className="month-header">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            ←
          </button>

          <h1>
            {displayedMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h1>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Days of the week */}
        <div className="weekday-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {calendarDays}
        </div>
      </div>

      {/* Return to the homepage */}
      <Link to="/" className="home-button">
        Home
      </Link>
    </div>
  );
}

export default Calendar;
