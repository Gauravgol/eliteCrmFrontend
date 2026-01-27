import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaTachometerAlt,
  FaFolderOpen,
  FaUsers,
  FaTasks,
  FaComments,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import "./Sidebar.css";

interface MenuItem {
  path: string;
  label: string;
}

export default function Sidebar() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    // if (!user?.id || !token) {
    //   toast.error("Unable to load menu. Please login again.");
    //   return;
    // }

    const fetchMenu = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/getMenu?userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              urn: "sidebar-menu"
            }
          }
        );

        setMenu(res.data.apiResponseData?.menu || []);
      } catch (e) {
        toast.error("Failed to load sidebar menu");
      }
    };

    fetchMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    // Update CSS variable for content area adjustment
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '60px' : '250px'
    );
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <ul className="sidebar-menu">
        {menu.length === 0 ? (
          <>
            {/* Fallback menu (keeps UI usable) */}
            <li
              onClick={() => navigate("/dashboard")}
              title={isCollapsed ? "Dashboard" : ""}
            >
              <FaTachometerAlt />
              {!isCollapsed && <span>Dashboard</span>}
            </li>
          </>
        ) : (
          menu.map((item, index) => (
            <li
              key={index}
              onClick={() => navigate(`/${item.path}`)}
              title={isCollapsed ? item.label : ""}
            >
              {getIcon(item.path)}
              {!isCollapsed && <span>{item.label}</span>}
            </li>
          ))
        )}
      </ul>

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
    </div>
  );
}

/* ---------------- ICON MAPPER ---------------- */
const getIcon = (path: string) => {
  if (path.includes("dashboard")) return <FaTachometerAlt />;
  if (path.includes("projects")) return <FaFolderOpen />;
  if (path.includes("users")) return <FaUsers />;
  if (path.includes("tasks")) return <FaTasks />;
  if (path.includes("chat")) return <FaComments />;
  return <FaFolderOpen />;
};
