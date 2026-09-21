import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Page2 from "./pages/Page2";
import Page3 from "./pages/Page3";
import { ActivityProvider } from "./components/ActivityContext";

function App() {
  return (
    <ActivityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
        </Routes>
      </BrowserRouter>
    </ActivityProvider>
  );
}

export default App;