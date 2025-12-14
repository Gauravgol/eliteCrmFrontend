import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import Login from "./components/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Projects from "./components/Projects/Projects";
import NewProject from "./components/NewProjects/NewProject";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  // simple auth check (later you can replace with context / redux)
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  // ❌ NOT LOGGED IN → SHOW LOGIN ONLY
  if (!isLoggedIn) {
    return <Login />;
  }

  // ✅ LOGGED IN → SHOW APP
  return (
    <>
      {/* Layout */}
      <Navbar />
      <Sidebar />

      {/* Pages */}
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </>
  );
}

export default App;
