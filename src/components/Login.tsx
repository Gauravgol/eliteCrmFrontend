import { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="d-flex flex-column flex-md-row vh-100 w-100">

      {/* LEFT SECTION */}
      <div
        className="d-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{ backgroundColor: "#000", flex: 1 }}
      >
        <h1 className="display-3 fw-bold text-center">Elite CRM</h1>
        <p className="lead text-center opacity-75">
          Manage your projects, clients & workflows efficiently.
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div
        className="d-flex justify-content-center align-items-center p-4"
        style={{ backgroundColor: "#fff", flex: 1 }}
      >
        <div className="w-100" style={{ maxWidth: "380px" }}>

          <h3 className="text-center mb-4 fw-bold">Login</h3>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
              />
              <span
                className="input-group-text"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button className="btn btn-dark w-100 mt-3 py-2 fw-semibold">
            Login
          </button>

        </div>
      </div>
    </div>
  );
}
