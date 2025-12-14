import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Routes, Route, useNavigate } from "react-router-dom";


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            urn: Math.floor(Math.random() * 10 ** 13).toString(), // temp urn
          },
        }
      );

      const { responseCode, responseMessage, apiResponseData } = response.data;

      if (responseCode === 200) {
        toast.success(responseMessage || "Login successful");
        
      localStorage.setItem("token", apiResponseData.token);
      localStorage.setItem("user", JSON.stringify(apiResponseData.user));
      navigate("/dashboard");
      } else {
        toast.error(responseMessage || "Login failed");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.responseMessage ||
          "Something went wrong. Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row vh-100 w-100">

      {/* LEFT SECTION */}
      <div
        className="d-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{ backgroundColor: "#000", flex: 1 }}
      >
        <h1 className="display-3 fw-bold text-center">Solar Sync Solutions</h1>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button
            className="btn btn-dark w-100 mt-3 py-2 fw-semibold"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
