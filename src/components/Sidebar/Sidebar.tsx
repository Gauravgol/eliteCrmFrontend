import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="sidebar-container">
      <ul className="sidebar-menu">
        <li onClick={()=>navigate("/dashboard")}>📊 Dashboard</li>
        <li >📝 Tasks</li>
        <li onClick={()=>navigate("/projects")}>📁 Projects</li>
        <li onClick={()=>navigate("/users")}>📁 Users</li>
      </ul>
    </div>
  );
}
