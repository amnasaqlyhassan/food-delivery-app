"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Moon,
  Package,
  MessageCircle,
  History,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Profile from "./Profile";
import "../styles/navbar.css";
import Checkout from "./Checkout";
import OrderStatus from "./OrderStatus";
import useOrderStore from './orderStore';
import ChatWindow from "./ChatBot"; 

// ...imports remain unchanged...

const Navbar = ({ isDarkMode, toggleTheme }) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const orderId = useOrderStore((state) => state.orderId);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <a href="/home-page" className="logo">
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

        {/* Center - Search */}
        <div className="search-container" role="search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <Profile />

          <button className="nav-icon-button" aria-label="Orders">
            <Link to={`/order-status/${orderId}`}>
              <Package />
            </Link>
            <span className="icon-label">Track Orders</span>
          </button>

          <Link to="/history">
            <button className="nav-icon-button" aria-label="Order History">
              <History />
              <span className="icon-label">Order History</span>
            </button>
          </Link>

          <Link to="/Checkout">
            <button className="nav-icon-button cart-icon" aria-label="Cart">
              <ShoppingBag />
              <span className="icon-label">View Cart</span>
            </button>
          </Link>

          <button
            className="nav-icon-button chat-button"
            aria-label="Chat with Us"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            <MessageCircle />
            <span className="icon-label">Chat with Us</span>
          </button>
        </div>
      </div>
      {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;
