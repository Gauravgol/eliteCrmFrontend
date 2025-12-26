import { useEffect, useState } from "react";
import "./ProjectDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { generateUrn } from "../../utils/generateUrn";
import { toast } from "react-toastify";
import moment from "moment-timezone";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // toggles
  const [showDescription, setShowDescription] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);
  const [showComments, setShowComments] = useState(true);

  // edit
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const [commentText, setCommentText] = useState("");
  const [uploading, setUploading] = useState(false);

  const USER_ID = "6939b329f8799ddbd5833664";
  const USER_NAME = "Gaurav";

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([fetchProject(), fetchTasks()]);
      return [p, t];
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/getProjects?projectId=${projectId}`,
      { headers: { urn: generateUrn(13) } }
    );
    const json = await res.json();
    setProject(json?.apiResponseData?.list?.[0]);
  };

  const fetchTasks = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/getTask?projectId=${projectId}`,
      { headers: { urn: generateUrn(13) } }
    );
    const json = await res.json();
    setTasks(json?.apiResponseData?.list || []);
  };

  const updateProject = async (payload: any, isFormData = false) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/updateProject`,
        {
          method: "PUT",
          headers: isFormData
            ? { urn: generateUrn(13) }
            : {
                "Content-Type": "application/json",
                urn: generateUrn(13),
              },
          body: isFormData
            ? payload
            : JSON.stringify({
                projectId,
                userId: USER_ID,
                ...payload,
              }),
        }
      );

      const json = await res.json();
      if (json?.responseCode !== "200") throw new Error();
      fetchProject();
    } catch {
      toast.error("Update failed");
    }
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files) return;

    for (const f of Array.from(files)) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB`);
        return;
      }
    }

    const fd = new FormData();
    fd.append("projectId", projectId!);
    fd.append("userId", USER_ID);
    Array.from(files).forEach((f) => fd.append("attachments", f));

    setUploading(true);
    await updateProject(fd, true);
    setUploading(false);
  };

  const fileName = (url: string) =>
    url.split("/").pop()?.split("_").slice(2).join("_");

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="empty-state">Project not found</div>;

  return (
    <div className="page-container">
      <div className="project-header">
        <h2>{project.name}</h2>
      </div>

      <div className="project-body">
        {/* LEFT */}
        <div className="tasks-section">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h5>Tasks</h5>
            <button className="btn-primary">+ New Task</button>
          </div>

          {tasks.map((t) => (
            <div
              key={t._id}
              className="task-card"
              onClick={() => navigate(`/task/${t._id}`)}
            >
              <div className="task-title">{t.name}</div>
              <div className="task-meta">
                <span className={`status ${t.status}`}>{t.status}</span>
                <span className={`priority ${t.priority}`}>{t.priority}</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="project-info">
          {/* STATIC INFO */}
          <div className="info-row">
  <label>Status</label>
  <select
    value={project.status}
    onChange={(e) =>
      updateProject({ status: e.target.value })
    }
  >
    <option value="TODO">TODO</option>
    <option value="INPROGRESS">IN PROGRESS</option>
    <option value="TESTING">TESTING</option>
    <option value="DELIVERD">DELIVERED</option>
    <option value="HOLD">HOLD</option>
  </select>
</div>
          <div className="info-row"><label>Owner</label><span>{project.owner?.name}</span></div>
          <div className="info-row"><label>Start</label><span>{new Date(project.startDate).toDateString()}</span></div>
          <div className="info-row"><label>Due Date</label><span>{new Date(project.dueDate).toDateString()}</span></div>

          {/* DESCRIPTION */}
          <div
  className="section-header"
  onClick={() => setShowDescription((v) => !v)}
>
  <span>{showDescription ? "▾" : "▸"} Description</span>
</div>

          {/* {showDescription && (
            editingDesc ? (
              <textarea
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={() => {
                  updateProject({ description: descDraft });
                  setEditingDesc(false);
                }}
              />
            ) : (
              <p
                className="editable"
                onClick={() => {
                  setDescDraft(project.description || "");
                  setEditingDesc(true);
                }}
              >
                {project.description || "Click to add description"}
              </p>
            )
          )} */}
          {showDescription && (
  editingDesc ? (
    <textarea
      autoFocus
      className="inline-textarea"
      value={descDraft}
      onChange={(e) => setDescDraft(e.target.value)}
      onBlur={() => {
        updateProject({ description: descDraft });
        setEditingDesc(false);
      }}
    />
  ) : (
    <p
      className="task-desc editable"
      onClick={() => {
        setDescDraft(project.description || "");
        setEditingDesc(true);
      }}
    >
      {project.description || "Click to add description"}
    </p>
  )
)}

          {/* ATTACHMENTS */}
          <div
  className="section-header"
  onClick={() => setShowAttachments((v) => !v)}
>
  <span>{showAttachments ? "▾" : "▸"} Attachments</span>
</div>
          {showAttachments && (
            <>
              {(project.attachments || []).map((a: any) => (
                <div key={a._id} className="attachment-row">
                  {a.url.endsWith(".pdf") ? "📄" : "🖼️"}
                  <a href={a.url} target="_blank">{fileName(a.url)}</a>
                </div>
              ))}
              <label className="attach-btn">
                {uploading ? "Uploading..." : "+ Add attachment"}
                <input type="file" multiple hidden onChange={(e) => uploadAttachments(e.target.files)} />
              </label>
            </>
          )}

          {/* COMMENTS */}
          <div
  className="section-header"
  onClick={() => setShowComments((v) => !v)}
>
  <span>{showComments ? "▾" : "▸"} Comments</span>
</div>

          {showComments && (
            <>
              {(project.comments || []).map((c: any) => (
                <div key={c._id} className="comment">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <strong>{c.commenterName}</strong>
    <span className="comment-time">
    {moment
        .utc(c.commentedAt)
        .tz("Asia/Kolkata")
        .format("DD MMM YYYY, hh:mm A")}
    </span>
  </div>
                  <p>{c.comment}</p>
                </div>
              ))}
              <textarea
                className="comment-box"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                className="comment-btn"
                disabled={!commentText.trim()}
                onClick={() => {
                  updateProject({
                    comment: commentText,
                    commenterId: USER_ID,
                    commenterName: USER_NAME,
                  });
                  setCommentText("");
                }}
              >
                Add Comment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
