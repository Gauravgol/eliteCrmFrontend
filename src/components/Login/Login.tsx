import { useState } from "react";
import { toast } from "react-toastify";
import { loginApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { connectUser } = useSocket();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      console.log("ww")
      const response: any = await loginApi({ email, password });
      console.log("ww2", response)

      // axiosInstance already returns apiResponseData on success
      if (response && response.token) {
        toast.success("Login successful");

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        if (response.user?.id) {
          connectUser(response.user.id);
        }

        navigate("/dashboard");
      } else {
        toast.error("Login failed: Invalid response data");
      }
    } catch (error: any) {
      console.log("Login error:", error);
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
        <h1 className="display-3 fw-bold text-center text-white">
          <img src="/Sync.png" alt="Sync Icon" style={{ width: "500px", marginRight: "15px" }} />
          {/* Solar Sync Solutions */}
        </h1>
        {/* <p className="lead text-center opacity-75 text-white">
          Manage your projects & workflow efficiently
        </p> */}
      </div>

      {/* RIGHT SECTION */}
      <div
        className="d-flex justify-content-center align-items-center p-4"
        style={{ backgroundColor: "#fff", flex: 1 }}
      >
        <div className="w-100" style={{ maxWidth: "380px" }}>

          <h3 className="text-center mb-4 fw-bold text-dark">Login</h3>

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
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="btn btn-dark w-100 mt-3 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>
      </div>
    </div>
  );
}