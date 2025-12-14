import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Projects.css";
import { generateUrn } from "../../utils/generateUrn";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  status: string;
  endDate: string;
}

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔁 Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_BASE_URL}/getProjects`,
        {
          params: {
            search,
            page: currentPage,
            limit: itemsPerPage,
          },
          headers: {
            urn: generateUrn(),
          },
        }
      );

      const data = res.data.apiResponseData;

      setProjects(data.list);
      setTotalPages(data.pagination.totalPages);

    } catch (err: any) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Call API on changes
  useEffect(() => {
    fetchProjects();
  }, [search, currentPage, itemsPerPage]);
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
  
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
  
    pages.push(1);
  
    if (currentPage > 3) pages.push("...");
  
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
  
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  
    if (currentPage < totalPages - 2) pages.push("...");
  
    pages.push(totalPages);
  
    return pages;
  };
  
  return (
    <div className="projects-page">

      {/* Top Bar */}
      <div className="projects-top-bar">
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

        <button
          className="btn btn-dark"
          onClick={() => navigate("/projects/new")}
        >
          + Add New Project
        </button>
      </div>

      {/* Table */}
      <div className="projects-table-wrapper">
        {loading ? (
          <div className="text-center py-5">Loading projects...</div>
        ) : error ? (
          <div className="text-center text-danger py-5">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5">No projects found</div>
        ) : (
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
              {projects.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>{p.owner}</td>
                  <td>{new Date(p.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Row */}
        {!loading && projects.length > 0 && (
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

  {/* Prev */}
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
  >
    Prev
  </button>

  {/* Page Numbers */}
  {getPaginationPages().map((page, index) =>
    page === "..." ? (
      <span key={index} className="dots">...</span>
    ) : (
      <button
        key={index}
        className={currentPage === page ? "active" : ""}
        onClick={() => setCurrentPage(page as number)}
      >
        {page}
      </button>
    )
  )}

  {/* Next */}
  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
  >
    Next
  </button>

</div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
