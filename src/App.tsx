// import { Routes, Route, Navigate } from "react-router-dom";
// import "./App.css";

// import Login from "./components/Login/Login";
// import Navbar from "./components/Navbar/Navbar";
// import Sidebar from "./components/Sidebar/Sidebar";
// import Projects from "./components/Projects/Projects";
// import NewProject from "./components/NewProjects/NewProject";
// import Dashboard from "./components/Dashboard/Dashboard";
// import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
// import TaskDetails from "./components/TaskDetails/TaskDetails";
// import NewTask from "./components/NewTask/NewTask";
// import Users from "./components/Users/Users";

// function App() {
//   const isLoggedIn = !!localStorage.getItem("token");

//   return (
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route
//         path="/*"
//         element={
//           isLoggedIn ? (
//             <>
//               <Navbar />
//               <Sidebar />

//               <Routes>
//                 <Route path="projects" element={<Projects />} />
//                 <Route path="projects/new" element={<NewProject />} />
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="projects/:projectId" element={<ProjectDetails />} />
//                 <Route path="task/:taskId" element={<TaskDetails />} />
//                 <Route path="/projects/:projectId/create-task" element={<NewTask />} />
//                 <Route path="/users" element={<Users />} />

//               </Routes>
//             </>
//           ) : (
//             <Navigate to="/" replace />
//           )
//         }
//       />
//     </Routes>
//   );
// }

// export default App;


import { Routes, Route, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

import Login from "./components/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Projects from "./components/Projects/Projects";
import NewProject from "./components/NewProjects/NewProject";
import Dashboard from "./components/Dashboard/Dashboard";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import TaskDetails from "./components/TaskDetails/TaskDetails";
import NewTask from "./components/NewTask/NewTask";
import Users from "./components/Users/Users";

import ProtectedRoute from "./ProtectedRoute";
import Tasks from "./components/Tasks/Tasks";
import Chatpage from "./components/Chatpage/Chatpage";
import { SocketProvider, useSocket } from "./context/SocketContext";
import NotificationPopup from "./components/NotificationPopup/NotificationPopup";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed.toString());
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "60px" : "250px"
    );
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const { notification, clearNotification } = useSocket();

  return (
    <>
      <Navbar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <Sidebar isCollapsed={isCollapsed} />
      <Outlet />
      {notification && (
        <NotificationPopup
          text={notification.text}
          onClose={clearNotification}
        />
      )}
    </>
  );
};

function App() {
  return (
    <SocketProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="projects/:projectId/create-task" element={<NewTask />} />
            <Route path="task/:taskId" element={<TaskDetails />} />
            <Route path="users" element={<Users />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="chat" element={<Chatpage />} />
          </Route>
        </Route>
      </Routes>
    </SocketProvider>
  );
}

export default App;