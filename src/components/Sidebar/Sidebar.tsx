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
} from "react-icons/fa";
import "./Sidebar.css";

interface MenuItem {
  path: string;
  label: string;
}

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
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

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <ul className="sidebar-menu">
        {menu.length === 0 ? (
          <>
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
