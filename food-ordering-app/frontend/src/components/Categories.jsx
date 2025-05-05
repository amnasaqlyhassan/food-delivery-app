"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import "../styles/categories.css";
import Navbar from "./Navbar";
import axios from "axios";
import useAuthStore from "./authStore";
import useCartStore from "./cartStore";
import { addCartRoute, filterMenu, removeCartRoute } from "../constant";

const pakistaniImages = {
  "SPICY BIRYANI": "/assets/biryani1.jpg",
  "Chicken Biryani": "/assets/biryani2.jpg",
};

const chineseImages = {
  "Chicken Manchurian": "/assets/chinese1.jpg",
};

const italianImages = {
  "Margherita Pizza": "/assets/italian1.jpg"
};

const fastFoodImages = {
  "Beef Burger": "/assets/fast food1.jpg",
};

const healthyImages = {
  "Avocado Salad": "/assets/healthy1.jpg",
  "wrap": "/assets/healthy2.jpg",
};

const dessertImages = {
  "Chocolate Lava Cake": "/assets/dessert1.jpg"
};

const cuisineImageMap = {
  Pakistani: pakistaniImages,
  Chinese: chineseImages,
  Italian: italianImages,
  "Fast Food": fastFoodImages,
  Healthy: healthyImages,
  Dessert: dessertImages,
};

export default function CategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { cartItems, addItemToCart, removeItemFromCart } = useCartStore();

  const [darkMode, setDarkMode] = useState(false);
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState([]);
  const [selectedAllergenFilters, setSelectedAllergenFilters] = useState([]);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user || !token) navigate("/login");
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        const API_URL = filterMenu;
        const queryParams = { cuisineType: categoryName };
        const response = await axios.get(API_URL, { params: queryParams });

        setItems(response.data);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching items:", err);
        setError("Failed to fetch items for this category.");
        setItems([]);
      }
    };

    fetchCategoryItems();
  }, [categoryName]);

  const handleAddToCart = async (item) => {
    const { cartItems } = useCartStore.getState();
    const isSameEatery = cartItems.every(
      (cartItem) => cartItem.eatery.eateryId === item.eatery.eateryId
    );

    if (cartItems.length > 0 && !isSameEatery) {
      setError("You can only add items from one eatery at a time.");
      return;
    }

    try {
      await axios.post(addCartRoute, {
        userId: user?._id,
        itemId: item._id,
        quantity: 1,
      });

      addItemToCart(item);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const response = await axios.post(removeCartRoute, {
        userId: user?._id,
        itemId: itemId,
        quantity: 1,
      });

      if (response.status === 200) {
        removeItemFromCart(itemId);
      } else {
        console.error("Failed to remove item from the cart");
      }
    } catch (err) {
      console.error("Error removing item from the cart:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setShowNavbar(currentScrollPos <= lastScrollTop);
      setLastScrollTop(currentScrollPos <= 0 ? 0 : currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    document.body.classList.toggle("light-mode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleDietaryFilter = (filter) => {
    setSelectedDietaryFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const toggleAllergenFilter = (filter) => {
    setSelectedAllergenFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find((i) => i._id === itemId || i.id === itemId);
    return cartItem?.quantity || 0;
  };

  const filteredItems = items.filter((item) => {
    const itemDietary = item.dietaryPreferences?.map((dp) => dp.toLowerCase()) || [];
    const itemAllergens = item.allergens?.map((al) => al.toLowerCase()) || [];

    const matchesAllDietary =
      selectedDietaryFilters.length === 0 ||
      selectedDietaryFilters.every((filter) => itemDietary.includes(filter));

    const excludesAllAllergens =
      selectedAllergenFilters.length === 0 ||
      selectedAllergenFilters.every((filter) => !itemAllergens.includes(filter));

    return matchesAllDietary && excludesAllAllergens;
  });

  return (
    <div className={`app-container ${darkMode ? "light-mode" : ""}`}>
      <Navbar isDarkMode={darkMode} toggleTheme={toggleDarkMode} showNavbar={showNavbar} />

      <div className="main-container">
        <div className={`categories-detail ${darkMode ? "dark-mode" : "light-mode"}`}>
          <main className="categories-content">
            <div className="categories-hero-section">
              <div className="categories-hero-content">
                <h1 className="categories-hero-title">{categoryName}</h1>
              </div>
              <div className="categories-hero-image">
                <img
                  src={`/assets/${categoryName.toLowerCase()}.jpg`}
                  alt={`${categoryName} banner`}
                  className="categories-banner-image"
                  style={{ width: "300px", height: "150px" }}
                />
              </div>
            </div>

            <div className="categories-filters">
              <h3 className="filter-heading">Dietary Preferences</h3>
              {["vegan", "vegetarian", "gluten-free", "keto"].map((filter) => (
                <button
                  key={filter}
                  className={`categories-filter-btn ${selectedDietaryFilters.includes(filter) ? "active" : ""}`}
                  onClick={() => toggleDietaryFilter(filter)}
                >
                  <span className="categories-filter-dot"></span>
                  {filter.replace("-", " ").replace(/^[a-z]/, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>

            <div className="categories-filters">
              <h3 className="filter-heading">Allergens</h3>
              {["dairy", "eggs", "gluten", "nuts", "seafood", "peanuts"].map((filter) => (
                <button
                  key={filter}
                  className={`categories-filter-btn ${selectedAllergenFilters.includes(filter) ? "active" : ""}`}
                  onClick={() => toggleAllergenFilter(filter)}
                >
                  <span className="categories-filter-dot"></span>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <section className="burger-section">
              <div className="categories-section-header">
                <h2 className="categories-section-title">All {categoryName} Items</h2>
              </div>

              {filteredItems.length === 0 ? (
                <p className="no-items-msg">No Items Found</p>
              ) : (
                <div className="categories-burger-grid">
                  {filteredItems.map((item) => (
                    <div className="categories-burger-card" key={item._id || item.id}>
                      <div className="categories-burger-info">
                        <h3 className="categories-burger-name">{item.name}</h3>
                        <p className="categories-burger-eatery">{item.eatery.eateryName}</p>
                        <p className="categories-burger-description">{item.description}</p>
                        <p className="categories-burger-price">Rs.{item.price.toFixed(2)}</p>
                      </div>
                      <div className="categories-burger-image-container">
                        <img
                          src={
                            (cuisineImageMap[categoryName] &&
                              cuisineImageMap[categoryName][item.name]) ||
                            item.image ||
                            "/placeholder.svg"
                          }
                          alt={item.name}
                          className="categories-burger-image"
                          style={{ width: "80px", height: "80px" }}
                        />
                        <div className="quantity-controls">
                          <button
                            className="categories-subtract-btn"
                            onClick={() => handleRemoveFromCart(item._id || item.id)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{getItemQuantity(item._id || item.id)}</span>
                          <button
                            className="categories-add-btn"
                            onClick={() => handleAddToCart(item)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
