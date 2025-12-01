import { Routes, Route } from "react-router-dom";
import "./App.css";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;
