
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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

  return (
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, "0")}-` +
    `${String(today.getDate()).padStart(2, "0")}`
  );
}

export default function TripDashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [itineraryView, setItineraryView] = useState("all");

  function selectDate(date) {
    setSelectedDate(date);
    setItineraryView("day");
  }

  return (
    <div className="trip-dashboard">
      <header className="dashboard-header">
        <h1>Yonder</h1>
        <span>Trip Planner</span>
      </header>

      <nav
        className="dashboard-tabs"
        aria-label="Trip navigation"
      >
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

      <div className="dashboard-body">
        <main className="dashboard-content">
          <Outlet
            context={{
              selectedDate,
              selectDate,
            }}
          />
        </main>

        <aside
          className="dashboard-itinerary"
          aria-label="Trip itinerary"
        >
          <ItinerarySidebar
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            view={itineraryView}
            onViewChange={setItineraryView}
          />
        </aside>
      </div>
    </div>
  );
}
