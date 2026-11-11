
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

function getSectionForDate(trip, dateString) {
  if (!trip?.startDate || !dateString || !trip?.tripSections?.length) {
    return null;
  }

  const start = new Date(`${trip.startDate}T12:00:00`);
  const date = new Date(`${dateString}T12:00:00`);

  const dayOffset = Math.round(
    (date - start) / (1000 * 60 * 60 * 24)
  );

  if (dayOffset < 0 || dayOffset >= trip.days) {
    return null;
  }

  let currentDay = 0;

  for (const section of trip.tripSections) {
    const sectionEnd = currentDay + section.days;

    if (dayOffset < sectionEnd) {
      return section;
    }

    currentDay = sectionEnd;
  }

  return null;
}

function getSectionBoundaryOffsets(sections) {
  const boundaries = [];
  let currentDay = 0;

  (sections ?? []).forEach((section, index) => {
    currentDay += section.days;

    if (index < sections.length - 1) {
      boundaries.push({
        sectionIndex: index,
        dayOffset: currentDay,
      });
    }
  });

  return boundaries;
}

function getSectionEndOffsets(sections) {
  const ends = [];
  let currentDay = 0;

  (sections ?? []).forEach((section, index) => {
    currentDay += section.days;

    ends.push({
      sectionIndex: index,
      dayOffset: currentDay - 1,
    });
  });

  return ends;
}

function Calendar() {
  const {
    activities,
    refreshActivities,
  } = useActivities();

  const {
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

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDate, setResizeDate] = useState(null);

  const [sectionDragPreview, setSectionDragPreview] = useState(null);

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

  // Use the preview date while dragging the start or end handle.
  const displayedTripStartDate =
    isDragging && dragDate
      ? dragDate
      : tripStartDate;

  const tripEndDate =
    displayedTripStartDate && trip?.days
      ? addDays(displayedTripStartDate, trip.days - 1)
      : null;

  const displayedTripEndDate =
    isResizing && resizeDate
      ? resizeDate
      : tripEndDate;

  // Preview section lengths while dragging a section boundary.
  const displayedSections = (trip?.tripSections ?? []).map(
    (section) => ({ ...section })
  );

  if (sectionDragPreview) {
    const {
      sectionIndex,
      boundary,
      leftStart,
      pairTotal,
    } = sectionDragPreview;

    if (
      displayedSections[sectionIndex] &&
      displayedSections[sectionIndex + 1]
    ) {
      displayedSections[sectionIndex].days =
        boundary - leftStart;

      displayedSections[sectionIndex + 1].days =
        pairTotal - displayedSections[sectionIndex].days;
    }
  }

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
      displayedTripEndDate &&
      date >= displayedTripStartDate &&
      date <= displayedTripEndDate
    );
  }

  function hasActivity(date) {
    return activities.some(
      (activity) => activity.date === date
    );
  }

  function getDateAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    const dayElement = element?.closest("[data-calendar-date]");

    if (!dayElement) return null;

    return dayElement.dataset.calendarDate;
  }

  // Save changes to the trip's sections.
  async function saveTripSections(updatedSections) {
    if (isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      const updatedTrip = await TripAPI.update({
        ...trip,
        tripSections: updatedSections,
      });

      setTrip(updatedTrip);
    } catch (err) {
      console.error("Unable to update trip sections:", err);
      setError(
        "Unable to update trip sections. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Split the selected section into two sections.
  async function handleAddSection(sectionIndex) {
    if (
      isSaving ||
      isDragging ||
      isResizing ||
      sectionDragPreview
    ) {
      return;
    }

    const updatedSections = (trip?.tripSections ?? []).map(
      (section) => ({ ...section })
    );

    const section = updatedSections[sectionIndex];

    // A section needs at least two days to be split.
    if (!section || section.days < 2) {
      return;
    }

    const firstHalf = Math.ceil(section.days / 2);
    const secondHalf = section.days - firstHalf;

    section.days = firstHalf;

    const nextId =
      updatedSections.reduce(
        (maximum, item) => Math.max(maximum, Number(item.id) || 0),
        0
      ) + 1;

    const newSection = {
      id: nextId,
      name: `Section ${updatedSections.length + 1}`,
      days: secondHalf,
      hexColor: "#6C8EBF",
      latitude: null,
      longitude: null,
    };

    updatedSections.splice(sectionIndex + 1, 0, newSection);

    await saveTripSections(updatedSections);
  }

  // Drag the boundary between two neighboring sections.
  function handleSectionBoundaryDragStart(
    event,
    sectionIndex,
    originalBoundary
  ) {
    if (
      event.button !== 0 ||
      isSaving ||
      isDragging ||
      isResizing ||
      sectionDragPreview
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sections = trip?.tripSections ?? [];

    const leftStart = sections
      .slice(0, sectionIndex)
      .reduce((total, section) => total + section.days, 0);

    const pairTotal =
      sections[sectionIndex].days +
      sections[sectionIndex + 1].days;

    let currentBoundary = originalBoundary;

    const minimumBoundary = leftStart + 1;
    const maximumBoundary = leftStart + pairTotal - 1;

    setError("");

    setSectionDragPreview({
      sectionIndex,
      boundary: originalBoundary,
      leftStart,
      pairTotal,
    });

    function handlePointerMove(pointerEvent) {
      const date = getDateAtPoint(
        pointerEvent.clientX,
        pointerEvent.clientY
      );

      if (!date || !tripStartDate) return;

      const dayOffset = daysBetween(tripStartDate, date);

      const nextBoundary = Math.max(
        minimumBoundary,
        Math.min(maximumBoundary, dayOffset)
      );

      currentBoundary = nextBoundary;

      setSectionDragPreview({
        sectionIndex,
        boundary: nextBoundary,
        leftStart,
        pairTotal,
      });
    }

    async function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);

      setSectionDragPreview(null);

      if (currentBoundary === originalBoundary) {
        return;
      }

      const updatedSections = sections.map(
        (section) => ({ ...section })
      );

      updatedSections[sectionIndex].days =
        currentBoundary - leftStart;

      updatedSections[sectionIndex + 1].days =
        pairTotal - updatedSections[sectionIndex].days;

      await saveTripSections(updatedSections);
    }

    function handlePointerCancel() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setSectionDragPreview(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  }

  // Shared function for moving the trip's start date.
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

      await Promise.all([
        refreshActivities(),
        refreshHousing(),
      ]);

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

  // Update the trip's number of days using its new end date.
  async function updateTripDuration(finalDate) {
    if (!finalDate || !tripStartDate || isSaving) {
      return;
    }

    if (finalDate < tripStartDate) {
      setError("A trip must be at least one day long.");
      return;
    }

    const newDays = daysBetween(tripStartDate, finalDate) + 1;

    if (newDays === trip.days) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updatedTrip = await TripAPI.update({
        ...trip,
        days: newDays,
      });

      setTrip(updatedTrip);

      await Promise.all([
        refreshActivities(),
        refreshHousing(),
      ]);

      const newEndDate = addDays(tripStartDate, newDays - 1);

      if (selectedDate > newEndDate) {
        selectDate(newEndDate);
      }
    } catch (err) {
      console.error("Unable to update trip duration:", err);
      setError(
        "Unable to update the trip duration. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Start dragging the trip's starting date.
  function handleDragStart(event) {
    if (
      event.button !== 0 ||
      !tripStartDate ||
      isSaving ||
      isResizing
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setError("");
    setDragDate(tripStartDate);
    setIsDragging(true);
  }

  // Double-click the starting-date handle to enter a date.
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

  // Start dragging the trip's ending date.
  function handleResizeStart(event) {
    if (
      event.button !== 0 ||
      !tripEndDate ||
      isSaving ||
      isDragging
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setError("");
    setResizeDate(tripEndDate);
    setIsResizing(true);
  }

  // Track the date currently underneath the start-date drag.
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

  // Track the date currently underneath the end-date drag.
  useEffect(() => {
    if (!isResizing) return;

    function handlePointerMove(event) {
      const date = getDateAtPoint(event.clientX, event.clientY);

      if (date && date >= tripStartDate) {
        setResizeDate(date);
      }
    }

    async function handlePointerUp(event) {
      const finalDate =
        getDateAtPoint(event.clientX, event.clientY) || resizeDate;

      setIsResizing(false);
      setResizeDate(null);

      if (!finalDate || finalDate < tripStartDate) {
        return;
      }

      await updateTripDuration(finalDate);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    isResizing,
    resizeDate,
    tripStartDate,
    trip,
    selectedDate,
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

  const sectionBoundaries =
    getSectionBoundaryOffsets(displayedSections);

  const sectionEnds =
    getSectionEndOffsets(displayedSections);

  // Calendar date cells.
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = getDateString(day);

    const dayHasActivity = hasActivity(dateString);
    const dayIsTripDay = isTripDay(dateString);

    const daySection = dayIsTripDay
      ? getSectionForDate(
          {
            ...trip,
            startDate: displayedTripStartDate,
            tripSections: displayedSections,
          },
          dateString
        )
      : null;

    const dayOffset = displayedTripStartDate
      ? daysBetween(displayedTripStartDate, dateString)
      : -1;

    const boundaryAtStart = sectionBoundaries.find(
      (boundary) => boundary.dayOffset === dayOffset
    );

    const sectionEndAtDate = sectionEnds.find(
      (sectionEnd) => sectionEnd.dayOffset === dayOffset
    );

    const sectionIndex = sectionEndAtDate
      ? sectionEndAtDate.sectionIndex
      : -1;

    const sectionForAdd = displayedSections[sectionIndex];

    const canAddSection =
      !!sectionForAdd &&
      sectionForAdd.days >= 2 &&
      !isSaving;

    const isTripStart =
      dateString === displayedTripStartDate;

    const isTripEnd =
      dateString === displayedTripEndDate;

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
          selectedDate === dateString ? "selected" : ""
        } ${
          (isDragging && dateString === dragDate) ||
          (isResizing && dateString === resizeDate)
            ? "drag-target"
            : ""
        }`}
        onClick={() => {
          if (
            !isDragging &&
            !isResizing &&
            !isSaving &&
            !sectionDragPreview
          ) {
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
            onClick={(event) => event.stopPropagation()}
          >
            <span className="trip-start-handle-icon">↔</span>
          </span>
        )}

        {isTripEnd && (
          <span
            className="trip-end-handle"
            title="Drag to change trip duration"
            aria-label="Change trip duration"
            onPointerDown={handleResizeStart}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="trip-end-handle-icon">↔</span>
          </span>
        )}

        <span className="calendar-day-number">
          {day}
        </span>

        {daySection && (
          <div
            className="trip-section-line"
            style={{
              backgroundColor: daySection.hexColor || "#6C8EBF",
            }}
            title={daySection.name}
          />
        )}

        {boundaryAtStart && (
          <span
            role="button"
            tabIndex={0}
            className="trip-section-boundary-handle"
            title="Drag to change the length of these sections"
            aria-label="Adjust section boundary"
            onPointerDown={(event) =>
              handleSectionBoundaryDragStart(
                event,
                boundaryAtStart.sectionIndex,
                boundaryAtStart.dayOffset
              )
            }
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
              }
            }}
          >
            ↔
          </span>
        )}

        {sectionEndAtDate && (
          <span
            role="button"
            tabIndex={0}
            className="trip-section-add-button"
            title={
              canAddSection
                ? `Add a section after ${sectionForAdd.name}`
                : "This section needs at least two days to split"
            }
            aria-label={`Add a section after ${sectionForAdd.name}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (canAddSection) {
                handleAddSection(sectionIndex);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                if (canAddSection) {
                  handleAddSection(sectionIndex);
                }
              }
            }}
          >
            +
          </span>
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
            disabled={
              isDragging ||
              isResizing ||
              isSaving ||
              !!sectionDragPreview
            }
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
            disabled={
              isDragging ||
              isResizing ||
              isSaving ||
              !!sectionDragPreview
            }
          >
            →
          </button>
        </div>

        {error && (
          <p className="calendar-error">{error}</p>
        )}

        {isSaving && (
          <p className="calendar-status">
            Updating trip...
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
          } ${
            isResizing ? "calendar-grid-resizing" : ""
          } ${
            sectionDragPreview ? "calendar-grid-section-dragging" : ""
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
