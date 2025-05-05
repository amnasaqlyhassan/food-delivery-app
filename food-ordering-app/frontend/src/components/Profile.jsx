"use client"

import { useState, useRef, useEffect } from "react"
import "../styles/profile.css"
import { Link } from "react-router-dom"
import useAuthStore from "./authStore"

const Profile = () => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, logout } = useAuthStore()

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    // The Link component will handle navigation
  }

  return (
    <div className="profile-wrapper" ref={dropdownRef}>
      <div className="profile-header" onClick={() => setOpen(!open)}>
        <span className="user-name">{user?.name || "User"}</span>
        <span className="arrow">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="profile-panel">
          <Link to="/" className="logout-link">
            <button className="panel-item logout-button" onClick={handleLogout}>
              Logout
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Profile
