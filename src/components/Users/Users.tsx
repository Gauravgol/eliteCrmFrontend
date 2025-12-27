import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { generateUrn } from "../../utils/generateUrn";
import { toast } from "react-toastify";
import "./Users.css";

export default function Users() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ totalPages: 1 });

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "employee",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/getUsers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            urn: generateUrn(),
          },
          params: {
            userId: user.id,
            page,
            limit: 10,
            search,
            role,
          },
        }
      );

      setUsers(res.data?.apiResponseData?.list || []);
      setPagination(res.data?.apiResponseData?.pagination || {});
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO SEARCH (DEBOUNCE) ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FILTER / PAGE CHANGE ================= */
  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;

    if (!form.name || !form.email || !form.password || !form.phone) {
      toast.error("All required fields must be filled");
      return false;
    }

    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!phoneRegex.test(form.phone)) {
      toast.error("Phone must be 10 digits");
      return false;
    }

    if (!passwordRegex.test(form.password)) {
      toast.error(
        "Password must be 6–15 chars, 1 uppercase, 1 number, 1 special char"
      );
      return false;
    }

    if (profilePic) {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(profilePic.type)) {
        toast.error("Only JPG / PNG images allowed");
        return false;
      }
      if (profilePic.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return false;
      }
    }

    return true;
  };

  /* ================= CREATE USER ================= */
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);

      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      fd.append("creatorId", user.id);
      if (profilePic) fd.append("profilePic", profilePic);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/registerUser`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            urn: generateUrn(),
          },
        }
      );

      if (res.data?.responseCode === 200) {
        toast.success("User created successfully");
        setShowModal(false);
        setForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "employee",
          city: "",
          state: "",
          pincode: "",
          country: "",
        });
        setProfilePic(null);
        fetchUsers();
      } else {
        toast.error(res.data?.responseMessage);
      }
    } catch {
      toast.error("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h2>Users</h2>
          <p className="muted">Manage system users</p>
        </div>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Create User
        </button>
      </div>

      {/* FILTERS */}
      <div className="users-filters">
        <input
          placeholder="Search name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* LIST */}
      <div className="users-card">
        {users.length === 0 && loading ? (
          <div className="loading">Loading...</div>
        ) : (
          users.map((u) => (
            <div key={u._id} className="user-row">
              <div className="avatar-placeholder">
                {u.profilePic ? <img src={u.profilePic} /> : u.name?.charAt(0)}
              </div>
              <div className="user-info">
                <strong>{u.name}</strong>
                <span>{u.email}</span>
                <span className="muted">{u.phone}</span>
              </div>
              <div className={`role-badge ${u.role}`}>{u.role}</div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <span>{page} / {pagination.totalPages}</span>
        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {showModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Create User</h3>

              <div className="modal-grid">
                <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
                <input placeholder="Phone" onChange={e => setForm({ ...form, phone: e.target.value })} />
                <input placeholder="City" onChange={e => setForm({ ...form, city: e.target.value })} />
                <input placeholder="State" onChange={e => setForm({ ...form, state: e.target.value })} />
                <input placeholder="Pincode" onChange={e => setForm({ ...form, pincode: e.target.value })} />
                <input placeholder="Country" onChange={e => setForm({ ...form, country: e.target.value })} />

                <select onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>

                <div className="full-width">
                  <input type="file" onChange={e => setProfilePic(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-black" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn-black" disabled={creating} onClick={handleCreateUser}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
