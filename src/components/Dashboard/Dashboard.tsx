// import "./Dashboard.css";

// export default function Dashboard() {
//   // Static user data (API later)
//   const user = {
//     name: "John Doe",
//     email: "gaurav@gmail.com",
//     role: "Client",
//     profilePic: "https://i.pravatar.cc/150?img=3",
//   };

//   const stats = {
//     assignedProjects: 8,
//     assignedTasks: 21,
//     completedProjects: 5,
//   };

//   return (
//     <div className="dashboard-container">

//       {/* User Info Card */}
//       <div className="user-card">
//         <img src={user.profilePic} alt="Profile" />
//         <div className="user-info">
//           <h3>{user.name}</h3>
//           <p>{user.email}</p>
//           <span className="role">{user.role}</span>
//         </div>
//       </div>

//       {/* Stats Section */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <h5>Assigned Projects</h5>
//           <p>{stats.assignedProjects}</p>
//         </div>

//         <div className="stat-card">
//           <h5>Assigned Tasks</h5>
//           <p>{stats.assignedTasks}</p>
//         </div>

//         <div className="stat-card">
//           <h5>Completed Projects</h5>
//           <p>{stats.completedProjects}</p>
//         </div>
//       </div>

//     </div>
//   );
// }
import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userFromStorage?.id) {
      setError("User not found");
      setLoading(false);
      return;
    }

    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/getUserInfo?userId=${userFromStorage?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.responseCode === "200") {
        setUser(res.data.apiResponseData);
      } else {
        setError("Failed to load dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="empty-state">No data found</div>;

  return (
    <div className="dashboard-container">
      {/* ================= USER CARD ================= */}
      <div className="user-card">
        <img
          src={user.profilePic || "https://i.pravatar.cc/150?img=3"}
          alt="Profile"
        />

        <div className="user-info">
          <h3>{user.name || "-"}</h3>
          <p>{user.email || "-"}</p>
          {/* <span className="role">{user.role || "-"}</span> */}

          <div className="user-meta">
          {user.role && <div><strong>Role:</strong> {user.role}</div>}
            {user.phone && <div><strong>Phone:</strong> {user.phone}</div>}

            {user.address && (
              <div>
                <strong>Address:</strong>{" "}
                {[user.address.city, user.address.state, user.address.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}

            {/* {user.createdAt && (
              <div>
                <strong>Joined:</strong>{" "}
                {new Date(user.createdAt).toDateString()}
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="stats-grid">
        { user.role !== "employee" && (
          <div className="stat-card">
            <h5>Assigned Projects</h5>
            <p>{user.projectCount}</p>
          </div>
        )}

        {typeof user.taskCount === "number" && (
          <div className="stat-card">
            <h5>Assigned Tasks</h5>
            <p>{user.taskCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}
