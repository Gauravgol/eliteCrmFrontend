// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "./Projects.css";
// import { generateUrn } from "../../utils/generateUrn";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// interface Project {
//   _id: string;
//   name: string;
//   description: string;
//   owner: {
//     name: string;
//     email: string;
//   };
//   status: string;
//   dueDate: string;
// }

// function Projects() {
//   const navigate = useNavigate();

//   const [projects, setProjects] = useState<Project[]>([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /* ---------------- FETCH PROJECTS ---------------- */

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await axios.get(`${API_BASE_URL}/getProjects`, {
//         params: {
//           search,
//           page: currentPage,
//           limit: itemsPerPage,
//         },
//         headers: {
//           urn: generateUrn(),
//         },
//       });

//       const data = res.data.apiResponseData;
//       setProjects(data.list || []);
//       setTotalPages(data.pagination.totalPages);
//     } catch {
//       setError("Failed to fetch projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, [search, currentPage, itemsPerPage]);

//   /* ---------------- PAGINATION ---------------- */

//   const getPaginationPages = () => {
//     const pages: (number | string)[] = [];

//     if (totalPages <= 5) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }

//     pages.push(1);
//     if (currentPage > 3) pages.push("...");

//     const start = Math.max(2, currentPage - 1);
//     const end = Math.min(totalPages - 1, currentPage + 1);

//     for (let i = start; i <= end; i++) pages.push(i);

//     if (currentPage < totalPages - 2) pages.push("...");
//     pages.push(totalPages);

//     return pages;
//   };

//   return (
//     <div className="page-container">
//       <div  style={{padding:"10px"}}>
//       {/* ================= TOP BAR ================= */}
//       <div className="projects-top-bar">
//         <input
//           type="text"
//           className="form-control search-input"
//           placeholder="Search projects..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />

//         <button className="btn btn-dark" onClick={() => navigate("/projects/new")}>
//           + Add New Project
//         </button>
//       </div>

//       {/* ================= PROJECT LIST ================= */}
//       <div className="projects-table-wrapper">
//       <h4 className="projects-title">Projects</h4>
//         {loading ? (
//           <div className="text-center py-5">Loading projects...</div>
//         ) : error ? (
//           <div className="text-center text-danger py-5">{error}</div>
//         ) : projects.length === 0 ? (
//           <div className="text-center py-5">No projects found</div>
//         ) : (
//           projects.map((p) => (
//             <div
//               key={p._id}
//               className="project-row"
//               onClick={() => navigate(`/projects/${p._id}`)}
//             >
//               <div className="project-title">{p.name}</div>

//               <div className="project-meta">
//                 <span className="meta-item">
//                   👤 {p.owner?.name || "Unknown"}
//                 </span>

//                 <span className={`status ${p.status.toLowerCase()}`}>
//                   {p.status}
//                 </span>

//                 <span className="meta-item">
//                   📅 {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "-"}
//                 </span>
//               </div>
//             </div>
//           ))
//         )}

//         {/* ================= PAGINATION ================= */}
//         {!loading && projects.length > 0 && (
//           <div className="pagination-row">
//             <div className="items-per-page">
//               <span>Items per page</span>
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//               >
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//               </select>
//             </div>

//             <div className="pagination-controls">
//               <button
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 Prev
//               </button>

//               {getPaginationPages().map((page, index) =>
//                 page === "..." ? (
//                   <span key={index} className="dots">
//                     ...
//                   </span>
//                 ) : (
//                   <button
//                     key={index}
//                     className={currentPage === page ? "active" : ""}
//                     onClick={() => setCurrentPage(page as number)}
//                   >
//                     {page}
//                   </button>
//                 )
//               )}

//               <button
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     </div>
//   );
// }

// export default Projects;
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./Projects.css";

import { getProjectsApi } from "../../api/projects.api";
import { generateUrn } from "../../utils/generateUrn";

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
  createdAt: string;
  createdBy?: {
    name: string;
  };
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

  // Filters
  const [status, setStatus] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerList, setOwnerList] = useState<any[]>([]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setShowOwnerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- FETCH PROJECTS ---------------- */

  /* ---------------- FETCH OWNERS ---------------- */
  const fetchOwners = async (searchQuery: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tagClient?search=${searchQuery}`,
        { headers: { urn: generateUrn() } }
      );
      const json = await res.json();
      setOwnerList(json?.apiResponseData?.list || []);
    } catch {
      console.error("Failed to load owners");
    }
  };

  const handleOwnerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOwnerSearch(value);
    setShowOwnerDropdown(true);
    fetchOwners(value);
  };

  const selectOwner = (u: any) => {
    setSelectedOwner(u);
    setOwnerSearch("");
    setShowOwnerDropdown(false);
    setCurrentPage(1);
  };

  const clearOwner = () => {
    setSelectedOwner(null);
    setOwnerSearch("");
    setShowOwnerDropdown(false);
    setOwnerList([]);
    setCurrentPage(1);
  };

  /* ---------------- FETCH PROJECTS ---------------- */

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjectsApi({
        search,
        page: currentPage,
        limit: itemsPerPage,
        status,
        owner: selectedOwner?._id,
      });

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
  }, [search, currentPage, itemsPerPage, status, selectedOwner]);

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
      <div style={{ padding: "10px" }}>
        {/* ================= TOP BAR ================= */}
        {/* ================= TOP BAR ================= */}
        <div className="projects-top-bar">
          <div className="filters-left">
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

            <select
              className="form-control status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="TODO">TODO</option>
              <option value="INPROGRESS">IN PROGRESS</option>
              <option value="TESTING">TESTING</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="HOLD">HOLD</option>
            </select>

            {/* OWNER FILTER */}
            <div className="owner-filter-wrapper" ref={ownerDropdownRef}>
              <div className="owner-input-group">
                {selectedOwner && (
                  <span className="selected-owner-chip">
                    {selectedOwner.name}
                    <button onClick={clearOwner}>×</button>
                  </span>
                )}
                {!selectedOwner && (
                  <input
                    placeholder="Filter by Owner..."
                    value={ownerSearch}
                    onChange={handleOwnerSearchChange}
                    onFocus={() => {
                      setShowOwnerDropdown(true);
                      if (ownerList.length === 0) fetchOwners("");
                    }}
                    className="owner-search-input"
                  />
                )}
              </div>

              {showOwnerDropdown && (
                <div className="owner-dropdown">
                  {ownerList.length === 0 ? (
                    <div className="dropdown-item no-results">No owners found</div>
                  ) : (
                    ownerList.map(u => (
                      <div key={u._id} className="dropdown-item" onClick={() => selectOwner(u)}>
                        <div className="owner-name">{u.name}</div>
                        <div className="owner-email">{u.email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            className="btn btn-dark"
            onClick={() => navigate("/projects/new")}
          >
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
            <div className="project-list-container">
              {/* HEADERS (Optional, but good for grid) */}
              <div className="project-list-header">
                <div className="col-name">PROJECT NAME</div>
                <div className="col-owner">OWNER</div>
                <div className="col-createdby">CREATED BY</div>
                <div className="col-status">STATUS</div>
                <div className="col-date">CREATED AT</div>
              </div>

              {projects.map((p) => (
                <div
                  key={p._id}
                  className="project-row"
                  onClick={() => navigate(`/projects/${p._id}`)}
                >
                  <div className="col-name">
                    <span className="project-name-text">{p.name}</span>
                  </div>

                  <div className="col-owner">
                    <span className="owner-badge">
                      👤 {p.owner?.name || "Unknown"}
                    </span>
                  </div>

                  <div className="col-createdby">
                    <span className="created-by-text">
                      {p.createdBy?.name || "-"}
                    </span>
                  </div>

                  <div className="col-status">
                    <span className={`status ${p.status?.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="col-date">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}

export default Projects;
