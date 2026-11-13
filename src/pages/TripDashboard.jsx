
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ItinerarySidebar from "../components/ItinerarySidebar";
import "./TripDashboard.css";

const API_BASE = "http://localhost:8080/api";

const tabs = [
  { label: "Calendar", path: "/Calendar" },
  { label: "Activities", path: "/Activities" },
  { label: "Housing", path: "/Housing" },
  { label: "Budget", path: "/Budget" },
  { label: "Maps", path: "/maps" },
];

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TripDashboard() {
  const location = useLocation();

  // Read the selected trip from the URL.
  // Example: /dashboard?tripId=2
  const params = new URLSearchParams(location.search);
  const requestedTripId = Number(params.get("tripId") || 1);
  const tripId =
    Number.isInteger(requestedTripId) && requestedTripId > 0
      ? requestedTripId
      : 1;

  const tripQuery = `?tripId=${tripId}`;

  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  const isItineraryPage =
    location.pathname.toLowerCase() === "/itinerary";

  // Load the selected trip whenever its ID changes.
  useEffect(() => {
    let cancelled = false;

    async function loadTrip() {
      setTripLoading(true);
      setTrip(null);
      setTripError("");

      try {
        const response = await fetch(
          `${API_BASE}/trips/${tripId}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load trip (${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setTrip(data);

          // Start the calendar on the trip's first day.
          setSelectedDate(
            data.startDate || getTodayString()
          );
        }
      } catch (error) {
        console.error("Could not load selected trip:", error);

        if (!cancelled) {
          setTripError(error.message);
        }
      } finally {
        if (!cancelled) {
          setTripLoading(false);
        }
      }
    }

    loadTrip();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  function selectDate(date) {
    setSelectedDate(date);
  }

  return (
    <div className="trip-dashboard">
      <header className="dashboard-header">
        <h1>Yonder</h1>

        <span>
          {tripLoading
            ? "Loading trip..."
            : trip
              ? trip.name
              : "Trip Planner"}
        </span>
      </header>

      <nav className="dashboard-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`${tab.path}${tripQuery}`}
            className={({ isActive }) =>
              `dashboard-tab ${isActive ? "active" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {tripError && (
        <p role="alert" className="home-error">
          {tripError}
        </p>
      )}

      {!tripLoading && trip && (
        <div
          className={`dashboard-body ${
            isItineraryPage ? "dashboard-body-full" : ""
          }`}
        >
          <main className="dashboard-content">
            <Outlet
              context={{
                selectedDate,
                selectDate,
                trip,
                tripId,
              }}
            />
          </main>

          {!isItineraryPage && (
            <aside
              className="dashboard-itinerary"
              aria-label="Trip itinerary"
            >
              <ItinerarySidebar
                selectedDate={selectedDate}
                onSelectDate={selectDate}
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
