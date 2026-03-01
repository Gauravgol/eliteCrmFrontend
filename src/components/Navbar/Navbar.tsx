import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";
import moment from "moment";
import { getNotifications, markNotificationsAsRead } from "../../api/notification.api";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [canScroll, setCanScroll] = useState(false);

  const { unreadCount, setUnreadCount } = useSocket();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const userId = JSON.parse(localStorage.getItem("user") || "{}");

  /* REMOVED INITIAL FETCH useEffect */

  const fetchNotifications = async (p: number, isInitial: boolean = false, customLimit: number = 5) => {
    if (loading || (!hasMore && !isInitial)) return [];
    setLoading(true);
    try {
      const data: any = await getNotifications(userId.id, p, customLimit);

      const newList = data.list;
      const pagination = data.pagination;

      if (isInitial) {
        setNotifications(newList);
      } else {
        setNotifications(prev => [...prev, ...newList]);
      }

      setHasMore(pagination.currentPage < pagination.totalPages);

      // Removed setUnreadCount logic from here as it's now handled by socket/manual action

      return newList;
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async () => {
    // If closing
    if (notificationsOpen) {
      setNotificationsOpen(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // If opening
    setNotificationsOpen(true);
    setProfileOpen(false);
    setCanScroll(false); // Reset scroll on open
    setPage(1); // Reset page

    // Fetch initial 4 notifications
    const list = await fetchNotifications(1, true, 4);

    // Set 5-second timer to mark as read
    if (list && list.length > 0) {
      timerRef.current = setTimeout(async () => {
        const unreadIds = list.filter((n: any) => !n.isRead).map((n: any) => n._id);

        if (unreadIds.length > 0) {
          try {
            await markNotificationsAsRead(unreadIds, userId.id);

            // Update local state visuals
            setNotifications(prev =>
              prev.map(n => unreadIds.includes(n._id) ? { ...n, isRead: true } : n)
            );

            // Decrease global unread count
            setUnreadCount(prev => Math.max(0, prev - unreadIds.length));
          } catch (error) {
            console.error("Failed to mark notifications read on timeout", error);
          }
        }
      }, 5000);
    }
  };

  const handleViewMore = async () => {
    setCanScroll(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, false, 4);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationsAsRead([notificationId], userId.id);

      // Update local state for immediate feedback
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleScroll = () => {
    if (!listRef.current || !canScroll) return;
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

      </div>
      <div>  <p className="nav-title">Solar Sync Solutions</p></div>
      {/* Right side icons */}
      <div className="nav-right-icons">
        {/* Theme Toggle */}
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer", marginRight: "10px" }} onClick={toggleTheme}>
          {theme === "light" ? (
            <i className="bi bi-moon-fill" style={{ fontSize: "1.2rem", color: "var(--navbar-text)" }} title="Switch to Dark Mode"></i>
          ) : (
            <i className="bi bi-sun-fill" style={{ fontSize: "1.2rem", color: "var(--navbar-text)" }} title="Switch to Light Mode"></i>
          )}
        </div>
        {/* Notification Bell */}
        <div className="notification-wrapper">
          <i
            className="bi bi-bell-fill notification-icon"
            onClick={handleNotificationClick}
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

              <div
                className="notification-list"
                ref={listRef}
                onScroll={handleScroll}
                style={{ overflowY: canScroll ? 'auto' : 'hidden', maxHeight: canScroll ? '300px' : 'auto' }}
              >
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification._id);
                      }
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

              {!canScroll && hasMore && (
                <div className="notification-footer" onClick={handleViewMore} style={{ cursor: 'pointer' }}>
                  <span className="text-primary">View More</span>
                </div>
              )}
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

