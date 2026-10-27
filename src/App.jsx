
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import TripDashboard from "./pages/TripDashboard";
import Activities from "./pages/Activities";
import Housing from "./pages/Housing";
import Calendar from "./pages/Calendar";
import Page3 from "./pages/Page3";
import Maps from "./pages/Maps";
import Budget from "./pages/Budget";
import UserInfo from "./pages/UserInfo";
import BackendTest from "./components/BackendTest";

import { ActivityProvider } from "./components/ActivityContext";
import { HousingProvider } from "./components/HousingContext";

function App() {
  return (
    <ActivityProvider>
      <HousingProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route element={<TripDashboard />}>
                <Route
                  path="/dashboard"
                  element={<Navigate to="/Calendar" replace />}
                />
                <Route path="/Calendar" element={<Calendar />} />
                <Route path="/Activities" element={<Activities />} />
                <Route path="/Housing" element={<Housing />} />
                <Route path="/Budget" element={<Budget />} />
                <Route path="/maps" element={<Maps />} />
              </Route>

              <Route path="/page3" element={<Page3 />} />
              <Route path="/userinfo" element={<UserInfo />} />
              <Route path="/backend-test" element={<BackendTest />} />
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </HousingProvider>
    </ActivityProvider>
  );
}

export default App;
