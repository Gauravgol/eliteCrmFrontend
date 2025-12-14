import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Projects.css";

function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();

  const projects = [
    { name: "Elite CRM", description: "CRM dev", owner: "Gaurav", dueDate: "2025-01-30", status: "InProgress" },
    { name: "Task Manager", description: "Task app", owner: "Anuj", dueDate: "2025-02-15", status: "OnHold" },
    { name: "Client Portal", description: "Client portal", owner: "Rahul", dueDate: "2025-03-01", status: "Completed" },
    { name: "HR Tool", description: "HR system", owner: "Amit", dueDate: "2025-03-10", status: "InProgress" },
    { name: "Billing App", description: "Billing", owner: "Rohit", dueDate: "2025-03-20", status: "OnHold" },
    { name: "Inventory", description: "Inventory", owner: "Suresh", dueDate: "2025-04-01", status: "Completed" },
  ];

  // Search filter
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  return (
    <div className="projects-page">


   {/* Top Bar */}
<div className="projects-top-bar">
  {/* Left: Search */}
  <input
    type="text"
    className="form-control search-input"
    placeholder="Search projects..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
  />

  {/* Right: Add Button */}
  <button className="btn btn-dark"   onClick={() => navigate("/projects/new")}
>
    + Add New Project
  </button>
</div>


      {/* Table */}
      <div className="projects-table-wrapper">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((p, index) => (
              <tr key={index}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.owner}</td>
                <td>{p.dueDate}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Row */}
        <div className="pagination-row">
          {/* Left */}
          <div className="items-per-page">
            <span>Items per page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Right */}
          <div className="pagination-controls">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
