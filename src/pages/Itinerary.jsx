/**
 * Component name: Itinerary
 * Date: 11/05/2026
 * Programmer: Ryan Sommerhauser
 * Description: Displays a seven-day itinerary with scheduled activities and
 * housing events. Supports dragging activities between dates, moving them
 * along the timeline, and resizing their scheduled durations.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useActivities } from "../components/ActivityContext";
import { useHousing } from "../components/HousingContext";
import "./Itinerary.css";

const HOUR_HEIGHT = 72;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const MAX_START_MINUTES = 22 * 60 + 45;
const MAX_TIME_MINUTES = 23 * 60 + 45;
const DAY_COUNT = 7;

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
 * Formats a date string for display using the specified date options.
 *
 * @param {string} dateString - The date in YYYY-MM-DD format.
 * @param {Object} [options={}] - Optional formatting settings.
 * @param {string} [options.weekday] - The weekday format.
 * @param {string} [options.month] - The month format.
 * @returns {string} The formatted date, or an empty string if no date is provided.
 */
function formatDate(dateString, options = {}) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: options.weekday || "short",
    month: options.month || "short",
    day: "numeric",
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
 * Creates timeline events for activities scheduled on a specific date.
 *
 * @param {Array<Object>} activities - The activities to filter.
 * @param {string} date - The date to retrieve activities for.
 * @returns {Array<Object>} The activity events with their titles and times.
 */
function getActivityEvents(activities, date) {
  return activities
    .filter(
      (activity) =>
        activity != null &&
        activity.date === date &&
        timeToMinutes(activity.startTime) !== null
    )
    .map((activity) => {
      const start = timeToMinutes(activity.startTime);
      const end = getActivityEnd(activity);

      return {
        id: `activity-${activity.id}`,
        type: "activity",
        activity,
        title: activity.description?.name || "Untitled activity",
        start,
        end,
      };
    });
}

/**
 * Creates timeline events for housing check-ins and check-outs occurring
 * on a specific date.
 *
 * @param {Array<Object>} housing - The housing bookings to evaluate.
 * @param {string} date - The date to retrieve housing events for.
 * @returns {Array<Object>} The matching check-in and check-out events.
 */
function getHousingEvents(housing, date) {
  const events = [];

  housing.forEach((booking) => {
    if (!booking) return;

    const bookingName = booking.description?.name;
    const readableAddress = booking.location?.readableAddress;

    if (booking.checkInDate === date) {
      const start = timeToMinutes(booking.checkInTime) ?? 15 * 60;

      events.push({
        id: `housing-checkin-${booking.id}`,
        type: "checkin",
        title: bookingName || readableAddress || "Housing check-in",
        start,
        end: Math.min(start + 30, MAX_TIME_MINUTES),
      });
    }

    if (booking.checkOutDate === date) {
      const start = timeToMinutes(booking.checkOutTime) ?? 11 * 60;

      events.push({
        id: `housing-checkout-${booking.id}`,
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
      (other) =>
        other.start < event.end &&
        other.end > event.start
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
 * Description: Renders the hourly labels displayed alongside the weekly
 * itinerary timeline.
 *
 * @returns {JSX.Element} The hourly timeline labels.
 */
function HourLabels() {
  return (
    <div className="week-hour-labels">
      {Array.from({ length: 24 }, (_, hour) => (
        <div className="week-hour-label" key={hour}>
          {formatTime(hour * 60)}
        </div>
      ))}
    </div>
  );
}

/**
 * Component name: Itinerary
 * Description: Displays a seven-day scheduling grid using the selected trip
 * date, activities, and housing bookings. Handles activity dragging,
 * repositioning, resizing, and adding activities to the itinerary.
 *
 * @returns {JSX.Element} The expanded weekly itinerary.
 */
export default function Itinerary() {
  const { selectedDate, selectDate } = useOutletContext();

  const {
    activities,
    loading,
    error,
    updateActivity,
  } = useActivities();

  const { housing } = useHousing();

  // Ignore null entries in API data.
  const validActivities = Array.isArray(activities)
    ? activities.filter((activity) => activity != null)
    : [];

  const validHousing = Array.isArray(housing)
    ? housing.filter((booking) => booking != null)
    : [];

  const [windowStart, setWindowStart] = useState(
    addDays(selectedDate, -3)
  );

  const [dragPreview, setDragPreview] = useState(null);
  const [dropError, setDropError] = useState("");

  const scrollRef = useRef(null);
  const dayAreaRefs = useRef({});
  const dragRef = useRef(null);

  const dates = useMemo(
    () =>
      Array.from({ length: DAY_COUNT }, (_, index) =>
        addDays(windowStart, index)
      ),
    [windowStart]
  );

  // Center the selected date when entering the expanded page.
  useEffect(() => {
    setWindowStart(addDays(selectedDate, -3));
  }, []);

  // Initially show the timeline around 6 AM.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = HOUR_HEIGHT * 6;
    }
  }, []);

  /**
   * Shifts the displayed seven-day window and updates the selected date
   * by the same number of days.
   *
   * @param {number} amount - The number of days to shift the window.
   */
  function shiftWindow(amount) {
    const nextStart = addDays(windowStart, amount);

    setWindowStart(nextStart);
    selectDate(addDays(selectedDate, amount));
  }

  function chooseDate(date) {
    selectDate(date);
  }

  /**
   * Retrieves and arranges all activity and housing events for a specific date.
   *
   * @param {string} date - The date to retrieve events for.
   * @returns {Array<Object>} The sorted timeline events with assigned lanes.
   */
  function getEventsForDate(date) {
    return assignLanes([
      ...getActivityEvents(validActivities, date),
      ...getHousingEvents(validHousing, date),
    ]);
  }

  /**
   * Calculates the positioning and dimensions of a timeline event.
   * Uses preview times when the event is being dragged or resized.
   *
   * @param {Object} event - The timeline event to position.
   * @param {?Object} preview - Optional temporary timing information.
   * @returns {Object} CSS positioning and sizing properties for the event.
   */
  function getEventStyle(event, preview) {
    const start = preview?.start ?? event.start;
    const end = preview?.end ?? event.end;
    const top = start * MINUTE_HEIGHT;
    const height = Math.max((end - start) * MINUTE_HEIGHT, 24);
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
      pointerId: pointerEvent.pointerId,
      startY: pointerEvent.clientY,
      originalStart: start,
      originalEnd: end,
      previewStart: start,
      previewEnd: end,
      sourceDate: activity.date,
      changed: false,
    };

    setDragPreview({
      activityId: activity.id,
      date: activity.date,
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
      Math.round(deltaY / (MINUTE_HEIGHT * 15)) * 15;

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
      date: drag.sourceDate,
      start: nextStart,
      end: nextEnd,
    });
  }

  /**
   * Determines which day column an activity was dropped into by checking
   * the pointer position against the visible day areas.
   *
   * @param {PointerEvent} pointerEvent - The pointer release event.
   * @param {string} fallbackDate - The original activity date if no column matches.
   * @returns {string} The date corresponding to the drop location.
   */
  function getDropDate(pointerEvent, fallbackDate) {
    for (const date of dates) {
      const element = dayAreaRefs.current[date];

      if (!element) continue;

      const rect = element.getBoundingClientRect();

      if (
        pointerEvent.clientX >= rect.left &&
        pointerEvent.clientX <= rect.right &&
        pointerEvent.clientY >= rect.top &&
        pointerEvent.clientY <= rect.bottom
      ) {
        return date;
      }
    }

    return fallbackDate;
  }

  /**
   * Completes an activity drag or resize operation and saves the updated
   * schedule through the activity context.
   *
   * @param {PointerEvent} pointerEvent - The pointer release event.
   * @returns {Promise<void>}
   */
  async function handlePointerUp(pointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;

    const targetDate =
      drag.mode === "move"
        ? getDropDate(pointerEvent, drag.sourceDate)
        : drag.sourceDate;

    if (drag.changed) {
      try {
        await updateActivity({
          ...drag.activity,
          tripDay: null,
          date: targetDate,
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
   * Allows activities to be dropped into a timeline day column.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drag-over event.
   */
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  /**
   * Handles dropping an activity from another component onto a timeline day.
   * Calculates its starting time from the drop position, assigns a default
   * one-hour duration, and saves the updated activity.
   *
   * @param {React.DragEvent<HTMLDivElement>} event - The drop event.
   * @param {string} date - The date of the timeline column receiving the activity.
   * @returns {Promise<void>}
   */
  async function handleDrop(event, date) {
    event.preventDefault();

    const activityId = event.dataTransfer.getData(
      "application/x-yonder-activity"
    );

    if (!activityId) return;

    const activity = validActivities.find(
      (item) => String(item.id) === String(activityId)
    );

    if (!activity) {
      setDropError("Could not find that activity.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const rawMinutes =
      ((event.clientY - rect.top) / HOUR_HEIGHT) * 60;

    const start = Math.max(
      0,
      Math.min(MAX_START_MINUTES, Math.round(rawMinutes / 15) * 15)
    );

    const end = Math.min(start + 60, MAX_TIME_MINUTES);

    try {
      await updateActivity({
        ...activity,
        tripDay: null,
        date,
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
    <div className="expanded-itinerary">
      <div className="expanded-itinerary-header">
        <div>
          <h1>Itinerary</h1>
          <p>
            {formatDate(dates[0], { weekday: "short" })} –{" "}
            {formatDate(dates[6], { weekday: "short" })}
          </p>
        </div>

        <div className="itinerary-day-navigation">
          <button type="button" onClick={() => shiftWindow(-1)}>
            Previous Day
          </button>
          <button type="button" onClick={() => shiftWindow(1)}>
            Next Day
          </button>
        </div>
      </div>

      {dropError && (
        <p className="expanded-itinerary-error">{dropError}</p>
      )}

      {error && (
        <p className="expanded-itinerary-error">{error}</p>
      )}

      {loading && <p>Loading activities...</p>}

      <div className="week-scroll" ref={scrollRef}>
        <div className="week-grid">
          <div className="week-header-row">
            <div className="week-header-spacer" />

            {dates.map((date) => (
              <button
                type="button"
                key={date}
                className={`week-day-header ${
                  date === selectedDate ? "selected" : ""
                }`}
                onClick={() => chooseDate(date)}
              >
                <strong>
                  {formatDate(date, { weekday: "short" })}
                </strong>
                <span>
                  {formatDate(date, { month: "short" })}
                </span>
              </button>
            ))}
          </div>

          <div className="week-timeline-row">
            <HourLabels />

            {dates.map((date) => {
              const events = getEventsForDate(date);

              return (
                <div
                  key={date}
                  className={`week-day-column ${
                    date === selectedDate ? "selected" : ""
                  }`}
                >
                  <div
                    className="week-day-event-area"
                    ref={(element) => {
                      dayAreaRefs.current[date] = element;
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, date)}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="week-hour-line"
                        style={{ top: `${hour * HOUR_HEIGHT}px` }}
                      />
                    ))}

                    {events.map((event) => {
                      const preview =
                        dragPreview &&
                        event.type === "activity" &&
                        dragPreview.activityId === event.activity?.id &&
                        dragPreview.date === date
                          ? dragPreview
                          : null;

                      const eventClass =
                        event.type === "activity"
                          ? "week-event-activity"
                          : "week-event-housing";

                      return (
                        <div
                          key={event.id}
                          className={`week-event ${eventClass} ${
                            preview ? "week-event-dragging" : ""
                          }`}
                          style={getEventStyle(event, preview)}
                          onPointerDown={
                            event.type === "activity"
                              ? (pointerEvent) =>
                                  startActivityDrag(
                                    pointerEvent,
                                    event.activity,
                                    "move"
                                  )
                              : undefined
                          }
                        >
                          {event.type === "activity" && (
                            <>
                              <div
                                className="week-resize-handle top"
                                onPointerDown={(pointerEvent) =>
                                  startActivityDrag(
                                    pointerEvent,
                                    event.activity,
                                    "resize-start"
                                  )
                                }
                              />

                              <div
                                className="week-resize-handle bottom"
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}