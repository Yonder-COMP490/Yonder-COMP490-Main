
import { useState } from "react";
import { Link } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import "./Calendar.css";

function Calendar() {
  const { activities } = useActivities();
  const { housing } = useHousing();

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    today.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    today.getFullYear()
  );

  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`
  );

  // Navigate between calendar months.
  function changeMonth(amount) {
    const date = new Date(
      currentYear,
      currentMonth + amount,
      1
    );

    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
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

  // Check whether activities are scheduled for a date.
  function hasActivity(date) {
    return activities.some(
      (activity) => activity.date === date
    );
  }

  // Check whether housing applies to a date.
  function hasHousing(date) {
    return housing.some(
      (housingItem) =>
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

  // Add empty spaces before the first day.
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      />
    );
  }

  // Generate the calendar dates.
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
        onClick={() => setSelectedDate(dateString)}
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
            {new Date(
              currentYear,
              currentMonth
            ).toLocaleDateString("en-US", {
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

      <Link to="/" className="home-button">
        <button type="button">Home</button>
      </Link>
    </div>
  );
}

export default Calendar;
