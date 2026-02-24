
// import { useEffect, useState } from "react";
// import axios from "axios";
// import "./Dashboard.css";

// export default function Dashboard() {
//   const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
//   const token = localStorage.getItem("token");

//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!userFromStorage?.id) {
//       setError("User not found");
//       setLoading(false);
//       return;
//     }

//     fetchUserInfo();
//   }, []);

//   const fetchUserInfo = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/getUserInfo?userId=${userFromStorage?.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (res.data?.responseCode === "200") {
//         setUser(res.data.apiResponseData);
//       } else {
//         setError("Failed to load dashboard");
//       }
//     } catch (err) {
//       setError("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="loading">Loading dashboard...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!user) return <div className="empty-state">No data found</div>;

//   return (
//     <div className="dashboard-container">
//       {/* ================= USER CARD ================= */}
//       <div className="user-card">
//         <img
//           src={user.profilePic || "https://i.pravatar.cc/150?img=3"}
//           alt="Profile"
//         />

//         <div className="user-info">
//           <h3>{user.name || "-"}</h3>
//           <p>{user.email || "-"}</p>
//           {/* <span className="role">{user.role || "-"}</span> */}

//           <div className="user-meta">
//           {user.role && <div><strong>Role:</strong> {user.role}</div>}
//             {user.phone && <div><strong>Phone:</strong> {user.phone}</div>}

//             {user.address && (
//               <div>
//                 <strong>Address:</strong>{" "}
//                 {[user.address.city, user.address.state, user.address.country]
//                   .filter(Boolean)
//                   .join(", ")}
//               </div>
//             )}

//             {/* {user.createdAt && (
//               <div>
//                 <strong>Joined:</strong>{" "}
//                 {new Date(user.createdAt).toDateString()}
//               </div>
//             )} */}
//           </div>
//         </div>
//       </div>

//       {/* ================= STATS ================= */}
//       <div className="stats-grid">
//         { user.role !== "employee" && (
//           <div className="stat-card">
//             <h5>Assigned Projects</h5>
//             <p>{user.projectCount}</p>
//           </div>
//         )}

//         {typeof user.taskCount === "number" && (
//           <div className="stat-card">
//             <h5>Assigned Tasks</h5>
//             <p>{user.taskCount}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getUserInfoApi, getDashboardDataApi } from "../../api/dashboard.api";

type DashboardData = {
  tasks: Record<string, number>;
  projects: Record<string, number>;
  role: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userFromStorage?.id) {
      setError("User not found");
      setLoading(false);
      return;
    }

    Promise.all([fetchUserInfo(), fetchDashboardData()])
      .catch(() => setError("Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  const fetchUserInfo = async () => {
    const data: any = await getUserInfoApi(userFromStorage.id);
    setUser(data);
  };

  const fetchDashboardData = async () => {
    const data: any = await getDashboardDataApi(userFromStorage.id);
    setDashboard(data);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="empty-state">No data found</div>;

  const renderStats = (title: string, data: Record<string, number>, type: 'tasks' | 'projects') => {
    const max = Math.max(...Object.values(data), 1);

    const handleCardClick = (key: string) => {
      let statusParam = key;
      if (key === "InProgress") statusParam = "INPROGRESS";
      if (key === "QC") statusParam = "QCINPROGRESS";
      // Generic normalizing for other common keys if needed
      if (key === "ToDo") statusParam = "TODO";
      if (key === "Complete") statusParam = "COMPLETE";

      if (type === 'tasks') {
        navigate(`/tasks?status=${statusParam}`);
      } else {
        navigate(`/projects?status=${statusParam}`);
      }
    };

    return (
      <div className="dashboard-section">
        <h4>{title}</h4>
        <div className="stats-grid">
          {Object.entries(data).map(([key, value]) => (
            <div
              className="stat-card stat-hover"
              key={key}
              onClick={() => handleCardClick(key)}
              style={{ cursor: 'pointer' }}
            >
              <span className="stat-label">{key}</span>
              <span className="stat-number">{value}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* ================= USER CARD ================= */}
      <div className="user-card user-hover">
        <img
          src={user.profilePic || "https://i.pravatar.cc/150?img=3"}
          alt="Profile"
        />

        <div className="user-info">
          <h3>{user.name || "-"}</h3>
          <p>{user.email || "-"}</p>

          <div className="user-meta">
            {user.role && (
              <div>
                <strong>Role:</strong> {user.role}
              </div>
            )}
            {user.phone && (
              <div>
                <strong>Phone:</strong> {user.phone}
              </div>
            )}
            {user.address && (
              <div>
                <strong>Address:</strong>{" "}
                {[user.address.city, user.address.state, user.address.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= DASHBOARD ================= */}
      {dashboard && (
        <>
          {(dashboard.role === "superAdmin" ||
            dashboard.role === "admin") && (
              <>
                {renderStats("Task Overview", dashboard.tasks, 'tasks')}
                {renderStats("Project Overview", dashboard.projects, 'projects')}
              </>
            )}

          {dashboard.role === "employee" &&
            renderStats("My Tasks", dashboard.tasks, 'tasks')}

          {dashboard.role === "client" &&
            renderStats("My Projects", dashboard.projects, 'projects')}
        </>
      )}
    </div>
  );
}
