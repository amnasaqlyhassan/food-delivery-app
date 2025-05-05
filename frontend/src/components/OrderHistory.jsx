import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import '../styles/history_style.css';
import { Link } from 'react-router-dom';
import axios from "axios";
import useAuthStore from './authStore';
import { orderHistoryRoute } from '../constant';

const OrderHistory = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useAuthStore();

    // Toggle Dark Mode and apply/remove class to body
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const id = user._id;

    // Fetch orders on mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.post(
                    orderHistoryRoute,
                    { userId: id }
                );
                setOrders(res.data);
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Failed to load order history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    if (isLoading) return <div className={`loading ${darkMode ? 'dark-mode' : ''}`}>Loading your orders…</div>;
    if (error) return <div className={`error ${darkMode ? 'dark-mode' : ''}`}>{error}</div>;

    return (
        <div className={darkMode ? 'dark-mode' : ''}>
            <Navbar isDarkMode={darkMode} toggleTheme={toggleDarkMode} showNavbar={true} />
            <div className={`hero-header-his ${darkMode ? 'dark-mode' : ''}`}>
                <h1>Order History</h1>
            </div>
            <div className="container-his">
                <div className="order-list-his">
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <div key={order._id} className={`order-item-his ${darkMode ? 'dark-mode' : ''}`}>
                                <div className="order-id-his">
                                    <h3>Order ID: {order._id}</h3>
                                </div>
                                <div className="order-details-his">
                                    <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {order.status}</p>
                                    <div className="order-items-his">
                                        <ul>
                                            {order.orderItems.map((orderItem, index) => (
                                                <li key={index}>
                                                    {orderItem.item.name} (x{orderItem.quantity}) - Rs.{orderItem.subtotalPrice}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p><strong>Total Price:</strong> Rs.{order.totalPrice}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={`work ${darkMode ? 'dark-mode' : ''}`}>You have no order history.</p>  
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
