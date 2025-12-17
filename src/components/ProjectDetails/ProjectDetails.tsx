import { useEffect, useState } from "react";
import "./ProjectDetails.css";
import { useParams } from "react-router-dom";
import { generateUrn } from "../../utils/generateUrn";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
  name: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
});

  useEffect(() => {
    if (!projectId) {
      setError("Invalid project ID");
      setLoading(false);
      return;
    }

    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchProject(), fetchTasks()]);
    } catch (err) {
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/getProjects?projectId=${projectId}`,
      { headers: { urn: "1234567890123" } }
    );

    const json = await res.json();
    const projectData = json?.apiResponseData?.list?.[0];

    if (!projectData) {
      throw new Error("Project not found");
    }

    setProject(projectData);
  };

  const fetchTasks = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/getTask?projectId=${projectId}`,
      { headers: { urn: "1234567890123" } }
    );

    const json = await res.json();
    setTasks(json?.apiResponseData?.list || []);
  };
  const createTask = async () => {
    if (!taskForm.name.trim()) {
      alert("Task name is required");
      return;
    }
  
    try {
      setCreating(true);
  
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/createTask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            urn: generateUrn(13),
          },
          body: JSON.stringify({
            ...taskForm,
            projectId,
            createdBy: "6939b329f8799ddbd5833664", // replace later with logged-in user
          }),
        }
      );
  
      const json = await res.json();
  
      if (json?.responseCode !== "200") {
        throw new Error("Failed to create task");
      }
  
      setShowTaskModal(false);
      setTaskForm({
        name: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      });
  
      fetchTasks();  
    } catch (err) {
      alert("Failed to create task");
    } finally {
      setCreating(false);
    }
  };


  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!project) {
    return <div className="empty-state">Project not found</div>;
  }

  return (
    <div className="page-container">
    <div className="project-details-container">
      {/* Header */}
      <div className="project-header">
        <h2>{project.name}</h2>
        <p className="truncate-2">{project.description}</p>
      </div>

      <div className="project-body">
        {/* LEFT - TASKS */}
        <div className="tasks-section">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
  <h5>Tasks</h5>
  <button
    className="btn-primary"
    onClick={() => setShowTaskModal(true)}
  >
    + New Task
  </button>
</div>

          {tasks.length === 0 ? (
            <div className="empty-state">No tasks created yet</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-title">{task.name}</div>

                <div className="task-meta">
                  <span className={`status ${task.status}`}>
                    {task.status}
                  </span>

                  <span className={`priority ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>

                <p className="truncate-2 task-description">
                  {task.description}
                </p>

                <div className="task-footer">
                  <span>
                    Assigned: {task.assignedTo?.name || "Unassigned"}
                  </span>
                  <span>
                    Due: {new Date(task.dueDate).toDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT - PROJECT INFO */}
        <div className="project-info">
          <h5>Project Info</h5>

          <div className="info-row">
            <label>Status</label>
            <span>{project.status}</span>
          </div>

          <div className="info-row">
            <label>Owner</label>
            <span>{project.owner}</span>
          </div>

          <div className="info-row">
            <label>Start Date</label>
            <span>{new Date(project.startDate).toDateString()}</span>
          </div>

          <div className="info-row">
            <label>End Date</label>
            <span>{new Date(project.endDate).toDateString()}</span>
          </div>

          <div className="comments-section">
            <h6>Comments</h6>
            <textarea placeholder="Add comment..." />
            <button>Add Comment</button>
          </div>
        </div>

 
        {showTaskModal && (
  <div
    className="drawer-overlay"
    onClick={() => setShowTaskModal(false)}
  >
    <div
      className="drawer"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="drawer-header">
        <h5>Create Task</h5>
        <span
          className="close-btn"
          onClick={() => setShowTaskModal(false)}
        >
          ✕
        </span>
      </div>

      {/* BODY */}
      <div className="drawer-body">
        {/* TASK NAME */}
        <label>Task Name</label>
        <input
          type="text"
          placeholder="Enter task name"
          value={taskForm.name}
          onChange={(e) =>
            setTaskForm({ ...taskForm, name: e.target.value })
          }
        />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          placeholder="Enter task description"
          value={taskForm.description}
          onChange={(e) =>
            setTaskForm({ ...taskForm, description: e.target.value })
          }
        />

        {/* STATUS */}
        <label>Status</label>
        <select
          value={taskForm.status}
          onChange={(e) =>
            setTaskForm({ ...taskForm, status: e.target.value })
          }
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="DONE">DONE</option>
          <option value="HOLD">HOLD</option>
        </select>

        {/* PRIORITY */}
        <label>Priority</label>
        <select
          value={taskForm.priority}
          onChange={(e) =>
            setTaskForm({ ...taskForm, priority: e.target.value })
          }
        >
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {/* ASSIGN TO (UI ONLY) */}
        <label>Assign To</label>
        <select>
          <option>Select user</option>
          <option>John Doe</option>
          <option>Rahul Sharma</option>
          <option>Ankit Verma</option>
        </select>

        {/* DUE DATE */}
        <label>Due Date</label>
        <input
          type="date"
          value={taskForm.dueDate}
          onChange={(e) =>
            setTaskForm({ ...taskForm, dueDate: e.target.value })
          }
        />

        {/* ATTACHMENTS (UI ONLY) */}
        <label>Attachments</label>
        <div className="file-upload">
          <input type="file" />
          <span>Attach files (UI only)</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="drawer-footer">
        <button
          className="btn-secondary"
          onClick={() => setShowTaskModal(false)}
        >
          Cancel
        </button>

        <button
          className="btn-primary"
          onClick={createTask}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Task"}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
    </div>
  );
}
