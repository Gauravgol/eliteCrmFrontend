import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Tasks.css";
import { generateUrn } from "../../utils/generateUrn";

export default function Tasks() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    // pagination
    const [page, setPage] = useState(1);
    const [columnsPerRow, setColumnsPerRow] = useState(3);
    const [pagination, setPagination] = useState<any>({
        totalPages: 1,
    });

    useEffect(() => {
        fetchTasks();
    }, [search, status, page]);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", String(page));
            params.append("limit", "10");

            if (search) params.append("search", search);
            if (status) params.append("status", status);

            const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/getTask?${params.toString()}&assignedTo=${userFromStorage?.id}`,
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
                                    onChange={(e) => {
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
    );
}
