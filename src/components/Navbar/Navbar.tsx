import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.clear();
  navigate("/login", { replace: true });
};


  return (
    <nav className="custom-navbar">
      {/* Invisible left space */}
      <div className="nav-left-space"></div>

      {/* Center title */}
      <span className="nav-title">Elite CRM</span>

      {/* Profile + Dropdown */}
      <div className="nav-profile-wrapper">
        <i
          className="bi bi-person-circle profile-icon"
          onClick={() => setOpen(!open)}
        ></i>

        {open && (
          <div className="profile-dropdown">
            <div className="dropdown-item">Profile</div>
            <div className="dropdown-item">Settings</div>
            <div className="dropdown-item logout" onClick={()=>handleLogout()}>Logout</div>
          </div>
        )}
      </div>
    </nav>
  );
}
