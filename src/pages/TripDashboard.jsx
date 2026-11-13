
import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

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

/**
 * Returns the current local date in YYYY-MM-DD format.
 *
 * Uses the device's local date instead of UTC to prevent
 * the selected calendar day from shifting across time zones.
 *
 * @returns {string} Current local date.
 */
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Displays the dashboard for a selected trip in Yonder.
 *
 * Retrieves the trip ID from the URL and loads the corresponding
 * trip information from the backend. Maintains the selected
 * calendar date and shares trip-specific data with nested pages
 * through React Router's Outlet context.
 *
 * Preserves the selected trip ID when navigating between
 * dashboard tabs and displays the itinerary sidebar except
 * when viewing the full-width Itinerary page.
 *
 * @component
 * @returns {JSX.Element} The trip dashboard interface.
 *
 * @author A. Garcia
 * @version 1.0
 */
export default function TripDashboard() {
  const location = useLocation();

  // Read the selected trip from the URL.
  // Example: /Calendar?tripId=2
  const params = new URLSearchParams(location.search);
  const requestedTripId = Number(params.get("tripId") || 1);

  const tripId =
    Number.isInteger(requestedTripId) &&
    requestedTripId > 0
      ? requestedTripId
      : 1;

  // Preserve the selected trip when navigating between tabs.
  const tripQuery = `?tripId=${tripId}`;

  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState("");

  const [selectedDate, setSelectedDate] =
    useState(getTodayString);

  // Hide the sidebar on the full-width Itinerary page.
  const isItineraryPage =
    location.pathname.toLowerCase() === "/itinerary";

  /**
   * Loads the selected trip whenever its ID changes.
   *
   * Clears the previous trip before retrieving updated data
   * from GET /api/trips/{tripId}. Initializes the calendar
   * to the trip's start date after a successful response.
   *
   * Uses a cancellation flag to prevent outdated asynchronous
   * responses from updating state after the component unmounts
   * or the selected trip changes.
   */
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

        const loadedTrip = await response.json();

        if (!cancelled) {
          setTrip(loadedTrip);

          // Open the calendar on the selected trip's
          // starting date.
          setSelectedDate(
            loadedTrip.startDate || getTodayString()
          );

          setTripError("");
        }
      } catch (error) {
        console.error(
          "Unable to load selected trip:",
          error
        );

        if (!cancelled) {
          setTripError(
            error.message ||
              "Unable to load trip information."
          );
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

  /**
   * Updates the date shared by the dashboard's nested pages
   * and itinerary sidebar.
   *
   * @param {string} date - Selected date in YYYY-MM-DD format.
   * @returns {void}
   */
  function selectDate(date) {
    setSelectedDate(date);
  }

  return (
    <div className="trip-dashboard">
      {/* Dashboard header */}
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

      {/* Trip-specific navigation */}
      <nav className="dashboard-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`${tab.path}${tripQuery}`}
            className={({ isActive }) =>
              `dashboard-tab ${
                isActive ? "active" : ""
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Error message */}
      {tripError && (
        <p
          role="alert"
          className="trip-error"
        >
          {tripError}
        </p>
      )}

      {/* Loading state */}
      {tripLoading && (
        <div className="dashboard-body">
          <main className="dashboard-content">
            <p>Loading trip information...</p>
          </main>
        </div>
      )}

      {/* Trip dashboard content */}
      {!tripLoading && trip && (
        <div
          className={`dashboard-body ${
            isItineraryPage
              ? "dashboard-body-full"
              : ""
          }`}
        >
          <main className="dashboard-content">
            <Outlet
              context={{
                selectedDate,
                selectDate,
                trip,
                setTrip,
                tripId,
              }}
            />
          </main>

          {/* Sidebar hidden on the Itinerary page */}
          {!isItineraryPage && (
            <aside
              className="dashboard-itinerary"
              aria-label="Trip itinerary"
            >
              <ItinerarySidebar
                selectedDate={selectedDate}
                onSelectDate={selectDate}
                trip={trip}
                setTrip={setTrip}
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
