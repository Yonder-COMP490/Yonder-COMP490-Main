import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ItinerarySidebar from "../components/ItinerarySidebar";
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
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const location = useLocation();

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
          <Outlet context={{ selectedDate, selectDate }} />
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