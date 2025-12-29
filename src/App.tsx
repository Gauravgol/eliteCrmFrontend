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


import { Routes, Route, Navigate, Outlet } from "react-router-dom";
// import { useEffect, useState } from "react";
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

const Layout = () => {
  return (
    <>
      <Navbar />
      <Sidebar />
      <Outlet />
    </>
  );
};

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={isLoggedIn ? <Layout /> : <Navigate to="/" replace />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<NewProject />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="projects/:projectId/create-task" element={<NewTask />} />
        <Route path="task/:taskId" element={<TaskDetails />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
