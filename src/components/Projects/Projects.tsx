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
  owner: {
    name: string;
    email: string;
  };
  status: string;
  dueDate: string;
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

  /* ---------------- FETCH PROJECTS ---------------- */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE_URL}/getProjects`, {
        params: {
          search,
          page: currentPage,
          limit: itemsPerPage,
        },
        headers: {
          urn: generateUrn(),
        },
      });

      const data = res.data.apiResponseData;
      setProjects(data.list || []);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, currentPage, itemsPerPage]);

  /* ---------------- PAGINATION ---------------- */

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

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="page-container">
      {/* ================= TOP BAR ================= */}
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

        <button className="btn btn-dark" onClick={() => navigate("/projects/new")}>
          + Add New Project
        </button>
      </div>

      {/* ================= PROJECT LIST ================= */}
      <div className="projects-table-wrapper">
      <h4 className="projects-title">Projects</h4>
        {loading ? (
          <div className="text-center py-5">Loading projects...</div>
        ) : error ? (
          <div className="text-center text-danger py-5">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5">No projects found</div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="project-row"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <div className="project-title">{p.name}</div>

              <div className="project-meta">
                <span className="meta-item">
                  👤 {p.owner?.name || "Unknown"}
                </span>

                <span className={`status ${p.status.toLowerCase()}`}>
                  {p.status}
                </span>

                <span className="meta-item">
                  📅 {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          ))
        )}

        {/* ================= PAGINATION ================= */}
        {!loading && projects.length > 0 && (
          <div className="pagination-row">
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

            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              {getPaginationPages().map((page, index) =>
                page === "..." ? (
                  <span key={index} className="dots">
                    ...
                  </span>
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
