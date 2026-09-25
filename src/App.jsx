import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Calendar from "./pages/Calendar";
import Page3 from "./pages/Page3";
import Maps from "./pages/Maps";
import { ActivityProvider } from "./components/ActivityContext";

function App() {
  return (
    <ActivityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/Calendar" element={<Calendar />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/maps" element={<Maps />} />
        </Routes>
      </BrowserRouter>
    </ActivityProvider>
  );
}

export default App;
