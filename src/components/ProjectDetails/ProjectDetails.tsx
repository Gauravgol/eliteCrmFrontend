// import { useEffect, useState, useRef } from "react";
// import "./ProjectDetails.css";
// import { useParams, useNavigate } from "react-router-dom";
// import { generateUrn } from "../../utils/generateUrn";
// import { toast } from "react-toastify";
// import moment from "moment-timezone";

// export default function ProjectDetails() {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();

//   const [project, setProject] = useState<any>(null);
//   const [tasks, setTasks] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // toggles
//   const [showDescription, setShowDescription] = useState(true);
//   const [showAttachments, setShowAttachments] = useState(true);
//   const [showComments, setShowComments] = useState(true);

//   // edit
//   const [editingDesc, setEditingDesc] = useState(false);
//   const [descDraft, setDescDraft] = useState("");

//   const [commentText, setCommentText] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // const [mentionSearch, setMentionSearch] = useState("");
//   const [mentionList, setMentionList] = useState<any[]>([]);
//   const [showMentionList, setShowMentionList] = useState(false);
//   const commentRef = useRef<HTMLDivElement>(null);

//   const USER_ID = "6939b329f8799ddbd5833664";
//   const USER_NAME = "Gaurav";

//   useEffect(() => {
//     fetchData();
//   }, [projectId]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [p, t] = await Promise.all([fetchProject(), fetchTasks()]);
//       return [p, t];
//     } catch {
//       setError("Failed to load project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProject = async () => {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_BASE_URL}/getProjects?projectId=${projectId}`,
//       { headers: { urn: generateUrn(13) } }
//     );
//     const json = await res.json();
//     setProject(json?.apiResponseData?.list?.[0]);
//   };

//   const fetchTasks = async () => {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_BASE_URL}/getTask?projectId=${projectId}`,
//       { headers: { urn: generateUrn(13) } }
//     );
//     const json = await res.json();
//     setTasks(json?.apiResponseData?.list || []);
//   };

//   const updateProject = async (payload: any, isFormData = false) => {
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/updateProject`,
//         {
//           method: "PUT",
//           headers: isFormData
//             ? { urn: generateUrn(13) }
//             : {
//                 "Content-Type": "application/json",
//                 urn: generateUrn(13),
//               },
//           body: isFormData
//             ? payload
//             : JSON.stringify({
//                 projectId,
//                 userId: USER_ID,
//                 ...payload,
//               }),
//         }
//       );

//       const json = await res.json();
//       if (json?.responseCode !== "200") throw new Error();
//       fetchProject();
//     } catch {
//       toast.error("Update failed");
//     }
//   };

//   const uploadAttachments = async (files: FileList | null) => {
//     if (!files) return;

//     for (const f of Array.from(files)) {
//       if (f.size > 5 * 1024 * 1024) {
//         toast.error(`${f.name} exceeds 5MB`);
//         return;
//       }
//     }

//     const fd = new FormData();
//     fd.append("projectId", projectId!);
//     fd.append("userId", USER_ID);
//     Array.from(files).forEach((f) => fd.append("attachments", f));

//     setUploading(true);
//     await updateProject(fd, true);
//     setUploading(false);
//   };

//   const fileName = (url: string) =>{
//     const file = url.split("/").pop(); // 1766939202757_images.jfif
//     if (!file) return "";

//     const parts = file.split("_");

//     if (parts.length > 1) {
//       return parts.slice(1).join("_");
//     }
//   return
//   }

//   const fetchUsersForMention = async (search: string) => {
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/tagUser?search=${search}`,
//         { headers: { urn: generateUrn(13) } }
//       );
//       const json = await res.json();
//       setMentionList(json?.apiResponseData?.list || []);
//     } catch {
//       toast.error("Failed to load users");
//     }
//   };
//   if (loading) return <div className="loading">Loading...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!project) return <div className="empty-state">Project not found</div>;

//   return (
//     <div className="page-container">
//             <div style={{ padding: "10px" }}>
//       <div className="project-header">
//         <h2>{project.name}</h2>
//       </div>

//       <div className="project-body">
//         {/* LEFT */}
//         <div className="tasks-section">
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <h5>Tasks</h5>
//             <button className="btn-primary" onClick={()=>navigate(`/projects/${projectId}/create-task`)}>+ New Task</button>
//           </div>

//           {tasks.map((t) => (
//             <div
//               key={t._id}
//               className="task-card"
//               onClick={() => navigate(`/task/${t._id}`)}
//             >
//               <div className="task-title">{t.name}</div>
//               <div className="task-meta">
//                 <span className={`status ${t.status}`}>{t.status}</span>
//                 <span className={`priority ${t.priority}`}>{t.priority}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* RIGHT */}
//         <div className="project-info">
//           {/* STATIC INFO */}
//           <div className="info-row">
//   <label>Status</label>
//   <select
//     value={project.status}
//     onChange={(e) =>
//       updateProject({ status: e.target.value })
//     }
//   >
//     <option value="TODO">TODO</option>
//     <option value="INPROGRESS">IN PROGRESS</option>
//     <option value="TESTING">TESTING</option>
//     <option value="DELIVERD">DELIVERED</option>
//     <option value="HOLD">HOLD</option>
//   </select>
// </div>
//           <div className="info-row"><label>Owner</label><span>{project.owner?.name}</span></div>
//           <div className="info-row"><label>Start</label><span>{new Date(project.startDate).toDateString()}</span></div>
//           <div className="info-row"><label>Due Date</label><span>{new Date(project.dueDate).toDateString()}</span></div>

//           {/* DESCRIPTION */}
//           <div
//   className="section-header"
//   onClick={() => setShowDescription((v) => !v)}
// >
//   <span>{showDescription ? "▾" : "▸"} Description</span>
// </div>

//           {/* {showDescription && (
//             editingDesc ? (
//               <textarea
//                 value={descDraft}
//                 onChange={(e) => setDescDraft(e.target.value)}
//                 onBlur={() => {
//                   updateProject({ description: descDraft });
//                   setEditingDesc(false);
//                 }}
//               />
//             ) : (
//               <p
//                 className="editable"
//                 onClick={() => {
//                   setDescDraft(project.description || "");
//                   setEditingDesc(true);
//                 }}
//               >
//                 {project.description || "Click to add description"}
//               </p>
//             )
//           )} */}
//           {showDescription && (
//   editingDesc ? (
//     <textarea
//       autoFocus
//       className="inline-textarea"
//       value={descDraft}
//       onChange={(e) => setDescDraft(e.target.value)}
//       onBlur={() => {
//         updateProject({ description: descDraft });
//         setEditingDesc(false);
//       }}
//     />
//   ) : (
//     <p
//       className="task-desc editable"
//       onClick={() => {
//         setDescDraft(project.description || "");
//         setEditingDesc(true);
//       }}
//     >
//       {project.description || "Click to add description"}
//     </p>
//   )
// )}

//           {/* ATTACHMENTS */}
//           <div
//   className="section-header"
//   onClick={() => setShowAttachments((v) => !v)}
// >
//   <span>{showAttachments ? "▾" : "▸"} Attachments</span>
// </div>
//           {showAttachments && (
//             <>
//               {(project.attachments || []).map((a: any) => (
//                 <div key={a._id} className="attachment-row">
//                   {a.url.endsWith(".pdf") ? "📄" : "🖼️"}
//                   <a href={a.url} target="_blank">{fileName(a.url)}</a>
//                 </div>
//               ))}
//               <label className="attach-btn">
//                 {uploading ? "Uploading..." : "+ Add attachment"}
//                 <input type="file" multiple hidden onChange={(e) => uploadAttachments(e.target.files)} />
//               </label>
//             </>
//           )}

//           {/* COMMENTS */}
//           <div
//   className="section-header"
//   onClick={() => setShowComments((v) => !v)}
// >
//   <span>{showComments ? "▾" : "▸"} Comments</span>
// </div>

//           {showComments && (
//             <>
//               {(project.comments || []).map((c: any) => (
//                 <div key={c._id} className="comment">
//                   <div style={{ display: "flex", justifyContent: "space-between" }}>
//     <strong>{c.commenterName}</strong>
//     <span className="comment-time">
//     {moment
//         .utc(c.commentedAt)
//         .tz("Asia/Kolkata")
//         .format("DD MMM YYYY, hh:mm A")}
//     </span>
//   </div>
//                   {/* <p>{c.comment}</p> */}
//                   <p
//   dangerouslySetInnerHTML={{
//     __html: c.comment.replace(
//       /@(\w+)/g,
//       `<span class="mention">@$1</span>`
//     ),
//   }}
// />
//                 </div>
//               ))}
//               {/* <textarea
//                 className="comment-box"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//               /> */}
//               <div className="comment-mention-wrapper" ref={commentRef}>
//   <textarea
//     className="comment-box"
//     value={commentText}
//     placeholder="Write a comment… Use @ to mention"
//     onChange={(e) => {
//       const value = e.target.value;
//       setCommentText(value);

//       const cursor = e.target.selectionStart;
//       const textBeforeCursor = value.slice(0, cursor);
//       const match = textBeforeCursor.match(/@(\w*)$/);

//       if (match) {
//         // setMentionSearch(match[1]);
//         setShowMentionList(true);
//         fetchUsersForMention(match[1]);
//       } else {
//         setShowMentionList(false);
//       }
//     }}
//   />

//   {showMentionList && mentionList.length > 0 && (
//     <ul className="mention-dropdown">
//       {mentionList.map((u) => (
//         <li
//           key={u._id}
//           onClick={() => {
//             const updatedText = commentText.replace(
//               /@(\w*)$/,
//               `@${u.name} `
//             );
//             setCommentText(updatedText);
//             setShowMentionList(false);
//           }}
//         >
//           @{u.name}
//         </li>
//       ))}
//     </ul>
//   )}
// </div>
//               <button
//                 className="comment-btn"
//                 disabled={!commentText.trim()}
//                 onClick={() => {
//                   updateProject({
//                     comment: commentText,
//                     commenterId: USER_ID,
//                     commenterName: USER_NAME,
//                   });
//                   setCommentText("");
//                 }}
//               >
//                 Add Comment
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState, useRef } from "react";
import "./ProjectDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import {
  getProjectsApi,
  updateProjectApi,
  tagUserApi,
  generateUploadUrl,
  uploadFileToS3Api
} from "../../api/projects.api";
import { getTasksApi } from "../../api/tasks.api";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["admin", "superAdmin"].includes(currentUser.role);

  // toggles
  const [showDescription, setShowDescription] = useState(true);
  const [showProjectDetails, setShowProjectDetails] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);
  const [showComments, setShowComments] = useState(true);

  // edit
  const [editingDesc, setEditingDesc] = useState(false);
  // const [descDraft, setDescDraft] = useState("");

  const [commentText, setCommentText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showTasks, setShowTasks] = useState(true);

  // project technical details edit
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState<any>({});


  // const [mentionSearch, setMentionSearch] = useState("");
  const [mentionList, setMentionList] = useState<any[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

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
    const data: any = await getProjectsApi({ projectId });
    setProject(data.list?.[0]);
  };

  const fetchTasks = async () => {
    const data: any = await getTasksApi({ projectId: projectId! });
    setTasks(data.list || []);
  };

  const updateProject = async (payload: any, isFormData = false) => {
    try {
      await updateProjectApi(
        isFormData ? payload : { projectId, userId: currentUser.id, ...payload },
        isFormData
      );
      fetchProject();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDetailsEdit = () => {
    setDetailsDraft(project.projectDetails || {});
    setEditingDetails(true);
  };

  const handleDetailsSave = async () => {
    await updateProject({
      projectDetails: {
        ...project.projectDetails, ...detailsDraft
      },
    });
    setEditingDetails(false);
  };

  const uploadAttachments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_SIZE = 300 * 1024 * 1024; // 300MB
    const newAttachments: { url: string; public_id: string }[] = [];

    setUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds 300MB limit`);
        continue;
      }

      try {
        const res: any = await generateUploadUrl({
          fileName: file.name,
          fileType: file.type,
        });

        const { uploadUrl, fileUrl, key } = res;

        await uploadFileToS3Api(uploadUrl, file);

        newAttachments.push({ url: fileUrl, public_id: key });
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        console.error("Upload error", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      const existingAttachments = project.attachments || [];
      const updatedAttachments = [...existingAttachments, ...newAttachments];

      await updateProject({ attachments: updatedAttachments });
    }

    setUploading(false);
  };

  const fileName = (url: string) => {
    const file = url.split("/").pop(); // 1766939202757_images.jfif
    if (!file) return "";

    const parts = file.split("_");

    if (parts.length > 1) {
      return parts.slice(1).join("_");
    }
    return
  }

  const fetchUsersForMention = async (search: string) => {
    try {
      const data: any = await tagUserApi(search);
      setMentionList(data.list || []);
    } catch {
      toast.error("Failed to load users");
    }
  };
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="empty-state">Project not found</div>;

  return (
    <div className="page-container">
      <div style={{ padding: "10px" }}>
        {/* HEADER */}
        <div className="project-header">
          <h2>{project.name}</h2>
        </div>

        <div className="project-body">
          {/* ================= LEFT ================= */}
          <div className="project-details-left">
            {/* TASKS */}
            <div
              className="section-header"
              onClick={() => setShowTasks(v => !v)}
            >
              <span>{showTasks ? "▾" : "▸"} Tasks</span>
              <button
                className="btn-primary"
                onClick={() =>
                  navigate(`/projects/${projectId}/create-task`)
                }
              >
                + New Task
              </button>
            </div>

            {showTasks && (
              <>
                <div style={{ marginBottom: "10px" }}></div>

                <div className="task-list-scroller">
                  {tasks.map((t) => (
                    <div
                      key={t._id}
                      className="task-card"
                      onClick={() => navigate(`/task/${t._id}`)}
                    >
                      <div className="task-title">{t.name}</div>
                      <div className="task-meta">
                        <span className={`status ${t.status}`}>
                          {t.status}
                        </span>
                        <span className={`priority ${t.priority}`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* DESCRIPTION */}
            <div
              className="section-header"
              onClick={() => setShowDescription((v) => !v)}
            >
              <span>{showDescription ? "▾" : "▸"} Description</span>
            </div>

            {showDescription &&
              (editingDesc ? (
                <RichTextEditor
                  initialValue={project.description || ""}
                  onSave={(content) => {
                    updateProject({ description: content });
                    setEditingDesc(false);
                  }}
                  onCancel={() => {
                    setEditingDesc(false);
                  }}
                />
              ) : (
                <div
                  className="task-desc editable"
                  onClick={() => {
                    setEditingDesc(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: project.description || "Click to add description",
                  }}
                />
              ))}

            {/* PROJECT DETAILS (TECHNICAL) */}
            <div
              className="section-header"
              onClick={() => setShowProjectDetails((v) => !v)}
            >
              <span>{showProjectDetails ? "▾" : "▸"} Project Details</span>
            </div>

            {showProjectDetails && (
              <div className="project-details-card">
                {editingDetails ? (
                  <>
                    <div className="details-grid">
                      <div className="details-item">
                        <label>Homeowner Name</label>
                        <input
                          type="text"
                          value={detailsDraft.homeownerName || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              homeownerName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Estimated Production</label>
                        <input
                          type="text"
                          value={detailsDraft.estimatedProduction || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              estimatedProduction: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Panel Modules & Qty</label>
                        <input
                          type="text"
                          value={detailsDraft.panelModulesQuantity || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              panelModulesQuantity: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Inverter Model & Qty</label>
                        <input
                          type="text"
                          value={detailsDraft.inverterModelQuantity || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              inverterModelQuantity: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Battery (Y/N)</label>
                        <select
                          value={detailsDraft.battery || "No"}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              battery: e.target.value,
                            })
                          }
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="details-item">
                        <label>Meter Number</label>
                        <input
                          type="text"
                          value={detailsDraft.meterNumber || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              meterNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Utility Name</label>
                        <input
                          type="text"
                          value={detailsDraft.utilityName || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              utilityName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="details-item">
                        <label>Roof (Pitch/Flat)</label>
                        <select
                          value={detailsDraft.roof || "Pitch"}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              roof: e.target.value,
                            })
                          }
                        >
                          <option value="Pitch">Pitch</option>
                          <option value="Flat">Flat</option>
                        </select>
                      </div>
                      <div className="details-item">
                        <label>AHJ Name</label>
                        <input
                          type="text"
                          value={detailsDraft.ahjName || ""}
                          onChange={(e) =>
                            setDetailsDraft({
                              ...detailsDraft,
                              ahjName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="edit-actions" style={{ marginTop: "20px" }}>
                      <button className="btn-save" onClick={handleDetailsSave}>
                        Save
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setEditingDetails(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className={`details-grid ${isAdmin ? "editable-grid" : ""}`}
                    onClick={() => isAdmin && handleDetailsEdit()}
                  >
                    <div className="details-item">
                      <label>Homeowner Name</label>
                      <p>{project.projectDetails?.homeownerName || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Estimated Production</label>
                      <p>{project.projectDetails?.estimatedProduction || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Panel Modules & Qty</label>
                      <p>{project.projectDetails?.panelModulesQuantity || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Inverter Model & Qty</label>
                      <p>{project.projectDetails?.inverterModelQuantity || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Battery (Y/N)</label>
                      <p>{project.projectDetails?.battery || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Meter Number</label>
                      <p>{project.projectDetails?.meterNumber || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Utility Name</label>
                      <p>{project.projectDetails?.utilityName || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>Roof (Pitch/Flat)</label>
                      <p>{project.projectDetails?.roof || "-"}</p>
                    </div>
                    <div className="details-item">
                      <label>AHJ Name</label>
                      <p>{project.projectDetails?.ahjName || "-"}</p>
                    </div>
                  </div>
                )}
              </div>
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
                {(project.attachments || []).length === 0 ? (
                  <p className="muted">No attachments</p>
                ) : (
                  <div className="attachments-grid">
                    {(project.attachments || []).map((a: any) => {
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
                                alt={fileName(a.url)}
                                loading="lazy"
                              />
                            )}
                          </div>

                          {/* FILE NAME (BELOW BOX) */}
                          <div className="attachment-name">
                            {fileName(a.url)}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* ADD ATTACHMENT — MUST BE INSIDE SAME FRAGMENT */}
                <label className="attach-btn" style={{ opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                  {uploading ? "Uploading..." : "+ Add attachment"}
                  <input
                    type="file"
                    multiple
                    hidden
                    disabled={uploading}
                    onChange={(e) => uploadAttachments(e.target.files)}
                  />
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{c.commenterName}</strong>
                      <span className="comment-time">
                        {moment
                          .utc(c.commentedAt)
                          .tz("Asia/Kolkata")
                          .format("DD MMM YYYY, hh:mm A")}
                      </span>
                    </div>

                    <p
                      dangerouslySetInnerHTML={{
                        __html: c.comment.replace(
                          /@(\w+)/g,
                          `<span class="mention">@$1</span>`
                        ),
                      }}
                    />
                  </div>
                ))}

                {/* COMMENT INPUT */}
                <div className="comment-mention-wrapper" ref={commentRef}>
                  <textarea
                    className="comment-box"
                    value={commentText}
                    placeholder="Write a comment… Use @ to mention"
                    onChange={(e) => {
                      const value = e.target.value;
                      setCommentText(value);

                      const cursor = e.target.selectionStart;
                      const textBeforeCursor = value.slice(0, cursor);
                      const match = textBeforeCursor.match(/@(\w*)$/);

                      if (match) {
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

          {/* ================= RIGHT (STICKY) ================= */}
          <div className="project-info">
            {/* STATIC INFO */}
            <div className="info-row">
              <label>Status</label>
              <select
                value={project.status}
                onChange={(e) => updateProject({ status: e.target.value })}
              >
                <option value="TODO">TODO</option>
                <option value="INPROGRESS">IN PROGRESS</option>
                <option value="TESTING">TESTING</option>
                <option value="DELIVERD">DELIVERED</option>
                <option value="HOLD">HOLD</option>
              </select>
            </div>

            <div className="info-row">
              <label>Owner</label>
              <span>{project.owner?.name}</span>
            </div>
            <div className="info-row">
              <label>CreatedBy</label>
              <span>{project.createdBy?.name}</span>
            </div>

            <div className="info-row">
              <label>Start</label>
              <span>{new Date(project.startDate).toDateString()}</span>
            </div>

            <div className="info-row">
              <label>Due</label>
              <span>{new Date(project.dueDate).toDateString()}</span>
            </div>


          </div>
        </div>
      </div>
    </div>

  );
}
