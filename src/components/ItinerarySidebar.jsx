
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function ItinerarySidebar({
  selectedDate,
  onSelectDate,
  view,
  onViewChange,
}) {
  const { activities, loading, error } = useActivities();
  const { housing } = useHousing();

  const events = [];

  // Activity events
  activities.forEach((activity) => {
    if (!activity.date) return;

    events.push({
      id: `activity-${activity.id}`,
      date: activity.date,
      time: activity.startTime || "",
      title: activity.name,
      type: "Activity",
    });
  });

  // Housing check-in and check-out events
  housing.forEach((item) => {
    if (item.checkInDate) {
      events.push({
        id: `checkin-${item.id}`,
        date: item.checkInDate,
        time: item.checkInTime || "",
        title: item.name,
        type: "Check-in",
      });
    }

    if (item.checkOutDate) {
      events.push({
        id: `checkout-${item.id}`,
        date: item.checkOutDate,
        time: item.checkOutTime || "",
        title: item.name,
        type: "Check-out",
      });
    }

    // Display ongoing hotel stays on intermediate days.
    if (view === "day" &&
        item.checkInDate &&
        item.checkOutDate &&
        selectedDate > item.checkInDate &&
        selectedDate < item.checkOutDate) {
      events.push({
        id: `stay-${item.id}`,
        date: selectedDate,
        time: "",
        title: item.name,
        type: "Staying here",
      });
    }
  });

  events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time)
  );

  const visibleEvents =
    view === "day"
      ? events.filter((event) => event.date === selectedDate)
      : events;

  const groupedEvents = visibleEvents.reduce(
    (groups, event) => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }

      groups[event.date].push(event);
      return groups;
    },
    {}
  );

  function changeDay(amount) {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + amount);

    const newDate =
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, "0")}-` +
      `${String(date.getDate()).padStart(2, "0")}`;

    onSelectDate(newDate);
  }

  return (
    <div className="itinerary-sidebar">
      <h2>Itinerary</h2>
      <p className="sidebar-subtitle">
        Your trip schedule
      </p>

      <div className="sidebar-view-toggle">
        <button
          type="button"
          className={view === "day" ? "active" : ""}
          onClick={() => onViewChange("day")}
          aria-pressed={view === "day"}
        >
          Selected Day
        </button>

        <button
          type="button"
          className={view === "all" ? "active" : ""}
          onClick={() => onViewChange("all")}
          aria-pressed={view === "all"}
        >
          Full Itinerary
        </button>
      </div>

      {view === "day" && (
        <div className="sidebar-day-navigation">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            aria-label="Previous day"
          >
            ←
          </button>

          <strong>{formatDate(selectedDate)}</strong>

          <button
            type="button"
            onClick={() => changeDay(1)}
            aria-label="Next day"
          >
            →
          </button>
        </div>
      )}

      {loading && <p>Loading activities...</p>}

      {error && (
        <p role="alert">
          Unable to load activities: {error}
        </p>
      )}

      {!loading && visibleEvents.length === 0 && (
        <p className="sidebar-empty">
          {view === "day"
            ? "Nothing scheduled for this day."
            : "No activities or accommodations scheduled yet."}
        </p>
      )}

      {Object.entries(groupedEvents).map(
        ([date, dayEvents]) => (
          <section className="sidebar-day" key={date}>
            <h3>{formatDate(date)}</h3>

            {dayEvents.map((event) => (
              <div
                className="sidebar-event"
                key={event.id}
              >
                <span className="sidebar-event-time">
                  {event.time || "Time not set"}
                </span>

                <div className="sidebar-event-details">
                  <strong>{event.title}</strong>
                  <span>{event.type}</span>
                </div>
              </div>
            ))}
          </section>
        )
      )}
    </div>
  );
}
