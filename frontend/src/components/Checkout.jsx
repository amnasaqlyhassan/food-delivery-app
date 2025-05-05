import React, { useState, useEffect } from "react";
import "../styles/Checkout_style.css";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { FiMinus, FiPlus } from "react-icons/fi";
import Navbar from "../components/Navbar";
import foodPic from '../styles/food_pic.jpg';
import useCartStore from './cartStore';
import axios from 'axios';  // Import axios for HTTP requests
import useAuthStore from './authStore';
import { useNavigate } from 'react-router-dom';
import useOrderStore from './orderStore'; // Import the Zustand store
import { addCartRoute, checkoutRoute, removeCartRoute } from "../constant";

const Cart = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState('delivery');
  const [setLocation, setShow] = useState(false);
  const [notification, setNotification] = useState(null);  // State for notification message
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const setOrderId = useOrderStore((state) => state.setOrderId);
  const { cartItems, addItemToCart, removeItemFromCart } = useCartStore();
  const id = user._id;

  const toggleMode = () => {
    setDarkMode(!darkMode);
  };
  
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null); // Hide the notification after 3 seconds
    }, 3000);
  };

  const handleAddToCart = async (item) => {
    try {
      const response = await axios.post(addCartRoute, {
        userId: id,
        itemId: item._id,
        quantity: 1,
      });
      if (response.status === 200) {
        addItemToCart(item); // Update Zustand store
      } else {
        console.error("Failed to add item to the cart");
      }
    } catch (err) {
      console.error("Error adding item to the cart:", err);
    }
  };
  
  const handleRemoveFromCart = async (itemId) => {
    try {
      const response = await axios.post(removeCartRoute, {
        userId: id,
        itemId: itemId,
        quantity: 1,
      });
      if (response.status === 200) {
        removeItemFromCart(itemId); // Update Zustand store
      } else {
        console.error("Failed to remove item from the cart");
      }
    } catch (err) {
      console.error("Error removing item from the cart:", err);
    }
  };
  
  const handleSelection = (option) => {
    setSelectedOption(option);
    if (option === 'delivery') {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showNotification("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      const response = await axios.post(checkoutRoute, { userId: id });

      if (response.status === 201) {
        useCartStore.getState().clearCart();  // Clear the cart after checkout
        const orderId = response.data._id;
        setOrderId(orderId);
        
        showNotification('Checkout successful! Your order is placed.');
        
        navigate(`/order-status/${orderId}`);  // Redirect with the order ID
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification('An error occurred during checkout. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedOption === 'delivery') {
      setShow(true);
    } else {
      setShow(false);
    }

    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [selectedOption, darkMode]);

  const deliveryFee = selectedOption === 'delivery' ? 2.50 : 0;

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Navbar isDarkMode={darkMode} toggleTheme={toggleMode} showNavbar={true} className="nav" />

      {/* Cart header */}
      <div className="cart-header">
        <div>
          <h1>Your Cart</h1>
          <p>Pickup or Delivery - We can do both!</p>
        </div>
        <div className="cart-options">
          <button
            className={`cart-btn ${selectedOption === 'delivery' ? 'selected' : ''}`}
            onClick={() => handleSelection('delivery')}
          >
            Delivery
          </button>
          <button
            className={`cart-btn ${selectedOption === 'pickup' ? 'selected' : ''}`}
            onClick={() => handleSelection('pickup')}
          >
            Pickup
          </button>
        </div>
        {setLocation && (
          <div className="location-dropdown">
            <label htmlFor="location">Choose Delivery Location:</label>
            <select id="location" name="location">
              <option value="m1">M1</option>
              <option value="m2">M2</option>
              <option value="m3">M3</option>
              <option value="m4">M4</option>
              <option value="m5">M5</option>
              <option value="m6">M6</option>
              <option value="f1">F1</option>
              <option value="f2">F2</option>
              <option value="f3">F3</option>
              <option value="f4">F4</option>
              <option value="f5">F5</option>
              <option value="f6">F6</option>
            </select>
          </div>
        )}
      </div>

      <div className="cart-container">
        <div className="cart-body">
          {/* List the items in the cart */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item._id}>
                <img src={foodPic || "/placeholder.svg"} alt={item.name} className="item-img" />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Price: Rs.{item.price}</p>
                </div>
                <div className="item-controls">
                  <button
                    className="item-btn"
                    onClick={() => handleRemoveFromCart(item._id)}
                    disabled={item.quantity < 0}
                  >
                    <FiMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="item-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="header">Place your order!</div>
            <div className="summary-details">
              {cartItems.map(item => (
                <p key={item._id}>
                  {item.quantity}x {item.name} <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                </p>
              ))}
            </div>
            <hr />
            <div className="summary-footer">
              <p>Sub Total: <span>Rs.{cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span></p>
              <p>Delivery Fee: <span>Rs.{deliveryFee.toFixed(2)}</span></p>
              <h4>Total: <span>Rs.{(cartItems.reduce((total, item) => total + item.price * item.quantity, 0) - 2.5 + deliveryFee).toFixed(2)}</span></h4>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>Checkout!</button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Cart;
