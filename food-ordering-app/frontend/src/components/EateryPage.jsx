"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import useAuthStore from "./authStore"
import useCartStore from "./cartStore"
import ReviewModal from "../components/ReviewModal"
import { Plus, Minus, Star, Clock, Bike, Search, Filter } from "lucide-react"
import axios from "axios"
import "../styles/eatery-page-style.css"
import { addCartRoute, eateryRoute, getEateryMenuRoute, getEateryReviewsRoute, removeCartRoute } from "../constant"

const EateryPage = () => {
  // Image mappings for food items
  const pakistaniImages = {
    "Spicy Chicken Biryani": "/assets/biryani1.jpg",
    "Chicken Biryani": "/assets/biryani2.jpg",
  }

  const chineseImages = {
    "Chicken Manchurian": "/assets/chinese1.jpg",
  }

  const italianImages = {
    "Margherita Pizza": "/assets/italian1.jpg",
  }

  const fastFoodImages = {
    "Beef Burger": "/assets/fast food1.jpg",
  }

  const healthyImages = {
    "Avocado Salad": "/assets/healthy1.jpg",
    wrap: "/assets/healthy2.jpg",
    "wrap 2": "/assets/healthy2.jpg",
  }

  const dessertImages = {
    "Chocolate Lava Cake": "/assets/dessert1.jpg",
  }

  // Combine all image mappings
  const allFoodImages = {
    ...pakistaniImages,
    ...chineseImages,
    ...italianImages,
    ...fastFoodImages,
    ...healthyImages,
    ...dessertImages,
  }

  const { eateryId } = useParams()
  const [menuItems, setMenuItems] = useState([])
  const [groupedItems, setGroupedItems] = useState({})
  const [filteredGroupedItems, setFilteredGroupedItems] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [eatery, setEatery] = useState({})
  const [activeFilters, setActiveFilters] = useState([])
  const [isLightMode, setIsLightMode] = useState(true)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const { user } = useAuthStore()
  const { cartItems, addItemToCart, removeItemFromCart } = useCartStore()
  const id = user?._id

  const [reviews, setReviews] = useState([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const navigate = useNavigate()

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev)
    document.body.classList.toggle("eatery-light-theme")
  }

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("eatery-light-theme")
      document.body.classList.remove("eatery-dark-theme")
    } else {
      document.body.classList.add("eatery-dark-theme")
      document.body.classList.remove("eatery-light-theme")
    }
  }, [isLightMode])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset
      setShowNavbar(currentScrollTop <= lastScrollTop)
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollTop])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${getEateryReviewsRoute}/${eateryId}`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      console.error("Error fetching reviews:", err.message)
    }
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${getEateryMenuRoute}/${eateryId}`)
        if (!response.ok) throw new Error("Failed to fetch menu")
        const data = await response.json()
        const grouped = groupMenuItems(data)
        setMenuItems(data)
        setGroupedItems(grouped)
        setFilteredGroupedItems(grouped)
      } catch (err) {
        console.error("Error fetching menu:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchEateryDetails = async () => {
      try {
        const response = await fetch(`${eateryRoute}/${eateryId}`)
        if (!response.ok) throw new Error("Failed to fetch eatery details")
        const data = await response.json()
        setEatery(data)
      } catch (err) {
        console.error("Error fetching eatery details:", err)
        setError(err.message)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${getEateryReviewsRoute}/${eateryId}`)
        if (!response.ok) throw new Error("Failed to fetch reviews")
        const data = await response.json()
        setReviews(data)
      } catch (err) {
        console.error("Error fetching reviews:", err.message)
      }
    }

    fetchMenu()
    fetchEateryDetails()
    fetchReviews()
  }, [eateryId])

  const groupMenuItems = (items) => {
    return items.reduce((acc, item) => {
      acc[item.cuisineType] = acc[item.cuisineType] || []
      acc[item.cuisineType].push(item)
      return acc
    }, {})
  }

  const applyFilters = () => {
    let filteredItems = [...menuItems]
    if (activeFilters.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        activeFilters.every((filter) => item.dietaryPreferences?.includes(filter)),
      )
    }
    if (searchQuery) {
      filteredItems = filteredItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFilteredGroupedItems(groupMenuItems(filteredItems))
  }

  const toggleFilter = (filter) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, activeFilters, menuItems])

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i._id === itemId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = async (item) => {
    const isSameEatery = cartItems.every((cartItem) => cartItem.eatery?.eateryId === item.eatery?.eateryId)
    if (cartItems.length > 0 && !isSameEatery) {
      setError("You can only add items from one eatery at a time.")
      setTimeout(() => setError(null), 3000)
      return
    }
    try {
      await axios.post(addCartRoute, {
        userId: id,
        itemId: item._id,
        quantity: 1,
      })
      addItemToCart(item)
      setSuccess(`Added ${item.name} to your cart`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      setError("Failed to add item to cart")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleRemoveFromCart = async (item) => {
    try {
      const response = await axios.post(removeCartRoute, {
        userId: id,
        itemId: item._id,
        quantity: 1,
      })
      if (response.status === 200) {
        removeItemFromCart(item._id)
      }
    } catch (err) {
      console.error("Error removing item from the cart:", err)
      setError("Failed to remove item from cart")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleReviewClick = () => {
    navigate(`/reviews/${eateryId}`)
  }

  const handleLeaveReviewClick = () => {
    navigate(`/leave-review/${eateryId}`)
  }

  // Get food images based on cuisine type
  const getFoodImage = (item) => {
    if (item.imageUrl) return item.imageUrl

    const name = item.name.toLowerCase()

    const cuisineMap = {
      Pakistani: pakistaniImages,
      Chinese: chineseImages,
      Italian: italianImages,
      "Fast Food": fastFoodImages,
      Healthy: healthyImages,
      Dessert: dessertImages,
    }

    const cuisineImages = cuisineMap[item.cuisineType]
    if (cuisineImages) {
      // Case-insensitive search
      const foundKey = Object.keys(cuisineImages).find((key) => key.toLowerCase() === name)
      if (foundKey) {
        return cuisineImages[foundKey]
      }
    }

    return "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="eatery-loading">
        <div className="eatery-loading-spinner"></div>
        <p>Loading menu...</p>
      </div>
    )
  }

  return (
    <>
      <Navbar isDarkMode={!isLightMode} toggleTheme={toggleTheme} showNavbar={showNavbar} />
      <div className="eatery-page-wrapper">
        <div className="eatery-content-container">
          {/* Hero Section */}
          <div className="eatery-banner-section">
            <div className="eatery-banner-content">
              <h1 className="eatery-banner-heading">{eatery.name}</h1>
              <div className="eatery-banner-details">
                <div className="eatery-detail">
                  <Bike size={18} />
                  <span>Delivery in 20-25 minutes</span>
                </div>
                <div className="eatery-detail">
                  <Clock size={18} />
                  <span>{eatery.openingHours || "Open: 9:00 AM - 10:00 PM"}</span>
                </div>
              </div>
            </div>
            <div className="eatery-banner-image">
              <img src={eatery.imageUrl || "/assets/eatery.jpg"} alt={eatery.name} />
            </div>
          </div>

          {error && <div className="eatery-error-message">{error}</div>}
          {success && <div className="eatery-success-message">{success}</div>}

        {/* Reviews Section */}
        <section className="eatery-reviews-section">
          <div className="eatery-section-header">
            <h2 className="eatery-content-heading">Customer Reviews</h2>
            <div className="eatery-section-divider"></div>
          </div>

          <div className="eatery-reviews-container">
            {/* Buttons Only */}
            <div className="eatery-review-actions">
              <button className="eatery-review-btn" onClick={handleReviewClick}>
                Read All Reviews
              </button>
              <button className="eatery-review-btn eatery-primary-btn" onClick={handleLeaveReviewClick}>
                Leave a Review
              </button>
            </div>
          </div>
        </section>

          {/* Search and Filter Section */}
          <div className="eatery-search-filter-container">
            <div className="eatery-search-box">
              <Search size={18} />
              <input
                type="text"
                className="eatery-menu-search"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="eatery-filter-buttons">
              <div className="eatery-filter-label">
                <Filter size={16} />
                <span>Dietary Preferences:</span>
              </div>
              {["Vegan", "Vegetarian", "Gluten-Free", "Keto"].map((filter) => (
                <button
                  key={filter}
                  className={`eatery-filter-btn ${activeFilters.includes(filter) ? "active" : ""}`}
                  onClick={() => toggleFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Categories */}
          {Object.keys(filteredGroupedItems).length > 0 ? (
            Object.keys(filteredGroupedItems).map((category) => (
              <section key={category} className="eatery-menu-category">
                <div className="eatery-section-header">
                  <h2 className="eatery-content-heading">{category}</h2>
                  <div className="eatery-section-divider"></div>
                </div>
                <div className="eatery-menu-grid">
                  {filteredGroupedItems[category].length > 0 ? (
                    filteredGroupedItems[category].map((item) => (
                      <div key={item._id} className="eatery-menu-item">
                        <div className="eatery-menu-item-image">
                          <img
                            src={getFoodImage(item) || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-xl"
                          />
                        </div>
                        <div className="eatery-menu-item-content">
                          <h3 className="eatery-menu-item-name">{item.name}</h3>
                          <p className="eatery-menu-item-description">{item.description}</p>
                          <div className="eatery-menu-item-footer">
                            <span className="eatery-menu-item-price">Rs. {item.price}</span>
                            <div className="eatery-quantity-controls">
                              <button
                                onClick={() => handleRemoveFromCart(item)}
                                className="eatery-subtract-button"
                                aria-label="Remove from cart"
                                disabled={getItemQuantity(item._id) === 0}
                              >
                                <Minus size={16} strokeWidth={3} />
                                <span className="sr-only">-</span>
                              </button>
                              <span className="eatery-quantity">{getItemQuantity(item._id)}</span>
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="eatery-add-button"
                                aria-label="Add to cart"
                              >
                                <Plus size={16} strokeWidth={3} />
                                <span className="sr-only">+</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="eatery-no-items">No items found in this category</p>
                  )}
                </div>
              </section>
            ))
          ) : (
            <div className="eatery-no-results">
              <p>No menu items match your search or filters.</p>
              <button
                className="eatery-reset-btn"
                onClick={() => {
                  setSearchQuery("")
                  setActiveFilters([])
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          <ReviewModal
            show={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            eateryId={eateryId}
            restaurantName={eatery.name}
          />
        </div>
      </div>
    </>
  )
}

export default EateryPage
