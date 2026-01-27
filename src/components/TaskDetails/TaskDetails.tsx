import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./TaskDetails.css";
import { generateUrn } from "../../utils/generateUrn";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import RichTextEditor from "../RichTextEditor/RichTextEditor";


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

  // Assign states
  const [assignedUser, setAssignedUser] = useState<any>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignList, setAssignList] = useState<any[]>([]);
  const [showAssignList, setShowAssignList] = useState(false);
  const assignRef = useRef<HTMLDivElement>(null);

  // @mention states (ADD)
  // const [mentionSearch, setMentionSearch] = useState("");
  const [mentionList, setMentionList] = useState<any[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  const fetchUsersForMention = async (search: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tagUser?search=${search}`,
        { headers: { urn: generateUrn(13) } }
      );
      const json = await res.json();
      setMentionList(json?.apiResponseData?.list || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  /* ---------------- FETCH TASK ---------------- */

  useEffect(() => {
    if (task?.assignedTo) {
      setAssignedUser(task.assignedTo);
      setShowAssignList(false);
    }
  }, [task]);

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

  const getFileName = (url: string) => {

    const file = url.split("/").pop();
    if (!file) return "";

    const parts = file.split("_");

    if (parts.length > 1) {
      return parts.slice(1).join("_");
    }
    return

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

  const fetchUsersForAssign = async (search: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tagUser?search=${search}`,
        { headers: { urn: generateUrn(13) } }
      );
      const json = await res.json();
      setAssignList(json?.apiResponseData?.list || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const handleAssignFocus = () => {
    setShowAssignList(true);
    fetchUsersForAssign("");
  };

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAssignSearch(value);
    setShowAssignList(true);
    fetchUsersForAssign(value);
  };

  const selectAssignedUser = async (u: any) => {
    setAssignedUser(u);
    setShowAssignList(false);

    await updateTaskField({
      assignedTo: u._id,
    });
  };

  const clearAssignedUser = async () => {
    setAssignedUser(null);
    setAssignSearch("");
    setAssignList([]);
    setShowAssignList(false);

    await updateTaskField({
      assignedTo: null,
    });
  };


  /* ---------------- UI STATES ---------------- */

  if (loading) return <div className="loading">Loading task...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!task) return <div className="empty-state">Task not found</div>;

  return (
    <div className="page-container">
      <div style={{ padding: "10px" }}>
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

            {showDescription &&
              (editingField === "description" ? (
                <RichTextEditor
                  initialValue={task.description || ""}
                  onSave={(content) => {
                    updateTaskField({ description: content });
                  }}
                  onCancel={() => {
                    setEditingField(null);
                  }}
                />
              ) : (
                <div
                  className="task-desc editable"
                  onClick={() => {
                    setEditingField("description");
                  }}
                  dangerouslySetInnerHTML={{
                    __html: task.description || "Click to add description",
                  }}
                />
              ))}


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
                  <div className="attachments-grid">
                    {(task.attachments || []).map((a: any) => {
                      const isPdf = a.url.toLowerCase().endsWith(".pdf");

                      return (
                        <a
                          key={a._id}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-card"
                        >
                          {/* PREVIEW BOX */}
                          <div className="attachment-preview">
                            {isPdf ? (
                              <div className="attachment-pdf">
                                <i className="fa-solid fa-file-pdf pdf-fa-icon"></i>
                              </div>
                            ) : (
                              <img
                                src={a.url}
                                alt={getFileName(a.url)}
                                loading="lazy"
                              />
                            )}
                          </div>

                          {/* FILE NAME BELOW BOX */}
                          <div className="attachment-name">
                            {getFileName(a.url)}
                          </div>
                        </a>
                      );
                    })}
                  </div>
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
                      <span className="comment-time">
                        {moment
                          .utc(c.commentedAt)
                          .tz("Asia/Kolkata")
                          .format("DD MMM YYYY, hh:mm A")}
                      </span>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: c.comment.replace(
                            /@(\w+)/g,
                            `<span class="mention">@$1</span>`
                          ),
                        }}
                      />
                    </div>
                  ))
                )}

                {/* <textarea
                className="comment-box"
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              /> */}
                <div className="comment-mention-wrapper" ref={commentRef}>
                  <textarea
                    className="comment-box"
                    placeholder="Write a comment… use @ to mention"
                    value={commentText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCommentText(value);

                      const cursor = e.target.selectionStart;
                      const textBeforeCursor = value.slice(0, cursor);
                      const match = textBeforeCursor.match(/@(\w*)$/);

                      if (match) {
                        // setMentionSearch(match[1]);
                        setShowMentionList(true);
                        fetchUsersForMention(match[1]);
                      } else {
                        setShowMentionList(false);
                      }
                    }}
                  />

                  {showMentionList && mentionList.length > 0 && (
                    <ul className="mention-dropdown">
                      {mentionList.map((u) => (
                        <li
                          key={u._id}
                          onClick={() => {
                            const updatedText = commentText.replace(
                              /@(\w*)$/,
                              `@${u.name} `
                            );
                            setCommentText(updatedText);
                            setShowMentionList(false);
                          }}
                        >
                          @{u.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>


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

            <div className="info-row assign-wrapper" ref={assignRef}>
              <label>Assigned To</label>

              <div
                className="assign-inprogress"
                onClick={() => {
                  if (assignedUser) {
                    setAssignedUser(null);
                    setAssignSearch("");
                    setShowAssignList(true);
                    fetchUsersForAssign("");
                  }
                }}
              >
                {assignedUser && (
                  <span className="assign-chip">
                    {assignedUser.name}
                    <span
                      onClick={(e) => {
                        e.stopPropagation(); // VERY IMPORTANT
                        clearAssignedUser();
                      }}
                    >

                    </span>
                  </span>
                )}

                {!assignedUser && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Assign user"
                    value={assignSearch}
                    onChange={handleAssignChange}
                    onFocus={handleAssignFocus}
                  />
                )}
              </div>

              {showAssignList && assignList.length > 0 && (
                <ul className="assign-dropdown">
                  {assignList.map((u) => (
                    <li
                      key={u._id}
                      onClick={() => selectAssignedUser(u)}
                    >
                      {u.name}
                    </li>
                  ))}
                </ul>
              )}
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
    </div>
  );
}

