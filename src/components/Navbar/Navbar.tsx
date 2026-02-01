import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";
import moment from "moment";

interface NavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ isCollapsed, toggleSidebar }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const userId = "6940447a596e4f73ec2b354b"; // As provided by user
  const urn = "6789608787678687687"; // As provided by user

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  const fetchNotifications = async (p: number, isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/getNotification?userId=${userId}&page=${p}&limit=5`, {
        headers: { urn }
      });

      if (res.data?.responseCode === "200") {
        const newList = res.data.apiResponseData.list;
        const pagination = res.data.apiResponseData.pagination;

        if (isInitial) {
          setNotifications(newList);
        } else {
          setNotifications(prev => [...prev, ...newList]);
        }

        setHasMore(pagination.currentPage < pagination.totalPages);

        // Update unread count based on the first page or total if available
        if (isInitial) {
          const count = newList.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <nav className="custom-navbar">
      <div className="nav-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <span className="nav-title">Solar Sync Solutions</span>
      </div>

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

              <div className="notification-list" ref={listRef} onScroll={handleScroll}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                    onClick={() => {
                      if (notification.entityType === "TASK") {
                        navigate(`/task/${notification.entityId}`);
                      }
                    }}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {moment(notification.createdAt).fromNow()}
                      </div>
                    </div>
                    {!notification.isRead && <div className="unread-dot"></div>}
                  </div>
                ))}
                {loading && <div className="notification-loading">Loading...</div>}
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

