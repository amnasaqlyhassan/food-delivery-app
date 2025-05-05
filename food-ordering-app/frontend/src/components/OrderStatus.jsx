import React, { useState, useEffect } from "react"; 
import Navbar from "../components/Navbar"; 
import axios from "axios";
import { useParams } from 'react-router-dom';

import { Clock, ChefHat, Truck, CheckCircle } from "lucide-react"
import "../styles/order-status-page.css"; // Ensure this file has the provided styles
import useOrderStore from './orderStore'; // Import the Zustand store
import { eateryRoute, orderRoute } from "../constant";


function OrderStatus() {
  const orderId = useOrderStore((state) => state.orderId); // Get the order ID from the Zustand store

  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [order, setOrder] = useState(null);
  const [eatery, setEatery] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Ensure orderId is valid before making the API request
        if (!orderId) {
          setError("Order ID is missing.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${orderRoute}/${orderId}`);
        setOrder(response.data);

        const eateryResponse = await axios.get(`${eateryRoute}/${response.data.eatery}`);
        setEatery(eateryResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch order data.");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const getStatusClass = (status) => {
    if (!order) return "";  // Avoid errors if order is not fetched yet
    if (order.status === status) {
      return 'highlighted'; // Add the 'highlighted' class if the order status matches
    }
    return ''; // Otherwise, return an empty string
  };

  return (
    <div className={`order-status-container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Add the Navbar component here */}
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} showNavbar={showNavbar} />

      <div className="order-status-container">
        {/* Header */}
        <header className="order-header">
          <h1 className="header-title">Order Status</h1>
        </header>

        {/* Main Content */}
        <main className="order-main">
          <div className="order-card">
            {/* Order Details */}
            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">{order._id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Restaurant:</span>
                <span className="detail-value">{eatery.name}</span>
              </div>
            </div>
            {/* Divider */}
            <div className="order-divider"></div>

            {/* Status Tracker */}
            <div className="status-tracker">
              {/* Pending */}
              <div className={`status-item ${getStatusClass("pending")}`}>
                <div className="status-indicator"></div>
                <span className="status-label">Pending</span>
                <Clock className="status-icon" />
              </div>

              {/* Preparing */}
              <div className={`status-item ${getStatusClass("preparing")}`}>
                <div className="status-indicator"></div>
                <span className="status-label">Preparing</span>
                <ChefHat className="status-icon" />
              </div>

              {/* Out for Delivery */}
              <div className={`status-item ${getStatusClass("out_for_delivery")}`}>
                <div className="status-indicator"></div>
                <span className="status-label">Out for Delivery</span>
                <Truck className="status-icon" />
              </div>

              {/* Delivered */}
              <div className={`status-item ${getStatusClass("delivered")}`}>
                <div className="status-indicator"></div>
                <span className="status-label">Delivered</span>
                <CheckCircle className="status-icon" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


export default OrderStatus;
