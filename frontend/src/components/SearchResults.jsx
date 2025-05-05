import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/search-results.css";
import useCartStore from './cartStore';
import { Plus, Minus } from "lucide-react";
import useAuthStore from './authStore';
import { addCartRoute, menuRoute, removeCartRoute } from "../constant";

// Image mappings for each category
const pakistaniImages = {
    "Spicy Chicken Biryani": "/assets/biryani1.jpg",
    "Chicken Biryani": "/assets/biryani2.jpg",
};

const chineseImages = {
    "Chicken Manchurian": "/assets/chinese1.jpg",
};

const italianImages = {
    "Margherita Pizza": "/assets/italian1.jpg",
};

const fastFoodImages = {
    "Beef Burger": "/assets/fast food1.jpg",
};

const healthyImages = {
    "Avocado Salad": "/assets/healthy1.jpg",
    wrap: "/assets/healthy2.jpg",
    "wrap 2": "/assets/healthy2.jpg",
};

const dessertImages = {
    "Chocolate Lava Cake": "/assets/dessert1.jpg",
};

// Combine all image mappings
const allFoodImages = {
    ...pakistaniImages,
    ...chineseImages,
    ...italianImages,
    ...fastFoodImages,
    ...healthyImages,
    ...dessertImages,
};

const SearchResults = () => {
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { cartItems, addItemToCart, removeItemFromCart } = useCartStore();
    const query = new URLSearchParams(useLocation().search).get("query")?.toLowerCase() || "";
    const { user } = useAuthStore();
    const id = user?._id;

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const response = await axios.get(menuRoute);
                setAllItems(response.data);
            } catch (err) {
                setError("Failed to load menu items.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllItems();
    }, []);

    useEffect(() => {
        const filtered = allItems.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.dietaryTags?.some(tag => tag.toLowerCase().includes(query))
        );
        setFilteredItems(filtered);
    }, [allItems, query]);

    const getItemQuantity = (cartItems, itemId) => {
        const item = cartItems.find(i => i._id === itemId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = async (item) => {
        const { cartItems, cartEateryId } = useCartStore.getState(); 

        const isSameEatery = cartItems.every(cartItem => cartItem.eatery.eateryId === item.eatery.eateryId);

        if (cartItems.length > 0 && !isSameEatery) {
            setError("You can only add items from one eatery at a time.");
            return; 
        }

        try {
            await axios.post(addCartRoute, {
                userId: id,
                itemId: item._id,
                quantity: 1,
            });
            addItemToCart(item);
        } catch (error) {
            console.error("Error adding to cart:", error);
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
                removeItemFromCart(itemId); 
            } else {
                console.error("Failed to remove item from the cart");
            }
        } catch (err) {
            console.error("Error removing item from the cart:", err);
        }
    };

    return (
        <>
            <Navbar />
            <div className="search-results-container">
                <h2 className="text-xl font-semibold mb-4">Results for "{query}"</h2>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {!loading && filteredItems.length === 0 && <p>No items found.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="menu-item">
                            {/* Use the correct image from allFoodImages based on the item name */}
                            <img src={allFoodImages[item.name]} alt={item.name} />
                            <div className="menu-details">
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                <p>Rs {item.price}</p>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleRemoveFromCart(item._id)}
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="quantity">{getItemQuantity(cartItems, item._id)}</span>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleAddToCart(item)} 
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SearchResults;
