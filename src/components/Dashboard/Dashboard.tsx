import "./Dashboard.css";

export default function Dashboard() {
  // Static user data (API later)
  const user = {
    name: "John Doe",
    email: "gaurav@gmail.com",
    role: "Client",
    profilePic: "https://i.pravatar.cc/150?img=3",
  };

  const stats = {
    assignedProjects: 8,
    assignedTasks: 21,
    completedProjects: 5,
  };

  return (
    <div className="dashboard-container">

      {/* User Info Card */}
      <div className="user-card">
        <img src={user.profilePic} alt="Profile" />
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="role">{user.role}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h5>Assigned Projects</h5>
          <p>{stats.assignedProjects}</p>
        </div>

        <div className="stat-card">
          <h5>Assigned Tasks</h5>
          <p>{stats.assignedTasks}</p>
        </div>

        <div className="stat-card">
          <h5>Completed Projects</h5>
          <p>{stats.completedProjects}</p>
        </div>
      </div>

    </div>
  );
}
