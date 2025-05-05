"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/change-password-style.css"
import { changePasswordRoute } from "../constant"

const ChangePassword = () => {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [showToggle, setShowToggle] = useState(true)

  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev)
    document.body.classList.toggle("password-light-mode")
  }

  useEffect(() => {
    const handleResize = () => {
      setShowToggle(window.innerWidth > 800)
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess("")

    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format."
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required."
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required."
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await axios.post(
        changePasswordRoute,
        {
          email,
          password: newPassword,
        },
        { withCredentials: true },
      )

      setSuccess("Password updated successfully! Redirecting to login...")
      setEmail("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        navigate("/") // Redirect to login after 2 seconds
      }, 2000)
    } catch (error) {
      setErrors({ api: error.response?.data?.error || "Password update failed. Please try again." })
    }
  }

  return (
    <div className={`password-container ${isLightMode ? "password-light-mode" : ""}`}>
      {showToggle && (
        <button className="password-theme-toggle" onClick={toggleTheme}>
          {isLightMode ? "🌞" : "🌙"}
        </button>
      )}

      <div className="password-box">
        <div className="password-form">
          <h2>Change Password</h2>

          {errors.api && <p className="password-error-message">{errors.api}</p>}
          {success && <p className="password-success-message">{success}</p>}

          <form onSubmit={handleSubmit}>
            <label>
              Email <span className="password-required">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="password-input"
            />
            {errors.email && <p className="password-error">{errors.email}</p>}

            <label>
              New Password <span className="password-required">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="password-input"
            />
            {errors.newPassword && <p className="password-error">{errors.newPassword}</p>}

            <label>
              Confirm Password <span className="password-required">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="password-input"
            />
            {errors.confirmPassword && <p className="password-error">{errors.confirmPassword}</p>}

            <div className="password-checkbox-container">
              <label className="password-custom-checkbox">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className="password-checkbox-input"
                />
                <span className="password-checkmark"></span>
                Show Password
              </label>
            </div>

            {/* "Back To Login" link */}
            <p className="password-back-to-login" onClick={() => navigate("/")}>
              Back To Login
            </p>

            <button type="submit" className="password-btn">
              Confirm
            </button>
          </form>
        </div>

        <div className="password-image">
          <img src="./assets/samosas.jpg" alt="Delicious Indian food" className="password-img" />
        </div>
      </div>
    </div>
  )
}

export default ChangePassword