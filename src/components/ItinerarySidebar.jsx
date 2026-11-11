import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";
import TripAPI from "../api/TripAPI";
import "./ItinerarySidebar.css";

const HOUR_HEIGHT = 72;
const MAX_START_MINUTES = 22 * 60 + 45;
const MAX_TIME_MINUTES = 23 * 60 + 45;

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

function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const safeMinutes = Math.max(
    0,
    Math.min(MAX_TIME_MINUTES, Math.round(minutes / 15) * 15)
  );

  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function getActivityEnd(activity) {
  const start = timeToMinutes(activity.startTime);
  const suppliedEnd = timeToMinutes(activity.endTime);

  if (start === null) return null;

  if (suppliedEnd !== null && suppliedEnd > start) {
    return suppliedEnd;
  }

  return Math.min(start + 60, MAX_TIME_MINUTES);
}

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

  function changeDay(amount) {
    onSelectDate(addDays(selectedDate, amount));
  }

  function startSectionEditing() {
    if (!currentSection) return;

    setSectionName(currentSection.name || "");
    setSectionColor(currentSection.hexColor || "#6C8EBF");
    setSectionSaveError("");
    setEditingSection(true);
  }

  function cancelSectionEditing() {
    setEditingSection(false);
    setSectionSaveError("");
  }

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

  async function handleFixedDateChange(activity, useFixedDate) {
    try {
      await switchScheduleType(activity.id, useFixedDate);
      setDropError("");
    } catch {
      setDropError("Unable to change activity scheduling type.");
    }
  }

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

  function handlePointerCancel() {
    clearDrag();
  }

  function clearDrag() {
    dragRef.current = null;
    setDragPreview(null);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

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