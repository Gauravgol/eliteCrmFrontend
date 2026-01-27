import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./NewProject.css";
import { generateUrn } from "../../utils/generateUrn";

export default function NewProject() {
  const today = new Date().toISOString().split("T")[0];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: today,
    dueDate: "",
    status: "INPROGRESS",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("status", form.status);
      formData.append("startDate", form.startDate);
      formData.append("dueDate", form.dueDate);
      formData.append("owner", assignedUser._id);
      formData.append("createdBy", user.id)

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/createProject`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            urn: generateUrn(),
          },
        }
      );

      if (res.data?.responseCode === "200") {
        toast.success("Project created successfully 🎉");

        setForm({
          name: "",
          description: "",
          startDate: today,
          dueDate: "",
          status: "INPROGRESS",
        });
        setAttachments([]);
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

     /* ---------------- ASSIGN STATES ---------------- */
     const [assignedUser, setAssignedUser] = useState<any>(null);
     const [assignSearch, setAssignSearch] = useState("");
     const [assignList, setAssignList] = useState<any[]>([]);
     const [showAssignList, setShowAssignList] = useState(false);
     const assignRef = useRef<HTMLDivElement>(null);
     /* -------- ASSIGN USERS -------- */
     const fetchUsersForAssign = async (search: string) => {
       try {
         const res = await fetch(
           `${import.meta.env.VITE_API_BASE_URL}/tagClient?search=${search}`,
           { headers: { urn: generateUrn(13) } }
         );
         const json = await res.json();
         setAssignList(json?.apiResponseData?.list || []);
       } catch {
         toast.error("Failed to load users");
       }
     };
   
     const handleAssignFocus = () => {
       if (assignedUser) return;
       setShowAssignList(true);
       if (assignList.length === 0) {
         fetchUsersForAssign("");
       }
     };
   
     const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const value = e.target.value;
       setAssignSearch(value);
       setShowAssignList(true);
   
       if (value.trim()) fetchUsersForAssign(value);
       else setAssignList([]);
     };
   
     const selectAssignedUser = (u: any) => {
       setAssignedUser(u);
       setAssignSearch("");
       setShowAssignList(false);
     };
   
     const clearAssignedUser = () => {
       setAssignedUser(null);
       setAssignSearch("");
       setAssignList([]);
       setShowAssignList(false);
     };

  return (
    <div className="page-container">
      <div className="new-project-page">
        <h2>Create New Project</h2>

        <form onSubmit={handleSubmit} className="project-form">
          {/* NAME */}
          <div className="form-row">
            <label>Project Name *</label>
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
              placeholder="Describe the project..."
            />
          </div>

          {/* DATES */}
          <div className="form-grid">
            <div className="form-row">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-grid">
          {/* STATUS */}
          <div className="form-row">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="TODO">TODO</option>
              <option value="INPROGRESS">IN PROGRESS</option>
              <option value="TESTING">TESTING</option>
              <option value="DELIVERD">DELIVERED</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>
          <div className="form-row assign-wrapper" ref={assignRef}>
              <label>Assign To</label>

              <div className="assign-input">
                {assignedUser && (
                  <span className="assign-chip">
                    {assignedUser.name}
                    <span onClick={clearAssignedUser}>×</span>
                  </span>
                )}

                {!assignedUser && (
                  <input
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
                    <li key={u._id} onClick={() => selectAssignedUser(u)}>
                      {u.name}
                    </li>
                  ))}
                </ul>
              )}
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

          {/* SUBMIT */}
          <button className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
