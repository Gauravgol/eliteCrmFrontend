import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TaskDetails.css";

export default function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<any>("");

  // Comment
  const [commentText, setCommentText] = useState("");
  const [updating, setUpdating] = useState(false);

  /* ---------------- FETCH TASK ---------------- */

  useEffect(() => {
    if (!taskId) {
      setError("Invalid task ID");
      setLoading(false);
      return;
    }
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/getTask?taskId=${taskId}`,
        { headers: { urn: "1234567890123" } }
      );

      const json = await res.json();
      setTask(json?.apiResponseData?.list?.[0] || null);
    } catch {
      setError("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const getFileName = (url?: string) => {
    if (!url) return "";
    const name = url.split("/").pop() || "";
    return name.split("_").slice(2).join("_");
  };

  /* ---------------- UPDATE TASK ---------------- */

  const updateTaskField = async (payload: Record<string, any>) => {
    try {
      setUpdating(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/updateTask`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            urn: "1234567890123",
          },
          body: JSON.stringify({
            taskId,
            ...payload,
          }),
        }
      );

      const json = await res.json();

      if (json?.responseCode !== "200") {
        throw new Error(json?.message || "Update failed");
      }

      // optimistic update
      setTask(json?.apiResponseData || task);

      // 🔥 ALWAYS REFRESH (source of truth)
      await fetchTask();

      setEditingField(null);
    } catch (err: any) {
      alert(err?.message || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) return <div className="loading">Loading task...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!task) return <div className="empty-state">Task not found</div>;

  return (
    <div className="page-container">
      {/* ================= HEADER ================= */}
      <div className="task-header">
        <div>
          {editingField === "name" ? (
            <input
              autoFocus
              className="inline-input title-input"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onBlur={() => updateTaskField({ name: draftValue })}
              onKeyDown={(e) =>
                e.key === "Enter" && updateTaskField({ name: draftValue })
              }
            />
          ) : (
            <h2
              className="editable"
              onClick={() => {
                setEditingField("name");
                setDraftValue(task?.name || "");
              }}
            >
              {task?.name}
            </h2>
          )}
          <p className="muted">{task?.projectId?.name}</p>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="task-body">
        {/* -------- LEFT -------- */}
        <div className="task-main">
          <h4>Description</h4>

          {editingField === "description" ? (
            <textarea
              autoFocus
              className="inline-textarea"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onBlur={() => updateTaskField({ description: draftValue })}
            />
          ) : (
            <p
              className="task-desc editable"
              onClick={() => {
                setEditingField("description");
                setDraftValue(task?.description || "");
              }}
            >
              {task?.description || "Click to add description"}
            </p>
          )}

          {/* ATTACHMENTS */}
          {task?.attachments?.length > 0 && (
            <>
              <h4>Attachments</h4>
              {(task.attachments || []).map((att: any) => (
                <div key={att?._id} className="attachment">
                  📎
                  <a
                    href={att?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getFileName(att?.url)}
                  </a>
                </div>
              ))}
            </>
          )}

          {/* COMMENTS */}
          <h4>Comments</h4>

          {(!task?.comments || task.comments.length === 0) ? (
            <p className="muted">No comments yet</p>
          ) : (
            (task.comments || []).map((c: any) => (
              <div key={c?._id} className="comment">
                <strong>{c?.commenterName}</strong>
                <p>{c?.comment}</p>
              </div>
            ))
          )}

          {/* ADD COMMENT */}
          <textarea
            className="comment-box"
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <button
            className="comment-btn"
            disabled={!commentText.trim() || updating}
            onClick={async () => {
              await updateTaskField({
                comment: commentText,
                commenterId: "6939b329f8799ddbd5833664",
                commenterName: "Gaurav",
              });
              setCommentText("");
            }}
          >
            Add
          </button>
        </div>

        {/* -------- RIGHT -------- */}
        <div className="task-info">
          <div className="info-row">
            <label>Status</label>
            <select
              value={task?.status || "TODO"}
              onChange={(e) =>
                updateTaskField({ status: e.target.value })
              }
            >
              <option value="TODO">TODO</option>
              <option value="INPROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>

          <div className="info-row">
            <label>Priority</label>
            <select
              value={task?.priority || "MEDIUM"}
              onChange={(e) =>
                updateTaskField({ priority: e.target.value })
              }
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="info-row">
            <label>Assigned To</label>
            <span>{task?.assignedTo?.name || "Unassigned"}</span>
          </div>

          <div className="info-row">
            <label>Due Date</label>
            <input
              type="date"
              value={task?.dueDate?.slice(0, 10) || ""}
              onChange={(e) =>
                updateTaskField({ dueDate: e.target.value })
              }
            />
          </div>

          <div className="info-row">
            <label>Created By</label>
            <span>{task?.createdBy?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
