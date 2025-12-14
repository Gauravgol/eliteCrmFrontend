import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./NewProject.css";
import {generateUrn} from "../../utils/generateUrn"

export default function NewProject() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    startDate: today,
    dueDate: "",
    status: "INPROGRESS",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.owner || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      owner: form.owner,
      status: form.status,
      startDate: form.startDate,
      endDate: form.dueDate,
    };

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/createProject`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            urn: generateUrn(),
          },
        }
      );
      console.log("🚀 ~ handleSubmit ~ res:", res)

      if (res.data?.responseCode === "200") {
        toast.success("Project created successfully 🎉");

        // reset form
        setForm({
          name: "",
          description: "",
          owner: "",
          startDate: today,
          dueDate: "",
          status: "INPROGRESS",
        });
      } else {
        toast.error(res.data?.responseMessage || "Failed to create project");
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
    <div className="new-project-container">
      <div className="card project-card">
        <h4 className="text-center mb-4">Create New Project</h4>

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-3">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
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
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Owner */}
          <div className="mb-3">
            <label className="form-label">Project Owner *</label>
            <input
              type="text"
              className="form-control"
              name="owner"
              value={form.owner}
              required
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
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={form.dueDate}
                required
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
              <option value="INPROGRESS">In Progress</option>
              <option value="HOLD">On Hold</option>
              <option value="DONE">Complete</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
