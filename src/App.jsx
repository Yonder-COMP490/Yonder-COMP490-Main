
/**
 * Component name: App
 * Date: 09/09/2026
 * Programmer: Tatiana Cherbaeva
 * Description: Defines the application's routing structure and shared context
 * providers. Wraps the application in activity and housing providers, configures
 * page routes, and displays the AI assistant across all routes.
 *
 * @returns {JSX.Element} The application router and its configured pages.
 */
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

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
