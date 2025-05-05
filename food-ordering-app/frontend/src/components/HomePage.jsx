"use client"

import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import { Plus, Minus } from 'lucide-react'
import axios from "axios"
import { Link } from "react-router-dom"
import useAuthStore from "./authStore"
import useCartStore from "./cartStore"
import "../styles/home-page.css"
import { addCartRoute, eateryRoute, recommendRoute, removeCartRoute } from "../constant"

const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [favorites, setFavorites] = useState([])
  const [restaurants, setRestaurants] = useState([])

  // Image mappings for food items
  const pakistaniImages = {
    "SPICY BIRYANI": "/assets/biryani1.jpg",
    "Chicken Biryani": "/assets/biryani2.jpg",
  }

  const chineseImages = {
    "Chicken Manchurian": "/assets/chinese1.jpg",
  }

  const italianImages = {
    "Margherita Pizza": "/assets/italian1.jpg"
  }

  const fastFoodImages = {
    "Beef Burger": "/assets/fast food1.jpg",
  }

  const healthyImages = {
    "Avocado Salad": "/assets/healthy1.jpg",
    "wrap": "/assets/healthy2.jpg",
    "wrap 2": "/assets/healthy2.jpg",
  }

  const dessertImages = {
    "Chocolate Lava Cake": "/assets/dessert1.jpg"
  }

  // Combine all image mappings
  const allFoodImages = {
    ...pakistaniImages,
    ...chineseImages,
    ...italianImages,
    ...fastFoodImages,
    ...healthyImages,
    ...dessertImages
  }

  // Function to get the appropriate image for a food item
  const getFoodImage = (itemName) => {
    // Check if we have a specific image for this item
    const exactMatch = allFoodImages[itemName]
    if (exactMatch) return exactMatch

    // Try case-insensitive match
    const lowerCaseName = itemName.toLowerCase()
    for (const [key, value] of Object.entries(allFoodImages)) {
      if (key.toLowerCase() === lowerCaseName) {
        return value
      }
    }

    // Try partial match (if item name contains a key)
    for (const [key, value] of Object.entries(allFoodImages)) {
      if (itemName.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(itemName.toLowerCase())) {
        return value
      }
    }

    // Return placeholder if no match found
    return "/placeholder.svg"
  }

  const { user, token } = useAuthStore()
  const { cartItems, addItemToCart, removeItemFromCart } = useCartStore()
  const id = user._id

  const bufferToBase64 = (buffer) => {
    if (!buffer?.data) return ""
    const base64String = btoa(new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), ""))
    return `data:image/jpeg;base64,${base64String}`
  }

  useEffect(() => {
    const fetchEateries = async () => {
      try {
        const response = await axios.get(eateryRoute)
        const eateriesWithImages = response.data.map((eatery) => ({
          ...eatery,
          imageSrc: bufferToBase64(eatery.image?.data),
        }))
        setRestaurants(eateriesWithImages)
      } catch (error) {
        setError("Failed to load eateries. Please try again.")
        console.error("Eateries Error:", error.message)
      }
    }

    fetchEateries()
  }, [])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${recommendRoute}/${id}`)
        const recommendations = response.data.recommendations || []
        setFavorites(recommendations)
      } catch (error) {
        console.error("Failed to load recommendations:", error)
      }
    }

    fetchRecommendations()
  }, [id])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle("home-light-theme")
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset
      setShowNavbar(currentScrollTop <= lastScrollTop)
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollTop])

  useEffect(() => {
    document.body.classList.toggle("home-light-theme", isDarkMode)
  }, [isDarkMode])

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((i) => i._id === itemId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = async (item) => {
    const { cartItems } = useCartStore.getState()

    if (!item.eatery || !item.eatery.eateryId) {
      setError("This item is missing eatery information and cannot be added to the cart.")
      return
    }

    const isSameEatery = cartItems.every(
      (cartItem) => cartItem.eatery && cartItem.eatery.eateryId === item.eatery.eateryId,
    )

    if (cartItems.length > 0 && !isSameEatery) {
      setError("You can only add items from one eatery at a time.")
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
      setError("Failed to add item to cart. Please try again.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleRemoveFromCart = async (item) => {
    try {
      await axios.post(removeCartRoute, {
        userId: id,
        itemId: item._id,
        quantity: 1,
      })
      removeItemFromCart(item._id)
    } catch (error) {
      console.error("Error removing from cart:", error)
      setError("Failed to remove item from cart. Please try again.")
      setTimeout(() => setError(""), 3000)
    }
  }

  return (
    <div className={`home-application-wrapper ${isDarkMode ? "home-light-theme" : ""}`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} showNavbar={showNavbar} />
      <div className="home-content-container">
        {/* Hero Section */}
        <div className="home-banner-section">
          <div className="home-banner-content">
            <span className="home-welcome-text">Welcome, {user.name}!</span>
            <h1 className="home-banner-heading">Feast Your Senses, Fast and Fresh</h1>
            <p className="home-banner-subheading">Discover delicious meals from top restaurants near you</p>
          </div>
          <div className="home-banner-image">
            <img src="./assets/hero-section-food.jpg" alt="Delicious food" />
          </div>
        </div>

        {error && <div className="home-error-message">{error}</div>}
        {success && <div className="home-success-message">{success}</div>}

        {/* Favorites Section */}
        <section className="home-content-section">
          <div className="home-section-header">
            <h2 className="home-content-heading">Your Favorites</h2>
            <div className="home-section-divider"></div>
          </div>
          <div className="home-featured-container">
            {favorites.length > 0 ? (
              favorites.map((item) => {
                const eateryId = item.eatery?.eateryId
                const matchedEatery = restaurants.find((r) => r._id === eateryId)

                return (
                  <div className="home-featured-item" key={item._id}>
                    <div className="home-featured-content">
                      <h3 className="home-featured-title">{item.name}</h3>
                      {matchedEatery && (
                        <div className="eatery-info">
                          <span className="eatery-name">{matchedEatery.name}</span>
                        </div>
                      )}
                      <p className="home-featured-description">{item.description}</p>
                      <div className="home-featured-price">
                        <span className="price-tag">Rs. {item.price}</span>
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleRemoveFromCart(item)}
                            className="subtract-button"
                            aria-label="Remove from cart"
                          >
                            <Minus size={20} strokeWidth={3} />
                            <span className="sr-only">-</span>
                          </button>
                          <span className="quantity">{getItemQuantity(item._id)}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="home-create-button"
                            aria-label="Add to cart"
                          >
                            <Plus size={20} strokeWidth={3} />
                            <span className="sr-only">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="home-featured-thumbnail">
                      <img 
                        src={getFoodImage(item.name) || item.image || "/placeholder.svg"} 
                        alt={item.name} 
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="home-loading">
                <div className="home-loading-spinner"></div>
                <p>Loading your favorites...</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="home-content-section">
          <div className="home-section-header">
            <h2 className="home-content-heading">Categories</h2>
            <div className="home-section-divider"></div>
          </div>
          <div className="home-groups-container">
            {[
              { id: 1, name: "Pakistani", image: "./assets/pakistani.jpg" },
              { id: 2, name: "Chinese", image: "./assets/chinese.jpg" },
              { id: 3, name: "Italian", image: "./assets/italian.jpg" },
              { id: 4, name: "Fast Food", image: "./assets/fast food.jpg" },
              { id: 5, name: "Healthy", image: "./assets/healthy.jpg" },
              { id: 6, name: "Dessert", image: "./assets/dessert.jpg" },
            ].map((category) => (
              <Link to={`/categories/${category.name}`} className="home-group-item" key={category.id}>
                <div className="home-group-card">
                  <div className="home-group-image">
                    <img src={category.image || "/placeholder.svg"} alt={category.name} />
                  </div>
                  <div className="home-group-name">{category.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Restaurants Section */}
        <section className="home-content-section">
          <div className="home-section-header">
            <h2 className="home-content-heading">All Restaurants</h2>
            <div className="home-section-divider"></div>
          </div>
          <div className="home-vendor-grid">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <Link
                  to={`/eatery/${restaurant._id}`}
                  key={restaurant._id}
                  className="home-vendor-card"
                  style={{ backgroundColor: restaurant.color || "#f8f9fa" }}
                >
                  <div className="home-vendor-logo">
                    <img src={restaurant.logoSrc || restaurant.imageSrc || "/placeholder.svg"} alt={restaurant.name} />
                  </div>
                  <span className="home-vendor-name">{restaurant.name}</span>
                </Link>
              ))
            ) : (
              <div className="home-loading">
                <div className="home-loading-spinner"></div>
                <p>Loading restaurants...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
