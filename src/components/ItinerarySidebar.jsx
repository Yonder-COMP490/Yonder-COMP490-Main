
import { useActivities } from "./ActivityContext";
import { useHousing } from "./HousingContext";

export default function ItinerarySidebar() {
  const { activities, loading, error } = useActivities();
  const { housing } = useHousing();

  const events = [];

  // Add scheduled activities.
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

  // Add housing check-in and check-out events.
  housing.forEach((housingItem) => {
    if (housingItem.checkInDate) {
      events.push({
        id: `housing-in-${housingItem.id}`,
        date: housingItem.checkInDate,
        time: housingItem.checkInTime || "",
        title: housingItem.name,
        type: "Check-in",
      });
    }

    if (housingItem.checkOutDate) {
      events.push({
        id: `housing-out-${housingItem.id}`,
        date: housingItem.checkOutDate,
        time: housingItem.checkOutTime || "",
        title: housingItem.name,
        type: "Check-out",
      });
    }
  });

  // Sort all events chronologically.
  events.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time)
  );

  // Group events by their date.
  const groupedEvents = Object.groupBy
    ? Object.groupBy(events, (event) => event.date)
    : events.reduce((groups, event) => {
        (groups[event.date] ||= []).push(event);
        return groups;
      }, {});

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

  return (
    <div className="itinerary-sidebar">
      <h2>Itinerary</h2>
      <p className="sidebar-subtitle">Your trip schedule</p>

      {loading && <p>Loading activities...</p>}

      {error && (
        <p role="alert">Unable to load activities: {error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="sidebar-empty">
          No activities or accommodations scheduled yet.
        </p>
      )}

      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <section className="sidebar-day" key={date}>
          <h3>{formatDate(date)}</h3>

          {dayEvents.map((event) => (
            <div className="sidebar-event" key={event.id}>
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
      ))}
    </div>
  );
}
