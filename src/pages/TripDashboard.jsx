
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

export default function TripDashboard() {
  return (
    <div className="trip-dashboard">
      {/* Dashboard header */}
      <header className="dashboard-header">
        <h1>Yonder</h1>
        <span>Trip Planner</span>
      </header>

      {/* Tab navigation */}
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

      {/* Dashboard content and persistent itinerary */}
      <div className="dashboard-body">
        <main className="dashboard-content">
          <Outlet />
        </main>

        <aside
          className="dashboard-itinerary"
          aria-label="Trip itinerary"
        >
          <ItinerarySidebar />
        </aside>
      </div>
    </div>
  );
}
