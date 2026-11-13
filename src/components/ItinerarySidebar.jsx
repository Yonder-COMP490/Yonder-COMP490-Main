/**
 * Displays a selected day's itinerary as an interactive sidebar timeline.
 * Supports navigation between dates, activity dragging and resizing,
 * fixed-date scheduling, housing events, and trip-section management.
 *
 * @author A. Garcia
 * @author R. Sommerhauser
 * @version 1.0
 * @since 2026-10-26
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";
import TripAPI from "../api/TripAPI";
import "./ItinerarySidebar.css";

const HOUR_HEIGHT = 72;
const MAX_START_MINUTES = 22 * 60 + 45;
const MAX_TIME_MINUTES = 23 * 60 + 45;

/**
 * Formats a date string into a readable date including the weekday,
 * month, day, and year.
 *
 * @param {string} dateString - The date in YYYY-MM-DD format.
 * @returns {string} The formatted date, or an empty string if no date is provided.
 */
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Converts a time string into the number of minutes since midnight.
 *
 * @param {string} time - The time in HH:mm format.
 * @returns {?number} The number of minutes, or null if the time is invalid.
 */
function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight into a time string rounded to the nearest
 * 15-minute interval and constrained to the allowed timeline range.
 *
 * @param {number} minutes - The number of minutes since midnight.
 * @returns {string} The resulting time in HH:mm format.
 */
function minutesToTime(minutes) {
  const safeMinutes = Math.max(
    0,
    Math.min(MAX_TIME_MINUTES, Math.round(minutes / 15) * 15)
  );

  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Converts minutes since midnight into a readable 12-hour time.
 *
 * @param {number} minutes - The number of minutes since midnight.
 * @returns {string} The formatted time with an AM or PM suffix.
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/**
 * Adds a specified number of days to a date string.
 *
 * @param {string} dateString - The starting date in YYYY-MM-DD format.
 * @param {number} amount - The number of days to add.
 * @returns {string} The resulting date in YYYY-MM-DD format.
 */
function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Finds the trip section that contains a specified date by calculating
 * its offset from the trip's start date.
 *
 * @param {Object} trip - The trip containing its start date, duration, and sections.
 * @param {string} dateString - The date to find a section for.
 * @returns {?Object} The matching trip section, or null if the date is outside the trip.
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
 * Determines an activity's ending time. Uses its supplied end time when valid,
 * otherwise defaults to one hour after its start time.
 *
 * @param {Object} activity - The activity to evaluate.
 * @returns {?number} The ending time in minutes since midnight, or null if
 * the activity has no valid start time.
 */
function getActivityEnd(activity) {
  const start = timeToMinutes(activity.startTime);
  const suppliedEnd = timeToMinutes(activity.endTime);

  if (start === null) return null;

  if (suppliedEnd !== null && suppliedEnd > start) {
    return suppliedEnd;
  }

  return Math.min(start + 60, MAX_TIME_MINUTES);
}

/**
 * Creates timeline events for activities and housing check-ins or check-outs
 * occurring on the selected date.
 *
 * @param {Array<Object>} activities - The activities to evaluate.
 * @param {Array<Object>} housing - The housing bookings to evaluate.
 * @param {string} currentDate - The date to retrieve events for.
 * @returns {Array<Object>} The matching timeline events with their titles and times.
 */
function prepareEvents(activities, housing, currentDate) {
  const events = [];

  (activities ?? []).forEach((activity) => {
    if (!activity || activity.date !== currentDate) return;

    const start = timeToMinutes(activity.startTime);
    if (start === null) return;

    const end = getActivityEnd(activity);

    events.push({
      id: `activity-${activity.id}`,
      type: "activity",
      activity,
      title: activity.description?.name || "Untitled activity",
      start,
      end,
    });
  });

  (housing ?? []).forEach((booking) => {
    if (!booking) return;

    const bookingName = booking.description?.name;
    const readableAddress = booking.location?.readableAddress;

    if (booking.checkInDate === currentDate) {
      const start = timeToMinutes(booking.checkInTime) ?? 15 * 60;

      events.push({
        id: `checkin-${booking.id}`,
        type: "checkin",
        title: bookingName || readableAddress || "Housing check-in",
        start,
        end: Math.min(start + 30, MAX_TIME_MINUTES),
      });
    }

    if (booking.checkOutDate === currentDate) {
      const start = timeToMinutes(booking.checkOutTime) ?? 11 * 60;

      events.push({
        id: `checkout-${booking.id}`,
        type: "checkout",
        title: bookingName || readableAddress || "Housing check-out",
        start,
        end: Math.min(start + 30, MAX_TIME_MINUTES),
      });
    }
  });

  return events;
}

/**
 * Assigns horizontal lanes to timeline events so overlapping events can be
 * displayed side by side.
 *
 * @param {Array<Object>} events - The timeline events to arrange.
 * @returns {Array<Object>} The sorted events with lane and laneCount properties.
 */
function assignLanes(events) {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const laneEnds = [];

  sorted.forEach((event) => {
    let lane = laneEnds.findIndex((end) => end <= event.start);

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(event.end);
    } else {
      laneEnds[lane] = event.end;
    }

    event.lane = lane;
  });

  sorted.forEach((event) => {
    const overlapping = sorted.filter(
      (other) => other.start < event.end && other.end > event.start
    );

    event.laneCount = Math.max(
      1,
      ...overlapping.map((item) => item.lane + 1)
    );
  });

  return sorted;
}

/**
 * Component name: HourLabels
 * Description: Renders the hourly labels displayed alongside the sidebar
 * itinerary timeline.
 *
 * @returns {JSX.Element} The hourly timeline labels.
 */
function HourLabels() {
  return (
    <div className="itinerary-hour-labels">
      {Array.from({ length: 24 }, (_, hour) => (
        <div className="itinerary-hour-label" key={hour}>
          {formatTime(hour * 60)}
        </div>
      ))}
    </div>
  );
}

/**
 * Component name: ItinerarySidebar
 * Description: Displays the selected day's itinerary, including scheduled
 * activities and housing events. Provides controls for navigating dates,
 * managing trip sections, editing activity schedules, and expanding the
 * itinerary into a weekly view.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.selectedDate - The currently selected date.
 * @param {Function} props.onSelectDate - Updates the selected date.
 * @param {Object} props.trip - The current trip and its trip sections.
 * @param {Function} props.setTrip - Updates the current trip.
 * @returns {JSX.Element} The itinerary sidebar.
 * @since 2026-10-26
 */
function ItinerarySidebar({ selectedDate, onSelectDate, trip, setTrip }) {
  const navigate = useNavigate();

  const {
    activities,
    loading,
    error,
    updateActivity,
    switchScheduleType,
  } = useActivities();

  const { housing } = useHousing();

  const [dropError, setDropError] = useState("");
  const [dragPreview, setDragPreview] = useState(null);

  const [editingSection, setEditingSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [sectionColor, setSectionColor] = useState("");
  const [sectionSaveError, setSectionSaveError] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  const timelineScrollRef = useRef(null);
  const timelineRef = useRef(null);
  const dragRef = useRef(null);

  const currentSection = getSectionForDate(trip, selectedDate);

  useEffect(() => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = HOUR_HEIGHT * 6;
    }
  }, [selectedDate]);

  // Close the editor when navigating to a different section.
  useEffect(() => {
    setEditingSection(false);
    setSectionSaveError("");
  }, [currentSection?.id]);

  const events = assignLanes(
    prepareEvents(activities, housing, selectedDate)
  );

  /**
   * Moves the sidebar's selected date forward or backward by a given
   * number of days using the date-selection callback from the dashboard.
   *
   * @param {number} amount - Number of days to move; negative for previous days.
   */
  function changeDay(amount) {
    onSelectDate(addDays(selectedDate, amount));
  }

  /**
   * Initializes the trip section editor using the current section's name
   * and color.
   */
  function startSectionEditing() {
    if (!currentSection) return;

    setSectionName(currentSection.name || "");
    setSectionColor(currentSection.hexColor || "#6C8EBF");
    setSectionSaveError("");
    setEditingSection(true);
  }

  /**
   * Closes the trip section editor and clears any displayed save errors.
   */
  function cancelSectionEditing() {
    setEditingSection(false);
    setSectionSaveError("");
  }

  /**
   * Validates and saves the edited trip section name and color.
   * Updates the trip through TripAPI and refreshes the local trip state.
   *
   * @returns {Promise<void>}
   */
  async function saveSectionChanges() {
    if (!currentSection || !trip || !setTrip) return;

    const trimmedName = sectionName.trim();
    const trimmedColor = sectionColor.trim();

    if (!trimmedName) {
      setSectionSaveError("Section name cannot be empty.");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(trimmedColor)) {
      setSectionSaveError("Enter a valid hex color, such as #6C8EBF.");
      return;
    }

    const updatedSections = trip.tripSections.map((section) =>
      section.id === currentSection.id
        ? {
            ...section,
            name: trimmedName,
            hexColor: trimmedColor,
          }
        : section
    );

    try {
      setSavingSection(true);
      setSectionSaveError("");

      const updatedTrip = await TripAPI.update({
        ...trip,
        tripSections: updatedSections,
      });

      setTrip(updatedTrip);
      setEditingSection(false);
    } catch (error) {
      console.error("Failed to update trip section:", error);
      setSectionSaveError("Unable to save section changes.");
    } finally {
      setSavingSection(false);
    }
  }

  /**
   * Removes the currently selected trip section and transfers its duration
   * to an adjacent section. Prevents removing the final remaining section.
   *
   * @returns {Promise<void>}
   */
  async function removeCurrentSection() {
    if (!currentSection || (trip.tripSections ?? []).length <= 1) {
      return;
    }

    const sections = [...trip.tripSections];
    const sectionIndex = sections.findIndex(
      (section) => section.id === currentSection.id
    );

    if (sectionIndex === -1) return;

    const removedSection = sections[sectionIndex];
    const targetIndex = sectionIndex > 0 ? sectionIndex - 1 : 1;

    sections[targetIndex] = {
      ...sections[targetIndex],
      days: sections[targetIndex].days + removedSection.days,
    };

    sections.splice(sectionIndex, 1);

    try {
      const updatedTrip = await TripAPI.update({
        ...trip,
        tripSections: sections,
      });

      setTrip(updatedTrip);
    } catch (error) {
      console.error("Failed to remove section:", error);
    }
  }

  /**
   * Switches an activity between trip-day scheduling and fixed-date scheduling.
   *
   * @param {Object} activity - The activity whose scheduling type is changing.
   * @param {boolean} useFixedDate - Whether the activity should use a fixed date.
   * @returns {Promise<void>}
   */
  async function handleFixedDateChange(activity, useFixedDate) {
    try {
      await switchScheduleType(activity.id, useFixedDate);
      setDropError("");
    } catch {
      setDropError("Unable to change activity scheduling type.");
    }
  }

  /**
   * Calculates the positioning and dimensions of a timeline event.
   * Uses temporary preview times when the event is being dragged or resized.
   *
   * @param {Object} event - The timeline event to position.
   * @returns {Object} CSS positioning and sizing properties for the event.
   */
  function getEventStyle(event) {
    const preview =
      dragPreview?.activityId === event.activity?.id
        ? dragPreview
        : null;

    const start = preview?.start ?? event.start;
    const end = preview?.end ?? event.end;

    const top = (start / 60) * HOUR_HEIGHT;
    const height = Math.max(
      ((end - start) / 60) * HOUR_HEIGHT,
      24
    );

    const width = 100 / event.laneCount;
    const left = width * event.lane;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `${left}%`,
      width: `${width}%`,
    };
  }

  /**
   * Initializes an activity drag or resize operation and registers the
   * necessary pointer event listeners.
   *
   * @param {React.PointerEvent} pointerEvent - The pointer event that started the operation.
   * @param {Object} activity - The activity being moved or resized.
   * @param {string} [mode="move"] - The operation mode: move, resize-start, or resize-end.
   */
  function startActivityDrag(pointerEvent, activity, mode = "move") {
    if (pointerEvent.button !== 0) return;

    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();

    const start = timeToMinutes(activity.startTime);
    const end = getActivityEnd(activity);

    if (start === null || end === null) return;

    dragRef.current = {
      activity,
      mode,
      startY: pointerEvent.clientY,
      originalStart: start,
      originalEnd: end,
      previewStart: start,
      previewEnd: end,
      changed: false,
    };

    setDragPreview({
      activityId: activity.id,
      start,
      end,
    });

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  }

  /**
   * Updates the temporary activity schedule while the pointer moves.
   * Calculates the new start and end times based on the pointer's vertical
   * movement and the current drag mode.
   *
   * @param {PointerEvent} pointerEvent - The pointer movement event.
   */
  function handlePointerMove(pointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaY = pointerEvent.clientY - drag.startY;

    const deltaMinutes =
      Math.round(deltaY / (HOUR_HEIGHT / 4)) * 15;

    let nextStart = drag.originalStart;
    let nextEnd = drag.originalEnd;

    if (drag.mode === "move") {
      const duration = drag.originalEnd - drag.originalStart;

      nextStart = Math.max(
        0,
        Math.min(
          MAX_START_MINUTES - duration,
          drag.originalStart + deltaMinutes
        )
      );

      nextEnd = nextStart + duration;
    } else if (drag.mode === "resize-start") {
      nextStart = Math.max(
        0,
        Math.min(
          drag.originalEnd - 15,
          drag.originalStart + deltaMinutes
        )
      );
    } else if (drag.mode === "resize-end") {
      nextEnd = Math.max(
        drag.originalStart + 15,
        Math.min(
          MAX_TIME_MINUTES,
          drag.originalEnd + deltaMinutes
        )
      );
    }

    drag.previewStart = nextStart;
    drag.previewEnd = nextEnd;

    drag.changed =
      nextStart !== drag.originalStart ||
      nextEnd !== drag.originalEnd;

    setDragPreview({
      activityId: drag.activity.id,
      start: nextStart,
      end: nextEnd,
    });
  }

  /**
   * Completes an activity drag or resize operation and saves the updated
   * schedule through the activity context.
   *
   * @returns {Promise<void>}
   */
  async function handlePointerUp() {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.changed) {
      try {
        await updateActivity({
          ...drag.activity,
          tripDay: null,
          date: selectedDate,
          active: true,
          startTime: minutesToTime(drag.previewStart),
          endTime: minutesToTime(drag.previewEnd),
        });

        setDropError("");
      } catch {
        setDropError("Unable to update this activity.");
      }
    }

    clearDrag();
  }

  /**
   * Cancels an active pointer drag or resize without saving the preview.
   * Clears the drag state and unregisters the pointer listeners.
   */
  function handlePointerCancel() {
    clearDrag();
  }

  /**
   * Resets the current drag operation, removes the drag preview, and unregisters
   * the pointer event listeners.
   */
  function clearDrag() {
    dragRef.current = null;
    setDragPreview(null);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
  }

  /**
   * Allows activities to be dropped onto the sidebar itinerary timeline.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drag-over event.
   */
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  /**
   * Handles dropping an activity onto the sidebar timeline.
   * Calculates its starting time from the drop position, assigns a default
   * one-hour duration, and saves the updated activity for the selected date.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drop event.
   * @returns {Promise<void>}
   */
  async function handleDrop(event) {
    event.preventDefault();

    const activityId = event.dataTransfer.getData(
      "application/x-yonder-activity"
    );

    if (!activityId) return;

    const activity = (activities ?? []).find(
      (item) => String(item.id) === String(activityId)
    );

    if (!activity) {
      setDropError("Could not find that activity.");
      return;
    }

    const rect = timelineRef.current
      ?.querySelector(".itinerary-event-area")
      ?.getBoundingClientRect();

    if (!rect) return;

    const rawMinutes =
      ((event.clientY - rect.top) / HOUR_HEIGHT) * 60;

    const start = Math.max(
      0,
      Math.min(
        MAX_START_MINUTES,
        Math.round(rawMinutes / 15) * 15
      )
    );

    const end = Math.min(start + 60, MAX_TIME_MINUTES);

    try {
      await updateActivity({
        ...activity,
        tripDay: null,
        date: selectedDate,
        active: true,
        startTime: minutesToTime(start),
        endTime: minutesToTime(end),
      });

      setDropError("");
    } catch {
      setDropError("Unable to add this activity to the itinerary.");
    }
  }

  return (
    <div className="itinerary-sidebar">
      <div className="itinerary-header">
        <button
          type="button"
          onClick={() => changeDay(-1)}
          aria-label="Previous day"
        >
          &lt;
        </button>

        <div className="itinerary-date">
          {formatDate(selectedDate)}
        </div>

        <button
          type="button"
          onClick={() => changeDay(1)}
          aria-label="Next day"
        >
          &gt;
        </button>

        <button
          type="button"
          className="itinerary-expand-button"
          onClick={() => navigate("/Itinerary")}
        >
          Expand
        </button>
      </div>

      {currentSection && (
        <div className="itinerary-section-indicator">
          {!editingSection ? (
            <>
              <span
                className="itinerary-section-color"
                style={{
                  backgroundColor: currentSection.hexColor || "#6C8EBF",
                }}
              />

              <button
                type="button"
                className="itinerary-section-name-button"
                onClick={startSectionEditing}
                title="Edit trip section"
              >
                {currentSection.name || "Unnamed section"}
              </button>

              <button
                type="button"
                className="remove-section-button"
                onClick={removeCurrentSection}
                disabled={(trip.tripSections ?? []).length <= 1}
                title="Remove trip section"
              >
                ×
              </button>
            </>
          ) : (
            <div className="itinerary-section-editor">
              <label>
                <span>Section name</span>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(event) => setSectionName(event.target.value)}
                  placeholder="Section name"
                />
              </label>

              <label>
                <span>Hex color</span>
                <input
                  type="text"
                  value={sectionColor}
                  onChange={(event) => setSectionColor(event.target.value)}
                  placeholder="#6C8EBF"
                  maxLength={7}
                />
              </label>

              <div className="itinerary-section-editor-buttons">
                <button
                  type="button"
                  onClick={saveSectionChanges}
                  disabled={savingSection}
                >
                  {savingSection ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={cancelSectionEditing}
                  disabled={savingSection}
                >
                  Cancel
                </button>
              </div>

              {sectionSaveError && (
                <p className="itinerary-section-error">
                  {sectionSaveError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {dropError && (
        <p className="itinerary-drop-error">{dropError}</p>
      )}

      {error && (
        <p className="itinerary-drop-error">{error}</p>
      )}

      {loading && <p className="itinerary-loading">Loading...</p>}

      <div
        className="itinerary-timeline-scroll"
        ref={timelineScrollRef}
      >
        <div
          className="itinerary-timeline"
          ref={timelineRef}
        >
          <HourLabels />

          <div
            className="itinerary-event-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="itinerary-hour-line"
                style={{ top: `${hour * HOUR_HEIGHT}px` }}
              />
            ))}

            {events.map((event) => {
              const preview =
                dragPreview?.activityId === event.activity?.id
                  ? dragPreview
                  : null;

              const isActivity = event.type === "activity";

              return (
                <div
                  key={event.id}
                  className={`itinerary-event ${
                    isActivity
                      ? "itinerary-event-activity"
                      : "itinerary-event-checkin itinerary-event-checkout"
                  } ${
                    preview ? "itinerary-event-dragging" : ""
                  }`}
                  style={getEventStyle(event)}
                  onPointerDown={
                    isActivity
                      ? (pointerEvent) =>
                          startActivityDrag(
                            pointerEvent,
                            event.activity,
                            "move"
                          )
                      : undefined
                  }
                >
                  {isActivity && (
                    <>
                      <div
                        className="itinerary-resize-handle itinerary-resize-top"
                        onPointerDown={(pointerEvent) =>
                          startActivityDrag(
                            pointerEvent,
                            event.activity,
                            "resize-start"
                          )
                        }
                      />

                      <div
                        className="itinerary-resize-handle itinerary-resize-bottom"
                        onPointerDown={(pointerEvent) =>
                          startActivityDrag(
                            pointerEvent,
                            event.activity,
                            "resize-end"
                          )
                        }
                      />
                    </>
                  )}

                  <strong>{event.title}</strong>

                  <span>
                    {formatTime(preview?.start ?? event.start)} –{" "}
                    {formatTime(preview?.end ?? event.end)}
                  </span>

                  {isActivity && (
                    <label
                      className="itinerary-fixed-date-toggle"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={event.activity.fixedDate != null}
                        onChange={(e) =>
                          handleFixedDateChange(
                            event.activity,
                            e.target.checked
                          )
                        }
                      />
                      <span>Fixed Date</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItinerarySidebar;