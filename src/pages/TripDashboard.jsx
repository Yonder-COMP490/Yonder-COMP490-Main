import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ItinerarySidebar from "../components/ItinerarySidebar";
import TripAPI from "../api/TripAPI";
import "./TripDashboard.css";

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
  const [trip, setTrip] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [tripError, setTripError] = useState("");

  const location = useLocation();

  useEffect(() => {
    async function loadTrip() {
      try {
        const loadedTrip = await TripAPI.get();

        setTrip(loadedTrip);

        if (loadedTrip.startDate) {
          setSelectedDate(loadedTrip.startDate);
        }

        setTripError("");
      } catch (error) {
        console.error("Unable to load trip:", error);
        setTripError("Unable to load trip information.");
      }
    }

    loadTrip();
  }, []);

  const isItineraryPage = location.pathname === "/Itinerary";

  function selectDate(date) {
    setSelectedDate(date);
  }

  return (
    <div className="trip-dashboard">
      <header className="dashboard-header">
        <h1>Yonder</h1>
        <span>Trip Planner</span>
      </header>

      <nav className="dashboard-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `dashboard-tab ${isActive ? "active" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div
        className={`dashboard-body ${
          isItineraryPage ? "dashboard-body-full" : ""
        }`}
      >
        <main className="dashboard-content">
          {tripError && (
            <p className="trip-error">{tripError}</p>
          )}

          <Outlet
            context={{
              selectedDate,
              selectDate,
              trip,
              setTrip,
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
    </div>
  );
}