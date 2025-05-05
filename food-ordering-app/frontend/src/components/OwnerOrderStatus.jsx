import React, { useState, useEffect } from "react";
import EateryNavbar from "../components/Eatery-Navbar";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, Truck, CheckCircle, Loader2 } from "lucide-react";
import "../styles/order-status-page.css"; 
import useAuthStore from './authStore'; 
import { eateryRoute, orderRoute } from "../constant";

function OwnerOrderStatus() {
  const { orderId } = useParams(); 
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [eatery, setEatery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState(null);

  const id = user._id; 

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const statusOptions = [
    { label: "Pending", value: "pending", icon: <Clock className="status-icon" /> },
    { label: "Preparing", value: "preparing", icon: <ChefHat className="status-icon" /> },
    { label: "Out for Delivery", value: "out_for_delivery", icon: <Truck className="status-icon" /> },
    { label: "Delivered", value: "delivered", icon: <CheckCircle className="status-icon" /> },
  ];

  const fetchOrderData = async () => {
    try {
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

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    if (updatingStatus || order?.status === newStatus) return;

    setSelectedStatus(newStatus);       
    setUpdatingStatus(true);
    try {
      const { data } = await axios.put(
        `${orderRoute}/${orderId}/eatery/status`,
        { status: newStatus, userId: id, role: "owner" }
      );
      setOrder(data.order);

      if (newStatus === "delivered") {
        alert("✅ Order has been successfully delivered.");

        // Delete the order
        // await axios.delete(`http://localhost:5001/api/orders/${orderId}`);

        // Optional small delay for smoother UX
        setTimeout(() => {
          navigate("/eatery-homepage");
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setUpdatingStatus(false);
      setSelectedStatus(null);            
    }
  };

  const getStatusClass = (status) => (order?.status === status ? "highlighted" : "");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={`order-status-container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <EateryNavbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} showNavbar={showNavbar} />

      <div className="order-status-container">
        <header className="order-header">
          <h1 className="header-title">Update Order Status</h1>
        </header>

        <main className="order-main">
          <div className="order-card">
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
                <span className="detail-value">{eatery?.name}</span>
              </div>
            </div>

            <div className="order-divider"></div>
            <div className="status-tracker">
              {statusOptions.map(({ label, value, icon }) => (
                <div key={value} className={`status-item ${getStatusClass(value)}`}>
                  {/* Status circle */}
                  <div
                    className={`status-indicator ${order?.status === value ? "active" : ""}`}
                    onClick={() => !updatingStatus && handleStatusUpdate(value)}
                    style={{ cursor: updatingStatus ? "not-allowed" : "pointer" }}
                  >
                    {updatingStatus && selectedStatus === value && (
                      <Loader2 className="status-icon spin" />
                    )}
                  </div>

                  {/* Label below circle */}
                  <span className="status-label">{label}</span>

                  {/* Icon below label */}
                  <div className="status-icon-wrapper">
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OwnerOrderStatus;
