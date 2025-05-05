"use client"

import { useState, useEffect } from "react"
import EateryNavbar from "./Eatery-Navbar"
import useAuthStore from "./authStore"
import axios from "axios"
import { Link } from "react-router-dom"
import { eateryRoute, getEateryOrdersRoute, getEateryRoute } from "../constant"

export default function EateryHomepage() {
  const { user } = useAuthStore()

  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [eateryId, setEateryId] = useState(null)
  const [reviewsData, setReviewsData] = useState([])
  const [orders, setOrders] = useState([])
  const [orderPage, setOrderPage] = useState(1)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset
      setShowNavbar(currentScrollTop <= lastScrollTop || currentScrollTop < 50)
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollTop])

  useEffect(() => {
    if (!user?._id) return

    const fetchEateryId = async () => {
      try {
        const response = await axios.get(`${getEateryRoute}/${user._id}`)
        const fetchedId = response.data.eateryId
        setEateryId(fetchedId)
        console.log("Eatery ID:", fetchedId)
      } catch (err) {
        console.error("Error fetching eatery ID:", err)
        setError("Failed to load eatery data.")
      }
    }

    fetchEateryId()
  }, [user])

  useEffect(() => {
    if (!eateryId) return

    const fetchReviews = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${eateryRoute}/${eateryId}/reviews`)
        setReviewsData(response.data.reviews || [])
      } catch (err) {
        console.error("Error fetching reviews:", err)
        setError("Error fetching reviews")
      } finally {
        setLoading(false)
      }
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${getEateryOrdersRoute}/${eateryId}`)
        setOrders(response.data.orders || [])
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Error fetching orders")
      }
    }

    fetchReviews()
    fetchOrders()
  }, [eateryId])

  const ordersPerPage = 10
  const totalPages = Math.ceil(orders.length / ordersPerPage)
  const currentOrders = orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage)

  const handlePrevPage = () => {
    if (orderPage > 1) setOrderPage(orderPage - 1)
  }

  const handleNextPage = () => {
    if (orderPage < totalPages) setOrderPage(orderPage + 1)
  }

  const reviewsPerPage = 3
  const maxReviewIndex = Math.ceil(reviewsData.length / reviewsPerPage) - 1
  const handlePrevReview = () => setReviewIndex((prev) => (prev > 0 ? prev - 1 : maxReviewIndex))
  const handleNextReview = () => setReviewIndex((prev) => (prev < maxReviewIndex ? prev + 1 : 0))
  const visibleReviews = Array.isArray(reviewsData)
    ? reviewsData.slice(reviewIndex * reviewsPerPage, reviewIndex * reviewsPerPage + reviewsPerPage)
    : []

  return (
    <div className="home-application-wrapper">
      <EateryNavbar showNavbar={showNavbar} />

      <div className="home-content-container">
        <div className="home-banner-section">
          <div className="home-banner-content">
            <span className="home-welcome-text">Welcome, {user?.name || "Guest"}!</span>
            <h1 className="home-banner-heading">Feast Your Senses, Fast and Fresh</h1>
            <p className="home-banner-subheading">
              Discover delicious meals from top restaurants near you
            </p>
          </div>
          <div className="home-banner-image">
            <img src="./assets/hero-section-food.jpg" alt="Delicious food" />
          </div>
        </div>

        {error && <div className="home-error-message">{error}</div>}
        {success && <div className="home-success-message">{success}</div>}

        {/* Orders Section */}
        <section className="home-content-section">
          <div className="home-section-header">
            <h2 className="home-content-heading">All Orders</h2>
            <div className="home-section-divider"></div>
          </div>
          <div className="home-featured-container">
            {currentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/order-status-owner/${order._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="home-featured-item">
                  <div className="home-featured-content">
                    <h3 className="home-featured-title">Order by {order.user?.name || "Unknown"}</h3>
                    <p className="home-featured-description">
                      <strong>Order ID:</strong> {order._id}<br />
                      <strong>Status:</strong> {order.status || "Pending"}<br />
                      <strong>Total Items:</strong> {order.orderItems?.length || 0}<br />
                      <strong>Placed on:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="home-featured-price">
                      <span className="price-tag">Total: GBP {order.totalPrice?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                  <div className="home-order-items">
                    {order.orderItems.map((item) => (
                      <div key={item._id} className="home-order-item">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="pagination-controls">
            <button onClick={handlePrevPage} disabled={orderPage === 1}>Prev</button>
            <span>Page {orderPage} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={orderPage === totalPages}>Next</button>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="home-content-section home-reviews-section">
          <div className="home-reviews-header">
            <div className="home-section-header">
              <h2 className="home-content-heading home-reviews-title">Customer Reviews</h2>
              <div className="home-section-divider"></div>
            </div>
            <div className="home-reviews-navigation">
              <button className="home-nav-button" onClick={handlePrevReview}>←</button>
              <button className="home-nav-button" onClick={handleNextReview}>→</button>
            </div>
          </div>
          <div className="home-reviews-grid">
            {visibleReviews.map((review, idx) => (
              <div key={idx} className="home-review-card">
                <div className="home-review-header">
                  <div className="home-reviewer-info">
                    <p className="home-reviewer-name">{review.userName}</p>
                  </div>
                  <div className="home-review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`home-star ${i < review.rating ? "filled" : "empty"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="home-review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
