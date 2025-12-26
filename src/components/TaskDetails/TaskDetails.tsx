import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TaskDetails.css";
import { generateUrn } from "../../utils/generateUrn";
import { toast } from "react-toastify";

export default function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline edit
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");

  // Toggles (Jira-style)
  const [showDescription, setShowDescription] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);
  const [showComments, setShowComments] = useState(true);

  // Comment
  const [commentText, setCommentText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);


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
        { headers: { urn: generateUrn(13) } }
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
          body: JSON.stringify({ taskId, ...payload }),
        }
      );

      const json = await res.json();

      if (json?.responseCode !== "200") {
        throw new Error("Update failed");
      }

      await fetchTask();
      setEditingField(null);
    } catch {
      alert("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!files || files.length === 0) return;

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  for (const file of Array.from(files)) {
    if (file.size > MAX_SIZE) {
      toast.error(`"${file.name}" exceeds 5MB limit`);
      return;
    }
  }
  
    try {
      setUploading(true);
  
      const formData = new FormData();
      formData.append("taskId", taskId!);
  
      Array.from(files).forEach((file) => {
        formData.append("attachments", file);
      });
  
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/updateTask`,
        {
          method: "PUT",
          headers: {
            urn: generateUrn(13),
          },
          body: formData,
        }
      );
  
      const json = await res.json();
  
      if (json?.responseCode !== "200") {
        throw new Error("Upload failed");
      }
  
      // 🔥 Refresh from backend
      await fetchTask();
    } catch {
      alert("Failed to upload attachment");
    } finally {
      setUploading(false);
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
            />
          ) : (
            <h2
              className="editable"
              onClick={() => {
                setEditingField("name");
                setDraftValue(task.name);
              }}
            >
              {task.name}
            </h2>
          )}
          <p className="muted">{task.projectId?.name}</p>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="task-body">
        {/* ================= LEFT ================= */}
        <div className="task-main">

          {/* DESCRIPTION */}
          <div className="section-header" onClick={() => setShowDescription(!showDescription)}>
            <span>{showDescription ? "▾" : "▸"} Description</span>
          </div>

          {showDescription && (
            editingField === "description" ? (
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
                  setDraftValue(task.description || "");
                }}
              >
                {task.description || "Click to add description"}
              </p>
            )
          )}

          {/* ATTACHMENTS */}
          <div
  className="section-header"
  onClick={() => setShowAttachments(!showAttachments)}
>
  <span>{showAttachments ? "▾" : "▸"} Attachments</span>
</div>

{showAttachments && (
  <>
    {(task.attachments || []).length === 0 ? (
      <p className="muted">No attachments</p>
    ) : (
      (task.attachments || []).map((att: any) => (
        <div key={att._id} className="attachment">
          📎
          <a
  href={att.url}
  target="_blank"
  rel="noopener noreferrer"
  className="attachment-link"
>
  <span className="attachment-icon">
    {att.url.endsWith(".pdf") ? "📄" : "🖼️"}
  </span>
  {getFileName(att.url)}
</a>
        </div>
      ))
    )}

    {/* ADD ATTACHMENT */}
    <label className="attach-btn">
      {uploading ? "Uploading..." : "+ Add attachment"}
      <input
        type="file"
        multiple
        hidden
        onChange={(e) => uploadAttachments(e.target.files)}
      />
    </label>
  </>
)}

          {/* COMMENTS */}
          <div className="section-header" onClick={() => setShowComments(!showComments)}>
            <span>{showComments ? "▾" : "▸"} Comments</span>
          </div>

          {showComments && (
            <>
              {(task.comments || []).length === 0 ? (
                <p className="muted">No comments yet</p>
              ) : (
                task.comments.map((c: any) => (
                  <div key={c._id} className="comment">
                    <strong>{c.commenterName}</strong>
                    <p>{c.comment}</p>
                  </div>
                ))
              )}

              <textarea
                className="comment-box"
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <button
                className="comment-btn"
                disabled={!commentText.trim() || updating}
                onClick={() => {
                  updateTaskField({
                    comment: commentText,
                    commenterId: "6939b329f8799ddbd5833664",
                    commenterName: "Gaurav",
                  });
                  setCommentText("");
                }}
              >
                Add
              </button>
            </>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="task-info">
          <div className="info-row">
            <label>Status</label>
            <select
             className={`status-select status-${task.status.toLowerCase()}`}
              value={task.status}
              onChange={(e) => updateTaskField({ status: e.target.value })}
            >
               <option value="TODO">To do</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETE">Complete</option>
                <option value="HOLD">HOLD</option>
                <option value="QAINPROGRESS">Qa in progress</option>
                <option value="QACOMPLETE">Qa complete</option>
                <option value="QCINPROGRESS">Qc in progress</option>
                <option value="QCCOMPLETE">Qc complete</option>
            </select>
          </div>

          <div className="info-row">
            <label>Priority</label>
            <select
              value={task.priority}
              onChange={(e) => updateTaskField({ priority: e.target.value })}
            >
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="info-row">
            <label>Due Date</label>
            <input
              type="date"
              value={task.dueDate?.slice(0, 10) || ""}
              onChange={(e) => updateTaskField({ dueDate: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}