import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Housing from "./pages/Housing";
import Calendar from "./pages/Calendar";
import Page3 from "./pages/Page3";
import Maps from "./pages/Maps";
import Budget from "./pages/Budget";

import { ActivityProvider } from "./components/ActivityContext";
import { HousingProvider } from "./components/HousingContext";
import { BudgetProvider } from "./components/BudgetContext";

function App() {
  return (
    <ActivityProvider>
      <HousingProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Activities" element={<Activities />} />
              <Route path="/Housing" element={<Housing />} />
              <Route path="/Calendar" element={<Calendar />} />
              <Route path="/page3" element={<Page3 />} />
              <Route path="/maps" element={<Maps />} />
              <Route path="/Budget" element={<Budget />} />
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </HousingProvider>
    </ActivityProvider>
  );
}

export default App;
