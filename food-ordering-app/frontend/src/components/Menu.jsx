"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle } from "lucide-react"
import "../styles/menu.css"
import useAuthStore from "./authStore"
import axios from "axios"
import EateryNavbar from "./Eatery-Navbar";
import { getEateryMenuRoute, getEateryRoute, menuRoute } from "../constant"

const Menu = () => {
  const { user } = useAuthStore()
  const [menuItems, setMenuItems] = useState([])
  const [groupedItems, setGroupedItems] = useState({})
  const [activeCuisine, setActiveCuisine] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    dietaryPreferences: [],
    allergens: [],
  })
  const [editingItem, setEditingItem] = useState(null)
  const [notification, setNotification] = useState({ message: "", type: "", visible: false })

  const [eateryName, setEateryName] = useState("")
  const id = user?._id
  const eateryIdRef = useRef(null)
  const modalRef = useRef(null)
  const notificationTimeoutRef = useRef(null)

  const cuisineImageMap = {
    Pakistani: {
      "Spicy Chicken Biryani": "/assets/biryani1.jpg",
      "Chicken Biryani": "/assets/biryani2.jpg",
    },
    Chinese: {
      "Chicken Manchurian": "/assets/chinese1.jpg",
    },
    Italian: {
      "Margherita Pizza": "/assets/italian1.jpg",
    },
    "Fast Food": {
      "Beef Burger": "/assets/fast food1.jpg",
    },
    Healthy: {
      "Avocado Salad": "/assets/healthy1.jpg",
      wrap: "/assets/healthy2.jpg",
    },
    Dessert: {
      "Chocolate Lava Cake": "/assets/dessert1.jpg",
    },
  }

  // Show notification function
  const showNotification = (message, type = "success") => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    // Set the notification
    setNotification({ message, type, visible: true })

    // Auto-hide after 5 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }))
    }, 5000)
  }

  useEffect(() => {
    if (!id) {
      setError("User ID is missing.")
      setLoading(false)
      return
    }

    const fetchEateryIdAndMenu = async () => {
      try {
        console.log("Fetching eatery for user ID:", id)

        const eateryRes = await axios.get(`${getEateryRoute}/${id}`)
        console.log("Eatery response received:", eateryRes.data)

        // Correctly access the eateryId and eateryName
        const eateryId = eateryRes.data.eateryId
        eateryIdRef.current = eateryId

        // Access and print eateryName to confirm it's being fetched
        const eateryName = eateryRes.data.eateryName
        console.log("Eatery Name:", eateryName)
        setEateryName(eateryName)

        // Fetch menu items using the eateryId
        const menuRes = await fetch(`${getEateryMenuRoute}/${eateryId}`)
        if (!menuRes.ok) throw new Error("Failed to fetch menu")

        const data = await menuRes.json()
        console.log("Menu items received:", data)

        const grouped = data.reduce((acc, item) => {
          acc[item.cuisineType] = acc[item.cuisineType] || []
          acc[item.cuisineType].push(item)
          return acc
        }, {})

        setMenuItems(data)
        setGroupedItems(grouped)
      } catch (err) {
        console.error("Error fetching menu or eatery:", err)
        setError("Failed to fetch menu or eatery.")
        showNotification("Failed to fetch menu or eatery.", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchEateryIdAndMenu()
  }, [id])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddForm(false)
        setEditingItem(null)
      }
    }

    if (showAddForm || editingItem) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showAddForm, editingItem])

  // Cleanup notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  const handleCuisineFilter = (cuisine) => setActiveCuisine(cuisine)

  const handleCheckboxChange = (type, value, isEdit = false) => {
    const updater = (prev) => {
      const current = prev[type] || []
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      return { ...prev, [type]: updated }
    }

    isEdit ? setEditingItem(updater) : setNewItem(updater)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      // Fetch eatery details using user ID
      const eateryRes = await axios.get(`${getEateryRoute}/${id}`)
      console.log("Eatery response received:", eateryRes.data)

      const eateryId = eateryRes.data.eateryId
      const eateryName = eateryRes.data.eateryName

      if (!eateryId || !eateryName) {
        throw new Error("Eatery ID or Name is missing.")
      }

      // Build the POST request payload
      const payload = {
        eatery: {
          eateryId,
          eateryName,
        },
        name: newItem.name,
        description: newItem.description,
        price: newItem.price || 500,
        ingredients: newItem.ingredients,
        cuisineType: newItem.cuisineType,
        dietaryPreferences: newItem.dietaryPreferences,
        allergens: newItem.allergens,
      }

      console.log("Add Payload:", payload)

      const response = await axios.post(menuRoute, payload)

      if (response.status === 201) {
        const added = response.data
        const updatedItems = [...menuItems, added]
        setMenuItems(updatedItems)

        const updatedGrouped = updatedItems.reduce((acc, item) => {
          acc[item.cuisineType] = acc[item.cuisineType] || []
          acc[item.cuisineType].push(item)
          return acc
        }, {})
        setGroupedItems(updatedGrouped)

        setShowAddForm(false)
        setNewItem({ dietaryPreferences: [], allergens: [] })
        showNotification(`${added.name} has been added to the menu successfully!`)
      }
    } catch (error) {
      console.error("Error adding item:", error.response ? error.response.data : error.message)
      showNotification("Failed to add the item. Please try again.", "error")
    }
  }

  const handleDeleteItem = async (itemId, itemName) => {
    try {
      // Removed the confirmation dialog
      await axios.delete(`${menuRoute}/${itemId}`)
      const updatedItems = menuItems.filter((item) => item._id !== itemId)
      setMenuItems(updatedItems)

      const updatedGrouped = updatedItems.reduce((acc, item) => {
        acc[item.cuisineType] = acc[item.cuisineType] || []
        acc[item.cuisineType].push(item)
        return acc
      }, {})
      setGroupedItems(updatedGrouped)
      showNotification(`${itemName} has been deleted successfully!`)
    } catch (err) {
      console.error("Error deleting item:", err)
      showNotification("Failed to delete the item. Please try again.", "error")
    }
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    try {
      if (!editingItem?._id) {
        throw new Error("Item ID is missing for update.")
      }

      // Fetch eatery details using user ID
      const eateryRes = await axios.get(`${getEateryRoute}/${id}`)
      console.log("Eatery response received:", eateryRes.data)

      const eateryId = eateryRes.data.eateryId
      const eateryName = eateryRes.data.eateryName

      if (!eateryId || !eateryName) {
        throw new Error("Eatery ID or Name is missing.")
      }

      // Build the update payload
      const updatedData = {
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price || 650,
        ingredients: editingItem.ingredients,
        cuisineType: editingItem.cuisineType,
        dietaryPreferences: editingItem.dietaryPreferences,
        allergens: editingItem.allergens,
        availability: editingItem.availability !== undefined ? editingItem.availability : true,
        eatery: {
          eateryId,
          eateryName,
        },
      }

      console.log("Update Payload:", updatedData)

      const apiUrl = `${menuRoute}/${editingItem._id}`
      const response = await axios.put(apiUrl, updatedData)

      if (response.status === 200) {
        const updatedItem = response.data
        const updatedMenuList = menuItems.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        setMenuItems(updatedMenuList)

        const regrouped = updatedMenuList.reduce((acc, item) => {
          acc[item.cuisineType] = acc[item.cuisineType] || []
          acc[item.cuisineType].push(item)
          return acc
        }, {})
        setGroupedItems(regrouped)

        setEditingItem(null)
        showNotification(`${updatedItem.name} has been updated successfully!`)
      }
    } catch (err) {
      console.error("Error updating item:", err.response ? err.response.data : err.message)
      showNotification("Failed to update the item. Please try again.", "error")
    }
  }

  const filteredItems = activeCuisine === "All" ? menuItems : groupedItems[activeCuisine] || []
  const cuisineTypes = ["All", "Pakistani", "Chinese", "Healthy", "Italian", "Fast Food", "Dessert"]

  return (
    <div className="menu-management-container">
        <div className="menu-management-container">
        <EateryNavbar /> {/* Add EateryNavbar here */}
        {/* The rest of your Menu component JSX */}
        </div>

        {/* Improved Notification Component */}
        {notification.visible && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === "success" ? (
              <CheckCircle className="notification-icon" size={20} />
            ) : (
              <AlertCircle className="notification-icon" size={20} />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => setNotification((prev) => ({ ...prev, visible: false }))}
            aria-label="Close notification"
          >
          <X size={30} style={{ color: 'black' }} />
          </button>
        </div>
      )}

      <div className="menu-header">
        <h1>Menu Management</h1>
        <button className="add-item-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <div className="cuisine-filter">
        {cuisineTypes.map((cuisine) => (
          <button
            key={cuisine}
            className={`cuisine-btn ${activeCuisine === cuisine ? "active" : ""}`}
            onClick={() => handleCuisineFilter(cuisine)}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Modal Overlay for Edit Form */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2>Edit Menu Item</h2>
              <button className="close-modal" onClick={() => setEditingItem(null)}>
                <X size={24} />
              </button>
            </div>
            <form className="menu-form" onSubmit={handleUpdateItem}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={editingItem.price || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ingredients</label>
                <input
                  type="text"
                  value={editingItem.ingredients || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cuisine Type</label>
                <select
                  value={editingItem.cuisineType || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, cuisineType: e.target.value })}
                  required
                >
                  <option value="">Select cuisine</option>
                  {cuisineTypes.slice(1).map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-checkbox-group">
                <label>Dietary Preferences:</label>
                <div className="checkbox-options">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Keto"].map((pref) => (
                    <label key={pref} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingItem.dietaryPreferences?.includes(pref)}
                        onChange={() => handleCheckboxChange("dietaryPreferences", pref, true)}
                      />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-checkbox-group">
                <label>Allergens:</label>
                <div className="checkbox-options">
                  {["Nuts", "Dairy", "Gluten"].map((allergen) => (
                    <label key={allergen} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editingItem.allergens?.includes(allergen)}
                        onChange={() => handleCheckboxChange("allergens", allergen, true)}
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Update Item
                </button>
                <button type="button" className="cancel-btn" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Overlay for Add Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2>Add New Menu Item</h2>
              <button className="close-modal" onClick={() => setShowAddForm(false)}>
                <X size={24} />
              </button>
            </div>
            <form className="menu-form" onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={newItem.ingredients || ""}
                  onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cuisine Type</label>
                <select
                  value={newItem.cuisineType || ""}
                  onChange={(e) => setNewItem({ ...newItem, cuisineType: e.target.value })}
                  required
                >
                  <option value="">Select cuisine</option>
                  {cuisineTypes.slice(1).map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-checkbox-group">
                <label>Dietary Preferences:</label>
                <div className="checkbox-options">
                  {["Vegetarian", "Vegan", "Gluten-Free"].map((pref) => (
                    <label key={pref} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newItem.dietaryPreferences?.includes(pref)}
                        onChange={() => handleCheckboxChange("dietaryPreferences", pref)}
                      />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-checkbox-group">
                <label>Allergens:</label>
                <div className="checkbox-options">
                  {["Dairy", "Eggs", "Gluten", "Nuts", "Seafood", "Peanuts"].map((allergen) => (
                    <label key={allergen} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newItem.allergens?.includes(allergen)}
                        onChange={() => handleCheckboxChange("allergens", allergen)}
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Add Item
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-grid">
        {loading ? (
          <p>Loading menu items...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item._id} className="menu-item">
              <img
                src={cuisineImageMap[item.cuisineType]?.[item.name] || item.imageUrl || "https://placehold.co/600x400"}
                alt={item.name}
                className="menu-item-image"
              />
              <div className="menu-item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">Rs. {item.price}</p>
                <div className="menu-item-id">ID: {item._id}</div>
                <div className="menu-item-actions">
                  <button className="edit-btn" onClick={() => setEditingItem(item)}>
                    <Edit size={18} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteItem(item._id, item.name)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No items available for {activeCuisine} cuisine.</p>
        )}
      </div>
    </div>
  )
}

export default Menu
