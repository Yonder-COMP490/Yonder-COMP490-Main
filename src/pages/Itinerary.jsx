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

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString, options = {}) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: options.weekday || "short",
    month: options.month || "short",
    day: "numeric",
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

function getActivityEnd(activity) {
  const start = timeToMinutes(activity.startTime);
  const suppliedEnd = timeToMinutes(activity.endTime);

  if (start === null) return null;

  if (suppliedEnd !== null && suppliedEnd > start) {
    return suppliedEnd;
  }

  return Math.min(start + 60, MAX_TIME_MINUTES);
}

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

  function shiftWindow(amount) {
    const nextStart = addDays(windowStart, amount);

    setWindowStart(nextStart);
    selectDate(addDays(selectedDate, amount));
  }

  function chooseDate(date) {
    selectDate(date);
  }

  function getEventsForDate(date) {
    return assignLanes([
      ...getActivityEvents(validActivities, date),
      ...getHousingEvents(validHousing, date),
    ]);
  }

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