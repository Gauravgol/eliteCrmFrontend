import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Tasks.css";
import { generateUrn } from "../../utils/generateUrn";

export default function Tasks() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(searchParams.get("status") || "");

    // User filter states
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userSearch, setUserSearch] = useState("");
    const [userList, setUserList] = useState<any[]>([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    // pagination
    const [page, setPage] = useState(1);
    // const [columnsPerRow, setColumnsPerRow] = useState(3);
    const [pagination, setPagination] = useState<any>({
        totalPages: 1,
    });

    // Initialize with current logged-in user
    useEffect(() => {
        const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
        if (userFromStorage?.id) {
            setSelectedUser({
                _id: userFromStorage.id,
                name: userFromStorage.name || "Me"
            });
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [search, status, page, selectedUser]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", "10");

            if (search) params.append("search", search);
            if (status) params.append("status", status);
            if (selectedUser?._id) params.append("assignedTo", selectedUser._id);

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/getTask?${params.toString()}`,
                {
                    headers: { urn: generateUrn(13) },
                }
            );

            const json = await res.json();

            setTasks(json?.apiResponseData?.list || []);
            setPagination(json?.apiResponseData?.pagination || { totalPages: 1 });
        } catch {
            console.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersForFilter = async (searchQuery: string) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/tagUser?search=${searchQuery}`,
                { headers: { urn: generateUrn(13) } }
            );
            const json = await res.json();
            setUserList(json?.apiResponseData?.list || []);
        } catch {
            console.error("Failed to load users");
        }
    };

    const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserSearch(value);
        setShowUserDropdown(true);
        fetchUsersForFilter(value);
    };

    const selectUser = (user: any) => {
        setSelectedUser(user);
        setUserSearch("");
        setShowUserDropdown(false);
        setPage(1);
    };

    const clearUserFilter = () => {
        setSelectedUser(null);
        setUserSearch("");
        setShowUserDropdown(false);
        setPage(1);
    };

    /* ================= PAGINATION HELPER (ADD THIS) ================= */
    const getPaginationPages = () => {
        const totalPages = pagination.totalPages;
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(1);

        let start = Math.max(2, page - 1);
        let end = Math.min(totalPages - 1, page + 1);

        if (start > 2) pages.push("...");

        for (let i = start; i <= end; i++) pages.push(i);

        if (end < totalPages - 1) pages.push("...");

        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="page-container">
            <div style={{ padding: "10px" }}>
                {/* HEADER */}
                <div className="tasks-header">
                    <div className="task-filters">
                        <input
                            type="text"
                            placeholder="Search task..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="TODO">TODO</option>
                            <option value="INPROGRESS">IN PROGRESS</option>
                            <option value="COMPLETE">COMPLETE</option>
                            <option value="HOLD">HOLD</option>
                            <option value="QAINPROGRESS">QA IN PROGRESS</option>
                            <option value="QACOMPLETE">QA COMPLETE</option>
                            <option value="QCINPROGRESS">QC IN PROGRESS</option>
                            <option value="QCCOMPLETE">QC COMPLETE</option>
                        </select>

                        {/* User Filter */}
                        <div className="user-filter-wrapper" ref={userDropdownRef}>
                            <div className="user-filter-display">
                                <span className="user-filter-label">
                                    Assigned to: <strong>{selectedUser?.name || "All"}</strong>
                                </span>
                                {selectedUser && (
                                    <button
                                        className="clear-user-btn"
                                        onClick={clearUserFilter}
                                        title="Reset to my tasks"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Search user..."
                                value={userSearch}
                                onChange={handleUserSearchChange}
                                onFocus={() => {
                                    setShowUserDropdown(true);
                                    fetchUsersForFilter("");
                                }}
                                className="user-search-input"
                            />
                            {showUserDropdown && (
                                <div className="user-dropdown">
                                    {userList.length === 0 ? (
                                        <div className="user-dropdown-item no-results">
                                            No users found
                                        </div>
                                    ) : (
                                        userList.map((user) => (
                                            <div
                                                key={user._id}
                                                className="user-dropdown-item"
                                                onClick={() => selectUser(user)}
                                            >
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="table-wrapper"> <h2>Tasks</h2>
                    {loading ? (
                        <div className="loading">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="empty-state">No tasks found</div>
                    ) : (
                        <>
                            <div className="task-list">
                                {tasks.map((t) => (
                                    <div
                                        key={t._id}
                                        className="task-row"
                                        onClick={() => navigate(`/task/${t._id}`)}
                                    >
                                        {/* LEFT */}
                                        <div className="task-left">
                                            <div className="task-name">{t.name}</div>
                                            {/* {t.projectId?.name && (
                                        <div className="task-project">
                                            {t.projectId.name}
                                        </div>
                                    )} */}
                                        </div>

                                        {/* RIGHT */}
                                        <div className="task-right">
                                            <span className={`status ${t.status}`}>
                                                {t.status}
                                            </span>

                                            {t.priority && (
                                                <span className={`priority ${t.priority}`}>
                                                    {t.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="pagination-row">
                                    <div className="items-per-page">
                                        <span>Items per page</span>
                                        <select
                                            value={pagination.pageSize || 10}
                                            onChange={() => {
                                                setPage(1);
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                        </select>
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                        >
                                            Prev
                                        </button>

                                        {getPaginationPages().map((p, index) =>
                                            p === "..." ? (
                                                <span key={index} className="dots">...</span>
                                            ) : (
                                                <button
                                                    key={index}
                                                    className={page === p ? "active" : ""}
                                                    onClick={() => setPage(p as number)}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        )}

                                        <button
                                            disabled={page === pagination.totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>



                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
