/**
 * Component name: Calendar
 * Date: 09/21/2026
 * Programmer: Ryan Sommerhauser
 * Description: Displays an interactive monthly calendar for managing trip
 * dates and trip sections. Supports changing the trip's start date and
 * duration, adjusting section lengths, and selecting dates.
 */
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import TripAPI from "../api/TripAPI";
import "./Calendar.css";

/**
 * Formats a JavaScript Date object into YYYY-MM-DD format.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date.
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Adds a specified number of days to a date string.
 *
 * @param {string} dateString - The starting date in YYYY-MM-DD format.
 * @param {number} amount - The number of days to add.
 * @returns {string} The resulting date in YYYY-MM-DD format.
 */
function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}

/**
 * Calculates the number of days between two dates.
 *
 * @param {string} startDate - The starting date.
 * @param {string} endDate - The ending date.
 * @returns {number} The number of days between the dates.
 */
function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Finds the trip section containing a specific date.
 *
 * Uses the trip start date and section durations to determine
 * which section includes the specified date.
 *
 * @param {Object} trip - The trip containing its start date, duration, and sections.
 * @param {string} dateString - The date to find a section for.
 * @returns {Object|null} The matching trip section, or null if none applies.
 */
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

/**
 * Calculates the day offsets where neighboring trip sections meet.
 *
 * @param {Array<Object>} sections - The trip sections.
 * @returns {Array<Object>} Section boundary information containing section indices
 * and day offsets.
 */
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

/**
 * Calculates the ending day offset for each trip section.
 *
 * @param {Array<Object>} sections - The trip sections.
 * @returns {Array<Object>} Section ending information containing section indices
 * and day offsets.
 */
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

  /**
   * Changes the displayed calendar month.
   *
   * @param {number} amount - The number of months to move forward or backward.
   */
  function changeMonth(amount) {
    setDisplayedMonth(
      new Date(currentYear, currentMonth + amount, 1)
    );
  }

  /**
   * Gets the number of days in a specified month.
   *
   * @param {number} year - The calendar year.
   * @param {number} month - The zero-based month index.
   * @returns {number} The number of days in the month.
   */
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Gets the weekday index of the first day of a specified month.
   *
   * @param {number} year - The calendar year.
   * @param {number} month - The zero-based month index.
   * @returns {number} The weekday index, where Sunday is 0.
   */
  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Creates a date string for a day in the currently displayed month.
   *
   * @param {number} day - The day of the month.
   * @returns {string} The date in YYYY-MM-DD format.
   */
  function getDateString(day) {
    return (
      `${currentYear}-` +
      `${String(currentMonth + 1).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`
    );
  }

  /**
   * Checks whether a date falls within the displayed trip date range.
   *
   * @param {string} date - The date to check.
   * @returns {boolean} Whether the date is part of the trip.
   */
  function isTripDay(date) {
    return (
      displayedTripStartDate &&
      displayedTripEndDate &&
      date >= displayedTripStartDate &&
      date <= displayedTripEndDate
    );
  }

  /**
   * Checks whether an activity is scheduled for a specific date.
   *
   * @param {string} date - The date to check.
   * @returns {boolean} Whether an activity exists on that date.
   */
  function hasActivity(date) {
    return activities.some(
      (activity) => activity.date === date
    );
  }

  /**
   * Finds the calendar date underneath a specified screen position.
   *
   * @param {number} x - The horizontal screen coordinate.
   * @param {number} y - The vertical screen coordinate.
   * @returns {string|null} The calendar date at that position, or null if none exists.
   */
  function getDateAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    const dayElement = element?.closest("[data-calendar-date]");

    if (!dayElement) return null;

    return dayElement.dataset.calendarDate;
  }

  /**
   * Saves updated trip sections to the backend and refreshes the trip state.
   *
   * Prevents overlapping save operations and displays an error if the update fails.
   *
   * @param {Array<Object>} updatedSections - The updated trip sections.
   * @returns {Promise<void>} A promise that resolves after the save operation finishes.
   */
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

  /**
   * Splits an existing trip section into two smaller sections.
   *
   * Divides the section's days between the original and new section,
   * then saves the updated section list.
   *
   * @param {number} sectionIndex - The index of the section to split.
   * @returns {Promise<void>} A promise that resolves after the update finishes.
   */
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

  /**
   * Begins dragging the boundary between two neighboring trip sections.
   *
   * Updates a preview while dragging and saves the new section durations
   * when the pointer is released.
   *
   * @param {PointerEvent} event - The pointer event that begins the drag.
   * @param {number} sectionIndex - The index of the section before the boundary.
   * @param {number} originalBoundary - The original boundary day offset.
   */
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

  /**
   * Updates the trip's starting date.
   *
   * Preserves the selected date's relative position within the trip when possible,
   * then refreshes activities and housing bookings to reflect the new dates.
   *
   * @param {string} finalDate - The new trip start date in YYYY-MM-DD format.
   * @returns {Promise<void>} A promise that resolves after the update finishes.
   */
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

  /**
   * Updates the trip duration using a new ending date.
   *
   * Calculates the new number of trip days, saves the change, and refreshes
   * activities and housing bookings. Adjusts the selected date if it falls
   * beyond the new trip end date.
   *
   * @param {string} finalDate - The new trip end date in YYYY-MM-DD format.
   * @returns {Promise<void>} A promise that resolves after the update finishes.
   */
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

  /**
   * Begins dragging the trip's starting-date handle.
   *
   * Initializes the drag preview and prevents dragging when another
   * conflicting operation is active.
   *
   * @param {PointerEvent} event - The pointer event that begins the drag.
   */
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

  /**
   * Opens a prompt for manually entering a new trip start date.
   *
   * @param {MouseEvent} event - The double-click event.
   */
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

  /**
   * Begins dragging the trip's ending-date handle to change its duration.
   *
   * @param {PointerEvent} event - The pointer event that begins the resize.
   */
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
