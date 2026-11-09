
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import TripAPI from "../api/TripAPI";
import "./Calendar.css";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}

function Calendar() {
  const {
    activities,
    refreshActivities,
  } = useActivities();

  const {
    housing,
    refreshHousing,
  } = useHousing();

  const outletContext = useOutletContext();

  if (!outletContext) {
    throw new Error(
      "Calendar must be rendered inside TripDashboard."
    );
  }

  const {
    selectedDate,
    selectDate,
    trip,
    setTrip,
  } = outletContext;

  const tripStartDate = trip?.startDate ?? null;

  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const initialDate = tripStartDate || selectedDate;
    const date = new Date(`${initialDate}T00:00:00`);

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragDate, setDragDate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Keep the displayed month synchronized with the selected date.
  useEffect(() => {
    if (!selectedDate) return;

    const date = new Date(`${selectedDate}T00:00:00`);

    setDisplayedMonth(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
  }, [selectedDate]);

  // Once the trip loads, show its starting month.
  useEffect(() => {
    if (!tripStartDate) return;

    const date = new Date(`${tripStartDate}T00:00:00`);

    setDisplayedMonth(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
  }, [tripStartDate]);

  const currentMonth = displayedMonth.getMonth();
  const currentYear = displayedMonth.getFullYear();

  // Use the preview date while dragging.
  const displayedTripStartDate =
    isDragging && dragDate
      ? dragDate
      : tripStartDate;

  const tripEndDate =
    displayedTripStartDate && trip?.days
      ? addDays(displayedTripStartDate, trip.days - 1)
      : null;

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

  function isTripDay(date) {
    return (
      displayedTripStartDate &&
      tripEndDate &&
      date >= displayedTripStartDate &&
      date <= tripEndDate
    );
  }

  function hasActivity(date) {
    return activities.some(
      (activity) => activity.date === date
    );
  }

  function hasHousing(date) {
    return housing.some(
      (housingItem) =>
        housingItem.checkInDate &&
        housingItem.checkOutDate &&
        date >= housingItem.checkInDate &&
        date <= housingItem.checkOutDate
    );
  }

  function getDateAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    const dayElement = element?.closest("[data-calendar-date]");

    if (!dayElement) return null;

    return dayElement.dataset.calendarDate;
  }

  // Shared function for dragging and manually entering a date.
  async function updateTripStartDate(finalDate) {
    if (!finalDate || finalDate === tripStartDate || isSaving) {
      return;
    }

    const parsedDate = new Date(`${finalDate}T00:00:00`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(finalDate) ||
      Number.isNaN(parsedDate.getTime()) ||
      formatDate(parsedDate) !== finalDate
    ) {
      setError("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    const oldStartDate = tripStartDate;

    const selectedDayOffset =
      selectedDate >= oldStartDate &&
      selectedDate <= addDays(oldStartDate, trip.days - 1)
        ? daysBetween(oldStartDate, selectedDate)
        : null;

    setIsSaving(true);
    setError("");

    try {
      const updatedTrip = await TripAPI.update({
        ...trip,
        startDate: finalDate,
      });

      setTrip(updatedTrip);

      // Refresh the frontend copies of the affected dates.
      await Promise.all([
        refreshActivities(),
        refreshHousing(),
      ]);

      // Preserve the selected trip day, if it was within the trip.
      if (selectedDayOffset !== null) {
        selectDate(addDays(finalDate, selectedDayOffset));
      } else {
        selectDate(finalDate);
      }
    } catch (err) {
      console.error("Unable to move trip start date:", err);
      setError(
        "Unable to update the trip start date. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleDragStart(event) {
    if (event.button !== 0 || !tripStartDate || isSaving) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setError("");
    setDragDate(tripStartDate);
    setIsDragging(true);
  }

  // Double-click the move handle to enter a specific start date.
  function handleMoveButtonDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!tripStartDate || isSaving) return;

    const newDate = window.prompt(
      "Enter the new trip start date (YYYY-MM-DD):",
      tripStartDate
    );

    if (newDate === null) return;

    updateTripStartDate(newDate.trim());
  }

  // Track the date currently underneath the pointer.
  useEffect(() => {
    if (!isDragging) return;

    function handlePointerMove(event) {
      const date = getDateAtPoint(event.clientX, event.clientY);

      if (date) {
        setDragDate(date);
      }
    }

    async function handlePointerUp(event) {
      const finalDate =
        getDateAtPoint(event.clientX, event.clientY) || dragDate;

      setIsDragging(false);
      setDragDate(null);

      if (!finalDate || finalDate === tripStartDate) {
        return;
      }

      await updateTripStartDate(finalDate);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    isDragging,
    dragDate,
    tripStartDate,
    selectedDate,
    trip,
    setTrip,
    selectDate,
    refreshActivities,
    refreshHousing,
  ]);

  const daysInMonth = getDaysInMonth(
    currentYear,
    currentMonth
  );

  const firstDay = getFirstDayOfMonth(
    currentYear,
    currentMonth
  );

  const calendarDays = [];

  // Empty cells before the first day of the month.
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="calendar-day empty"
      />
    );
  }

  // Calendar date cells.
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = getDateString(day);

    const dayHasActivity = hasActivity(dateString);
    const dayHasHousing = hasHousing(dateString);
    const dayIsTripDay = isTripDay(dateString);
    const isTripStart = dateString === displayedTripStartDate;

    calendarDays.push(
      <button
        key={day}
        type="button"
        data-calendar-date={dateString}
        className={`calendar-day ${
          dayIsTripDay ? "trip-day" : ""
        } ${
          dayHasActivity ? "has-activity" : ""
        } ${
          dayHasHousing ? "has-housing" : ""
        } ${
          selectedDate === dateString ? "selected" : ""
        } ${
          isDragging && dateString === dragDate
            ? "drag-target"
            : ""
        }`}
        onClick={() => {
          if (!isDragging && !isSaving) {
            selectDate(dateString);
          }
        }}
        aria-label={`Select ${dateString}`}
        aria-pressed={selectedDate === dateString}
      >
        {isTripStart && (
          <span
            className="trip-start-handle"
            title="Drag to move trip. Double-click to enter a date."
            aria-label="Move trip start date"
            onPointerDown={handleDragStart}
            onDoubleClick={handleMoveButtonDoubleClick}
          >
            <span className="trip-start-handle-icon">↔</span>
          </span>
        )}

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
        <div className="month-header">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            disabled={isDragging || isSaving}
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
            disabled={isDragging || isSaving}
          >
            →
          </button>
        </div>

        {error && (
          <p className="calendar-error">{error}</p>
        )}

        {isSaving && (
          <p className="calendar-status">
            Updating trip dates...
          </p>
        )}

        <div className="weekday-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div
          className={`calendar-grid ${
            isDragging ? "calendar-grid-dragging" : ""
          }`}
        >
          {calendarDays}
        </div>
      </div>

      <Link to="/" className="home-button">
        Home
      </Link>
    </div>
  );
}

export default Calendar;
