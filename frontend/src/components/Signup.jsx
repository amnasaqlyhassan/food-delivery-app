"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import "../styles/signup-style.css"
import { signupRoute } from "../constant"

const Signup = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    accountType: "Customer",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [showToggle, setShowToggle] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev)
    document.body.classList.toggle("signup-light-mode")
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
    setError("")
    setSuccess("")

    const phoneRegex = /^\d{11}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be exactly 11 digits long.")
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      )
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await axios.post(signupRoute, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.accountType.toLowerCase(),
      })

      setSuccess("Account created successfully!")
      setFormData({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "", accountType: "Customer" })

      console.log("Signup successful:", response.data)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.error || "Signup failed. Please try again.")
    }
  }

  return (
    <div className={`signup-container ${isLightMode ? "signup-light-mode" : ""}`}>
      {showToggle && (
        <button className="signup-theme-toggle" onClick={toggleTheme}>
          {isLightMode ? "🌞" : "🌙"}
        </button>
      )}

      <div className="signup-box">
        <div className="signup-form-wrapper">
          <h1 className="signup-heading">GET STARTED</h1>

          {error && <p className="signup-error-message">{error}</p>}
          {success && <p className="signup-success">{success}</p>}

          <form onSubmit={handleSubmit} className="signup-form-element">
            <label htmlFor="signup-name" className="signup-label">
              Name
              <span className="password-required"> *</span> </label>
            <input
              type="text"
              id="signup-name"
              name="name"
              placeholder="Mark Norman"
              value={formData.name}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <label htmlFor="signup-email" className="signup-label">
              Email
              <span className="password-required"> *</span>  </label>
            <input
              type="email"
              id="signup-email"
              name="email"
              placeholder="seamus.schmidt@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <label htmlFor="signup-phoneNumber" className="signup-label">
              Phone Number
              <span className="password-required"> *</span> </label>
            <input
              type="text"
              id="signup-phoneNumber"
              name="phoneNumber"
              placeholder="03x-xxx-xxxxx"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <label htmlFor="signup-password" className="signup-label">
              Password
              <span className="password-required"> *</span> </label>
            <input
              type={showPassword ? "text" : "password"}
              id="signup-password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <label htmlFor="signup-confirmPassword" className="signup-label">
              Confirm Password
              <span className="password-required"> *</span> </label>
            <input
              type={showPassword ? "text" : "password"}
              id="signup-confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="signup-input"
            />

            <div className="signup-checkbox-row">
              <label className="signup-custom-checkbox">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className="signup-checkbox-input"
                />
                <span className="signup-checkmark"></span>
                Show Password
              </label>
            </div>

            <label htmlFor="signup-accountType" className="signup-label">
              Select Account Type
              <span className="password-required"> *</span> </label>
            <select
              id="signup-accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="signup-select"
            >
              <option>Customer</option>
              <option>Owner</option>
            </select>

            <button type="submit" className="signup-btn">
              Sign Up
            </button>

            <div className="signup-login-link">
            Already have an account?
            <Link to="/" className="signup-link">
                Sign in
              </Link>
            </div>
          </form>
        </div>

        <div className="signup-image-container">
          <img src="./assets/woman-eating-food.jpg" alt="Woman eating food" className="signup-image-content" />
        </div>
      </div>
    </div>
  )
}

export default Signup

