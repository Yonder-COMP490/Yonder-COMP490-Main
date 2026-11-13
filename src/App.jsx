
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import TripDashboard from "./pages/TripDashboard";
import Activities from "./pages/Activities";
import Housing from "./pages/Housing";
import Calendar from "./pages/Calendar";
import Page3 from "./pages/Page3";
import Maps from "./pages/Maps";
import Budget from "./pages/Budget";
import UserInfo from "./pages/UserInfo";
import Itinerary from "./pages/Itinerary";
import BackendTest from "./components/BackendTest";
import AIAssistant from "./components/AIAssistant";

import { ActivityProvider } from "./components/ActivityContext";
import { HousingProvider } from "./components/HousingContext";

/**
 * Redirects the dashboard's base route to the Calendar page.
 *
 * Preserves the URL query parameters, including the selected
 * trip ID, so navigation does not switch to another trip.
 *
 * @returns {JSX.Element} A redirect to the Calendar route.
 */
function DashboardRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname: "/Calendar",
        search: location.search,
      }}
      replace
    />
  );
}

/**
 * Provides trip-specific activity and housing data to
 * child components.
 *
 * Extracts the trip ID from the URL query parameters and
 * defaults to trip 1 when no valid ID is provided.
 *
 * Uses trip-specific React keys to remount the Context
 * providers when the selected trip changes, preventing
 * data from a previous trip from remaining in the new
 * trip's state.
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Components
 * that require access to trip-specific Context providers.
 * @returns {JSX.Element} Nested activity and housing providers.
 */
function TripScopedProviders({ children }) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const requestedId = Number(params.get("tripId") || 1);

  const tripId =
    Number.isInteger(requestedId) && requestedId > 0
      ? requestedId
      : 1;

  return (
    <ActivityProvider key={`activity-${tripId}`} tripId={tripId}>
      <HousingProvider key={`housing-${tripId}`} tripId={tripId}>
        {children}
      </HousingProvider>
    </ActivityProvider>
  );
}

/**
 * Defines the application's page routes and shared components.
 *
 * Groups the trip management pages under TripDashboard so
 * they share dashboard navigation and trip-specific state.
 * Wraps routes in trip-scoped providers and renders the
 * AI assistant alongside the application routes.
 *
 * @returns {JSX.Element} Application routes and shared providers.
 */
function AppRoutes() {
  return (
    <TripScopedProviders>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<TripDashboard />}>
          <Route
            path="/dashboard"
            element={<DashboardRedirect />}
          />

          <Route path="/Calendar" element={<Calendar />} />
          <Route path="/Activities" element={<Activities />} />
          <Route path="/Housing" element={<Housing />} />
          <Route path="/Budget" element={<Budget />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/Itinerary" element={<Itinerary />} />
        </Route>

        <Route path="/page3" element={<Page3 />} />
        <Route path="/userinfo" element={<UserInfo />} />
        <Route
          path="/backend-test"
          element={<BackendTest />}
        />
      </Routes>

      <AIAssistant />
    </TripScopedProviders>
  );
}

/**
 * Initializes the Yonder application with React Router.
 *
 * Provides browser-based navigation to all application
 * routes through the AppRoutes component.
 *
 * @component
 * @returns {JSX.Element} The application's root component.
 *
 * @author A. Garcia
 * @version 1.0
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
