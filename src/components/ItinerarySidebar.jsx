
import { useEffect, useRef } from "react";
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";
import "./ItinerarySidebar.css";

const HOUR_HEIGHT = 72;
const DAY_MINUTES = 24 * 60;

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function timeToMinutes(time) {
  if (!time) return null;

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTime(time) {
  const minutes = timeToMinutes(time);

  if (minutes === null) return "Time not set";

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const suffix = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(remainder).padStart(2, "0")} ${suffix}`;
}

function addDays(dateString, amount) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + amount);

  return (
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")}`
  );
}

function prepareEvents(activities, housing) {
  const events = [];

  activities.forEach((activity) => {
    if (!activity.date) return;

    const start = timeToMinutes(activity.startTime);
    const end = timeToMinutes(activity.endTime);

    events.push({
      id: `activity-${activity.id}`,
      date: activity.date,
      title: activity.name || "Untitled activity",
      type: "Activity",
      start,
      end:
        start !== null && end !== null && end > start
          ? end
          : start !== null
            ? Math.min(start + 60, DAY_MINUTES)
            : null,
    });
  });

  housing.forEach((item) => {
    if (item.checkInDate) {
      const start = timeToMinutes(item.checkInTime);

      events.push({
        id: `housing-in-${item.id}`,
        date: item.checkInDate,
        title: item.name || "Accommodation",
        type: "Check-in",
        start,
        end: start === null ? null : Math.min(start + 30, DAY_MINUTES),
      });
    }

    if (item.checkOutDate) {
      const start = timeToMinutes(item.checkOutTime);

      events.push({
        id: `housing-out-${item.id}`,
        date: item.checkOutDate,
        title: item.name || "Accommodation",
        type: "Check-out",
        start,
        end: start === null ? null : Math.min(start + 30, DAY_MINUTES),
      });
    }
  });

  return events;
}

function assignLanes(events) {
  const timedEvents = events
    .filter(
      (event) =>
        event.start !== null &&
        event.end !== null &&
        event.end > event.start
    )
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const lanes = [];
  const positioned = [];

  timedEvents.forEach((event) => {
    let lane = lanes.findIndex((laneEnd) => laneEnd <= event.start);

    if (lane === -1) {
      lane = lanes.length;
      lanes.push(event.end);
    } else {
      lanes[lane] = event.end;
    }

    positioned.push({ ...event, lane });
  });

  return positioned.map((event) => ({
    ...event,
    laneCount: lanes.length,
  }));
}

function HourLabels() {
  return (
    <div className="itinerary-hour-labels">
      {Array.from({ length: 24 }, (_, hour) => (
        <div className="itinerary-hour-label" key={hour}>
          {hour === 0
            ? "12 AM"
            : hour < 12
              ? `${hour} AM`
              : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
        </div>
      ))}
    </div>
  );
}

export default function ItinerarySidebar({
  selectedDate,
  onSelectDate,
}) {
  const { activities, loading, error } = useActivities();
  const { housing = [] } = useHousing();

  const timelineScrollRef = useRef(null);

  const events = prepareEvents(activities, housing);

  const currentDate = selectedDate;

  // Start at 6 AM whenever the selected day changes.
  useEffect(() => {
    if (!loading && timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = 6 * HOUR_HEIGHT;
    }
  }, [currentDate, loading]);

  const dayEvents = events.filter(
    (event) => event.date === currentDate
  );

  const timedEvents = assignLanes(dayEvents);

  const untimedEvents = dayEvents.filter(
    (event) => event.start === null || event.end === null
  );

  return (
    <div className="itinerary-sidebar">
      <div className="itinerary-header">
        <button
          type="button"
          className="itinerary-nav-button"
          aria-label="Previous day"
          onClick={() =>
            onSelectDate(addDays(currentDate, -1))
          }
        >
          &#8249;
        </button>

        <div className="itinerary-date-heading">
          <h2>Itinerary</h2>
          <h3>{formatDate(currentDate)}</h3>
        </div>

        <button
          type="button"
          className="itinerary-nav-button"
          aria-label="Next day"
          onClick={() =>
            onSelectDate(addDays(currentDate, 1))
          }
        >
          &#8250;
        </button>
      </div>

      {loading && <p>Loading activities...</p>}

      {error && (
        <p role="alert">Unable to load activities: {error}</p>
      )}

      {!loading && !error && (
        <>
          <div
            className="itinerary-timeline-scroll"
            ref={timelineScrollRef}
          >
            <div
              className="itinerary-timeline"
              style={{
                height: (DAY_MINUTES / 60) * HOUR_HEIGHT,
              }}
            >
              <HourLabels />

              <div className="itinerary-event-area">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    className="itinerary-hour-line"
                    key={hour}
                    style={{
                      top: hour * HOUR_HEIGHT,
                      height: HOUR_HEIGHT,
                    }}
                  />
                ))}

                {timedEvents.map((event) => {
                  const top =
                    (event.start / 60) * HOUR_HEIGHT;

                  const height =
                    ((event.end - event.start) / 60) *
                    HOUR_HEIGHT;

                  const width = 100 / event.laneCount;

                  const startHour = Math.floor(event.start / 60);
                  const startMinute = event.start % 60;
                  const endHour = Math.floor(event.end / 60);
                  const endMinute = event.end % 60;

                  const startTime =
                    `${String(startHour).padStart(2, "0")}:` +
                    `${String(startMinute).padStart(2, "0")}`;

                  const endTime =
                    `${String(endHour).padStart(2, "0")}:` +
                    `${String(endMinute).padStart(2, "0")}`;

                  return (
                    <div
                      className={`itinerary-event itinerary-event-${event.type
                        .toLowerCase()
                        .replace("-", "")}`}
                      key={event.id}
                      title={`${event.title}: ${formatTime(startTime)} – ${formatTime(endTime)}`}
                      style={{
                        top,
                        height: Math.max(height, 22),
                        left: `${event.lane * width}%`,
                        width: `${width}%`,
                      }}
                    >
                      <strong>{event.title}</strong>

                      <span>
                        {formatTime(startTime)} – {formatTime(endTime)}
                      </span>

                      {event.type !== "Activity" && (
                        <small>{event.type}</small>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {untimedEvents.length > 0 && (
            <section className="itinerary-unscheduled">
              <h4>Time not set</h4>

              {untimedEvents.map((event) => (
                <div
                  key={event.id}
                  className="itinerary-unscheduled-event"
                >
                  <strong>{event.title}</strong>
                  <span>{event.type}</span>
                </div>
              ))}
            </section>
          )}

          {dayEvents.length === 0 && (
            <p className="sidebar-empty">
              Nothing scheduled for this day.
            </p>
          )}
        </>
      )}
    </div>
  );
}
