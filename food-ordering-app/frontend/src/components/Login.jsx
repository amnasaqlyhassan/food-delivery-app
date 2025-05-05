import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "./authStore";
import "../styles/login-style.css";
import { loginRoute, userRoute } from "../constant";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [showToggle, setShowToggle] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
    document.body.classList.toggle("light-mode");
  };

  useEffect(() => {
    const handleResize = () => {
      setShowToggle(window.innerWidth > 800);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(loginRoute, {
        email: formData.email,
        password: formData.password,
      });

      const { token, userId } = response.data;
      const userRes = await axios.get(`${userRoute}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userRes.data;
      setAuth({ user, token });
      setSuccess("Login successful!");

      // Redirect based on role
      setTimeout(() => {
        if (user.role === "customer") {
          window.location.href = "/home-page";
        } else {
          window.location.href = "/eatery-homepage";
        }
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className={`auth-container ${isLightMode ? 'light-mode' : ''}`}>
      {showToggle && (
        <button className="theme-switch" onClick={toggleTheme}>
          {isLightMode ? "🌞" : "🌙"}
        </button>
      )}

      <div className="auth-box">
        <div className="auth-form">
          <h1>WELCOME BACK</h1>

          {error && <p className="alert-error">{error}</p>}
          {success && <p className="alert-success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">
              Email <span className="password-required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">
              Password <span className="password-required">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="checkbox-group">
              <label className="styled-checkbox">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                />
                <span className="checkbox-circle"></span>
                Show Password
              </label>
            </div>

            <Link to="/change-password" className="password-reset">
              Forgot Password?
            </Link>

            <button type="submit" className="submit-btn">
              Login
            </button>

            <div className="register-link">
              Don't have an account?{" "}
              <Link to="/signup" className="register-link">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <div className="auth-image">
          <img src="./assets/indian-food.jpg" alt="Delicious Indian food" />
        </div>
      </div>
    </div>
  );
};

export default Login;
