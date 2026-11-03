
import { useEffect, useRef, useState } from "react";
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";
import "./ItinerarySidebar.css";

const HOUR_HEIGHT = 72;
const DAY_MINUTES = 24 * 60;
const MAX_START_MINUTES = 22 * 60 + 45;
const MAX_TIME_MINUTES = 23 * 60 + 45;

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString("en-US", {
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
    Math.min(MAX_TIME_MINUTES, minutes)
  );

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes
  ).padStart(2, "0")}`;
}

function formatTime(minutes) {
  if (minutes == null) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const date = new Date();
  date.setHours(hours, remainingMinutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function prepareEvents(activities, housing, currentDate) {
  const events = [];

  activities.forEach((activity) => {
    if (!activity.date || activity.date !== currentDate) return;

    const start = timeToMinutes(activity.startTime);
    const rawEnd = timeToMinutes(activity.endTime);

    let end = null;

    if (start !== null) {
      if (rawEnd !== null && rawEnd > start) {
        end = Math.min(rawEnd, DAY_MINUTES);
      } else {
        end = Math.min(start + 60, MAX_TIME_MINUTES);
      }
    }

    events.push({
      id: `activity-${activity.id}`,
      activity,
      activityId: activity.id,
      date: activity.date,
      title: activity.name || "Untitled activity",
      type: "Activity",
      start,
      end,
    });
  });

  housing.forEach((booking) => {
    if (booking.checkInDate === currentDate) {
      events.push({
        id: `housing-checkin-${booking.id}`,
        date: booking.checkInDate,
        title: booking.name || "Housing check-in",
        type: "Check-in",
        start: timeToMinutes(booking.checkInTime),
        end: null,
      });
    }

    if (booking.checkOutDate === currentDate) {
      events.push({
        id: `housing-checkout-${booking.id}`,
        date: booking.checkOutDate,
        title: booking.name || "Housing check-out",
        type: "Check-out",
        start: timeToMinutes(booking.checkOutTime),
        end: null,
      });
    }
  });

  return events;
}

function assignLanes(events) {
  const timedEvents = events
    .filter((event) => event.start !== null)
    .sort((a, b) => a.start - b.start);

  const groups = [];

  timedEvents.forEach((event) => {
    let group = groups.find(
      (candidate) => candidate.end > event.start
    );

    if (!group) {
      group = {
        end: event.end ?? event.start + 15,
        events: [],
        laneEnds: [],
      };

      groups.push(group);
    }

    let lane = group.laneEnds.findIndex(
      (laneEnd) => laneEnd <= event.start
    );

    if (lane === -1) {
      lane = group.laneEnds.length;
      group.laneEnds.push(0);
    }

    group.laneEnds[lane] = event.end ?? event.start + 15;
    group.end = Math.max(
      group.end,
      event.end ?? event.start + 15
    );

    event.lane = lane;
    group.events.push(event);
  });

  groups.forEach((group) => {
    group.events.forEach((event) => {
      event.laneCount = group.laneEnds.length;
    });
  });

  return timedEvents;
}

function HourLabels() {
  return (
    <div className="itinerary-hour-labels">
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className="itinerary-hour-label"
          style={{ height: HOUR_HEIGHT }}
        >
          {new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })}
        </div>
      ))}
    </div>
  );
}

function ItinerarySidebar() {
  const {
    activities,
    loading,
    error,
    updateActivity,
  } = useActivities();

  const { housing = [] } = useHousing();

  const [currentDate, setCurrentDate] = useState("");
  const [dropError, setDropError] = useState("");
  const [dragPreview, setDragPreview] = useState(null);

  const timelineScrollRef = useRef(null);
  const timelineRef = useRef(null);
  const dragRef = useRef(null);

  // Set the initial date using the first available activity.
  useEffect(() => {
    if (currentDate || activities.length === 0) return;

    const firstScheduledActivity = activities.find(
      (activity) => activity.date
    );

    if (firstScheduledActivity) {
      setCurrentDate(firstScheduledActivity.date);
    }
  }, [activities, currentDate]);

  // Scroll to 6 AM whenever the selected day changes.
  useEffect(() => {
    if (!timelineScrollRef.current) return;

    timelineScrollRef.current.scrollTop = HOUR_HEIGHT * 6;
  }, [currentDate]);

  const events = prepareEvents(
    activities,
    housing,
    currentDate
  );

  const timedEvents = assignLanes(events);

  const unscheduledActivities = activities.filter(
    (activity) => !activity.date
  );

  function startActivityDrag(event, activity, start, end, mode) {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    setDropError("");

    dragRef.current = {
      activity,
      mode,
      startY: event.clientY,
      originalStart: start,
      originalEnd: end,
      previewStart: start,
      previewEnd: end,
    };

    setDragPreview({
      activityId: activity.id,
      start,
      end,
    });
  }

  // Move and resize existing timeline activities.
  useEffect(() => {
    function handlePointerMove(event) {
      const drag = dragRef.current;

      if (!drag) return;

      const difference = event.clientY - drag.startY;

      const minuteDifference =
        Math.round(
          ((difference / HOUR_HEIGHT) * 60) / 15
        ) * 15;

      let start = drag.originalStart;
      let end = drag.originalEnd;

      if (drag.mode === "move") {
        const duration = drag.originalEnd - drag.originalStart;

        start = Math.max(
          0,
          Math.min(
            MAX_START_MINUTES - duration,
            drag.originalStart + minuteDifference
          )
        );

        end = start + duration;
      }

      if (drag.mode === "resize-start") {
        start = Math.max(
          0,
          Math.min(
            drag.originalEnd - 15,
            drag.originalStart + minuteDifference
          )
        );
      }

      if (drag.mode === "resize-end") {
        end = Math.max(
          drag.originalStart + 15,
          Math.min(
            MAX_TIME_MINUTES,
            drag.originalEnd + minuteDifference
          )
        );
      }

      drag.previewStart = start;
      drag.previewEnd = end;

      setDragPreview({
        activityId: drag.activity.id,
        start,
        end,
      });
    }

    async function handlePointerUp() {
      const drag = dragRef.current;

      if (!drag) return;

      dragRef.current = null;
      setDragPreview(null);

      // Don't make an API request if nothing changed.
      if (
        drag.previewStart === drag.originalStart &&
        drag.previewEnd === drag.originalEnd
      ) {
        return;
      }

      try {
        await updateActivity({
          ...drag.activity,
          tripDay: null,
          date: currentDate,
          active: true,
          startTime: minutesToTime(drag.previewStart),
          endTime: minutesToTime(drag.previewEnd),
        });
      } catch (err) {
        setDropError(
          err.message || "Unable to update activity schedule."
        );
      }
    }

    function handlePointerCancel() {
      dragRef.current = null;
      setDragPreview(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener(
        "pointercancel",
        handlePointerCancel
      );
    };
  }, [updateActivity, currentDate]);

  // Drop an unscheduled activity onto the timeline.
  async function handleTimelineDrop(event) {
    event.preventDefault();

    const activityId = event.dataTransfer.getData(
      "application/x-yonder-activity"
    );

    if (!activityId || !timelineRef.current) return;

    const activity = activities.find(
      (item) => String(item.id) === activityId
    );

    if (!activity) return;

    const timelineRect =
      timelineRef.current.getBoundingClientRect();

    const mouseY = event.clientY - timelineRect.top;

    const rawMinutes = (mouseY / HOUR_HEIGHT) * 60;

    const startMinutes = Math.max(
      0,
      Math.min(
        MAX_START_MINUTES,
        Math.round(rawMinutes / 15) * 15
      )
    );

    const endMinutes = Math.min(
      startMinutes + 60,
      MAX_TIME_MINUTES
    );

    setDropError("");

    try {
      await updateActivity({
        ...activity,
        tripDay: null,
        date: currentDate,
        active: true,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
      });
    } catch (err) {
      setDropError(
        err.message || "Unable to schedule activity."
      );
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function changeDay(amount) {
    if (!currentDate) return;

    setCurrentDate((date) => addDays(date, amount));
  }

  if (loading) {
    return <p>Loading itinerary...</p>;
  }

  if (error) {
    return <p role="alert">Failed to load activities: {error}</p>;
  }

  return (
    <div className="itinerary-sidebar">
      <div className="itinerary-header">
        <button
          type="button"
          onClick={() => changeDay(-1)}
          aria-label="Previous day"
        >
          &#8592;
        </button>

        <div className="itinerary-date">
          {currentDate ? formatDate(currentDate) : "Select a day"}
        </div>

        <button
          type="button"
          onClick={() => changeDay(1)}
          aria-label="Next day"
        >
          &#8594;
        </button>
      </div>

      {dropError && (
        <p className="itinerary-drop-error" role="alert">
          {dropError}
        </p>
      )}

      <div
        className="itinerary-timeline-scroll"
        ref={timelineScrollRef}
      >
        <div className="itinerary-timeline">
          <HourLabels />

          <div
            className="itinerary-event-area"
            ref={timelineRef}
            onDragOver={handleDragOver}
            onDrop={handleTimelineDrop}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="itinerary-hour-line"
                style={{
                  top: hour * HOUR_HEIGHT,
                }}
              />
            ))}

            {timedEvents.map((event) => {
              const isActivity = event.type === "Activity";

              let displayStart = event.start;
              let displayEnd = event.end;

              if (
                isActivity &&
                dragPreview?.activityId === event.activityId
              ) {
                displayStart = dragPreview.start;
                displayEnd = dragPreview.end;
              }

              const duration = Math.max(
                15,
                displayEnd - displayStart
              );

              const left =
                (event.lane / event.laneCount) * 100;

              const width = 100 / event.laneCount;

              const isDragging =
                isActivity &&
                dragPreview?.activityId === event.activityId;

              return (
                <div
                  key={event.id}
                  className={`itinerary-event ${
                    isActivity
                      ? "itinerary-event-activity"
                      : ""
                  } ${
                    event.type === "Check-in"
                      ? "itinerary-event-checkin"
                      : ""
                  } ${
                    event.type === "Check-out"
                      ? "itinerary-event-checkout"
                      : ""
                  } ${
                    isDragging
                      ? "itinerary-event-dragging"
                      : ""
                  }`}
                  style={{
                    top: (displayStart / 60) * HOUR_HEIGHT,
                    height: (duration / 60) * HOUR_HEIGHT,
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  onPointerDown={
                    isActivity
                      ? (eventPointer) =>
                          startActivityDrag(
                            eventPointer,
                            event.activity,
                            event.start,
                            event.end,
                            "move"
                          )
                      : undefined
                  }
                  title={
                    isActivity
                      ? "Drag to move this activity"
                      : event.title
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
                            event.start,
                            event.end,
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
                            event.start,
                            event.end,
                            "resize-end"
                          )
                        }
                      />
                    </>
                  )}

                  <strong>{event.title}</strong>

                  {isActivity && (
                    <span>
                      {formatTime(displayStart)} –{" "}
                      {formatTime(displayEnd)}
                    </span>
                  )}

                  {!isActivity && (
                    <span>{event.type}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="itinerary-unscheduled">
        <h3>Unscheduled Activities</h3>

        {unscheduledActivities.length === 0 ? (
          <p>All activities are scheduled.</p>
        ) : (
          <p className="itinerary-unscheduled-instructions">
            Drag an activity's picture from the Activities page
            onto the timeline to schedule it.
          </p>
        )}

        {unscheduledActivities.map((activity) => (
          <div
            key={activity.id}
            className="itinerary-unscheduled-item"
          >
            {activity.name || "Untitled activity"}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItinerarySidebar;
