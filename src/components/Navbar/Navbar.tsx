import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css";

// Static notification data
const NOTIFICATIONS = [
  {
    id: 1,
    title: "New Task Assigned",
    message: "You have been assigned to 'Update Dashboard UI'",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    title: "Project Update",
    message: "Solar Panel Installation project status changed to In Progress",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Comment Added",
    message: "John commented on your task 'Fix Login Bug'",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "Deadline Reminder",
    message: "Task 'API Integration' is due tomorrow",
    time: "3 hours ago",
    read: true,
  },
];

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <nav className="custom-navbar">
      {/* Invisible left space */}
      <div className="nav-left-space"></div>

      {/* Center title */}
      <span className="nav-title">Solar Sync Solutions</span>

      {/* Right side icons */}
      <div className="nav-right-icons">
        {/* Notification Bell */}
        <div className="notification-wrapper">
          <i
            className="bi bi-bell-fill notification-icon"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          ></i>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}

          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h6>Notifications</h6>
                <span className="notification-count">{unreadCount} new</span>
              </div>

              <div className="notification-list">
                {NOTIFICATIONS.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? "read" : "unread"
                      }`}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))}
              </div>

              <div className="notification-footer">
                <a href="#">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        {/* Profile Icon */}
        <div className="nav-profile-wrapper">
          <i
            className="bi bi-person-circle profile-icon"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          ></i>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Settings</div>
              <div className="dropdown-item logout" onClick={() => handleLogout()}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
