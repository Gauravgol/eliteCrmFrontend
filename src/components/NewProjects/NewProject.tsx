import { useState } from "react";
import "./NewProject.css";

export default function NewProject() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    startDate: today,
    dueDate: "",
    status: "inprogress",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Project Data:", form);
    // API call later
  };

  return (
    <div className="new-project-container">
      <div className="card project-card">
        <h4 className="text-center mb-4">Create New Project</h4>

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-3">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              required
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              onChange={handleChange}
            />
          </div>

          {/* Owner */}
          <div className="mb-3">
            <label className="form-label">Project Owner</label>
            <input
              type="text"
              className="form-control"
              name="owner"
              onChange={handleChange}
            />
          </div>

          {/* Dates */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="inprogress">In Progress</option>
              <option value="hold">On Hold</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-dark w-100">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}
