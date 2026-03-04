import { useState, useRef } from "react";
import { toast } from "react-toastify";
import "./NewProject.css";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import { createProjectApi, generateUploadUrl, tagClientApi } from "../../api/projects.api";
import axios from "axios"
import { useNavigate } from "react-router-dom";

export default function NewProject() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: today,
    dueDate: "",
    status: "INPROGRESS",
  });

  const [projectDetails, setProjectDetails] = useState({
    homeownerName: "",
    estimatedProduction: "",
    panelModulesQuantity: "",
    inverterModelQuantity: "",
    battery: "No",
    meterNumber: "",
    utilityName: "",
    roof: "Pitch",
    ahjName: "",
  });

  // const [attachments, setAttachments] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<
    {
      file: File;
      progress: number;
      url?: string;
      public_id?: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProjectDetails({ ...projectDetails, [e.target.name]: e.target.value });
  };

  // const handleFileChange = (files: FileList | null) => {
  //   if (!files) return;

  //   const MAX_SIZE = 6 * 1024 * 1024; // 5MB

  //   for (const file of Array.from(files)) {
  //     if (file.size > MAX_SIZE) {
  //       toast.error(`"${file.name}" exceeds 5MB limit`);
  //       return;
  //     }
  //   }

  //   setAttachments(Array.from(files));
  // };
  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    const MAX_SIZE = 300 * 1024 * 1024; // ✅ 300MB

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds 300MB limit`);
        continue;
      }

      const newFile = { file, progress: 0 };
      setAttachments((prev) => [...prev, newFile]);

      try {
        // 1️⃣ Get signed URL
        const res = await generateUploadUrl({
          fileName: file.name,
          fileType: file.type,
        });
        console.log("🚀 ~ handleFileChange ~ data:", res)

        const { uploadUrl, fileUrl, key } = res;

        // 2️⃣ Upload to S3
        await axios.put(uploadUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );

            setAttachments((prev) =>
              prev.map((f) =>
                f.file === file
                  ? {
                    ...f,
                    url: fileUrl,
                    public_id: key,
                    progress: percent,
                  }
                  : f
              )
            );
          },
        });

        // 3️⃣ Save final URL
        setAttachments((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, url: fileUrl, progress: 100 } : f
          )
        );

        toast.success(`${file.name} uploaded`);
      } catch (err) {
        console.log("🚀 ~ handleFileChange ~ err:", err)
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.dueDate || !projectDetails.homeownerName) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);

      // const formData = new FormData();
      // formData.append("name", form.name);
      // formData.append("description", form.description);
      // formData.append("status", form.status);
      // formData.append("startDate", form.startDate);
      // formData.append("dueDate", form.dueDate);
      // formData.append("owner", assignedUser._id);
      // formData.append("createdBy", user.id);

      // Object.entries(projectDetails).forEach(([key, value]) => {
      //   formData.append(`projectDetails[${key}]`, value);
      // });
      const uploadedFiles = attachments.filter((f) => f.url && f.public_id).map((f) => ({
        url: f.url!,
        public_id: f.public_id!,
      }));
      const payload = { ...form, owner: assignedUser?._id, createdBy: user.id, projectDetails, attachments: uploadedFiles };
      const res: any = await createProjectApi(payload);

      if (res) {
        toast.success("Project created successfully");

        setForm({
          name: "",
          description: "",
          startDate: today,
          dueDate: "",
          status: "INPROGRESS",
        });
        setProjectDetails({
          homeownerName: "",
          estimatedProduction: "",
          panelModulesQuantity: "",
          inverterModelQuantity: "",
          battery: "No",
          meterNumber: "",
          utilityName: "",
          roof: "Pitch",
          ahjName: "",
        });
        setAttachments([]);
        navigate("/projects");
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
      const res: any = await tagClientApi(search);
      setAssignList(res.list || []);
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

      <div className="new-project-page" style={{ padding: "25px" }}>
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
            <div className="rich-text-wrapper">
              <RichTextEditor
                initialValue={form.description}
                onChange={(content) => setForm({ ...form, description: content })}
                hideControls={true}
              />
            </div>
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
                {attachments.map((item, i) => (
                  <div key={i} className="attachment-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "10px" }}>
                        {item.file.name}
                      </span>
                      <span
                        onClick={() => handleRemoveAttachment(i)}
                        style={{ cursor: "pointer", color: "var(--btn-danger-text, red)", fontWeight: "bold", fontSize: "16px", padding: "0 5px" }}
                        title="Remove attachment"
                      >
                        &times;
                      </span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <small>{item.progress}%</small>
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

          <hr className="form-divider" />
          <h4 className="section-title">Project Details</h4>

          <div className="form-grid">
            {/* Homeowner Name */}
            <div className="form-row">
              <label>Homeowner Name *</label>
              <input
                type="text"
                name="homeownerName"
                value={projectDetails.homeownerName}
                onChange={handleDetailsChange}
                required
              />
            </div>

            {/* Estimated Production */}
            <div className="form-row">
              <label>Estimated Production</label>
              <input
                type="text"
                name="estimatedProduction"
                value={projectDetails.estimatedProduction}
                onChange={handleDetailsChange}
              />
            </div>
          </div>

          <div className="form-grid">
            {/* Panel Modules & Quantity */}
            <div className="form-row">
              <label>Panel Modules & Quantity</label>
              <input
                type="text"
                name="panelModulesQuantity"
                value={projectDetails.panelModulesQuantity}
                onChange={handleDetailsChange}
              />
            </div>

            {/* Inverter Model & Quantity */}
            <div className="form-row">
              <label>Inverter Model & Quantity</label>
              <input
                type="text"
                name="inverterModelQuantity"
                value={projectDetails.inverterModelQuantity}
                onChange={handleDetailsChange}
              />
            </div>
          </div>

          <div className="form-grid">
            {/* Battery */}
            <div className="form-row">
              <label>Battery (Y/N)</label>
              <select
                name="battery"
                value={projectDetails.battery}
                onChange={handleDetailsChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Meter Number */}
            <div className="form-row">
              <label>Meter Number</label>
              <input
                type="text"
                name="meterNumber"
                value={projectDetails.meterNumber}
                onChange={handleDetailsChange}
              />
            </div>
          </div>

          <div className="form-grid">
            {/* Utility Name */}
            <div className="form-row">
              <label>Utility Name</label>
              <input
                type="text"
                name="utilityName"
                value={projectDetails.utilityName}
                onChange={handleDetailsChange}
              />
            </div>

            {/* Roof */}
            <div className="form-row">
              <label>Roof (Pitch / Flat)</label>
              <select
                name="roof"
                value={projectDetails.roof}
                onChange={handleDetailsChange}
              >
                <option value="Pitch">Pitch</option>
                <option value="Flat">Flat</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* AHJ Name */}
            <label>AHJ Name</label>
            <input
              type="text"
              name="ahjName"
              value={projectDetails.ahjName}
              onChange={handleDetailsChange}
            />
          </div>

          <hr className="form-divider" />

          {/* SUBMIT */}
          <button className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
