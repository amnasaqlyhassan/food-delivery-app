"use client";

import { useState, useEffect } from "react";
import { Package, Menu as MenuIcon } from "lucide-react"; // 🧹 Removed Moon
import { Link } from "react-router-dom";
import Profile from "./Profile";
import "../styles/eatery-navbar.css";
import useOrderStore from './orderStore';

const EateryNavbar = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const orderId = useOrderStore((state) => state.orderId);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <a href="/eatery-homepage" className="logo">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>BiTE</span>
          </a>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Profile Dropdown */}
          <Profile />

          {/* Track Orders */}
          <Link to={`/order-status-owner/${orderId}`} className="nav-icon-button" aria-label="Orders">
            <Package />
            <span className="icon-label">Track Orders</span>
          </Link>

          {/* Our Menu */}
          <Link to="/menu" className="nav-icon-button" aria-label="Menu">
            <MenuIcon strokeWidth={1.75} />
            <span className="icon-label">Menu</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default EateryNavbar;
