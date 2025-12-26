import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { generateUrn } from "../../utils/generateUrn";
import "./NewTask.css";

export default function NewTask() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds 5MB limit`);
        return;
      }
    }

    setAttachments(Array.from(files));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !projectId) {
      toast.error("Task name is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("projectId", projectId);
      formData.append("createdBy", user.id);
      formData.append("priority", form.priority);

      if (form.status) formData.append("status", form.status);
      if (form.dueDate) formData.append("dueDate", form.dueDate);
      if (form.assignedTo) formData.append("assignedTo", form.assignedTo);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/createTask`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            urn: generateUrn(),
          },
        }
      );

      if (res.data?.responseCode === "200") {
        toast.success("Task created successfully 🎉");
        navigate(`/projects/${projectId}`);
      } else {
        toast.error(res.data?.responseMessage || "Failed to create task");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.responseMessage || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="new-task-page">
        <h2>Create New Task</h2>

        <form onSubmit={handleSubmit} className="task-form">
          {/* NAME */}
          <div className="form-row">
            <label>Task Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-row">
            <label>Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the task..."
            />
          </div>

          {/* GRID */}
          <div className="form-grid">
            <div className="form-row">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`status-select status-${form.status.toLowerCase()}`}
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

            <div className="form-row">
              <label>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* OPTIONAL */}
          <div className="form-grid">
            <div className="form-row">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Assign To (User ID)</label>
              <input
                type="text"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="form-row">
            <label>Attachments</label>

            {attachments.length > 0 && (
              <div className="attachment-list">
                {attachments.map((file, i) => (
                  <div key={i} className="attachment-item">
                    📎 {file.name}
                  </div>
                ))}
              </div>
            )}

            <label className="attach-btn">
              + Add attachments
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </label>
          </div>

          {/* ACTIONS */}
          <div className="action-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
