import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { getUsersApi, registerUserApi } from "../../api/users.api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Users.css";

export default function Users() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ totalPages: 1 });

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
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
  const [countryCode, setCountryCode] = useState("+91");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [profilePic, setProfilePic] = useState<File | null>(null);

  const countryCodes = [
    { code: "+91", country: "IN" },
    { code: "+1", country: "US" },
    { code: "+44", country: "UK" },
    { code: "+81", country: "JP" },
    { code: "+86", country: "CN" },
    { code: "+49", country: "DE" },
    { code: "+33", country: "FR" },
    { code: "+61", country: "AU" },
    { code: "+7", country: "RU" },
    { code: "+971", country: "AE" },
  ];

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await getUsersApi({
        userId: user.id,
        page,
        limit: 10,
        search,
        role,
      });

      setUsers(res.list || []);
      setPagination(res.pagination || {});
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
    const newErrors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check mandatory fields individually for better UX
    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/;
      if (!passwordRegex.test(form.password)) {
        newErrors.password = "Pass: 6-15 chars, 1 Uppercase, 1 Num, 1 Special char";
      }
    }

    // Phone is optional now, but check format if provided
    /*
    if (form.phone) {
        // basic check if needed, mostly handled by optionality
    }
    */

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= CREATE USER ================= */
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setCreating(true);

      const fd = new FormData();
      // Combine country code and phone if phone exists
      const finalPhone = form.phone ? `${countryCode} ${form.phone}` : "";

      Object.keys(form).forEach((k) => {
        if (k === 'phone') fd.append(k, finalPhone);
        else fd.append(k, form[k]);
      });

      fd.append("creatorId", user.id);
      if (profilePic) fd.append("profilePic", profilePic);

      await registerUserApi(fd);

      // axiosInstance intercepts response so res is already data.apiResponseData usually,
      // but let's check if the base format is returned or just success.
      // Usually axiosInstance throws if responseCode != 200|201
      toast.success("User created successfully");
      handleModalClose();
      fetchUsers();
    } catch {
      toast.error("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setErrors({});
    setShowPassword(false);
  };

  return (
    <div className="page-container">
      <div style={{ padding: "10px" }}>
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
                  <span className="muted">{u.phone || "No phone"}</span>
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
            <div className="modal-overlay" onClick={handleModalClose}>
              <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Create New User</h3>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Name <span className="required-star">*</span></label>
                    <input
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className={errors.name ? "input-error" : ""}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email <span className="required-star">*</span></label>
                    <input
                      placeholder="e.g. john@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={errors.email ? "input-error" : ""}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Password <span className="required-star">*</span></label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Strong password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className={errors.password ? "input-error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <div className="phone-input-group">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="country-select"
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                        ))}
                      </select>
                      <input
                        placeholder="Mobile (Optional)"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      placeholder="City"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      placeholder="State"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      placeholder="Pincode"
                      value={form.pincode}
                      onChange={e => setForm({ ...form, pincode: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      placeholder="Country"
                      value={form.country}
                      onChange={e => setForm({ ...form, country: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Role</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setProfilePic(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={handleModalClose}>
                    Cancel
                  </button>
                  <button className="btn-submit" disabled={creating} onClick={handleCreateUser}>
                    {creating ? "Creating..." : "Create User"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
